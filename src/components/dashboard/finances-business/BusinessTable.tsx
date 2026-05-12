"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Check, X, Briefcase, TrendingUp, TrendingDown, Wrench, Megaphone, Code, AlertCircle, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/formatCurrency";
import { useOrganization } from "@/context/OrganizationContext";

export type BusinessEntry = {
  id: string;
  concept: string;
  type: "ingreso_cliente" | "gasto_operativo" | "gasto_marketing" | "gasto_herramientas" | "gasto_desarrollo" | "impuesto" | "otros";
  amount: number;
  month: number;
  year: number;
  client?: string | null;
  project?: string | null;
  notes?: string | null;
};

const TYPE_LABEL: Record<BusinessEntry["type"], string> = {
  ingreso_cliente: "INGRESO CLIENTE",
  gasto_operativo: "GASTO OPERATIVO",
  gasto_marketing: "MARKETING",
  gasto_herramientas: "HERRAMIENTAS",
  gasto_desarrollo: "DESARROLLO",
  impuesto: "IMPUESTO",
  otros: "OTROS",
};

const TYPE_BADGE: Record<BusinessEntry["type"], string> = {
  ingreso_cliente: "bg-[#D1FAE5] dark:bg-[#10B981]/20 text-[#059669] dark:text-[#6EE7B7]",
  gasto_operativo: "bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#D97706] dark:text-[#FCD34D]",
  gasto_marketing: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
  gasto_herramientas: "bg-[#EFF6FF] dark:bg-[#1B4FD8]/20 text-[#1B4FD8] dark:text-[#93C5FD]",
  gasto_desarrollo: "bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300",
  impuesto: "bg-[#FEF2F2] dark:bg-[#EF4444]/20 text-[#DC2626] dark:text-[#FCA5A5]",
  otros: "bg-slate-100 dark:bg-slate-800/60 text-[#64748B] dark:text-[#94A3B8]",
};

function TypeIcon({ type }: { type: BusinessEntry["type"] }) {
  const cls = "w-3.5 h-3.5 md:w-4 md:h-4";
  if (type === "ingreso_cliente") return <TrendingUp className={cn(cls, "text-emerald-500")} />;
  if (type === "gasto_herramientas") return <Wrench className={cn(cls, "text-[#1B4FD8]")} />;
  if (type === "gasto_marketing") return <Megaphone className={cn(cls, "text-purple-500")} />;
  if (type === "gasto_desarrollo") return <Code className={cn(cls, "text-cyan-500")} />;
  if (type === "impuesto") return <AlertCircle className={cn(cls, "text-red-500")} />;
  if (type === "gasto_operativo") return <TrendingDown className={cn(cls, "text-amber-500")} />;
  return <Briefcase className={cn(cls, "text-[#64748B]")} />;
}

