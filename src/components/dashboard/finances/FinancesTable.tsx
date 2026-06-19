"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { MoreHorizontal, Home, Shield, AlertTriangle, Plus, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/formatCurrency";
import { useOrganization } from "@/context/OrganizationContext";
import { useLanguage } from "@/lib/LanguageContext";

import { OCIO_INCOME_CATEGORIES, OCIO_EXPENSE_CATEGORIES } from "./categories";

export type FinanceEntry = {
  id: string;
  concept: string;
  category: string;
  type: string;
  amount: number;
  month: number;
  year: number;
};

const TYPE_BADGE: Record<string, string> = {
  gasto_fijo: "bg-[#EFF6FF] dark:bg-[#1B4FD8]/20 text-[#1B4FD8] dark:text-[#93C5FD]",
  variable: "bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#D97706] dark:text-[#FCD34D]",
  ingreso: "bg-[#D1FAE5] dark:bg-[#10B981]/20 text-[#059669] dark:text-[#6EE7B7]",
  deuda: "bg-[#FEF2F2] dark:bg-[#EF4444]/20 text-[#DC2626] dark:text-[#FCA5A5]",
  ahorro: "bg-[#F0FDF4] dark:bg-[#10B981]/20 text-[#16A34A] dark:text-[#86EFAC]",
  suscripcion: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
};

// Badges for Ocio categories
OCIO_INCOME_CATEGORIES.forEach(cat => { TYPE_BADGE[cat] = "bg-[#D1FAE5] dark:bg-[#10B981]/20 text-[#059669] dark:text-[#6EE7B7]"; });
OCIO_EXPENSE_CATEGORIES.forEach(cat => { TYPE_BADGE[cat] = "bg-[#FEF2F2] dark:bg-[#EF4444]/20 text-[#DC2626] dark:text-[#FCA5A5]"; });

const getCategoryKey = (cat: string) => {
  return cat
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*\/\s*/g, '_')
    .replace(/\s+/g, '_');
};

function iconForType(type: string) {
  if (type === "deuda" || OCIO_EXPENSE_CATEGORIES.includes(type)) return <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />;
  if (type === "ingreso" || OCIO_INCOME_CATEGORIES.includes(type)) return <ArrowUpIcon />;
  if (type === "variable") return <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />;
  return <Home className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />;
}

