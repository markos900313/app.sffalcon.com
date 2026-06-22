'use client';

import { useState } from 'react';
import { X, Loader2, XCircle, Trash2 } from 'lucide-react';
import { Lead } from './types';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/lib/LanguageContext';

interface DiscardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess: () => void;
}

const MOTIVOS = [
  'No interesado',
  'Sin presupuesto',
  'Competencia',
  'No responde',
  'Duplicado',
  'Otro'
];

const MOTIVOS_MAPPING: Record<string, string> = {
  'No interesado': 'modals.lead.discard.reasons.no_interesado',
  'Sin presupuesto': 'modals.lead.discard.reasons.sin_presupuesto',
  'Competencia': 'modals.lead.discard.reasons.competencia',
  'No responde': 'modals.lead.discard.reasons.no_responde',
  'Duplicado': 'modals.lead.discard.reasons.duplicado',
  'Otro': 'modals.lead.discard.reasons.otro'
};

export default function DiscardModal({ isOpen, onClose, lead, onSuccess }: DiscardModalProps) {
  const supabase = createClient();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [otroMotivo, setOtroMotivo] = useState('');

  const handleDiscard = async () => {
    setLoading(true);
    try {
      const finalMotivo = motivo === 'Otro' ? otroMotivo : motivo;
      
      const { error } = await supabase
        .from('leads')
        .update({
          estado: 'descartado',
          motivo_descarte: finalMotivo,
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id);

      if (error) throw error;

      toast.success(t('modals.lead.discard.toastSuccess'));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Discard error:', error);
      toast.error(t('modals.lead.discard.toastError'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#111F3A] w-full max-w-sm rounded-2xl border border-slate-200 dark:border-[#1E3A5F] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header - Fixed */}
        <div className="p-6 border-b border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-2xl">
              <XCircle className="text-red-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('modals.lead.discard.title')}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate max-w-[150px]">{lead.nombre}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1E3A5F] rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {t('modals.lead.discard.desc')}
          </p>

          <div className="grid grid-cols-1 gap-2">
            {MOTIVOS.map(m => (
              <label 
                key={m} 
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                  motivo === m 
                  ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30' 
                  : 'bg-slate-50 dark:bg-[#111F3A] border-slate-100 dark:border-white/5 opacity-60 hover:opacity-100'
                }`}
              >
                <input 
                  type="radio" 
                  name="motivo" 
                  className="w-4 h-4 text-red-600 accent-red-600"
                  checked={motivo === m}
                  onChange={() => setMotivo(m)}
                />
                <span className={`text-sm font-bold ${motivo === m ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {t(MOTIVOS_MAPPING[m] ?? m)}
                </span>
              </label>
            ))}
          </div>

          {motivo === 'Otro' && (
            <textarea
              className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-red-500/10 transition-all text-sm font-bold resize-none"
              placeholder={t('modals.lead.discard.otherPlaceholder')}
              rows={2}
              value={otroMotivo}
              onChange={e => setOtroMotivo(e.target.value)}
            />
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 md:p-8 border-t border-slate-100 dark:border-[#1E3A5F] flex flex-col gap-3 shrink-0">
          <button
            onClick={handleDiscard}
            disabled={loading || (motivo === 'Otro' && !otroMotivo)}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {t('modals.lead.discard.confirm')}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors active:scale-95"
          >
            {t('modals.lead.discard.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
