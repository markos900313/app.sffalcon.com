"use client";

import React, { useState, useEffect } from "react";
import { Bot, Clock, Loader2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useOrganization } from "@/context/OrganizationContext";
import { useLanguage } from "@/lib/LanguageContext";

export default function AutoReplySection({ user, organization: propOrganization }: { user: any, organization?: any }) {
  const { organization: contextOrganization } = useOrganization();
  const organization = propOrganization || contextOrganization;
  const supabase = createClient();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeMode, setActiveMode] = useState<'24/7' | 'schedule' | 'off'>('off');
  
  const localTranslations = {
    es: {
      modeLabel: "Modo de respuesta",
      off: "Desactivada",
      offDesc: "La IA no responde automáticamente.",
      schedule: "Solo fuera de horario",
      scheduleDesc: "La IA responde automáticamente cuando el negocio está cerrado.",
      always: "Siempre 24/7",
      alwaysDesc: "La IA responde en todo momento, dentro y fuera del horario.",
      savedToast: "Modo de respuesta de IA actualizado correctamente",
      errorToast: "Error al actualizar el modo de respuesta de la IA",
    },
    en: {
      modeLabel: "Response Mode",
      off: "Disabled",
      offDesc: "The AI does not respond automatically.",
      schedule: "Out of hours only",
      scheduleDesc: "The AI responds automatically when the business is closed.",
      always: "Always 24/7",
      alwaysDesc: "The AI responds at all times, inside and outside of hours.",
      savedToast: "AI response mode updated successfully",
      errorToast: "Error updating AI response mode",
    }
  };

  const currentT = localTranslations[language === 'es' ? 'es' : 'en'];

  // Estado local para los inputs antes de guardar
  const [settings, setSettings] = useState({
    auto_reply_enabled: true,
    working_hours_start: 9,
    working_hours_end: 19,
    working_days: ["L", "M", "X", "J", "V"]
  });

  useEffect(() => {
    async function loadSettings() {
      const orgId = organization?.id;
      if (!orgId) return;
      const { data, error } = await supabase
        .from('organizations')
        .select('auto_reply_enabled, working_hours_start, working_hours_end, working_days, ai_always_reply, ai_schedule_reply')
        .eq('id', orgId)
        .single();

      if (!error && data) {
        setSettings({
          auto_reply_enabled: data.auto_reply_enabled ?? true,
          working_hours_start: data.working_hours_start ?? 9,
          working_hours_end: data.working_hours_end ?? 19,
          working_days: data.working_days || ["L", "M", "X", "J", "V"]
        });
        const always = data.ai_always_reply ?? false;
        const schedule = data.ai_schedule_reply ?? false;
        setActiveMode(always ? '24/7' : (schedule ? 'schedule' : 'off'));
      }
      setLoading(false);
    }
    loadSettings();
  }, [user, supabase, organization?.id]);

  const handleSave = async (mode: '24/7' | 'schedule' | 'off') => {
    if (!organization?.id) return;
    setSaving(true);
    setActiveMode(mode);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          ai_always_reply: mode === '24/7',
          ai_schedule_reply: mode === 'schedule',
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (error) throw error;
      toast.success(currentT.savedToast);
    } catch (e) {
      console.error("Error saving AI response mode:", e);
      toast.error(currentT.errorToast);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveToggle = async (enabled: boolean) => {
    if (!organization?.id) return;
    setSaving(true);
    setSettings(prev => ({ ...prev, auto_reply_enabled: enabled }));
    try {
      await supabase.from('organizations').update({
        auto_reply_enabled: enabled,
        ai_enabled: enabled,
        ai_whatsapp_enabled: enabled,
        updated_at: new Date().toISOString()
      }).eq('id', organization.id);
      toast.success(enabled ? t('autoReplyEnabledToast') : t('autoReplyDisabledToast'));
    } catch (e) {
      toast.error(t('errorActualizar'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!organization?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          working_hours_start: settings.working_hours_start,
          working_hours_end: settings.working_hours_end,
          working_days: settings.working_days,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (error) throw error;
      toast.success(t('horarioGuardadoCorrectamente'));
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error(t('errorGuardarHorario'));
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter(d => d !== day)
        : [...prev.working_days, day]
    }));
  };

  if (loading) return null;

  const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;
  const parseHour = (val: string) => parseInt(val.split(':')[0], 10);

  const days = [
    { label: t('dayMondayShort'), value: 1 },
    { label: t('dayTuesdayShort'), value: 2 },
    { label: t('dayWednesdayShort'), value: 3 },
    { label: t('dayThursdayShort'), value: 4 },
    { label: t('dayFridayShort'), value: 5 },
    { label: t('daySaturdayShort'), value: 6 },
    { label: t('daySundayShort'), value: 0 }
  ];

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] p-6 sm:p-8 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-8">
        <Bot className="w-5 h-5 text-[#1B4FD8]" />
        <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
          {t('automatizacionComunicaciones')}
        </h3>
      </div>

      <div className="space-y-6">
        {/* Toggle Principal */}
        <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-[#0D1B35] rounded-xl border border-slate-100 dark:border-[#1E3A5F]">
          <div className="space-y-1">
            <h4 className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              {t('respuestaAutomaticaFueraHorario')}
            </h4>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              {t('sfIaGestionaraEmails')}
            </p>
          </div>
          <button
            onClick={() => handleSaveToggle(!settings.auto_reply_enabled)}
            disabled={saving}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              settings.auto_reply_enabled ? "bg-[#1B4FD8]" : "bg-slate-300 dark:bg-[#1E3A5F]"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
                settings.auto_reply_enabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Modo de respuesta de la IA */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block ml-1">
            {currentT.modeLabel}
          </label>
          <div className="flex gap-2 p-1 bg-slate-50 dark:bg-[#0D1B35] rounded-xl w-fit border border-slate-100 dark:border-[#1E3A5F]">
            {(['off', 'schedule', '24/7'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => handleSave(mode)}
                disabled={saving}
                className={cn(
                  "px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all",
                  activeMode === mode 
                    ? "bg-[#1B4FD8] text-white shadow-sm" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                {mode === 'off' && currentT.off}
                {mode === 'schedule' && currentT.schedule}
                {mode === '24/7' && currentT.always}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] ml-1">
            {activeMode === 'off' && currentT.offDesc}
            {activeMode === 'schedule' && currentT.scheduleDesc}
            {activeMode === '24/7' && currentT.alwaysDesc}
          </p>
        </div>

        {/* Bloque Horario y Días */}
        <div className="p-5 border border-slate-100 dark:border-[#1E3A5F] rounded-2xl bg-white dark:bg-[#111F3A] space-y-6">
           <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1B4FD8]" />
              <span className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] uppercase tracking-wider">
                {t('horarioTrabajo')}
              </span>
           </div>

           <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#0D1B35] px-4 py-2 rounded-xl border border-slate-100 dark:border-[#1E3A5F]">
                 <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">{t('deHour')}</span>
                 <input 
                   type="time" 
                   value={formatHour(settings.working_hours_start)}
                   onChange={(e) => setSettings(p => ({ ...p, working_hours_start: parseHour(e.target.value) }))}
                   className="bg-transparent text-[14px] font-bold text-[#1B4FD8] outline-none"
                 />
              </div>

              <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#0D1B35] px-4 py-2 rounded-xl border border-slate-100 dark:border-[#1E3A5F]">
                 <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">{t('aHour')}</span>
                 <input 
                   type="time" 
                   value={formatHour(settings.working_hours_end)}
                   onChange={(e) => setSettings(p => ({ ...p, working_hours_end: parseHour(e.target.value) }))}
                   className="bg-transparent text-[14px] font-bold text-[#1B4FD8] outline-none"
                 />
              </div>
           </div>

           <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1B4FD8]" />
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">{t('diasLaborales')}</span>
              </div>
              <div className="flex gap-2">
                {days.map(day => (
                  <button
                    key={day.value}
                    onClick={() => {
                      const val = day.value;
                      setSettings(prev => ({
                        ...prev,
                        working_days: prev.working_days.includes(val as never)
                          ? prev.working_days.filter(d => d !== (val as never))
                          : [...prev.working_days, val as never]
                      }));
                    }}
                    className={cn(
                      "w-8 h-8 rounded-lg text-[12px] font-bold transition-all border",
                      settings.working_days.includes(day.value as never)
                        ? "bg-[#1B4FD8] border-[#1B4FD8] text-white shadow-md shadow-blue-500/20 scale-110"
                        : "bg-white dark:bg-[#0D1B35] border-slate-100 dark:border-[#1E3A5F] text-[#64748B] hover:border-[#1B4FD8]"
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
           </div>

           <div className="pt-2">
              <p className={cn(
                "text-[12px] font-medium",
                settings.auto_reply_enabled ? "text-[#1B4FD8]" : "text-[#64748B] dark:text-[#94A3B8]"
              )}>
                {settings.auto_reply_enabled 
                  ? t('fueraDeHorarioExplicacion')
                  : t('activaRespuestaAutomaticaExplicacion')
                }
              </p>
           </div>

           <button
             onClick={handleSaveSchedule}
             disabled={saving}
             className="w-full h-11 bg-[#1B4FD8] hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
           >
             {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t('guardarHorario')}
           </button>
        </div>
      </div>
    </div>
  );
}
