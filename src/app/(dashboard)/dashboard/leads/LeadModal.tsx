'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, UserPlus, Save } from 'lucide-react';
import { Lead, LeadEstado, LeadTemperatura, LeadOrigen } from './types';
import { createClient } from '@/lib/supabase/client';
import { useOrganization } from '@/context/OrganizationContext';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/lib/LanguageContext';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  onSuccess: () => void;
}

export default function LeadModal({ isOpen, onClose, lead, onSuccess }: LeadModalProps) {
  const supabase = createClient();
  const { organization } = useOrganization();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>({
    nombre: '',
    empresa: '',
    cargo: '',
    email: '',
    telefono: '',
    valor_estimado: 0,
    moneda: 'EUR',
    temperatura: 'frio',
    estado: 'nuevo',
    origen: 'manual',
    proximo_seguimiento: null,
    notas: ''
  });

  useEffect(() => {
    if (lead) {
      setFormData(lead);
    } else {
      setFormData({
        nombre: '',
        empresa: '',
        cargo: '',
        email: '',
        telefono: '',
        valor_estimado: 0,
        moneda: 'EUR',
        temperatura: 'frio',
        estado: 'nuevo',
        origen: 'manual',
        proximo_seguimiento: null,
        notas: ''
      });
    }
  }, [lead, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No auth user');

      const payload = {
        ...formData,
        user_id: user.id,
        organization_id: organization?.id || null,
        updated_at: new Date().toISOString(),
      };

      if (lead) {
        const { error } = await supabase
          .from('leads')
          .update(payload)
          .eq('id', lead.id);
        if (error) throw error;
        toast.success(t('modals.lead.toastUpdateSuccess'));
      } else {
        const { error } = await supabase
          .from('leads')
          .insert([payload]);
        if (error) throw error;
        toast.success(t('modals.lead.toastSaveSuccess'));
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving lead:', error);
      toast.error(error.message || t('modals.lead.toastSaveError'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#111F3A] w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-[#1E3A5F] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <UserPlus size={18} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {lead ? t('modals.lead.editTitle') : t('modals.lead.newTitle')}
              </h3>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{t('modals.lead.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1E3A5F] rounded-full transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} id="lead-form" className="flex-1 overflow-y-auto p-5 md:p-8 space-y-4 sm:space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            
            {/* Nombre */}
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('modals.lead.nameLabel')}</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold"
                placeholder={t('modals.lead.namePlaceholder')}
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            {/* Empresa */}
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('modals.lead.companyLabel')}</label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold"
                placeholder={t('modals.lead.companyPlaceholder')}
                value={formData.empresa || ''}
                onChange={e => setFormData({ ...formData, empresa: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('modals.lead.emailLabel')}</label>
              <input
                type="email"
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold"
                placeholder={t('modals.lead.emailPlaceholder')}
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('modals.lead.phoneLabel')}</label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold"
                placeholder={t('modals.lead.phonePlaceholder')}
                value={formData.telefono || ''}
                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>

            {/* Cargo */}
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('modals.lead.positionLabel')}</label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold"
                placeholder={t('modals.lead.positionPlaceholder')}
                value={formData.cargo || ''}
                onChange={e => setFormData({ ...formData, cargo: e.target.value })}
              />
            </div>

            {/* Valor Estimado */}
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('modals.lead.valueLabel')}</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold pl-9"
                  value={formData.valor_estimado}
                  onChange={e => setFormData({ ...formData, valor_estimado: Number(e.target.value) })}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">€</span>
              </div>
            </div>

            {/* Temperatura */}
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('modals.lead.temperatureLabel')}</label>
              <select
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold appearance-none cursor-pointer dark:text-white dark:[&>option]:bg-[#111F3A]"
                value={formData.temperatura}
                onChange={e => setFormData({ ...formData, temperatura: e.target.value as LeadTemperatura })}
              >
                <option value="frio" className="bg-[#111F3A] text-white">{t('modals.lead.temperatures.frio')}</option>
                <option value="tibio" className="bg-[#111F3A] text-white">{t('modals.lead.temperatures.tibio')}</option>
                <option value="caliente" className="bg-[#111F3A] text-white">{t('modals.lead.temperatures.caliente')}</option>
              </select>
            </div>

            {/* Origen */}
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('modals.lead.sourceLabel')}</label>
              <select
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold appearance-none cursor-pointer dark:text-white dark:[&>option]:bg-[#111F3A]"
                value={formData.origen}
                onChange={e => setFormData({ ...formData, origen: e.target.value as LeadOrigen })}
              >
                <option value="web" className="bg-[#111F3A] text-white">{t('modals.lead.sources.web')}</option>
                <option value="whatsapp" className="bg-[#111F3A] text-white">{t('modals.lead.sources.whatsapp')}</option>
                <option value="email" className="bg-[#111F3A] text-white">{t('modals.lead.sources.email')}</option>
                <option value="manual" className="bg-[#111F3A] text-white">{t('modals.lead.sources.manual')}</option>
                <option value="referido" className="bg-[#111F3A] text-white">{t('modals.lead.sources.referido')}</option>
                <option value="redes_sociales" className="bg-[#111F3A] text-white">{t('modals.lead.sources.redes_sociales')}</option>
              </select>
            </div>

            {/* Fecha Seguimiento */}
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('modals.lead.nextFollowupLabel')}</label>
              <input
                type="date"
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold"
                value={formData.proximo_seguimiento || ''}
                onChange={e => setFormData({ ...formData, proximo_seguimiento: e.target.value })}
              />
            </div>

            {/* Estado */}
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('modals.lead.statusLabel')}</label>
              <select
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold appearance-none cursor-pointer dark:text-white dark:[&>option]:bg-[#111F3A]"
                value={formData.estado}
                onChange={e => setFormData({ ...formData, estado: e.target.value as LeadEstado })}
              >
                <option value="nuevo" className="bg-[#111F3A] text-white">{t('modals.lead.statuses.nuevo')}</option>
                <option value="contactado" className="bg-[#111F3A] text-white">{t('modals.lead.statuses.contactado')}</option>
                <option value="cualificado" className="bg-[#111F3A] text-white">{t('modals.lead.statuses.cualificado')}</option>
                <option value="descartado" className="bg-[#111F3A] text-white">{t('modals.lead.statuses.descartado')}</option>
                <option value="convertido" className="bg-[#111F3A] text-white">{t('modals.lead.statuses.convertido')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('modals.lead.notesLabel')}</label>
            <textarea
              rows={3}
              className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold resize-none"
              placeholder={t('modals.lead.notesPlaceholder')}
              value={formData.notas || ''}
              onChange={e => setFormData({ ...formData, notas: e.target.value })}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-[#1E3A5F] flex flex-col sm:flex-row items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all active:scale-95"
          >
            {t('modals.lead.cancel')}
          </button>
          <button
            form="lead-form"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto order-1 sm:order-2 px-10 py-3 bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {lead ? t('modals.lead.update') : t('modals.lead.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
