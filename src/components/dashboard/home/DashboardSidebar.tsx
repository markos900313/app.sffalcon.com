'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Send, Activity, TrendingUp, TrendingDown, Wallet, Building2, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buildFinanceContext, buildBusinessContext } from "@/lib/financeContext";
import AddIncomeModal from "@/components/dashboard/modals/AddIncomeModal";
import AddExpenseModal from "@/components/dashboard/modals/AddExpenseModal";
import AddBusinessIncomeModal from "@/components/dashboard/modals/AddBusinessIncomeModal";
import AddBusinessExpenseModal from "@/components/dashboard/modals/AddBusinessExpenseModal";
import AsistenteAIAssistant from "@/components/dashboard/home/AsistenteAIAssistant";
import { generateFinanceReport } from "@/lib/generatePDF";
import { useOrganization } from "@/context/OrganizationContext";

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const monthToNumber: Record<string, number> = Object.fromEntries(MONTHS.map((m, i) => [m, i + 1]));
const numberToMonth: Record<number, string> = Object.fromEntries(MONTHS.map((m, i) => [i + 1, m]));

function fmt(n: number, symbol: string = '€') {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + symbol;
}

const cn = (...cls: any[]) => cls.filter(Boolean).join(' ');

export default function DashboardSidebar({
  data,
  monthStatuses,
  mode = 'hogar',
  showActions = true,
  onOpenIncome,
  onOpenExpense,
  onOpenBizIncome,
  onOpenBizExpense
}: {
  data: any,
  monthStatuses?: Record<string, 'completo' | 'parcial' | 'vacio'>,
  mode?: 'hogar' | 'business',
  showActions?: boolean,
  onOpenIncome?: () => void,
  onOpenExpense?: () => void,
  onOpenBizIncome?: () => void,
  onOpenBizExpense?: () => void
}) {
  const { organization } = useOrganization();
  const router = useRouter();
  const pathname = usePathname();
  const isMainDashboard = pathname === '/dashboard';

  const supabase = createClient();
  const [isExporting, setIsExporting] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const currentYear = new Date().getFullYear();
  const selectedMonthNum = data.currentMonth
    ? (MONTHS.indexOf(data.currentMonth) + 1)
    : (new Date().getMonth() + 1);

  const entries = data.entries || [];
  const businessEntries = data.businessEntries || [];
  const communications = data.communications || [];
  const clients = data.clients || [];

  // Calcular resumen combinado del mes seleccionado
  const combinado = useMemo(() => {
    const hogarEntries: any[] = data.entries || [];
    const bizEntries: any[] = data.businessEntries || businessEntries;

    const hogarMes = hogarEntries.filter((e: any) => Number(e.month) === selectedMonthNum);
    const hogarIng = hogarMes.filter((e: any) => e.type === 'ingreso').reduce((s: number, e: any) => s + Number(e.amount), 0);
    const hogarGas = hogarMes.filter((e: any) => e.type !== 'ingreso').reduce((s: number, e: any) => s + Number(e.amount), 0);

    const bizMes = bizEntries.filter(e => Number(e.month) === selectedMonthNum);
    const bizIng = bizMes.filter(e => e.type === 'ingreso_cliente').reduce((s, e) => s + Number(e.amount), 0);
    const bizGas = bizMes.filter(e => e.type !== 'ingreso_cliente').reduce((s, e) => s + Number(e.amount), 0);

    // Acumulado año completo
    const hogarAcum = hogarEntries.reduce((s: number, e: any) =>
      e.type === 'ingreso' ? s + Number(e.amount) : s - Number(e.amount), 0);
    const bizAcum = bizEntries.reduce((s, e) =>
      e.type === 'ingreso_cliente' ? s + Number(e.amount) : s - Number(e.amount), 0);

    return {
      hogarIng, hogarGas, hogarBal: hogarIng - hogarGas,
      bizIng, bizGas, bizBal: bizIng - bizGas,
      total: (hogarIng - hogarGas) + (bizIng - bizGas),
      hogarAcum, bizAcum, totalAcum: hogarAcum + bizAcum
    };
  }, [data.entries, businessEntries, selectedMonthNum]);

  const businessCtx = useMemo(() => {
    const biz = data.businessEntries || businessEntries;
    return biz.length > 0 ? buildBusinessContext(biz, selectedMonthNum, currentYear) : null;
  }, [data.businessEntries, businessEntries, selectedMonthNum, currentYear]);

  // --- EXPORTAR JSON ---
  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("No autenticado"); setIsExporting(false); return; }

      if (mode === 'business') {
        // Exportar business_entries
        const blob = new Blob([JSON.stringify({ exportDate: new Date().toISOString(), year: currentYear, negocio: data.businessEntries || businessEntries }, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `SF_Negocio_${currentYear}_${new Date().toISOString().split("T")[0]}.json`;
        a.click(); URL.revokeObjectURL(url);
      } else {
        const { data: financeData } = await supabase.from("finance_entries").select("*").eq("user_id", user.id).eq("year", currentYear).order("month");
        const exportObj = { exportDate: new Date().toISOString(), year: currentYear, hogar: financeData ?? [], negocio: businessEntries };
        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `SF_Total_${currentYear}_${new Date().toISOString().split("T")[0]}.json`;
        a.click(); URL.revokeObjectURL(url);
      }
      toast.success("Exportado correctamente");
    } catch { toast.error("Error al exportar"); }
    finally { setIsExporting(false); }
  };

  // --- GENERAR PDF ---
  const handleGeneratePDF = async () => {
    const sourceEntries = mode === 'business' ? (data.businessEntries || businessEntries) : (data.entries || []);
    if (!sourceEntries?.length) { toast.error('Sin datos para el informe'); return; }
    setGeneratingPDF(true);
    try {
      await generateFinanceReport(sourceEntries, selectedMonthNum, data.currentYear || currentYear);
      toast.success('Informe PDF generado');
    } catch { toast.error('Error al generar el PDF'); }
    finally { setGeneratingPDF(false); }
  };

  const mesNombre = numberToMonth[selectedMonthNum] || 'MES';

  return (
    <div className="flex flex-col gap-5">
      {/* ASISTENTE IA — SOLO EN EL DASHBOARD PRINCIPAL */}
      {isMainDashboard && (
        <div className="h-[600px]">
          <AsistenteAIAssistant
            financeEntries={entries}
            businessEntries={businessEntries}
            communications={communications}
            clients={clients}
            projects={data.projects}
            selectedMonth={selectedMonthNum}
            year={currentYear}
          />
        </div>
      )}

      {/* RESUMENES Y ACCIONES — SOLO EN MÓDULOS DE FINANZAS */}
      {!isMainDashboard && (
        <>
          {/* RESUMEN COMBINADO */}
          <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[16px] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.08em]">
                Resumen {mesNombre} {currentYear}
              </h3>
              <span className={cn("text-[11px] font-bold tabular-nums", combinado.total >= 0 ? "text-emerald-500" : "text-red-400")}>
                {combinado.total >= 0 ? "+" : ""}{fmt(combinado.total, organization?.currency_symbol || '€')}
              </span>
            </div>


          {/* NEGOCIO */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Building2 className="w-3.5 h-3.5 text-[#1B4FD8]" />
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">Resumen {organization?.name || 'SF Gestor'}</span>
            </div>
              <div className="grid grid-cols-3 gap-2">
                <MiniCard label="Ingresos" value={fmt(combinado.bizIng, organization?.currency_symbol || '€')} color="text-emerald-500" />
                <MiniCard label="Gastos" value={fmt(combinado.bizGas, organization?.currency_symbol || '€')} color="text-red-400" />
                <MiniCard label="Beneficio" value={fmt(combinado.bizBal, organization?.currency_symbol || '€')} color={combinado.bizBal >= 0 ? "text-emerald-500" : "text-red-400"} />
              </div>
            </div>

            <div className="border-t border-[#F1F5F9] dark:border-[#1E3A5F] my-3" />

            {/* BALANCE COMBO */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-[#0D1B35] rounded-xl px-4 py-3">
              <div>
                <p className="text-[9px] font-semibold text-[#64748B] uppercase tracking-wider">Rentabilidad Anual</p>
                <p className="text-[9px] text-[#94A3B8] mt-0.5">{organization?.name || 'SF Gestor'}</p>
              </div>
              <span className={cn("text-xl font-bold tabular-nums", combinado.bizAcum >= 0 ? "text-emerald-500" : "text-red-400")}>
                {combinado.bizAcum >= 0 ? "+" : ""}{fmt(combinado.bizAcum, organization?.currency_symbol || '€')}
              </span>
            </div>
          </div>

          {/* RESUMEN AÑO — DOTS POR MES */}
          <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[16px] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.08em]">Año {currentYear}</h3>
              <span className={cn("text-[12px] font-bold tabular-nums", combinado.totalAcum >= 0 ? "text-emerald-500" : "text-red-400")}>
                {combinado.totalAcum >= 0 ? "+" : ""}{fmt(combinado.totalAcum, organization?.currency_symbol || '€')}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {MONTHS.map(m => (
                <YTDMonthItem key={m} name={m} status={monthStatuses?.[m] || 'vacio'} />
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#F1F5F9] dark:border-[#1E3A5F]">
              <LegendDot color="bg-emerald-500" label="Completo" />
              <LegendDot color="bg-amber-400" label="Parcial" />
              <LegendDot color="bg-slate-300 dark:bg-slate-700" label="Vacío" />
            </div>
          </div>

          {/* ACCIONES RÁPIDAS */}
          {showActions && (
            <div className="grid grid-cols-2 gap-2">
              <QuickActionButton
                icon={<Plus className="w-5 h-5 text-emerald-500" />}
                label="INGRESO"
                onClick={() => mode === 'business' ? onOpenBizIncome?.() : onOpenIncome?.()}
              />
              <QuickActionButton
                icon={<Plus className="w-5 h-5 text-red-400 rotate-45" />}
                label="GASTO"
                onClick={() => mode === 'business' ? onOpenBizExpense?.() : onOpenExpense?.()}
              />
              <QuickActionButton icon={<Activity className="w-5 h-5 text-blue-500" />} label="GRÁFICO"
                onClick={() => router.push(mode === 'business' ? '/dashboard/finances-business' : '/dashboard/finances')} />
              <QuickActionButton icon={<Send className="w-5 h-5 text-[#64748B]" />} label="EXPORTAR" onClick={handleExportJSON} disabled={isExporting} />
            </div>
          )}

          {/* BOTÓN PDF */}
          <button onClick={handleGeneratePDF} disabled={generatingPDF}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] text-[#0F172A] dark:text-[#F1F5F9] hover:border-[#1B4FD8] hover:text-[#1B4FD8] disabled:opacity-50 shadow-sm">
            {generatingPDF ? <><span className="animate-spin inline-block">⏳</span> Generando...</> : <>📄 Informe PDF</>}
          </button>
        </>
      )}




    </div>
  );
}

// ─── AUXILIARES ───────────────────────────────────────────────────────────────
function MiniCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0D1B35] rounded-xl p-2.5 text-center">
      <p className="text-[9px] text-[#94A3B8] uppercase tracking-wide mb-1">{label}</p>
      <p className={cn("text-[12px] font-bold tabular-nums leading-tight", color)}>{value}</p>
    </div>
  );
}

function YTDMonthItem({ name, status }: { name: string; status: 'completo' | 'parcial' | 'vacio' }) {
  return (
    <div className="flex items-center justify-between gap-1">
      <span className="text-[11px] font-medium text-[#0F172A] dark:text-[#F1F5F9]">{name}</span>
      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", status === "completo" ? "bg-[#10B981]" : status === "parcial" ? "bg-[#F59E0B]" : "bg-slate-200 dark:bg-slate-700")} />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("w-2 h-2 rounded-full", color)} />
      <span className="text-[9px] text-[#94A3B8] uppercase tracking-wide">{label}</span>
    </div>
  );
}

function QuickActionButton({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex flex-col items-center justify-center gap-1 p-3 bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-lg hover:border-[#1B4FD8]/40 transition-all group shadow-sm active:scale-95 disabled:opacity-50">
      <div className="group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider group-hover:text-[#1B4FD8]">{label}</span>
    </button>
  );
}

