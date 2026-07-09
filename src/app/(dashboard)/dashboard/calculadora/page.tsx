"use client";

import React, { useState, useEffect } from "react";
import {
  Calculator,
  Plus,
  Tag,
  Search,
  Filter,
  Trash2,
  Pencil,
  FileCheck,
  RefreshCw,
  TrendingUp,
  BarChart2,
  CheckCircle,
  FileText,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { useLanguage } from "@/lib/LanguageContext";
import { DashboardPageContainer } from "@/components/dashboard/DashboardPageContainer";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { format, parseISO, addDays } from "date-fns";

import PageSkeleton from "@/components/dashboard/ui/PageSkeleton";
import dynamic from "next/dynamic";
// Components
const QuoteCalculator = dynamic(() => import("@/components/dashboard/calculator/QuoteCalculator"), {
  ssr: false,
  loading: () => <div className="animate-pulse" />
});
const CatalogManager = dynamic(() => import("@/components/dashboard/calculator/CatalogManager"), {
  ssr: false,
  loading: () => <div className="animate-pulse" />
});

interface QuoteCalculation {
  id: string;
  organization_id: string;
  estimate_id: string | null;
  title: string;
  client_name: string;
  client_email: string | null;
  items: any;
  subtotal: number;
  markup_percent: number;
  markup_amount: number;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function CalculatorPage() {
  const supabase = createClient();
  const { organization } = useOrganization();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Lists and Search States
  const [calculations, setCalculations] = useState<QuoteCalculation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Modal Control States
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<QuoteCalculation | null>(null);

  // Local translations
  const pageTranslations = {
    es: {
      title: "Calculadora de Presupuestos",
      subtitle: "Gestión de cálculos rápidos y universales",
      newCalculation: "Nueva Calculación",
      manageCatalog: "Gestionar Catálogo",
      searchPlaceholder: "Buscar cálculo por título o cliente...",
      statusFilterAll: "Todos los estados",
      statusFilterDraft: "Borrador",
      statusFilterConverted: "Convertido",
      noRecords: "No se encontraron cálculos guardados.",
      colTitle: "Título del Cálculo",
      colClient: "Cliente",
      colTotal: "Total",
      colDate: "Fecha",
      colStatus: "Estado",
      colActions: "Acciones",
      statusDraft: "Borrador",
      statusConverted: "Convertido",
      kpiTotalCalculated: "Total calculado este mes",
      kpiCountCalculations: "Nº de cálculos",
      kpiConverted: "Convertidos",
      toastLoadError: "Error al cargar cálculos",
      toastDeleteSuccess: "Cálculo eliminado correctamente",
      toastDeleteError: "Error al eliminar el cálculo",
      toastExportSuccess: "Presupuesto creado con éxito como {num}",
      toastExportError: "Error al exportar cálculo a Presupuestos",
      deleteConfirm: "¿Eliminar el cálculo permanentemente?",
      exportConfirm: "¿Deseas exportar este cálculo a la lista de Presupuestos?",
      titleEdit: "Editar",
      titleDelete: "Eliminar",
      titleExport: "Exportar a Presupuestos",
      activeLabel: "UNIVERSAL",
    },
    en: {
      title: "Quote Calculator",
      subtitle: "Universal and generic quote calculation management",
      newCalculation: "New Calculation",
      manageCatalog: "Manage Catalog",
      searchPlaceholder: "Search calculation by title or client...",
      statusFilterAll: "All statuses",
      statusFilterDraft: "Draft",
      statusFilterConverted: "Converted",
      noRecords: "No saved calculations found.",
      colTitle: "Calculation Title",
      colClient: "Client",
      colTotal: "Total",
      colDate: "Date",
      colStatus: "Status",
      colActions: "Actions",
      statusDraft: "Draft",
      statusConverted: "Converted",
      kpiTotalCalculated: "Calculated this month",
      kpiCountCalculations: "No. of calculations",
      kpiConverted: "Converted",
      toastLoadError: "Error loading calculations",
      toastDeleteSuccess: "Calculation deleted successfully",
      toastDeleteError: "Error deleting calculation",
      toastExportSuccess: "Estimate successfully created as {num}",
      toastExportError: "Error exporting calculation to Estimates",
      deleteConfirm: "Delete calculation permanently?",
      exportConfirm: "Do you want to export this calculation to the Estimates list?",
      titleEdit: "Edit",
      titleDelete: "Delete",
      titleExport: "Export to Estimates",
      activeLabel: "UNIVERSAL",
    }
  };

  const currentT = pageTranslations[language === "es" ? "es" : "en"];
  const currencySymbol = organization?.currency_symbol || "€";

  useEffect(() => {
    fetchCalculations();
  }, [organization?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!organization?.id) return;

    const channel = supabase
      .channel("quote-calculations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quote_calculations",
          filter: `organization_id=eq.${organization.id}`
        },
        () => {
          fetchCalculations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization?.id, supabase]);

  async function fetchCalculations() {
    if (!organization?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quote_calculations")
        .select("*")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCalculations(data || []);
    } catch (err) {
      console.error("Error loading calculations:", err);
      toast.error(currentT.toastLoadError);
    } finally {
      setLoading(false);
    }
  }

  // KPIs
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const totalCalculatedThisMonth = calculations.reduce((acc, calc) => {
    const calcDate = new Date(calc.created_at);
    if (calcDate.getMonth() === currentMonth && calcDate.getFullYear() === currentYear) {
      return acc + Number(calc.total || 0);
    }
    return acc;
  }, 0);

  const numCalculations = calculations.length;

  const numConverted = calculations.filter((calc) => calc.estimate_id !== null).length;

  // Filter calculations
  const filteredCalculations = calculations.filter((calc) => {
    const matchesSearch =
      calc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calc.client_name.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "todos") return matchesSearch;
    if (statusFilter === "draft") return matchesSearch && !calc.estimate_id;
    if (statusFilter === "converted") return matchesSearch && calc.estimate_id;
    return matchesSearch;
  });

  const handleCreate = () => {
    setSelectedCalculation(null);
    setIsCalculatorOpen(true);
  };

  const handleEdit = (calc: QuoteCalculation) => {
    setSelectedCalculation(calc);
    setIsCalculatorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(currentT.deleteConfirm)) return;
    setActionLoading(`del-${id}`);
    try {
      const { error } = await supabase.from("quote_calculations").delete().eq("id", id);
      if (error) throw error;
      toast.success(currentT.toastDeleteSuccess);
      fetchCalculations();
    } catch (err) {
      console.error("Error deleting calculation:", err);
      toast.error(currentT.toastDeleteError);
    } finally {
      setActionLoading(null);
    }
  };

  // Generate Estimate number
  const getNextEstimateNumber = async (orgId: string): Promise<string> => {
    const currentYear = new Date().getFullYear();
    const prefix = `PRE-${currentYear}-`;
    
    try {
      const { data, error } = await supabase
        .from("estimates")
        .select("estimate_number")
        .eq("organization_id", orgId)
        .like("estimate_number", `${prefix}%`);
        
      if (error) throw error;
      
      let maxSeq = 0;
      if (data && data.length > 0) {
        data.forEach((est: any) => {
          const parts = est.estimate_number.split("-");
          if (parts.length >= 3) {
            const seq = parseInt(parts[2], 10);
            if (!isNaN(seq) && seq > maxSeq) {
              maxSeq = seq;
            }
          }
        });
      }
      
      const nextSeq = maxSeq + 1;
      return `${prefix}${String(nextSeq).padStart(3, "0")}`;
    } catch (err) {
      console.error("Error generating estimate number, fallback used:", err);
      return `${prefix}001`;
    }
  };

  const handleExport = async (calc: QuoteCalculation) => {
    if (!confirm(currentT.exportConfirm)) return;
    setActionLoading(`export-${calc.id}`);
    try {
      const estimateNumber = await getNextEstimateNumber(organization!.id);

      // Create estimate items format: { description, quantity, unit_price }
      const estimateItems: any[] = (calc.items || []).map((it: any) => ({
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price
      }));

      // Append markup as a line item if greater than 0
      if (calc.markup_amount > 0) {
        estimateItems.push({
          description: `Margen / Markup (${calc.markup_percent}%)`,
          quantity: 1,
          unit_price: calc.markup_amount
        });
      }

      // Append discount as a line item if greater than 0
      if (calc.discount_amount > 0) {
        estimateItems.push({
          description: `Descuento / Discount (${calc.discount_percent}%)`,
          quantity: 1,
          unit_price: -calc.discount_amount
        });
      }

      // Insert estimate
      const { data: newEst, error: estError } = await supabase
        .from("estimates")
        .insert({
          organization_id: organization!.id,
          estimate_number: estimateNumber,
          customer_name: calc.client_name,
          customer_email: calc.client_email || null,
          items: estimateItems,
          subtotal: calc.subtotal + calc.markup_amount - calc.discount_amount,
          tax_rate: calc.tax_rate,
          tax_amount: calc.tax_amount,
          total: calc.total,
          notes: calc.notes || null,
          status: "draft",
          valid_until: format(addDays(new Date(), 15), "yyyy-MM-dd"),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select("id")
        .single();

      if (estError) throw estError;

      // Update quote calculation status
      if (newEst) {
        const { error: calcUpdateError } = await supabase
          .from("quote_calculations")
          .update({
            estimate_id: newEst.id,
            status: "converted",
            updated_at: new Date().toISOString()
          })
          .eq("id", calc.id);

        if (calcUpdateError) throw calcUpdateError;
        toast.success(currentT.toastExportSuccess.replace("{num}", estimateNumber));
        fetchCalculations();
      }
    } catch (err) {
      console.error("Error exporting to estimate:", err);
      toast.error(currentT.toastExportError);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (calc: QuoteCalculation) => {
    if (calc.estimate_id) {
      return (
        <span className="px-2.5 py-1 bg-green-500/10 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1.5 w-fit border border-green-500/20">
          <CheckCircle className="w-3.5 h-3.5" /> {currentT.statusConverted}
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs font-semibold rounded-full flex items-center gap-1.5 w-fit border border-slate-700">
          {currentT.statusDraft}
        </span>
      );
    }
  };

  if (loading) {
    return <PageSkeleton showKPIs={true} rows={6} />;
  }

  return (
    <>
      <DashboardPageContainer>
        {/* Main Banner */}
        <div className="card-premium p-0 overflow-hidden shadow-2xl shadow-blue-500/5 relative group bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-indigo-500/5 opacity-50 transition-opacity group-hover:opacity-80" />

          <div className="relative px-4 md:px-8 py-6 flex flex-col xl:flex-row items-center justify-between gap-6 font-geist">
            {/* Left: Branding */}
            <div className="flex items-center gap-6 w-full xl:w-auto">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B4FD8] to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1B4FD8]">{currentT.title.toUpperCase()}</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#1B4FD8]/10 text-[#60A5FA] text-[8px] font-black uppercase tracking-widest border border-[#1B4FD8]/25">{currentT.activeLabel}</span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  {currentT.title}
                </h1>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">{currentT.subtitle}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <button
                onClick={() => setIsCatalogOpen(true)}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border border-slate-700 active:scale-95 w-full md:w-auto shrink-0"
              >
                <Tag className="w-4 h-4" />
                {currentT.manageCatalog}
              </button>

              <button
                onClick={handleCreate}
                className="flex items-center justify-center gap-2 bg-[#1B4FD8] hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95 w-full md:w-auto shrink-0"
              >
                <Plus className="w-4 h-4" />
                {currentT.newCalculation}
              </button>
            </div>
          </div>
        </div>

        {/* KPIs Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* KPI 1 */}
          <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl p-6 md:p-8 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center rounded-2xl shrink-0">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{currentT.kpiTotalCalculated}</p>
              <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight tabular-nums">
                {totalCalculatedThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currencySymbol}
              </p>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl p-6 md:p-8 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center rounded-2xl shrink-0">
              <BarChart2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{currentT.kpiCountCalculations}</p>
              <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight tabular-nums">
                {numCalculations}
              </p>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl p-6 md:p-8 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center rounded-2xl shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{currentT.kpiConverted}</p>
              <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight tabular-nums">
                {numConverted}
              </p>
            </div>
          </div>
        </div>

        {/* List Table and Filters */}
        <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="py-6 px-4 md:px-8 border-b border-[#E2E8F0] dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                placeholder={currentT.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#0A1628] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-[#475569] outline-none focus:ring-2 focus:ring-[#1B4FD8]/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                <Filter className="w-4 h-4 text-[#64748B]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-[13px] font-bold text-slate-500 uppercase tracking-tight outline-none cursor-pointer"
                >
                  <option value="todos" className="bg-[#111F3A] text-white">
                    {currentT.statusFilterAll}
                  </option>
                  <option value="draft" className="bg-[#111F3A] text-white">
                    {currentT.statusFilterDraft}
                  </option>
                  <option value="converted" className="bg-[#111F3A] text-white">
                    {currentT.statusFilterConverted}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Calculations Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#0A1628]/50 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider border-b border-[#E2E8F0] dark:border-[#1E3A5F]">
                  <th className="px-5 py-4 w-1/3">{currentT.colTitle}</th>
                  <th className="px-5 py-4">{currentT.colClient}</th>
                  <th className="px-5 py-4 text-right">{currentT.colTotal}</th>
                  <th className="px-5 py-4">{currentT.colDate}</th>
                  <th className="px-5 py-4">{currentT.colStatus}</th>
                  <th className="px-5 py-4 text-center">{currentT.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E3A5F]">
                {loading && calculations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#1B4FD8] mb-2" />
                      Cargando cálculos...
                    </td>
                  </tr>
                ) : filteredCalculations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                      {currentT.noRecords}
                    </td>
                  </tr>
                ) : (
                  filteredCalculations.map((calc) => (
                    <tr
                      key={calc.id}
                      className="hover:bg-[#F8FAFC] dark:hover:bg-[#0D1B35]/50 transition-colors group text-sm text-[#0F172A] dark:text-[#F1F5F9]"
                    >
                      {/* Title */}
                      <td className="px-5 py-4 font-semibold">
                        {calc.title}
                      </td>

                      {/* Client */}
                      <td className="px-5 py-4">
                        <p className="font-semibold">{calc.client_name}</p>
                        {calc.client_email && (
                          <p className="text-xs text-slate-400 mt-0.5">{calc.client_email}</p>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 text-right font-black tabular-nums">
                        {calc.total.toFixed(2)} {currencySymbol}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs font-mono text-[#475569] dark:text-[#CBD5E1]">
                        {format(parseISO(calc.created_at), "dd/MM/yyyy")}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {getStatusBadge(calc)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          {/* Export to Estimate Button */}
                          {!calc.estimate_id && (
                            <button
                              onClick={() => handleExport(calc)}
                              disabled={actionLoading === `export-${calc.id}`}
                              title={currentT.titleExport}
                              className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20"
                            >
                              {actionLoading === `export-${calc.id}` ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <FileCheck className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEdit(calc)}
                            title={currentT.titleEdit}
                            className="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(calc.id)}
                            disabled={actionLoading === `del-${calc.id}`}
                            title={currentT.titleDelete}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                          >
                            {actionLoading === `del-${calc.id}` ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardPageContainer>

      {/* Calculator Modal */}
      {isCalculatorOpen && (
        <QuoteCalculator
          isOpen={isCalculatorOpen}
          onClose={() => {
            setIsCalculatorOpen(false);
            setSelectedCalculation(null);
          }}
          onSaved={fetchCalculations}
          calculationToEdit={selectedCalculation}
        />
      )}

      {/* Catalog Modal */}
      {isCatalogOpen && (
        <CatalogManager
          isOpen={isCatalogOpen}
          onClose={() => setIsCatalogOpen(false)}
        />
      )}
    </>
  );
}
