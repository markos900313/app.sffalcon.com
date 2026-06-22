'use client';

import { useState } from 'react';
import { X, Loader2, Users, Trello, Zap, ArrowRightCircle } from 'lucide-react';
import { Lead } from './types';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/lib/LanguageContext';

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess: () => void;
}

export default function ConvertModal({ isOpen, onClose, lead, onSuccess }: ConvertModalProps) {
  const supabase = createClient();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleConvert = async (type: 'cliente' | 'deal' | 'cliente_y_deal') => {
    setLoading(true);
    try {
      let clientId = null;
      let dealId = null;

      // 1. Crear Cliente si es necesario
      if (type === 'cliente' || type === 'cliente_y_deal') {
        const { data: newClient, error: clientErr } = await supabase
          .from('clients')
          .insert([{
            name: lead.nombre,
            company: lead.empresa || null,
            email: lead.email || null,
            phone: lead.telefono || null,
            user_id: lead.user_id,
            organization_id: lead.organization_id,
            status: 'lead',
            source: 'captacion'
          }])
          .select()
          .single();
        
        if (clientErr) throw clientErr;
        clientId = newClient.id;
      }

      // 2. Crear Deal si es necesario
      if (type === 'deal' || type === 'cliente_y_deal') {
        const { data: newDeal, error: dealErr } = await supabase
          .from('pipeline_deals')
          .insert([{
            nombre: lead.nombre,
            empresa: lead.empresa,
            email: lead.email,
            telefono: lead.telefono,
            valor_estimado: lead.valor_estimado,
            moneda: lead.moneda,
            etapa: 'nuevo_lead',
            prioridad: lead.temperatura === 'caliente' ? 'alta' : 'media',
            origen: lead.origen,
            client_id: clientId,
            user_id: lead.user_id,
            organization_id: lead.organization_id
          }])
          .select()
          .single();

        if (dealErr) throw dealErr;
        dealId = newDeal.id;
      }

      // 3. Marcar el Lead como convertido
      const { error: updateErr } = await supabase
        .from('leads')
        .update({
          estado: 'convertido',
          convertido_en: type,
          converted_client_id: clientId,
          converted_deal_id: dealId,
          fecha_conversion: new Date().toISOString()
        })
        .eq('id', lead.id);

      if (updateErr) throw updateErr;

      toast.success(
        type === 'cliente' ? t('modals.convert.toastConvertClient') :
        type === 'deal' ? t('modals.convert.toastConvertDeal') :
        t('modals.convert.toastConvertBoth')
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Conversion error:', error);
      toast.error(t('modals.convert.toastError') + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#111F3A] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-[#1E3A5F] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header - Fixed */}
        <div className="p-6 border-b border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-2xl">
              <ArrowRightCircle className="text-purple-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('modals.convert.title')}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate max-w-[200px]">{lead.nombre}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1E3A5F] rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">
            {t('modals.convert.desc')}
          </p>

          <button
            onClick={() => handleConvert('cliente')}
            disabled={loading}
            className="w-full group flex items-center gap-4 p-5 bg-slate-50 dark:bg-[#111F3A] hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/20 rounded-2xl transition-all text-left disabled:opacity-50"
          >
            <div className="p-3 bg-white dark:bg-white/5 rounded-xl shadow-sm text-slate-400 group-hover:text-blue-500 transition-colors">
              <Users size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t('modals.convert.optionClient')}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-500">{t('modals.convert.optionClientDesc')}</p>
            </div>
          </button>

          <button
            onClick={() => handleConvert('deal')}
            disabled={loading}
            className="w-full group flex items-center gap-4 p-5 bg-slate-50 dark:bg-[#111F3A] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-slate-100 dark:border-white/5 hover:border-emerald-200 dark:hover:border-emerald-500/20 rounded-2xl transition-all text-left disabled:opacity-50"
          >
            <div className="p-3 bg-white dark:bg-white/5 rounded-xl shadow-sm text-slate-400 group-hover:text-emerald-500 transition-colors">
              <Trello size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{t('modals.convert.optionDeal')}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-500">{t('modals.convert.optionDealDesc')}</p>
            </div>
          </button>

          <button
            onClick={() => handleConvert('cliente_y_deal')}
            disabled={loading}
            className="w-full group flex items-center gap-4 p-5 bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all text-left shadow-xl shadow-blue-500/20 disabled:opacity-50"
          >
            <div className="p-3 bg-white/10 rounded-xl text-white">
              <Zap size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-white">{t('modals.convert.optionBoth')}</p>
              <p className="text-[10px] text-blue-100">{t('modals.convert.optionBothDesc')}</p>
            </div>
            {loading && <Loader2 size={20} className="animate-spin text-white" />}
          </button>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 md:p-8 border-t border-slate-100 dark:border-[#1E3A5F] flex flex-col gap-3 shrink-0">
          <button 
            onClick={onClose} 
            className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors active:scale-95"
          >
            {t('modals.convert.keepAsLead')}
          </button>
        </div>
      </div>
    </div>
  );
}
