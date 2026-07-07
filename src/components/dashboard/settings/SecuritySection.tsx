"use client";

import React, { useState, useEffect } from "react";
import { Shield, Laptop, Loader2, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";

export default function SecuritySection({ user }: { user: any }) {
  const supabase = createClient();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
      if (session) setSessionInfo(session);
    };
    getSession();
  }, [supabase]);

  const handleUpdatePassword = async () => {
    if (!passwords.current) return toast.error(t('introduceContrasenaActual'));
    if (passwords.new.length < 8) return toast.error(t('nuevaContrasenaMinLength'));
    if (passwords.new !== passwords.confirm) return toast.error(t('contrasenasNoCoinciden'));

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: passwords.new
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('contrasenaActualizada'));
      setPasswords({ current: "", new: "", confirm: "" });
      setShowForm(false);
    }
    setLoading(false);
  };

  const handleSignOutGlobal = async () => {
    if (confirm(t('confirmCerrarSesionesGlobal'))) {
      await supabase.auth.signOut({ scope: 'global' });
      router.replace('/login');
    }
  };

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] p-6 sm:p-8 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-5 h-5 text-[#1B4FD8]" />
        <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
          {t('seguridad')}
        </h3>
      </div>

      <div className="space-y-10">
        {/* Change Password Card */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-[#F8FAFC] dark:bg-[#111F3A] rounded-xl border border-[#E2E8F0]/50 dark:border-[#1E3A5F] gap-6 transition-all">
            <div className="text-center sm:text-left">
              <h4 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1">
                {t('cambiarContrasena')}
              </h4>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-normal leading-tight">
                {t('actualizaContrasenaDesc')}
              </p>
            </div>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="whitespace-nowrap px-6 py-2.5 bg-white dark:bg-[#162040] border border-[#E2E8F0] dark:border-[#1E3A5F] text-[13px] font-semibold text-[#1B4FD8] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#111F3A] rounded-lg transition-all shadow-sm uppercase tracking-wide active:scale-95"
            >
              {showForm ? t('cancelar') : t('cambiarAhora')}
            </button>
          </div>

          {showForm && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-slate-50 dark:bg-[#111F3A]/50 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A5F] animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider ml-1">{t('actual')}</label>
                <input 
                  type="password" 
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="w-full bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-lg py-2.5 px-4 text-[13px] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider ml-1">{t('nueva')}</label>
                <input 
                  type="password" 
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-lg py-2.5 px-4 text-[13px] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                />
              </div>
              <div className="space-y-1.5 flex flex-col justify-between">
                <div>
                  <label className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider ml-1">{t('confirmar')}</label>
                  <input 
                    type="password" 
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className="w-full bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-lg py-2.5 px-4 text-[13px] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                  />
                </div>
                <button 
                  onClick={handleUpdatePassword}
                  disabled={loading}
                  className="mt-2 w-full py-2.5 bg-[#1B4FD8] text-white rounded-lg text-[12px] font-bold uppercase tracking-wider shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  {t('actualizar')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-medium text-[#64748B] dark:text-[#475569] uppercase tracking-[0.08em] ml-1">
            {t('sesionActual')}
          </h4>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-[#162040] gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 dark:bg-[#111F3A] rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/5">
                <Laptop className="w-5 h-5 md:w-6 md:h-6 text-[#64748B] dark:text-[#94A3B8]" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <p className="text-[14px] md:text-[15px] font-bold text-[#0F172A] dark:text-[#F1F5F9] truncate">
                    {typeof window !== 'undefined' ? (window.navigator.userAgent.includes('Windows') ? t('windowsPC') : t('navegadorWeb')) : t('navegador')}
                  </p>
                  <span className="text-[9px] md:text-[10px] font-black text-[#10B981] bg-emerald-50 dark:bg-[#10B981]/10 px-2.5 py-1 rounded-full uppercase tracking-widest whitespace-nowrap border border-emerald-200/50 dark:border-emerald-500/20">
                    {t('activa')}
                  </span>
                </div>
                <p className="text-[11px] md:text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase tracking-tight">
                  {t('iniciadaEl', { date: sessionInfo ? new Date(sessionInfo.user.last_sign_in_at).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES') : '--/--/--' })}
                </p>
              </div>
            </div>
            <button 
              onClick={handleSignOutGlobal}
              className="w-full sm:w-auto h-9 sm:h-auto px-4 sm:px-0 bg-red-50 sm:bg-transparent dark:bg-red-500/5 sm:dark:bg-transparent text-[10px] md:text-[11px] font-black text-[#EF4444] hover:underline uppercase tracking-widest transition-all rounded-lg sm:rounded-none text-center sm:text-right"
            >
              {t('cerrarTodasSesiones')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