export default function BusinessTable({
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
  entries: BusinessEntry[];
  loading: boolean;
  onEntriesChange: (next: BusinessEntry[]) => void;
}) {
  const { organization } = useOrganization();
  const symbol = organization?.currency_symbol || '€';
  
  const fmt = (val: number) => {
    return val.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' ' + symbol;
  };

  const supabase = useMemo(() => createClient(), []);

  const [isAdding, setIsAdding] = useState(false);
  const [newConcept, setNewConcept] = useState("");
  const [newType, setNewType] = useState<BusinessEntry["type"]>("ingreso_cliente");
  const [newAmount, setNewAmount] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [savingNew, setSavingNew] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingId) queueMicrotask(() => editInputRef.current?.focus());
  }, [editingId]);

  function cancelAdd() {
    setIsAdding(false);
    setNewConcept(""); setNewType("ingreso_cliente");
    setNewAmount(""); setNewClient(""); setNewProject(""); setNewNotes("");
  }

  async function confirmAdd() {
    if (!userId) return;
    const concept = newConcept.trim();
    const amountNumber = Number(String(newAmount).replace(",", "."));
    if (!concept) { toast.error("Introduce un concepto"); return; }
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) { toast.error("Importe inválido"); return; }

    setSavingNew(true);
    const { data, error } = await supabase
      .from("business_entries")
      .insert({
        user_id: userId,
        month: monthNumber,
        year,
        concept: concept.toUpperCase(),
        type: newType,
        amount: amountNumber,
        client: newClient.trim() || null,
        project: newProject.trim() || null,
        notes: newNotes.trim() || null,
      })
      .select("*")
      .single();

    if (error || !data) { toast.error("Error al añadir entrada"); setSavingNew(false); return; }

    onEntriesChange([
      ...entries,
      {
        id: String((data as any).id),
        concept: String((data as any).concept ?? "").toUpperCase(),
        type: (data as any).type,
        amount: Number((data as any).amount),
        month: Number((data as any).month),
        year: Number((data as any).year),
        client: (data as any).client || null,
        project: (data as any).project || null,
        notes: (data as any).notes || null,
      },
    ]);
    toast.success("Entrada añadida");
    setSavingNew(false);
    cancelAdd();
  }

  async function commitEdit(entry: BusinessEntry) {
    if (!userId) return;
    const next = Number(String(editValue).replace(",", "."));
    if (!Number.isFinite(next)) { toast.error("Importe inválido"); return; }
    if (next === entry.amount) { setEditingId(null); return; }
    setEditingId(null);
    const prevAmount = entry.amount;
    onEntriesChange(entries.map(e => e.id === entry.id ? { ...e, amount: next } : e));
    const { error } = await supabase
      .from("business_entries")
      .update({ amount: next, updated_at: new Date().toISOString() })
      .eq("id", entry.id).eq("user_id", userId);
    if (error) {
      onEntriesChange(entries.map(e => e.id === entry.id ? { ...e, amount: prevAmount } : e));
      toast.error("Error al actualizar");
    }
  }

  async function deleteEntry(entry: BusinessEntry) {
    if (!userId) return;
    if (!window.confirm(`¿Eliminar ${entry.concept}?`)) return;
    const prev = entries;
    onEntriesChange(entries.filter(e => e.id !== entry.id));
    const { error } = await supabase.from("business_entries").delete().eq("id", entry.id).eq("user_id", userId);
    if (error) { onEntriesChange(prev); toast.error("Error al eliminar"); return; }
    toast.success("Entrada eliminada");
  }

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[16px] md:rounded-[20px] lg:rounded-[24px] p-4 md:p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 md:mb-6 lg:mb-8">
        <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
          Movimientos SF — {month} {year}
        </h3>
      </div>

      {/* TABLA DESKTOP */}
      <div className="hidden lg:block overflow-x-auto -mx-8 px-8">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-left">
              {["CONCEPTO", "TIPO", "CLIENTE", "IMPORTE", "ACCIONES"].map(h => (
                <th key={h} className={cn("pb-4 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider", h === "IMPORTE" || h === "ACCIONES" ? "text-right" : "")}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-[#1E3A5F]">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {[4, 4, 4, 4, 4].map((_, j) => (
                  <td key={j} className="py-4"><div className="h-4 bg-slate-200/60 rounded w-3/4" /></td>
                ))}
              </tr>
            )) : entries.length === 0 && !isAdding ? (
              <tr><td colSpan={5} className="py-12 text-center">
                <p className="text-slate-500 text-sm">Sin entradas para este mes</p>
                <p className="text-slate-400 text-xs mt-1">Pulsa + Añadir entrada para comenzar</p>
              </td></tr>
            ) : (
              <>
                {entries.map((row, idx) => (
                  <tr key={row.id} className={cn("group transition-colors h-14",
                    idx % 2 === 0 ? "bg-white dark:bg-[#111F3A]" : "bg-[#F8FAFC]/40 dark:bg-[#0D1B35]/40",
                    "hover:bg-[#F0F7FF] dark:hover:bg-[#162040] border-b border-slate-50 dark:border-[#1E3A5F]"
                  )}>
                    <td className="py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 dark:bg-[#0D1B35] rounded-xl flex items-center justify-center border border-slate-100 dark:border-[#1E3A5F] flex-shrink-0">
                          <TypeIcon type={row.type} />
                        </div>
                        <span className="text-[14px] font-medium text-[#0F172A] dark:text-[#F1F5F9] uppercase tracking-wide truncate max-w-[180px]">
                          {row.concept}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-semibold tracking-[0.05em] uppercase", TYPE_BADGE[row.type])}>
                        {TYPE_LABEL[row.type]}
                      </span>
                    </td>
                    <td className="py-3 text-[13px] text-[#64748B] dark:text-[#94A3B8] truncate max-w-[120px]">
                      {row.client || "—"}
                    </td>
                    <td className="py-3 text-right text-[14px] font-mono tabular-nums text-[#0F172A] dark:text-[#F1F5F9]">
                      {editingId === row.id ? (
                        <input ref={editInputRef} value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") commitEdit(row); if (e.key === "Escape") setEditingId(null); }}
                          onBlur={() => commitEdit(row)}
                          className="bg-[#F1F5F9] dark:bg-[#0D1B35] border border-[#1B4FD8] rounded-lg px-3 py-1 text-[13px] w-24 text-right outline-none focus:ring-2 focus:ring-blue-500/20"
                          inputMode="decimal" placeholder="0,00"
                        />
                      ) : (
                        <button onClick={() => { setEditingId(row.id); setEditValue(String(row.amount).replace(".", ",")); }}
                          className="hover:underline underline-offset-4">
                          {fmt(row.amount)}
                        </button>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      <button onClick={() => deleteEntry(row)}
                        className="p-2 text-[#64748B] hover:text-red-500 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {isAdding && (
                  <tr className="bg-blue-50/30 dark:bg-blue-900/10">
                    <td className="py-3" colSpan={5}>
                      <div className="grid grid-cols-5 gap-2 items-center">
                        <input value={newConcept} onChange={e => setNewConcept(e.target.value)}
                          placeholder="Concepto"
                          className="bg-[#F1F5F9] dark:bg-[#0D1B35] border border-[#1B4FD8] rounded-lg px-3 py-1.5 text-[13px] text-[#0F172A] dark:text-[#F1F5F9] outline-none" />
                        <select value={newType} onChange={e => setNewType(e.target.value as BusinessEntry["type"])}
                          className="bg-[#F1F5F9] dark:bg-[#0D1B35] border border-[#1B4FD8] rounded-lg px-2 py-1.5 text-[12px] text-[#0F172A] dark:text-[#F1F5F9] outline-none">
                          {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                        <input value={newClient} onChange={e => setNewClient(e.target.value)}
                          placeholder="Cliente (opc.)"
                          className="bg-[#F1F5F9] dark:bg-[#0D1B35] border border-[#1B4FD8] rounded-lg px-3 py-1.5 text-[13px] text-[#0F172A] dark:text-[#F1F5F9] outline-none" />
                        <input value={newAmount} onChange={e => setNewAmount(e.target.value)}
                          placeholder="0,00" inputMode="decimal"
                          className="bg-[#F1F5F9] dark:bg-[#0D1B35] border border-[#1B4FD8] rounded-lg px-3 py-1.5 text-[13px] text-right text-[#0F172A] dark:text-[#F1F5F9] outline-none" />
                        <div className="flex gap-2 justify-end">
                          <button disabled={savingNew} onClick={confirmAdd}
                            className="w-8 h-8 bg-[#1B4FD8] text-white rounded-full flex items-center justify-center disabled:opacity-60">
                            <Check className="w-4 h-4" />
                          </button>
                          <button disabled={savingNew} onClick={cancelAdd}
                            className="w-8 h-8 bg-white dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] text-[#64748B] rounded-full flex items-center justify-center">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST */}
      <div className="lg:hidden space-y-3">
        {isAdding && (
          <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/40 rounded-2xl space-y-3">
            <input value={newConcept} onChange={e => setNewConcept(e.target.value)} placeholder="Concepto"
              className="w-full bg-white dark:bg-[#0D1B35] border border-blue-200 rounded-xl px-4 py-2 text-[14px] text-[#0F172A] dark:text-[#F1F5F9] outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <select value={newType} onChange={e => setNewType(e.target.value as BusinessEntry["type"])}
                className="bg-white dark:bg-[#0D1B35] border border-blue-200 rounded-xl px-3 py-2 text-[13px] text-[#0F172A] dark:text-[#F1F5F9] outline-none">
                {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <input value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="0,00" inputMode="decimal"
                className="bg-white dark:bg-[#0D1B35] border border-blue-200 rounded-xl px-3 py-2 text-[14px] font-mono text-right text-[#0F172A] dark:text-[#F1F5F9] outline-none" />
            </div>
            <input value={newClient} onChange={e => setNewClient(e.target.value)} placeholder="Cliente (opcional)"
              className="w-full bg-white dark:bg-[#0D1B35] border border-blue-200 rounded-xl px-4 py-2 text-[13px] text-[#0F172A] dark:text-[#F1F5F9] outline-none" />
            <div className="flex gap-2">
              <button disabled={savingNew} onClick={confirmAdd}
                className="flex-1 bg-[#1B4FD8] text-white py-2.5 rounded-xl font-bold text-[13px] active:scale-95 transition-all">
                {savingNew ? "Guardando..." : "Confirmar"}
              </button>
              <button onClick={cancelAdd} className="px-6 bg-white dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] text-[#64748B] rounded-xl font-bold text-[13px]">X</button>
            </div>
          </div>
        )}
        {!loading && entries.map(row => (
          <div key={row.id} className="p-4 bg-white dark:bg-[#111F3A] border border-slate-100 dark:border-[#1E3A5F] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 dark:bg-[#0D1B35] rounded-xl flex items-center justify-center border border-slate-100 dark:border-[#1E3A5F]">
                  <TypeIcon type={row.type} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] uppercase">{row.concept}</p>
                  {row.client && <p className="text-[11px] text-[#64748B]">{row.client}</p>}
                </div>
              </div>
              <p className="text-[14px] font-bold text-[#0F172A] dark:text-[#F1F5F9] font-mono">{fmt(row.amount)}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-[#1E3A5F]">
              <span className={cn("text-[9px] font-bold tracking-wider rounded-md px-1.5 py-0.5", TYPE_BADGE[row.type])}>{TYPE_LABEL[row.type]}</span>
              <button onClick={() => deleteEntry(row)} className="text-[10px] font-bold text-red-500 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">BORRAR</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setIsAdding(true)} disabled={!userId || loading || isAdding}
        className="mt-6 flex items-center gap-2 text-[13px] font-semibold text-[#1B4FD8] border border-dashed border-[#1B4FD8] rounded-xl px-4 h-11 hover:bg-[#EFF6FF] dark:hover:bg-[#162040] transition-all group disabled:opacity-50 w-full justify-center">
        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
        AÑADIR ENTRADA
      </button>
    </div>
  );
}
