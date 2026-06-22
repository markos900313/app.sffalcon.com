"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, 
  Calendar, 
  Activity, 
  Timer,
  ArrowRight,
  TrendingUp,
  History,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

interface DashboardProps {
  staff: any;
}

export default function Dashboard({ staff }: DashboardProps) {
  const { t, language } = useLanguage();
  const dateLocale = language === 'en' ? enUS : es;
  const supabase = createClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastEntrada, setLastEntrada] = useState<any>(null);
  const [workedToday, setWorkedToday] = useState("0h 0m");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextShift, setNextShift] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadData();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (lastEntrada) {
      const entradaTime = new Date(lastEntrada.timestamp);
      
      const updateCounter = () => {
        const now = new Date();
        const diffMs = now.getTime() - entradaTime.getTime();
        const h = Math.floor(diffMs / 3600000);
        const m = Math.floor((diffMs % 3600000) / 60000);
        const s = Math.floor((diffMs % 60000) / 1000);
        setWorkedToday(`${h}h ${m}m ${s}s`);
      };

      updateCounter();
      const counterInterval = setInterval(updateCounter, 1000);
      return () => clearInterval(counterInterval);
    } else {
      setWorkedToday("Sin turno activo");
    }
  }, [lastEntrada]);

  async function loadData() {
    try {
      // 1. Get last entry today
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const { data: fichajesToday } = await supabase
        .from('fichajes')
        .select('*')
        .eq('staff_id', staff.id)
        .gte('timestamp', today.toISOString())
        .order('timestamp', { ascending: false });

      if (fichajesToday && fichajesToday.length > 0) {
        const last = fichajesToday[0];
        if (last.tipo === 'entrada') {
          setLastEntrada(last);
        }
      }

      // 2. Get history (last 7 days - simplified to last 14 entries)
      const { data: fichajeHistory } = await supabase
        .from('fichajes')
        .select('*')
        .eq('staff_id', staff.id)
        .order('timestamp', { ascending: false })
        .limit(14);
      
      setHistory(fichajeHistory || []);

      // 3. Get next shift
      const { data: proximoTurno } = await supabase
        .from('shifts')
        .select('*')
        .eq('staff_id', staff.id)
        .gte('fecha', format(new Date(), 'yyyy-MM-dd'))
        .order('fecha', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      setNextShift(proximoTurno);

    } catch (error) {
      console.error("Error loading dashboard data", error);
    } finally {
      setLoading(false);
    }
  }

  const welcomeMessage = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t("employeePanel.dashboard.welcome.morning");
    if (hour < 20) return t("employeePanel.dashboard.welcome.afternoon");
    return t("employeePanel.dashboard.welcome.evening");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 overflow-x-hidden w-full">
      {/* Header Banner */}
      <div className="relative overflow-hidden card-premium p-8 rounded-[32px] bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] w-full">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1B4FD8]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1B4FD8]">{t('employeePanel.dashboard.controlPanel')}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {format(currentTime, language === 'en' ? "EEEE, MMMM d" : "EEEE, d 'de' MMMM", { locale: dateLocale })}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {welcomeMessage()}, <span className="text-[#1B4FD8]">{staff?.full_name?.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
              {staff?.role} {t('employeePanel.dashboard.welcome.at')} <span className="text-slate-900 dark:text-white font-bold">{staff?.organizations?.name}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1B4FD8] flex items-center justify-center shadow-lg dark:shadow-blue-500/20 text-[#1B4FD8] dark:text-white">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[24px] font-black tabular-nums tracking-tighter leading-none dark:text-white">
                {format(currentTime, "HH:mm:ss")}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={cn("w-2 h-2 rounded-full", lastEntrada ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600")} />
                <span className={cn("text-[9px] font-black uppercase tracking-widest", lastEntrada ? "text-emerald-500" : "text-slate-400")}>
                  {lastEntrada ? t('employeePanel.dashboard.status.inShift') : t('employeePanel.dashboard.status.outOfService')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="card-premium p-6 rounded-[24px] bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Timer size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('employeePanel.dashboard.kpi.timeToday')}</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {workedToday === "Sin turno activo" ? t('employeePanel.dashboard.status.noActiveShift') : workedToday}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
            <TrendingUp size={12} />
            <span>{t('employeePanel.dashboard.kpi.realTime')}</span>
          </div>
        </div>

        <div className={cn(
          "card-premium p-6 rounded-[24px] border transition-all",
          nextShift?.fecha === format(new Date(), 'yyyy-MM-dd')
            ? "bg-blue-600 text-white border-blue-400 shadow-xl shadow-blue-500/20"
            : "bg-white dark:bg-[#111F3A] border-slate-200 dark:border-[#1E3A5F]"
        )}>
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              nextShift?.fecha === format(new Date(), 'yyyy-MM-dd') ? "bg-white/20 text-white" : "bg-amber-500/10 text-amber-500"
            )}>
              <Calendar size={20} />
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              nextShift?.fecha === format(new Date(), 'yyyy-MM-dd') ? "text-blue-100" : "text-slate-400"
            )}>{t('employeePanel.dashboard.kpi.nextShift')}</span>
          </div>
          
          {nextShift ? (
            <div className="space-y-1">
              <p className="text-2xl font-black capitalize">
                {format(new Date(nextShift.fecha + 'T12:00:00'), "EEEE d", { locale: dateLocale })}
              </p>
              <div className="flex items-center gap-2">
                 <Clock size={14} className="opacity-70" />
                 <span className="text-sm font-bold">{nextShift.hora_inicio} — {nextShift.hora_fin}</span>
                 <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-black uppercase tracking-widest">
                   {nextShift.tipo === 'morning' ? t('employeePanel.turnos.types.morning') : nextShift.tipo === 'afternoon' ? t('employeePanel.turnos.types.afternoon') : t('employeePanel.turnos.types.split')}
                 </span>
              </div>
            </div>
          ) : (
            <p className="text-2xl font-black opacity-30 italic">{t('employeePanel.dashboard.kpi.noShifts')}</p>
          )}

          {nextShift?.fecha === format(new Date(), 'yyyy-MM-dd') && (
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase bg-white/20 w-fit px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{t('employeePanel.dashboard.kpi.isToday')}</span>
            </div>
          )}
        </div>

        <div className="card-premium p-6 rounded-[24px] bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('employeePanel.dashboard.kpi.status')}</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{t('employeePanel.dashboard.status.active')}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>{t('employeePanel.dashboard.kpi.staff')}</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card-premium rounded-[32px] bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
               <Activity size={18} />
             </div>
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{t('employeePanel.dashboard.history.title')}</h3>
           </div>
           <button className="text-[9px] font-black text-[#1B4FD8] uppercase tracking-widest flex items-center gap-1.5 hover:gap-2 transition-all">
             {t('employeePanel.dashboard.history.viewAll')} <ArrowRight size={12} />
           </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('employeePanel.dashboard.history.date')}</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('employeePanel.dashboard.history.event')}</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('employeePanel.dashboard.history.time')}</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('employeePanel.dashboard.history.channel')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {history.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white tabular-nums">
                      {format(new Date(item.timestamp), language === 'en' ? "MMM d, yyyy" : "d MMM, yyyy", { locale: dateLocale })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      item.tipo === 'entrada' 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    )}>
                      {item.tipo === 'entrada' ? t('employeePanel.dashboard.history.clockIn') : t('employeePanel.dashboard.history.clockOut')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                      {format(new Date(item.timestamp), "HH:mm")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {item.canal || 'Web Panel'}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && history.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <Info size={24} className="text-slate-200" />
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('employeePanel.dashboard.history.noRecords')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
