'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { useOrganization } from '@/context/OrganizationContext';
import { OCIO_INCOME_CATEGORIES } from './categories';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const inputCls = "w-full px-4 py-2.5 border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-xl bg-[#F1F5F9] dark:bg-[#111F3A] text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-[14px] min-h-[44px] appearance-none";

export default function AddBusinessIncomeModal({ isOpen, onClose, onSuccess }: Props) {
  const { organization } = useOrganization();
  const [concept, setConcept] = useState(OCIO_INCOME_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [client, setClient] = useState('');
  const [project, setProject] = useState('');
  const [notes, setNotes] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!concept.trim()) e.concept = 'El concepto no puede estar vacío';
    const n = parseFloat(amount.replace(',', '.'));
    if (!amount.trim() || isNaN(n) || n <= 0) e.amount = 'El importe debe ser mayor que 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('No autenticado'); return; }
      if (!organization?.id) { toast.error('Organización no encontrada'); return; }

      const { error } = await supabase.from('business_entries').insert({
        user_id: user.id,
        organization_id: organization.id,
        month,
        year: new Date().getFullYear(),
        concept: concept.toUpperCase(),
        type: 'ingreso_cliente',
        amount: parseFloat(amount.replace(',', '.')),
        client: client.trim() || null,
        project: project.trim() || null,
        notes: notes.trim() || null,
      });
      if (error) throw error;
      toast.success('Ingreso añadido correctamente');
      setConcept(OCIO_INCOME_CATEGORIES[0]); setAmount(''); setClient(''); setProject(''); setNotes('');
      setMonth(new Date().getMonth() + 1); setErrors({});
      onClose(); onSuccess?.();
    } catch { toast.error('Error al añadir ingreso'); }
    finally { setIsLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Nuevo Ingreso</h2>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 uppercase tracking-wide">Factura / Cobro de cliente</p>
          </div>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-1.5">Categoría / Concepto *</label>
            <select
              value={concept}
              onChange={e => { setConcept(e.target.value); setErrors(p => ({ ...p, concept: '' })); }}
              className={inputCls + (errors.concept ? ' border-red-400' : '')}
            >
              {OCIO_INCOME_CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-[#111F3A] text-white">{cat}</option>
              ))}
            </select>
            {errors.concept && <p className="text-[11px] text-red-400 mt-1">{errors.concept}</p>}
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-1.5">Importe (€) *</label>
            <input type="text" inputMode="decimal" value={amount} onChange={e => { setAmount(e.target.value); setErrors(p => ({ ...p, amount: '' })); }}
              placeholder="0,00" className={inputCls + ' font-semibold tabular-nums' + (errors.amount ? ' border-red-400' : '')} />
            {errors.amount && <p className="text-[11px] text-red-400 mt-1">{errors.amount}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-1.5">Cliente</label>
              <input type="text" value={client} onChange={e => setClient(e.target.value)} placeholder="Nombre cliente" className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-1.5">Proyecto</label>
              <input type="text" value={project} onChange={e => setProject(e.target.value)} placeholder="Nombre proyecto" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-1.5">Mes</label>
            <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className={inputCls}>
              {MESES.map((m, i) => <option key={m} value={i + 1} className="bg-[#111F3A] text-white">{m}</option>)}
            </select>
          </div>
          <div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas opcionales..."
              className={inputCls + ' resize-none h-16'} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-[#1E3A5F]">
            <button type="button" onClick={onClose} disabled={isLoading}
              className="flex-1 px-4 py-3 border border-[#E2E8F0] dark:border-[#1E3A5F] text-[#64748B] rounded-xl hover:bg-slate-50 dark:hover:bg-[#162040] text-[13px] font-semibold uppercase tracking-wide disabled:opacity-50 min-h-[48px] transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-[13px] font-semibold uppercase tracking-wide shadow-lg active:scale-[0.98] disabled:opacity-50 min-h-[48px] transition-all">
              {isLoading ? 'Guardando...' : 'Nuevo Ingreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
