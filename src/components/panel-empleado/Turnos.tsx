"use client";

import React, { useState, useEffect } from "react";
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Info,
  ArrowRight
} from "lucide-react";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  eachDayOfInterval,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameMonth
} from "date-fns";
import { es, enUS } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

interface TurnosProps {
  staff: any;
}

const SHIFT_TYPES: any = {
  morning: { label: 'Mañana', color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  afternoon: { label: 'Tarde', color: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  split: { label: 'Partido', color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  finde: { label: 'Finde', color: 'bg-violet-500', text: 'text-violet-600', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
};

export default function Turnos({ staff }: TurnosProps) {
  const { t, language } = useLanguage();
  const dateLocale = language === 'en' ? enUS : es;
  const supabase = createClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'week' | 'month'>('week');

  const start = view === 'week' 
    ? startOfWeek(currentDate, { weekStartsOn: 1 })
    : startOfMonth(currentDate);

  const end = view === 'week'
    ? endOfWeek(currentDate, { weekStartsOn: 1 })
    : endOfMonth(currentDate);

  const calendarDays = view === 'week'
    ? eachDayOfInterval({ start, end })
    : eachDayOfInterval({ 
        start: startOfWeek(start, { weekStartsOn: 1 }), 
        end: endOfWeek(end, { weekStartsOn: 1 }) 
      });

  useEffect(() => {
    fetchShifts();
  }, [currentDate, view]);

  async function fetchShifts() {
    if (!staff?.id) {
       console.log('Skipping fetch: staff.id not ready');
       return;
    }
    setLoading(true);
    try {
      const qStart = start.toISOString().split('T')[0];
      const qEnd = end.toISOString().split('T')[0];
      
      console.log('DEBUG - fetchShifts:', {
        staff_id: staff.id,
        inicioSemana: qStart,
        finSemana: qEnd
      });

      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('staff_id', staff.id)
        .gte('fecha', qStart)
        .lte('fecha', qEnd);
      
      if (error) throw error;
      
      console.log('DEBUG - shifts data:', data);
      setShifts(data || []);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    } finally {
      setLoading(false);
    }
  }

  const getShiftsForDay = (day: Date) => {
    return shifts.filter(s => isSameDay(parseISO(s.fecha), day));
  };
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Week Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#111F3A] p-6 rounded-[32px] border border-slate-200 dark:border-[#1E3A5F]">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="text-[#1B4FD8]" />
            {t('employeePanel.turnos.title')}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
             {t('employeePanel.turnos.subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-white/5 p-2 rounded-2xl border border-slate-100 dark:border-white/5">
          <div className="flex bg-white dark:bg-white/5 p-1 rounded-xl border border-slate-100 dark:border-white/5">
            <button 
              onClick={() => setView('week')}
              className={cn(
                "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                view === 'week' ? "bg-[#1B4FD8] text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-900"
              )}
            >{t('employeePanel.turnos.week')}</button>
            <button 
              onClick={() => setView('month')}
              className={cn(
                "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                view === 'month' ? "bg-[#1B4FD8] text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-900"
              )}
            >{t('employeePanel.turnos.month')}</button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentDate(view === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1))}
              className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-center min-w-[140px]">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white leading-none">
                {view === 'week' 
                  ? `${format(start, language === 'en' ? "MMM d" : "d MMM")} — ${format(end, language === 'en' ? "MMM d, yyyy" : "d MMM, yyyy", { locale: dateLocale })}`
                  : format(currentDate, "MMMM yyyy", { locale: dateLocale })
                }
              </span>
            </div>
            <button 
              onClick={() => setCurrentDate(view === 'week' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1))}
              className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Turnos */}
      {view === 'week' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {calendarDays.map((day) => {
            const dayShifts = getShiftsForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={day.toString()} 
                className={cn(
                  "flex flex-col min-h-[160px] rounded-[32px] p-5 border transition-all",
                  isToday 
                    ? "bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/30" 
                    : "bg-white dark:bg-[#111F3A] border-slate-100 dark:border-white/5"
                )}
              >
                <p className={cn("text-[9px] font-black uppercase tracking-wider mb-1", isToday ? "text-blue-500" : "text-slate-400")}>
                  {format(day, "EEEE", { locale: dateLocale })}
                </p>
                <p className={cn("text-2xl font-black mb-4", isToday ? "text-blue-600" : "text-slate-900 dark:text-white")}>
                  {format(day, "d")}
                </p>
                {dayShifts.length > 0 ? (
                  <div className="mt-auto space-y-3">
                    {dayShifts.map((shift, sIdx) => {
                      const shiftType = SHIFT_TYPES[shift.tipo] || SHIFT_TYPES.morning;
                      const shiftLabel = t(`employeePanel.turnos.types.${shift.tipo}` as any) || shiftType.label;
                      return (
                        <div key={shift.id} className={cn("p-4 rounded-2xl border space-y-2", shiftType.bg, shiftType.border)}>
                          <div className="flex items-center gap-1.5">
                            <div className={cn("w-1.5 h-1.5 rounded-full", shiftType.color)} />
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", shiftType.text)}>{shiftLabel}</span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[11px] font-black tabular-nums">{shift.hora_inicio} — {shift.hora_fin}</p>
                            {shift.tipo === 'split' && shift.hora_inicio_2 && (
                              <>
                                <div className="h-px border-t border-dashed border-emerald-500/30 my-2" />
                                <p className="text-[11px] font-black tabular-nums">{shift.hora_inicio_2} — {shift.hora_fin_2}</p>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-auto h-16 flex items-center justify-center border border-dashed border-slate-200 dark:border-white/5 rounded-2xl text-[9px] font-black text-slate-300 uppercase italic">{t('employeePanel.turnos.free')}</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* VISTA MES COMPLETA */
        <div className="space-y-4">
           {/* Desktop Grid */}
           <div className="hidden md:block card-premium bg-white dark:bg-[#111F3A] rounded-[32px] border border-slate-200 dark:border-[#1E3A5F] overflow-hidden">
              <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                {(language === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']).map(d => (
                  <div key={d} className="py-4 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                    const dayShifts = getShiftsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    
                    return (
                      <div key={idx} className={cn(
                        "min-h-[140px] p-3 border-r border-b border-slate-100 dark:border-white/10 transition-all",
                        !isCurrentMonth && "bg-slate-50/50 dark:bg-black/10 opacity-40",
                        isToday && "ring-2 ring-blue-500 ring-inset z-10 bg-blue-500/5"
                      )}>
                        <p className={cn("text-xs font-black", isToday ? "text-blue-500" : "text-slate-400")}>{format(day, 'd')}</p>
                        {dayShifts.map(shift => {
                          const shiftType = SHIFT_TYPES[shift.tipo] || SHIFT_TYPES.morning;
                          const shiftLabel = t(`employeePanel.turnos.types.${shift.tipo}` as any) || shiftType.label;
                          return (
                            <div key={shift.id} className={cn("mt-2 p-2 rounded-xl border flex flex-col gap-1", shiftType.bg, shiftType.border)}>
                               <span className={cn("text-[7px] font-black uppercase truncate", shiftType.text)}>{shiftLabel}</span>
                               <span className="text-[9px] font-black tabular-nums">{shift.hora_inicio}</span>
                               {shift.tipo === 'split' && shift.hora_inicio_2 && (
                                 <span className="text-[9px] font-black tabular-nums border-t border-dashed border-emerald-500/30 pt-1 mt-1">{shift.hora_inicio_2}</span>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    );
                })}
              </div>
           </div>

           {/* Mobile List View */}
           <div className="md:hidden space-y-2">
              {calendarDays.filter(d => isSameMonth(d, currentDate)).map((day, idx) => {
                const dayShifts = getShiftsForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div key={idx} className={cn(
                    "p-4 rounded-2xl border flex flex-col gap-3",
                    isToday ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-[#111F3A] border-slate-100 dark:border-white/5"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-center w-10">
                          <p className="text-[9px] font-black uppercase opacity-60">{format(day, 'EEE', { locale: dateLocale })}</p>
                          <p className="text-lg font-black">{format(day, 'd')}</p>
                        </div>
                        <div className="h-8 w-px bg-current opacity-10" />
                        <div className="flex flex-col gap-2">
                          {dayShifts.map(shift => {
                            const shiftType = SHIFT_TYPES[shift.tipo] || SHIFT_TYPES.morning;
                            const shiftLabel = t(`employeePanel.turnos.types.${shift.tipo}` as any) || shiftType.label;
                            return (
                              <div key={shift.id}>
                                <p className="text-[10px] font-black uppercase tracking-widest">{shiftLabel}</p>
                                <p className="text-[10px] font-bold opacity-70">{shift.hora_inicio} — {shift.hora_fin}</p>
                                {shift.tipo === 'split' && shift.hora_inicio_2 && (
                                  <>
                                    <div className="h-px bg-current opacity-10 my-1" />
                                    <p className="text-[10px] font-bold opacity-70">{shift.hora_inicio_2} — {shift.hora_fin_2}</p>
                                  </>
                                )}
                              </div>
                            );
                          })}
                          {dayShifts.length === 0 && (
                            <p className="text-[10px] font-black uppercase opacity-30 italic">{t('employeePanel.turnos.free')}</p>
                          )}
                        </div>
                      </div>
                      {dayShifts.length > 0 && <div className={cn("w-2 h-2 rounded-full", SHIFT_TYPES[dayShifts[0].tipo]?.color || "bg-blue-500")} />}
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5 flex items-start gap-4">
         <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
           <Info size={20} />
         </div>
         <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{t('employeePanel.turnos.noticeTitle')}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
              {t('employeePanel.turnos.noticeDesc')}
            </p>
         </div>
      </div>

    </div>
  );
}
