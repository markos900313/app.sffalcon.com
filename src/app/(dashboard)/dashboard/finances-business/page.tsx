"use client";

import React, { useState, useEffect, useMemo } from "react";
import MonthSelector from "@/components/dashboard/finances/MonthSelector";
import BusinessSummaryCards from "@/components/dashboard/finances-business/BusinessSummaryCards";
import BusinessTable, { BusinessEntry } from "@/components/dashboard/finances-business/BusinessTable";
import FinancialAlerts from "@/components/dashboard/finances/FinancialAlerts";
import DashboardSidebar from "@/components/dashboard/home/DashboardSidebar";
import PageSkeleton from "@/components/dashboard/ui/PageSkeleton";
import dynamic from "next/dynamic";
const BusinessDonutChart = dynamic(() => import("@/components/dashboard/finances-business/BusinessDonutChart"), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-slate-50 dark:bg-[#111F3A] animate-pulse rounded-[24px]" />
});
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { generateFinanceReport } from "@/lib/generatePDF";
import { useOrganization } from "@/context/OrganizationContext";
import { useLanguage } from "@/lib/LanguageContext";

const monthToNumber: Record<string, number> = {
  ENE: 1, FEB: 2, MAR: 3, ABR: 4, MAY: 5, JUN: 6,
  JUL: 7, AGO: 8, SEP: 9, OCT: 10, NOV: 11, DIC: 12,
};
const numberToMonth: Record<number, string> = Object.fromEntries(
  Object.entries(monthToNumber).map(([k, v]) => [v, k])
);