function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-600 w-3.5 h-3.5 md:w-4 md:h-4">
      <path d="M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FinancesTable({
  month,
  monthNumber,
  year,
  userId,
  entries,
  loading,
  onEntriesChange,
}: {
  month: string;
  monthNumber: number;
  year: number;
  userId: string | null;
  entries: FinanceEntry[];
  loading: boolean;
  onEntriesChange: (next: FinanceEntry[]) => void;
}) {
  const { organizationId } = useOrganization();
  const supabase = useMemo(() => createClient(), []);
  const { t } = useLanguage();
  const [allHistoryConcepts, setAllHistoryConcepts] = useState<string[]>([]);

  const conceptSuggestions = useMemo(() => {
    const combined = Array.from(new Set([...OCIO_INCOME_CATEGORIES, ...OCIO_EXPENSE_CATEGORIES]));
    return combined.sort((a, b) => a.localeCompare(b, "es"));
  }, []);

  const getTypeLabel = (type: string) => {
    const lower = type.toLowerCase();
    if (["gasto_fijo", "variable", "ingreso", "deuda", "ahorro", "suscripcion"].includes(lower)) {
      return t(`financesTable.types.${lower}`);
    }
    return t(`finances.categories.${getCategoryKey(type)}`, { defaultValue: type });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('finance_entries')
        .select('concept')
        .eq('user_id', userId)
        .limit(100);
      
      if (!error && data) {
        setAllHistoryConcepts(Array.from(new Set((data as { concept: string }[]).map(d => d.concept.toUpperCase()))));
      }
    };
    fetchHistory();
  }, [userId, supabase]);

  const [isAdding, setIsAdding] = useState(false);
  const [newConcept, setNewConcept] = useState("");
  const [newType, setNewType] = useState<FinanceEntry["type"]>("variable");
  const [newAmount, setNewAmount] = useState("");
  const [savingNew, setSavingNew] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingId) {
      queueMicrotask(() => editInputRef.current?.focus());
    }
  }, [editingId]);

  function startAdd() {
    if (!userId) return;
    setIsAdding(true);
    setNewConcept("");
    setNewType("Otros gastos");
    setNewAmount("");
  }

  function cancelAdd() {
    setIsAdding(false);
    setNewConcept("");
    setNewAmount("");
    setNewType("");
  }

  async function confirmAdd() {
    if (!userId) return;
    const concept = newConcept.trim();
    const amountNumber = Number(String(newAmount).replace(",", "."));

    if (!concept) {
      toast.error(t("financesTable.errors.conceptEmpty"));
      return;
    }
    if (!Number.isFinite(amountNumber)) {
      toast.error(t("financesTable.errors.amountInvalid"));
      return;
    }

    setSavingNew(true);
    const { data, error } = await supabase
      .from("finance_entries")
      .insert({
        user_id: userId,
        organization_id: organizationId,
        month: monthNumber,
        year,
        concept: concept.toUpperCase(),
        category: newType.toUpperCase(),
        type: OCIO_INCOME_CATEGORIES.includes(newType) ? 'ingreso' : 'gasto',
        amount: amountNumber,
      })
      .select("*")
      .single();

    if (error || !data) {
      toast.error(t("financesTable.toast.addError"));
      setSavingNew(false);
      return;
    }

    onEntriesChange([
      ...entries,
      {
        id: String((data as any).id),
        concept: String((data as any).concept ?? "").toUpperCase(),
        category: String((data as any).category ?? "").toUpperCase(),
        type: (data as any).type,
        amount: Number((data as any).amount),
        month: Number((data as any).month),
        year: Number((data as any).year),
      },
    ]);
    toast.success(t("financesTable.toast.addSuccess"));
    setSavingNew(false);
    cancelAdd();
  }

  function startEditAmount(entry: FinanceEntry) {
    setEditingId(entry.id);
    setEditValue(String(entry.amount).replace(".", ","));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  async function commitEdit(entry: FinanceEntry) {
    if (!userId) return;
    const next = Number(String(editValue).replace(",", "."));
    if (!Number.isFinite(next)) {
      toast.error(t("financesTable.errors.amountInvalid"));
      return;
    }
    
    if (next === entry.amount) {
      setEditingId(null);
      return;
    }

    setEditingId(null);
    const prevAmount = entry.amount;
    
    // Optimistic Update
    onEntriesChange(entries.map((e) => (e.id === entry.id ? { ...e, amount: next } : e)));

    const { error } = await supabase
      .from("finance_entries")
      .update({
        amount: next,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entry.id)
      .eq("user_id", userId);

    if (error) {
      onEntriesChange(entries.map((e) => (e.id === entry.id ? { ...e, amount: prevAmount } : e)));
      toast.error(t("financesTable.toast.updateError"));
    }
  }

  async function deleteEntry(entry: FinanceEntry) {
    if (!userId) return;
    const ok = window.confirm(t("financesTable.confirmDelete", { concept: entry.concept.toUpperCase() }));
    if (!ok) return;

    const prev = entries;
    onEntriesChange(entries.filter((e) => e.id !== entry.id));

    const { error } = await supabase
      .from("finance_entries")
      .delete()
      .eq("id", entry.id)
      .eq("user_id", userId);

    if (error) {
      onEntriesChange(prev);
      toast.error(t("financesTable.toast.deleteError"));
      return;
    }
    toast.success(t("financesTable.toast.deleteSuccess"));
  }

  return (
    <div className="card-premium card-finanzas p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-8 pb-6 border-b border-slate-50 dark:border-white/5">
        <h3 className="card-titulo">
          {t('financesTable.title', { month: t('monthSelector.' + month), year })}
        </h3>
        <div className="flex items-center gap-4">
          <button className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#1B4FD8] transition-colors">
            {t('financesTable.viewHistory')}
          </button>
        </div>
      </div>
      <div className="hidden lg:block overflow-x-auto -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="text-left">
              <th className="pb-4 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                {t('financesTable.headers.concept')}
              </th>
              <th className="pb-4 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                {t('financesTable.headers.type')}
              </th>
              <th className="pb-4 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-right">
                {t('financesTable.headers.amount')}
              </th>
              <th className="pb-4 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-right">
                {t('financesTable.headers.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-[#1E3A5F]">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3 md:py-4 lg:py-5">
                    <div className="h-4 md:h-5 w-32 md:w-40 bg-slate-200/60 rounded" />
                  </td>
                  <td className="py-3 md:py-4 lg:py-5">
                    <div className="h-4 md:h-5 w-20 md:w-28 bg-slate-200/50 rounded" />
                  </td>
                  <td className="py-3 md:py-4 lg:py-5">
                    <div className="h-4 md:h-5 w-16 md:w-24 bg-slate-200/60 rounded ml-auto" />
                  </td>
                  <td className="py-3 md:py-4 lg:py-5">
                    <div className="h-4 md:h-5 w-8 md:w-10 bg-slate-200/40 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : entries.length === 0 && !isAdding ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <p className="text-slate-500 text-sm">{t('financesTable.noEntries')}</p>
                  <p className="text-slate-400 text-xs mt-1">{t('financesTable.addConceptPrompt')}</p>
                </td>
              </tr>
            ) : (
              <>
                {entries.map((row, idx) => (
                  <tr 
                     key={row.id} 
                     className={cn(
                       "group transition-colors h-14 md:h-16",
                       idx % 2 === 0 ? "bg-white dark:bg-[#111F3A]" : "bg-[#F8FAFC]/40 dark:bg-[#0D1B35]/40",
                       "hover:bg-[#F0F7FF] dark:hover:bg-[#162040] border-b border-slate-50 dark:border-[#1E3A5F]"
                     )}
                  >
                    <td className="py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 dark:bg-[#0D1B35] rounded-xl flex items-center justify-center border border-slate-100 dark:border-[#1E3A5F] group-hover:bg-white dark:group-hover:bg-[#111F3A] transition-colors flex-shrink-0">
                          <div className="w-4 h-4 md:w-5 md:h-5">{iconForType(row.type)}</div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-[#0F172A] dark:text-[#F1F5F9] uppercase tracking-wide truncate max-w-[180px]">
                            {row.concept}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {t('finances.categories.' + getCategoryKey(row.category), { defaultValue: row.category })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 md:py-4 lg:py-5">
                      {getTypeLabel(row.type).toUpperCase()}
                    </td>
                    <td className="py-3 md:py-4 lg:py-5 text-right text-[10px] md:text-[12px] lg:text-[14px] font-normal text-[#0F172A] dark:text-[#F1F5F9] font-mono tabular-nums">
                      {editingId === row.id ? (
                        <input
                          ref={editInputRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit(row);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          onBlur={() => commitEdit(row)}
                          className="bg-[#F1F5F9] dark:bg-[#0D1B35] border border-[#1B4FD8] rounded-lg px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-[12px] lg:text-[13px] font-normal text-[#0F172A] dark:text-[#F1F5F9] w-20 md:w-24 text-right outline-none focus:ring-4 focus:ring-blue-500/20 min-h-[32px] md:min-h-[36px]"
                          inputMode="decimal"
                          placeholder="0,00"
                        />
                      ) : (
                        <button
                          onClick={() => startEditAmount(row)}
                          className="hover:underline underline-offset-4"
                          title={t('financesTable.editAmountTooltip')}
                        >
                          {formatCurrency(row.amount)}
                        </button>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-2 text-[#64748B] dark:text-[#475569] hover:text-[#1B4FD8] dark:hover:text-[#F1F5F9] transition-colors"
                          title={t('common.delete')}
                          onClick={() => deleteEntry(row)}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {isAdding && (
                  <tr className="bg-blue-600/5 dark:bg-blue-500/10 border-b-2 border-blue-500/20 shadow-inner">
                    <td className="py-3 md:py-4 lg:py-5 pl-1 md:pl-2 lg:pl-2">
                      <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
                        <div className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 flex-shrink-0">
                          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1B4FD8]" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <input
                            value={newConcept}
                            onChange={(e) => setNewConcept(e.target.value)}
                            list="concept-suggestions"
                            className="bg-white dark:bg-[#0F172A] border border-blue-500/40 rounded-xl px-4 py-2 text-[13px] font-medium text-[#0F172A] dark:text-[#F1F5F9] w-48 md:w-56 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                            placeholder={t('financesTable.newConceptPlaceholder')}
                          />
                          <datalist id="concept-suggestions">
                            {conceptSuggestions.map((c) => (
                              <option key={c} value={c} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 md:py-4 lg:py-5">
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="bg-white dark:bg-[#0F172A] border border-blue-500/40 rounded-xl px-3 py-2 text-[12px] font-medium text-[#0F172A] dark:text-[#F1F5F9] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all min-h-[40px] appearance-none cursor-pointer"
                      >
                        <optgroup label={t('financesTable.optgroups.income')}>
                          {OCIO_INCOME_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{t('finances.categories.' + getCategoryKey(cat), { defaultValue: cat })}</option>
                          ))}
                        </optgroup>
                        <optgroup label={t('financesTable.optgroups.expenses')}>
                          {OCIO_EXPENSE_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{t('finances.categories.' + getCategoryKey(cat), { defaultValue: cat })}</option>
                          ))}
                        </optgroup>
                      </select>
                    </td>
                    <td className="py-3 md:py-4 lg:py-5 text-right">
                      <input
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="bg-white dark:bg-[#0F172A] border border-blue-500/40 rounded-xl px-4 py-2 text-[14px] font-bold text-right text-[#0F172A] dark:text-[#F1F5F9] w-24 md:w-32 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                        inputMode="decimal"
                        placeholder="0,00"
                      />
                    </td>
                    <td className="py-3 md:py-4 lg:py-5 text-right pr-1 md:pr-2">
                      <div className="flex items-center justify-end gap-2 pr-2">
                        <button
                          disabled={savingNew}
                          onClick={confirmAdd}
                          className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-90 transition-all disabled:opacity-50"
                          title={t('financesTable.confirmButton')}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          disabled={savingNew}
                          onClick={cancelAdd}
                          className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all"
                          title={t('common.cancel')}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile ListView */}
      <div className="lg:hidden space-y-4">
        {isAdding && (
          <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/40 rounded-2xl space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 block">{t('financesTable.headers.concept')}</label>
                <input
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  list="concept-suggestions-mobile"
                  className="w-full bg-white dark:bg-[#0D1B35] border border-blue-200 rounded-xl px-4 py-2 text-[14px] text-[#0F172A] dark:text-[#F1F5F9] outline-none"
                  placeholder={t('financesTable.conceptPlaceholderExample')}
                />
                <datalist id="concept-suggestions-mobile">
                  {conceptSuggestions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 block">{t('financesTable.headers.type')}</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-white dark:bg-[#0D1B35] border border-blue-200 rounded-xl px-3 py-2 text-[13px] text-[#0F172A] dark:text-[#F1F5F9] outline-none"
                  >
                    <optgroup label={t('financesTable.optgroups.income')}>
                      {OCIO_INCOME_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{t('finances.categories.' + getCategoryKey(cat), { defaultValue: cat })}</option>
                      ))}
                    </optgroup>
                    <optgroup label={t('financesTable.optgroups.expenses')}>
                      {OCIO_EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{t('finances.categories.' + getCategoryKey(cat), { defaultValue: cat })}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 block">{t('financesTable.amountLabelWithCurrency')}</label>
                  <input
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full bg-white dark:bg-[#0D1B35] border border-blue-200 rounded-xl px-3 py-2 text-[14px] font-mono text-right text-[#0F172A] dark:text-[#F1F5F9] outline-none"
                    inputMode="decimal"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                disabled={savingNew}
                onClick={confirmAdd}
                className="flex-1 bg-[#1B4FD8] text-white py-2.5 rounded-xl font-bold text-[13px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all uppercase"
              >
                {savingNew ? t('common.loading') : t('financesTable.confirmButton')}
              </button>
              <button
                disabled={savingNew}
                onClick={cancelAdd}
                className="px-6 bg-white dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] text-[#64748B] rounded-xl font-bold text-[13px] active:scale-95 transition-all"
              >
                X
              </button>
            </div>
          </div>
        )}

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-[#0D1B35] rounded-xl animate-pulse flex justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-200/60 rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-slate-200/60 rounded" />
                  <div className="h-3 w-16 bg-slate-200/40 rounded" />
                </div>
              </div>
              <div className="h-4 w-16 bg-slate-200/60 rounded" />
            </div>
          ))
        ) : entries.length === 0 && !isAdding ? (
          <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-[#1E3A5F] rounded-2xl">
            <p className="text-slate-500 text-xs text-[#64748B]">{t('financesTable.noEntries')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((row) => (
              <div 
                key={row.id}
                className="p-4 bg-white dark:bg-[#111F3A] border border-slate-100 dark:border-[#1E3A5F] rounded-2xl shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-50 dark:bg-[#0D1B35] rounded-xl flex items-center justify-center border border-slate-100 dark:border-[#1E3A5F]">
                      <div className="w-4 h-4">{iconForType(row.type)}</div>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] uppercase tracking-wide truncate max-w-[140px]">{row.concept}</p>
                      <span className={cn(
                        "text-[9px] font-bold tracking-wider rounded-md px-1.5 py-0.5 inline-block mt-0.5",
                        TYPE_BADGE[row.type]
                      )}>
                        {getTypeLabel(row.type).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {editingId === row.id ? (
                      <input
                        ref={editInputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => commitEdit(row)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit(row);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="bg-[#F1F5F9] dark:bg-[#0D1B35] border border-[#1B4FD8] rounded-lg px-2 py-1 text-[13px] font-mono w-20 text-right outline-none"
                        inputMode="decimal"
                      />
                    ) : (
                      <p 
                        onClick={() => startEditAmount(row)}
                        className="text-[14px] font-bold text-[#0F172A] dark:text-[#F1F5F9] font-mono tabular-nums"
                      >
                        {formatCurrency(row.amount)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50 dark:border-[#1E3A5F]">
                  <button 
                    onClick={() => startEditAmount(row)}
                    className="text-[10px] font-bold text-[#1B4FD8] px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  >
                    {t('common.edit').toUpperCase()}
                  </button>
                  <button 
                    onClick={() => deleteEntry(row)}
                    className="text-[10px] font-bold text-red-500 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    {t('common.delete').toUpperCase()}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={startAdd}
        disabled={!userId || loading}
        className="mt-6 flex items-center gap-2 text-[13px] font-semibold text-[#1B4FD8] border border-dashed border-[#1B4FD8] rounded-xl px-4 h-11 hover:bg-[#EFF6FF] dark:hover:bg-[#162040] transition-all group disabled:opacity-50 w-full justify-center"
      >
        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
        {t('financesTable.addConceptButton')}
      </button>
    </div>
  );
}
