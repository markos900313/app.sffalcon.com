import React, { useState, useEffect } from 'react';
import { 
  X, 
  RefreshCw, 
  FileText, 
  Users, 
  Briefcase, 
  Type, 
  Euro, 
  Percent, 
  Calendar, 
  StickyNote, 
  ChevronDown 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useOrganization } from '@/context/OrganizationContext';
import { getModuleEnabled } from '@/lib/sectorConfig';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  invoiceToEdit?: any;
}

export default function InvoiceModal({ isOpen, onClose, onSaved, invoiceToEdit }: InvoiceModalProps) {
  const supabase = createClient();
  const { organization } = useOrganization();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  function getTaxLabel(country?: string): string {
    const c = (country || 'ES').toUpperCase();
    if (c === 'GB') return 'VAT';
    if (['US','CA','MX','AU'].includes(c)) return 'Tax';
    return 'IVA';
  }

  const taxLabel = getTaxLabel(organization?.country);
  
  const modules = organization?.sector_config;
  const hasProjects = false;
  
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    concept: '',
    base_amount: '',
    tax_rate: 21,
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    notes: ''
  });

  // Load clients and projects initially
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const [{ data: clientsData }, { data: projectsData }] = await Promise.all([
          supabase.from('clients').select('id, name').order('name'),
          supabase.from('projects').select('id, name, client_id').order('name')
        ]);
        if (clientsData) setClients(clientsData);
        if (projectsData) setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching dependencies:", error);
      }
    };
    fetchData();

    if (invoiceToEdit) {
      setFormData({
        client_id: invoiceToEdit.client_id || '',
        project_id: invoiceToEdit.project_id || '',
        concept: invoiceToEdit.concept || '',
        base_amount: invoiceToEdit.amount || invoiceToEdit.base_amount || '',
        tax_rate: invoiceToEdit.tax_rate ?? 21,
        issue_date: invoiceToEdit.issue_date || format(new Date(), 'yyyy-MM-dd'),
        due_date: invoiceToEdit.due_date || format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        notes: invoiceToEdit.notes || ''
      });
    } else {
      setFormData({
        client_id: '',
        project_id: '',
        concept: '',
        base_amount: '',
        tax_rate: 21,
        issue_date: format(new Date(), 'yyyy-MM-dd'),
        due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        notes: ''
      });
    }
  }, [isOpen, invoiceToEdit]);

  if (!isOpen) return null;

  // Filter projects based on selected client
  const filteredProjects = formData.client_id 
    ? projects.filter(p => p.client_id === formData.client_id)
    : projects;

  const calculatedTotal = (Number(formData.base_amount) || 0) * (1 + (Number(formData.tax_rate) || 0) / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id || !formData.concept || !formData.base_amount) {
      toast.error(t('modals.invoice.toastFieldsRequired'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        base_amount: Number(formData.base_amount),
        tax_rate: Number(formData.tax_rate),
      };

      if (invoiceToEdit) {
        const res = await fetch('/api/invoices', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: invoiceToEdit.id, ...payload })
        });
        if (!res.ok) throw new Error();
        toast.success(t('modals.invoice.toastUpdateSuccess'));
      } else {
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error();
        toast.success(t('modals.invoice.toastCreateSuccess'));
      }
      setTimeout(() => {
        onSaved();
        onClose();
      }, 300);
    } catch (error) {
      console.error(error);
      toast.error(t('modals.invoice.toastSaveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-[#111F3A] rounded-[24px] w-full max-w-2xl my-auto flex flex-col max-h-[90vh] shadow-2xl border border-[#E2E8F0] dark:border-[#1E3A5F] overflow-hidden">
        {/* Header Estandarizado */}
        <div className="px-5 md:px-8 py-4 md:py-6 border-b border-[#E2E8F0] dark:border-[#1E3A5F] flex items-center justify-between bg-white/50 dark:bg-[#111F3A]/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1B4FD8]" />
              {invoiceToEdit ? t('modals.invoice.editTitle', { number: invoiceToEdit.invoice_number || '' }) : t('modals.invoice.newTitle')}
            </h2>
            <p className="hidden sm:block text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">{t('modals.invoice.desc')}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Cliente */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">{t('modals.invoice.clientLabel')}</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={formData.client_id}
                    onChange={e => setFormData({ ...formData, client_id: e.target.value, project_id: '' })}
                    required
                    className="w-full pl-10 pr-10 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white appearance-none cursor-pointer bg-[#111F3A]"
                  >
                    <option value="" className="bg-[#111F3A] text-white">{t('modals.invoice.clientPlaceholder')}</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#111F3A] text-white">{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Proyecto */}
              {hasProjects && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">{t('modals.invoice.projectLabel')}</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={formData.project_id}
                      onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                      className="w-full pl-10 pr-10 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white appearance-none cursor-pointer disabled:opacity-50 bg-[#111F3A]"
                      disabled={!formData.client_id}
                    >
                      <option value="" className="bg-[#111F3A] text-white">{t('modals.invoice.projectPlaceholder')}</option>
                      {filteredProjects.map(p => (
                        <option key={p.id} value={p.id} className="bg-[#111F3A] text-white">{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Concepto */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">{t('modals.invoice.conceptLabel')}</label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.concept}
                    onChange={e => setFormData({ ...formData, concept: e.target.value })}
                    required
                    placeholder={
                      organization?.sector_config?.grupo === 'P1_restauracion' || organization?.sector_config?.grupo === '4_hosteleria'
                        ? t('modals.invoice.conceptPlaceholderRestaurant')
                        : (!hasProjects ? t('modals.invoice.conceptPlaceholderDefault') : t('modals.invoice.conceptPlaceholderWeb'))
                    }
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Importe Base */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">{t('modals.invoice.baseAmountLabel')}</label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_amount}
                    onChange={e => setFormData({ ...formData, base_amount: e.target.value })}
                    required
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* IVA y Total */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">{taxLabel} (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.tax_rate}
                      onChange={e => setFormData({ ...formData, tax_rate: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">{t('modals.invoice.totalLabel')}</label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <input
                      type="text"
                      value={calculatedTotal.toFixed(2)}
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-xl text-base text-emerald-600 dark:text-emerald-400 font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Fecha Emisión */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">{t('modals.invoice.issueDateLabel')}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={e => setFormData({ ...formData, issue_date: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Fecha Vencimiento */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">{t('modals.invoice.dueDateLabel')}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">{t('modals.invoice.notesLabel')}</label>
                <div className="relative">
                  <StickyNote className="absolute left-3 top-4 w-4 h-4 text-slate-400" />
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder={t('modals.invoice.notesPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* Footer Estandarizado */}
        <div className="px-5 md:px-8 py-4 md:py-6 border-t border-[#E2E8F0] dark:border-[#1E3A5F] flex flex-col sm:flex-row items-center justify-end gap-3 bg-white/50 dark:bg-[#111F3A]/50 backdrop-blur-md shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 md:py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all border border-slate-200 dark:border-white/10"
          >
            {t('modals.invoice.cancel')}
          </button>
          <button
            type="submit"
            form="invoice-form"
            disabled={loading}
            className={cn(
              "w-full sm:w-auto px-8 py-3 md:py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg uppercase tracking-wider",
              "bg-[#1B4FD8] text-white hover:bg-[#1642B5] shadow-blue-500/25 active:scale-95",
              loading && "opacity-50 cursor-not-allowed scale-95"
            )}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {t('modals.invoice.saving')}
              </>
            ) : (
              invoiceToEdit ? t('modals.invoice.saveChanges') : t('modals.invoice.createInvoice')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