export default function FinancesBusinessPage() {
  const { organization } = useOrganization();
  const router = useRouter();
  const { t } = useLanguage();
  const now = new Date();
  const currentYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(numberToMonth[now.getMonth() + 1]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [entries, setEntries] = useState<BusinessEntry[]>([]);
  const [allYearEntries, setAllYearEntries] = useState<BusinessEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [homeEntries, setHomeEntries] = useState<any[]>([]);
  const [aiAlerts, setAiAlerts] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectedMonthNumber = monthToNumber[selectedMonth] ?? 1;

  async function loadData(user_id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("business_entries")
      .select("*")
      .eq("user_id", user_id)
      .eq("year", selectedYear)
      .order("month");

    if (error) {
      toast.error(t("financesBusiness.toast.loadError"));
    } else {
      const mapped: BusinessEntry[] = (data ?? []).map((r: any) => ({
        id: String(r.id),
        concept: String(r.concept ?? ""),
        type: r.type,
        amount: Number(r.amount),
        month: Number(r.month),
        year: Number(r.year),
        client: r.client || null,
        project: r.project || null,
        notes: r.notes || null,
      }));
      setAllYearEntries(mapped);
      setEntries(mapped.filter(e => e.month === selectedMonthNumber));
    }

    const { data: home } = await supabase
      .from('finance_entries')
      .select('*')
      .eq('user_id', user_id)
      .eq('year', selectedYear);
    setHomeEntries(home ?? []);
  }

  useEffect(() => {
    async function init() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error(t("finances.toast.sessionExpired")); router.push("/login"); return; }
      setUserId(user.id);
      await loadData(user.id);
      setLoading(false);

      const channel = supabase
        .channel("business-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "business_entries", filter: `user_id=eq.${user.id}` },
          () => loadData(user.id))
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonthNumber]);

  const summary = useMemo(() => {
    const ingresos = entries.filter(e => e.type === "ingreso_cliente").reduce((s, e) => s + e.amount, 0);
    const gastos = entries.filter(e => e.type !== "ingreso_cliente").reduce((s, e) => s + e.amount, 0);
    return { ingresos, gastos, beneficio: ingresos - gastos };
  }, [entries]);

  const monthStatuses = useMemo(() => {
    return Object.keys(monthToNumber).reduce((acc, mes) => {
      const mNum = monthToNumber[mes];
      const mEntries = allYearEntries.filter(e => e.month === mNum);
      const tieneIngresos = mEntries.some(e => e.type === "ingreso_cliente");
      const tieneGastos = mEntries.some(e => e.type !== "ingreso_cliente");
      const st: "completo" | "parcial" | "vacio" = tieneIngresos && tieneGastos ? "completo" : mEntries.length > 0 ? "parcial" : "vacio";
      acc[mes] = st;
      return acc;
    }, {} as Record<string, "completo" | "parcial" | "vacio">);
  }, [allYearEntries]);

  const generateAlerts = async () => {
    if (entries.length === 0) return;
    try {
      const response = await fetch('/api/ai-groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: 'finances_business',
          message: `Analiza estos datos financieros y genera máximo 3 alertas importantes. 
          Responde SOLO con JSON array:
          [
            {
              "type": "warning/info/success",
              "title": "título corto",
              "message": "mensaje en máximo 15 palabras"
            }
          ]
          Sin markdown. Solo JSON válido. No uses negritas.`,
          businessData: { beneficioMes: summary.beneficio, ingresosMes: summary.ingresos, gastosMes: summary.gastos, todosLosMovimientos: entries.map(e => e.concept) },
          history: []
        })
      });

      const text = await response.text();
      try {
        const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        setAiAlerts(parsed);
      } catch (err) {
        console.error("Error parseando alertas IA:", err);
      }
    } catch (error) {
      console.error("Error generando alertas:", error);
    }
  };

  useEffect(() => {
    if (!loading && entries.length > 0) {
      generateAlerts();
    }
  }, [entries.length, loading, selectedMonth]);

  if (loading || !isMounted) return <PageSkeleton showKPIs={true} rows={6} />;

  // Exportar JSON del negocio
  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const blob = new Blob([JSON.stringify({
        exportDate: new Date().toISOString(),
        module: "Finanzas",
        year: selectedYear,
        entries: allYearEntries,
      }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Finanzas_${selectedYear}_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("finances.toast.exported"));
    } catch {
      toast.error(t("finances.toast.exportError"));
    } finally {
      setIsExporting(false);
    }
  };

  // Generar PDF del negocio usando buildBusinessContext como contexto
  const handleGeneratePDF = async () => {
    if (allYearEntries.length === 0) { toast.error(t("finances.toast.noDataReport")); return; }
    setGeneratingPDF(true);
    try {
      await generateFinanceReport(allYearEntries, selectedMonthNumber, selectedYear);
      toast.success(t("finances.toast.pdfGenerated"));
    } catch {
      toast.error(t("finances.toast.pdfError"));
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-700">
      <div className="flex flex-col 2xl:flex-row gap-5 md:gap-7 2xl:gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-5 md:space-y-7 lg:space-y-8">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-[24px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] tracking-[-0.02em]">
                {t('financesBusiness.titlePrefix')} — {organization?.name || 'SF'}
              </h1>
              <p className="text-[9px] md:text-[10px] lg:text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1 uppercase tracking-[0.08em]">
                {loading ? t('financesBusiness.syncing') : t('financesBusiness.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-xl px-4 py-2 shadow-sm">
              <button onClick={() => setSelectedYear(y => y - 1)} className="p-1 hover:bg-slate-50 dark:hover:bg-[#1E3A5F] rounded-lg transition-colors">
                <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] min-w-[40px] text-center">{selectedYear}</span>
              <button onClick={() => setSelectedYear(y => y + 1)} className="p-1 hover:bg-slate-50 dark:hover:bg-[#1E3A5F] rounded-lg transition-colors">
                <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Selector de mes */}
          <MonthSelector
            selected={selectedMonth}
            onChange={(m) => {
              setSelectedMonth(m);
              setEntries(allYearEntries.filter(e => e.month === monthToNumber[m]));
            }}
            statuses={monthStatuses}
          />

          {/* Cards */}
          <BusinessSummaryCards ingresos={summary.ingresos} gastos={summary.gastos} beneficio={summary.beneficio} loading={loading} />

          {/* Tabla */}
          <BusinessTable
            month={selectedMonth}
            monthNumber={selectedMonthNumber}
            year={selectedYear}
            userId={userId}
            entries={entries}
            loading={loading}
            onEntriesChange={(newEntries) => {
              setEntries(newEntries);
              setAllYearEntries(prev => {
                const otherMonths = prev.filter(e => e.month !== selectedMonthNumber);
                return [...otherMonths, ...newEntries];
              });
            }}
          />

          {/* Donut + Alertas */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-7 lg:gap-8">
            <BusinessDonutChart entries={entries} month={selectedMonth} />
            <FinancialAlerts
              entries={allYearEntries}
              selectedMonth={selectedMonthNumber}
              year={selectedYear}
              aiAlerts={aiAlerts}
              mode="business"
            />
          </div>
        </div>

        {/* Sidebar — igual que Finanzas Hogar */}
        <div className="w-full 2xl:w-[320px] shrink-0 2xl:sticky 2xl:top-24">
          <DashboardSidebar
            data={{
              entries: homeEntries, // hogar entries
              businessEntries: allYearEntries,
              currentMonth: selectedMonth,
              balance: summary.beneficio,
            }}
            monthStatuses={monthStatuses}
            mode="business"
          />
        </div>
      </div>
    </div>
  );
}
