"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useOrganization } from "@/context/OrganizationContext";
import MonthSelector from "@/components/dashboard/finances/MonthSelector";
import SummaryCards from "@/components/dashboard/finances/SummaryCards";
import FinancesTable from "@/components/dashboard/finances/FinancesTable";
import { FinanceEntry } from "@/components/dashboard/finances/FinancesTable";
import dynamic from 'next/dynamic'
const DonutChart = dynamic(() => import('@/components/dashboard/finances/DonutChart'), { ssr: false })
const FinanceTrendChart = dynamic(() => import('@/components/dashboard/finances/FinanceTrendChart'), { ssr: false })
import FinancialAlerts from "@/components/dashboard/finances/FinancialAlerts";
import PageSkeleton from "@/components/dashboard/ui/PageSkeleton";
import DashboardSidebar from "@/components/dashboard/home/DashboardSidebar";
import AddIncomeModal from "@/components/dashboard/finances/AddIncomeModal";
import AddExpenseModal from "@/components/dashboard/finances/AddExpenseModal";
import AddBusinessIncomeModal from "@/components/dashboard/finances/AddBusinessIncomeModal";
import AddBusinessExpenseModal from "@/components/dashboard/finances/AddBusinessExpenseModal";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { DashboardPageContainer } from "@/components/dashboard/DashboardPageContainer";
import Link from "next/link";
import { generateFinanceReport } from "@/lib/generatePDF";
import { Bot } from "lucide-react";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useLanguage } from "@/lib/LanguageContext";


const monthToNumber: Record<string, number> = {
  ENE: 1, FEB: 2, MAR: 3, ABR: 4, MAY: 5, JUN: 6,
  JUL: 7, AGO: 8, SEP: 9, OCT: 10, NOV: 11, DIC: 12,
};

const numberToMonth: Record<number, string> = Object.fromEntries(
  Object.entries(monthToNumber).map(([k, v]) => [v, k])
);

