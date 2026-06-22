"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { LogIn, LogOut, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function FicharPage() {
  const params = useParams();
  const codigo = params?.codigo as string;
  const supabase = createClient();
  const { t, language } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staff, setStaff] = useState<any>(null);
  const [time, setTime] = useState(new Date());
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [successType, setSuccessType] = useState<'entrada' | 'salida' | null>(null);

  const activeLocale = language === 'en' ? enUS : es;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadStaff() {
      if (!codigo) {
        setError(t('ficharCodigo.invalidCode'));
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('fichar_code', codigo)
        .single();
        
      if (error || !data) {
        setError(t('ficharCodigo.invalidCode'));
      } else {
        setStaff(data);
      }
      setLoading(false);
    }
    
    loadStaff();
  }, [codigo, supabase]);

  const handleFichar = async (tipo: 'entrada' | 'salida') => {
    if (!staff || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('fichajes')
        .insert([{
          organization_id: staff.organization_id,
          staff_id: staff.id,
          tipo,
          timestamp: new Date().toISOString(),
          canal: 'web'
        }]);
        
      if (error) throw error;
      
      const timeStr = format(new Date(), 'HH:mm');
      const typeLabel = tipo === 'entrada' ? t('ficharCodigo.successTypes.entrada') : t('ficharCodigo.successTypes.salida');
      setSuccessMessage(t('ficharCodigo.clockSuccess', { tipo: typeLabel, time: timeStr }));
      setSuccessType(tipo);
      
      // Bloquear 5 segundos
      setTimeout(() => {
        setSuccessMessage(null);
        setSuccessType(null);
        setIsSubmitting(false);
      }, 5000);
      
    } catch (err) {
      console.error(err);
      alert(t('ficharCodigo.toastError'));
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center p-4 bg-[var(--background)]"><div className="text-xl font-bold animate-pulse text-[var(--foreground)]">{t('ficharCodigo.loading')}</div></div>;
  if (error) return <div className="flex h-screen items-center justify-center p-4 bg-[var(--background)]"><div className="text-2xl font-bold text-red-500">{error}</div></div>;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] items-center justify-center p-6 text-[var(--foreground)] font-geist">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        
        {/* Header Logo/Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-indigo-600 tracking-tight">SF</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ficharCodigo.employeePortal')}</p>
        </div>

        {/* Info */}
        <div className="card-premium rounded-3xl p-8 w-full text-center border border-slate-200 dark:border-[#1E3A5F] shadow-2xl shadow-blue-500/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">{t('ficharCodigo.hello', { name: staff.full_name })}</h2>
          <div className="text-5xl font-black text-[#1B4FD8] dark:text-blue-400 mt-4 tracking-tighter">
            {format(time, "HH:mm:ss")}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">
            {format(time, t('ficharCodigo.dateFormat'), { locale: activeLocale })}
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className={`w-full flex flex-col items-center justify-center gap-3 bg-[var(--bg-card)] border-2 ${successType === 'entrada' ? 'border-emerald-500' : 'border-rose-500'} p-6 rounded-3xl text-center shadow-lg animate-in zoom-in duration-300`}>
            {successType === 'entrada' ? (
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            ) : (
              <CheckCircle2 className="w-12 h-12 text-rose-500" />
            )}
            <span className={`text-lg font-black uppercase tracking-widest ${successType === 'entrada' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {successMessage}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {!successMessage && (
          <div className="w-full space-y-4">
            <button
              disabled={isSubmitting}
              onClick={() => handleFichar('entrada')}
              className={`w-full min-h-[80px] h-24 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-2xl tracking-widest uppercase transition-all
                ${isSubmitting ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-[#1B4FD8] hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95'}`}
            >
              <LogIn className="w-8 h-8" />
              {t('ficharCodigo.clockInBtn')}
            </button>
            
            <button
              disabled={isSubmitting}
              onClick={() => handleFichar('salida')}
              className={`w-full min-h-[80px] h-24 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-2xl tracking-widest uppercase transition-all
                ${isSubmitting ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 active:scale-95'}`}
            >
              <LogOut className="w-8 h-8" />
              {t('ficharCodigo.clockOutBtn')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