export default function FinancesPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { organization, loading: orgLoading } = useOrganization();
  const now = new Date();
  const currentMonthName = numberToMonth[now.getMonth() + 1];
  const currentYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [allYearEntries, setAllYearEntries] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [businessEntries, setBusinessEntries] = useState<any[]>([]);
  const [aiAlerts, setAiAlerts] = useState<any[]>([]);
  
  // Modal states
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBizIncomeModal, setShowBizIncomeModal] = useState(false);
  const [showBizExpenseModal, setShowBizExpenseModal] = useState(false);
  const [showAuditor, setShowAuditor] = useState(false);
  const [auditorMessages, setAuditorMessages] = useState<{role: string, content: string}[]>([]);
  const [auditorLoading, setAuditorLoading] = useState(false);
  const [auditorTeaser, setAuditorTeaser] = useState<string>(
    t('finances.auditor.loading' as any)
  )
  const [teaserLoading, setTeaserLoading] = useState(false)

  const selectedMonthNumber = monthToNumber[selectedMonth];

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const csv = [
        ["Concepto", "Tipo", "Monto", "Mes", "Año"],
        ...entries.map(e => [e.concept, e.type, e.amount, e.month, e.year])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Finanzas_${selectedYear}_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(t('finances.toast.exported' as any));
    } catch (error) {
      toast.error(t('finances.toast.exportError' as any));
    } finally {
      setIsExporting(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!allYearEntries.length) { toast.error(t('finances.toast.noDataReport' as any)); return; }
    console.log('organization al generar PDF:', organization)
    setGeneratingPDF(true);
    try {
      await generateFinanceReport(allYearEntries, selectedMonthNumber, selectedYear, organization?.name ?? '');
      toast.success(t('finances.toast.pdfGenerated' as any));
    } catch (error: any) { 
      console.error("Error generando PDF:", error);
      toast.error(error?.message || t('finances.toast.pdfError' as any)); 
    }
    finally { setGeneratingPDF(false); }
  };

  async function loadFinanceData(user_id: string) {
    const supabase = createClient();
    const { data: yearData, error: yearError } = await supabase
      .from("finance_entries")
      .select("id, concept, category, type, amount, month, year")
      .eq("organization_id", organization?.id)
      .eq("year", selectedYear)
      .order("month")
      .order("type")
      .order("concept");

    if (yearError) {
      // Error silencioso en producción
      toast.error(t('finances.toast.refreshError' as any));
    } else {
      const mappedYear = (yearData ?? []).map((r: any) => ({
        id: String(r.id),
        concept: String(r.concept ?? ""),
        category: String(r.category ?? ""),
        type: r.type,
        amount: Number(r.amount),
        month: Number(r.month),
        year: Number(r.year),
      }));

      setAllYearEntries(mappedYear);
      const monthEntries = mappedYear.filter((e: { month: number }) => e.month === selectedMonthNumber);
      setEntries(monthEntries);
    }
  }

  async function loadBusinessData(user_id: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from('business_entries')
      .select('*')
      .eq('organization_id', organization?.id)
      .eq('year', selectedYear);
    setBusinessEntries(data ?? []);
  }

  useEffect(() => {
    let channel: any;
    async function checkAuthAndLoad() {
      setLoading(true);
      if (!organization?.id) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error(t('finances.toast.sessionExpired' as any));
        router.push("/login");
        return;
      }

      setUserId(user.id);
      await Promise.all([
        loadFinanceData(user.id),
        loadBusinessData(user.id)
      ]);
      setLoading(false);

      channel = supabase
        .channel('finance-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'finance_entries',
            filter: `organization_id=eq.${organization?.id}`
          },
          () => {
            loadFinanceData(user.id);
          }
        )
        .subscribe();
    }

    checkAuthAndLoad();

    return () => {
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, [selectedYear, selectedMonthNumber, router, organization?.id]);

  const monthStatuses = useMemo(() => {
    return Object.keys(monthToNumber).reduce((acc, mes) => {
      const mNum = monthToNumber[mes];
      const mesEntries = allYearEntries.filter(e => e.month === mNum);
      const tieneIngresos = mesEntries.some(e => e.type === 'ingreso');
      const tieneGastos = mesEntries.some(e => e.type !== 'ingreso');

      if (tieneIngresos && tieneGastos) acc[mes] = 'completo';
      else if (tieneGastos) acc[mes] = 'parcial';
      else acc[mes] = 'vacio';

      return acc;
    }, {} as Record<string, 'completo' | 'parcial' | 'vacio'>);
  }, [allYearEntries]);

  const financeData = useMemo(() => {
    const ingresos = entries.filter((e) => e.type === "ingreso").reduce((s, e) => s + e.amount, 0);
    const gastos = entries.filter((e) => e.type !== "ingreso").reduce((s, e) => s + e.amount, 0);
    return { ingresos, gastos, balance: ingresos - gastos, entries };
  }, [entries]);

  const generateAlerts = async () => {
    if (entries.length === 0) return;
    try {
      const response = await fetch('/api/ai-groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: 'finances',
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
          financeData: { balanceMes: financeData.balance, ingresosMes: financeData.ingresos, gastosMes: financeData.gastos, todosLosGastos: entries.map(e => e.concept) },
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

  const generateAuditorTeaser = async () => {
    if (entries.length === 0 || teaserLoading) return
    setTeaserLoading(true)
    try {
      const promptText = t('finances.auditor.promptTeaser' as any)
        .replace('{month}', selectedMonth)
        .replace('{year}', String(selectedYear));
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          organizationId: organization?.id
        })
      })
      const data = await response.json()
      if (data.reply) {
        setAuditorTeaser(data.reply)
      }
    } catch {
      setAuditorTeaser(
        t('finances.auditor.teaserDefault' as any)
      )
    } finally {
      setTeaserLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && entries.length > 0) {
      generateAlerts();
      generateAuditorTeaser();
    }
  }, [entries.length, loading, selectedMonth]);

  const handleOpenAuditor = async () => {
    setShowAuditor(true);
    if (auditorMessages.length === 0) {
      setAuditorLoading(true);
      try {
        const promptText = t('finances.auditor.promptAnalysis' as any)
          .replace('{month}', selectedMonth)
          .replace('{year}', String(selectedYear));
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: promptText,
            organizationId: organization?.id
          })
        });
        const data = await response.json();
        setAuditorMessages([
          { role: 'assistant', content: data.reply || 'Error' }
        ]);
      } catch (error) {
        console.error('Error iniciando auditor:', error);
        toast.error(t('finances.auditor.initError' as any));
      } finally {
        setAuditorLoading(false);
      }
    }
  };

  const handleAuditorSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || auditorLoading) return;
    
    setAuditorMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAuditorLoading(true);
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          organizationId: organization?.id
        })
      });
      const data = await response.json();
      setAuditorMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Error' }]);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      toast.error(t('finances.auditor.sendError' as any));
    } finally {
      setAuditorLoading(false);
    }
  };

  if (orgLoading || (loading && organization?.id) || !isMounted) return <PageSkeleton />;

  return (
    <div className="min-h-screen animate-in fade-in duration-700">
      <DashboardPageContainer>
        <div className="flex flex-col 2xl:flex-row gap-6 2xl:gap-8">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 2xl:gap-8">
          <div className="card-premium py-6 px-6 md:px-8 flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl tracking-tighter uppercase italic text-[var(--text-primary)]">
                {t('finances.header.management' as any)} <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{t('finances.header.financial' as any)}</span>
                <span className="text-emerald-500 text-xs not-italic ml-3 tracking-[0.3em] opacity-50">AUDIT MODE</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.4em]">
                {t('finances.header.fiscalYear' as any)} {selectedMonth} {selectedYear}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-2xl px-5 py-3 shadow-xl">
              <button onClick={() => setSelectedYear(y => y - 1)} className="p-1.5 hover:bg-[var(--bg-card)] rounded-xl transition-all" title={t('finances.header.prevYear' as any)}>
                <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="text-lg text-[var(--text-primary)] italic tracking-tighter min-w-[50px] text-center">{selectedYear}</span>
              <button onClick={() => setSelectedYear(y => y + 1)} className="p-1.5 hover:bg-[var(--bg-card)] rounded-xl transition-all" title={t('finances.header.nextYear' as any)}>
                <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div>
            <MonthSelector
              selected={selectedMonth}
              onChange={setSelectedMonth}
              statuses={monthStatuses}
            />
          </div>

          <div>
            <SummaryCards data={financeData} loading={loading} />
          </div>

          <div className="pb-20">
            <FinancesTable
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
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-8 rounded-[40px] shadow-2xl">
               <DonutChart entries={entries} month={selectedMonth} />
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-8 rounded-[40px] shadow-2xl">
              <FinancialAlerts
                entries={allYearEntries}
                selectedMonth={selectedMonthNumber}
                year={selectedYear}
                aiAlerts={aiAlerts}
                mode="hogar"
              />
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-8 rounded-[40px] shadow-2xl overflow-hidden">
             <FinanceTrendChart data={
               Object.keys(monthToNumber).map(m => {
                 const mNum = monthToNumber[m];
                 const mEntries = allYearEntries.filter(e => e.month === mNum);
                 return {
                   month: m,
                   ingresos: mEntries.filter(e => e.type === 'ingreso').reduce((s, e) => s + e.amount, 0),
                   gastos: mEntries.filter(e => e.type !== 'ingreso').reduce((s, e) => s + e.amount, 0)
                 };
               })
             } />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full 2xl:w-[380px] shrink-0 flex flex-col gap-6">
          <DashboardSidebar
            data={{
              ...financeData,
              currentMonth: selectedMonth,
              entries: allYearEntries,
              businessEntries: businessEntries
            }}
            monthStatuses={monthStatuses}
            onOpenIncome={() => setShowIncomeModal(true)}
            onOpenExpense={() => setShowExpenseModal(true)}
            onOpenBizIncome={() => setShowBizIncomeModal(true)}
            onOpenBizExpense={() => setShowBizExpenseModal(true)}
          />
          
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[40px] p-8 text-white shadow-2xl shadow-emerald-500/20">
             <h4 className="uppercase tracking-[0.3em] text-[10px] mb-6 flex items-center gap-3">
                <Bot className="w-5 h-5" />
                {t('finances.auditor.title' as any)}
             </h4>
             <p className="text-sm font-medium italic opacity-90 leading-relaxed mb-8">
               "{teaserLoading ? t('finances.auditor.loading' as any) : auditorTeaser}"
             </p>
             <button onClick={handleOpenAuditor} className="w-full py-4 bg-white text-emerald-700 rounded-2xl text-[10px] uppercase tracking-widest hover:shadow-2xl transition-all active:scale-95">
                {t('finances.auditor.startButton' as any)}
             </button>
          </div>
        </div>
      </div>

      {/* Modals rendered at root to avoid stacking context issues */}
      {showIncomeModal && (
        <AddIncomeModal 
          isOpen={showIncomeModal} 
          onClose={() => setShowIncomeModal(false)} 
          onSuccess={() => loadFinanceData(userId!)}
        />
      )}
      {showExpenseModal && (
        <AddExpenseModal 
          isOpen={showExpenseModal} 
          onClose={() => setShowExpenseModal(false)} 
          onSuccess={() => loadFinanceData(userId!)}
        />
      )}
      {showBizIncomeModal && (
        <AddBusinessIncomeModal 
          isOpen={showBizIncomeModal} 
          onClose={() => setShowBizIncomeModal(false)} 
          onSuccess={() => loadBusinessData(userId!)}
        />
      )}
      {showBizExpenseModal && (
        <AddBusinessExpenseModal 
          isOpen={showBizExpenseModal} 
          onClose={() => setShowBizExpenseModal(false)} 
          onSuccess={() => loadBusinessData(userId!)}
        />
      )}

      {/* Auditor Financiero IA Modal */}
      {showAuditor && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-t-[32px] md:rounded-[32px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-[var(--border-card)] shrink-0">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">{t('finances.auditor.title' as any)}</h2>
              </div>
              <button
                onClick={() => {
                  setShowAuditor(false);
                  setAuditorMessages([]);
                }}
                className="p-2 hover:bg-[var(--bg-page)] rounded-lg transition-all"
              >
                <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages - scrollable area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-[200px]">
              {auditorMessages.length === 0 && !auditorLoading && (
                <div className="text-center text-[var(--text-secondary)] text-sm py-8">
                  <p>{t('finances.auditor.initAnalysis' as any)}</p>
                </div>
              )}
              {auditorMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm md:text-base ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border-card)]'
                  }`}>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {auditorLoading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border-card)] px-4 py-3 rounded-2xl">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input - always visible */}
            <div className="border-t border-[var(--border-card)] p-4 md:p-6 shrink-0">
              <AuditorChatInput onSend={handleAuditorSendMessage} disabled={auditorLoading} />
            </div>
          </div>
        </div>
      )}
      </DashboardPageContainer>
    </div>
  );
}

// Componente auxiliar para el input del chat
function AuditorChatInput({ onSend, disabled }: { onSend: (msg: string) => void; disabled: boolean }) {
  const { t } = useLanguage();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        placeholder={t('finances.auditor.inputPlaceholder' as any)}
        className="flex-1 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95 text-sm font-medium"
      >
        {t('finances.auditor.sendButton' as any)}
      </button>
    </form>
  );
}
