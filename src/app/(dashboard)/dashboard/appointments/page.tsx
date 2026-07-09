"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { Check, Video, Bot, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Phone, MapPin, Edit2, Trash2, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
const AppointmentModal = dynamic(() => import("@/components/dashboard/appointments/AppointmentModal"), {
  ssr: false,
  loading: () => null
});
const AppointmentsAnalytics = dynamic(() => import("@/components/dashboard/appointments/AppointmentsAnalytics"), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-slate-50 dark:bg-[#111F3A]/40 animate-pulse rounded-[24px]" />
});
import { useSearchParams, useRouter } from "next/navigation";
import { useOrganization } from "@/context/OrganizationContext";
import { getModuleLabel, getSectorGrupo } from "@/lib/sectorConfig";
import { useLanguage } from "@/lib/LanguageContext";

const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const workingHours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  status: string;
  user_id: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  servicio?: string;
  duracion?: string;
  personas?: string;
  zona?: string;
  clients?: {
    id: string;
    name: string;
    email: string;
  };
}

function AppointmentsContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { organization } = useOrganization();
  const { language, t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week' | 'day' | 'analytics'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const fetchInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (!organization?.id) return;

      const { data, error } = await supabase
        .from('appointments')
        .select('*, clients(name, email)')
        .eq('organization_id', organization.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      if (data) setAppointments(data);
      if (error) throw error;

    } catch (e) {
      console.error(e);
      toast.error(t('appointments.loadError' as any));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [searchParams, router, organization?.id]);

  useEffect(() => {
    const channel = supabase
      .channel('appointments_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchInitialData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization?.id]);

  const deleteAppointment = async (id: string) => {
    if (!confirm(t('appointments.deleteConfirm' as any))) return;
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('appointments.deleteSuccess' as any));
      fetchInitialData();
    } catch (e) {
      console.error(e);
      toast.error(t('appointments.deleteError' as any));
    }
  };

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDayOffset = firstDay.getDay() - 1;
    if (startDayOffset === -1) startDayOffset = 6;
    
    const days = [];
    for (let i = startDayOffset; i > 0; i--) {
      days.push({ date: new Date(year, month, 1 - i), currentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), currentMonth: false });
    }
    return days;
  }, [currentDate]);

  const sector = organization?.sector?.toLowerCase() || 'default';
  const grupo = parseInt(String((getSectorGrupo as any)(sector))) || 1;
  
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6 w-full max-w-full text-[var(--text-primary)] pb-32">
      {/* Header aligned with Mi Web - 100% Static */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-[16px] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-3 md:p-4 bg-blue-50 dark:bg-[#0D1B35] rounded-xl md:rounded-2xl border border-blue-100 dark:border-[#1E3A5F]">
            <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-[#1B4FD8]" />
          </div>
          <div>
              <h1 className="text-[20px] md:text-[24px] lg:text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-none truncate border-b-2 border-indigo-500/20 pb-1">
                {t('appointments.title' as any)}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] md:text-[11px] mt-2 uppercase tracking-[0.15em]">
                {t('appointments.subtitle' as any)}
              </p>
          </div>
        </div>

        <div className="flex-1 w-full md:w-auto">
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4">
            <div className="grid grid-cols-2 sm:flex p-1 bg-slate-100 dark:bg-[#0D1B35] rounded-xl border border-slate-200 dark:border-[#1E3A5F] w-full md:w-auto">
              {[
                { id: 'month', label: t('appointments.views.month' as any) },
                { id: 'week', label: t('appointments.views.week' as any) },
                { id: 'day', label: t('appointments.views.day' as any) },
                { id: 'analytics', label: t('appointments.views.analytics' as any) }
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id as 'month'|'week'|'day'|'analytics')}
                  className={cn(
                    "px-3 md:px-6 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase whitespace-nowrap tracking-wider",
                    view === v.id 
                      ? "bg-white dark:bg-[#1B4FD8] text-blue-600 dark:text-white shadow-md" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  )}
                >
                  <span>{v.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between md:justify-start gap-2 bg-slate-100 dark:bg-[#0D1B35] p-1 rounded-xl border border-slate-200 dark:border-[#1E3A5F] w-full md:w-auto">
              <button onClick={() => navigate('prev')} className="p-2 hover:bg-white dark:hover:bg-blue-600/10 rounded-lg text-slate-500"><ChevronLeft size={16}/></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-[9px] font-black text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-blue-600/10 rounded-lg uppercase tracking-widest flex-1 md:flex-none">{t('appointments.today' as any)}</button>
              <button onClick={() => navigate('next')} className="p-2 hover:bg-white dark:hover:bg-blue-600/10 rounded-lg text-slate-500"><ChevronRight size={16}/></button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => { setEditingAppointment(null); setModalOpen(true); }}
                className="flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1B4FD8] hover:bg-blue-700 text-white text-[10px] sm:text-xs font-black rounded-xl shadow-xl shadow-blue-500/25 uppercase tracking-widest min-w-[140px]"
              >
                <Plus className="w-4 h-4" />
                <span className="whitespace-nowrap">
                {t('appointments.newAppointment' as any)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {view === 'month' && <MonthView days={monthDays} appointments={appointments} onSelectDay={(d: Date) => { setCurrentDate(d); setView('day'); }} />}
        {view === 'week' && <WeekView currentDate={currentDate} appointments={appointments} onEdit={(a: Appointment) => { setEditingAppointment(a); setModalOpen(true); }} onDetail={setSelectedAppointment} />}
        {view === 'day' && <DayView date={currentDate} appointments={appointments} onEdit={(a: Appointment) => { setEditingAppointment(a); setModalOpen(true); }} onDelete={deleteAppointment} onDetail={setSelectedAppointment} grupo={grupo} />}
        {view === 'analytics' && <AppointmentsAnalytics appointments={appointments} />}
      </div>

      <AppointmentDetailModal 
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchInitialData}
        appointment={editingAppointment}
      />
    </div>
  );
}

function AppointmentDetailModal({ appointment, onClose }: { appointment: Appointment | null, onClose: () => void }) {
  const { t } = useLanguage();
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#111F3A] w-full max-w-lg rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-[#1E3A5F]">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center border",
              appointment.type === 'llamada' ? "bg-blue-50 dark:bg-blue-600/10 border-blue-200/30 text-blue-600" :
              appointment.type === 'videollamada' ? "bg-green-50 dark:bg-green-600/10 border-green-200/30 text-green-600" :
              "bg-orange-50 dark:bg-orange-500/10 border-orange-200/30 text-orange-600"
            )}>
              {appointment.type === 'llamada' ? <Phone size={24} /> : appointment.type === 'videollamada' ? <Video size={24} /> : <MapPin size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">{t('appointments.detail.title' as any)}</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{appointment.type}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Main Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('appointments.detail.contact' as any)}</label>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{appointment.customer_name || appointment.clients?.name || t('appointments.detail.noName' as any)}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('appointments.detail.phone' as any)}</label>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{appointment.customer_phone || t('appointments.detail.unspecified' as any)}</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('appointments.detail.activity' as any)}</label>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{appointment.servicio || appointment.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('appointments.detail.date' as any)}</label>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{appointment.date}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('appointments.detail.time' as any)}</label>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{appointment.time}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('appointments.detail.people' as any)}</label>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{appointment.personas || '1'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('appointments.detail.zone' as any)}</label>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{appointment.zona || t('appointments.detail.unspecifiedF' as any)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('appointments.detail.duration' as any)}</label>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{appointment.duracion || t('appointments.detail.defaultDuration' as any)}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('appointments.detail.status' as any)}</label>
              <div>
                <span className={cn(
                  "inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                  appointment.status === 'confirmada' ? "bg-green-100 text-green-700" : 
                  appointment.status === 'pendiente' ? "bg-amber-100 text-amber-700" :
                  "bg-slate-100 text-slate-700"
                )}>{appointment.status}</span>
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-[#1E3A5F]">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('appointments.detail.notes' as any)}</label>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0D1B35] p-4 rounded-xl border border-slate-100 dark:border-[#1E3A5F]">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-slate-50 dark:bg-[#0D1B35] border-t border-slate-100 dark:border-[#1E3A5F]">
          <button 
            onClick={onClose}
            className="w-full px-4 py-4 bg-slate-200 dark:bg-[#1E3A5F] hover:bg-slate-300 dark:hover:bg-[#254A7C] text-slate-800 dark:text-white text-sm font-bold rounded-2xl transition-all"
          >
            {t('appointments.detail.close' as any)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-6 w-full max-w-full text-[var(--text-primary)]">
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-[16px] h-[100px] w-full" />
        <div className="card-premium p-0 overflow-hidden border border-white/5">
          <div className="h-16 w-full border-b border-white/5 bg-white/5" />
          <div className="grid grid-cols-7 h-[600px]">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="border-r border-b border-white/5 bg-white/5/10" />
            ))}
          </div>
        </div>
      </div>
    }>
      <AppointmentsContent />
    </Suspense>
  );
}

interface MonthViewProps {
  days: { date: Date; currentMonth: boolean }[];
  appointments: Appointment[];
  onSelectDay: (d: Date) => void;
}

function MonthView({ days, appointments, onSelectDay }: MonthViewProps) {
  const { t } = useLanguage();
  return (
    <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-sm">
      <div className="overflow-x-auto w-full">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-7 bg-slate-50 dark:bg-[#0D1B35] border-b border-slate-200 dark:border-[#1E3A5F]">
            {daysOfWeek.map((day, idx) => (
              <div key={day} className="py-5 text-center text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {t(`appointments.days.${idx}` as any)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-collapse">
            {days.map((item, idx) => {
              const dateStr = format(item.date, 'yyyy-MM-dd');
              const dayAppts = appointments.filter((a) => a.date === dateStr);
              const isToday = new Date().toDateString() === item.date.toDateString();

              return (
                <div 
                  key={idx}
                  onClick={() => onSelectDay(item.date)}
                  className={cn(
                    "min-h-[130px] p-4 md:px-8 md:py-6 border-r border-b border-slate-100 dark:border-[#1E3A5F] cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-blue-600/5",
                    !item.currentMonth && "opacity-20 pointer-events-none"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black",
                      isToday ? "bg-[#1B4FD8] text-white shadow-lg shadow-blue-500/25" : "text-slate-500 dark:text-slate-400"
                    )}>
                      {item.date.getDate()}
                    </span>
                    {dayAppts.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                  </div>
                  <div className="space-y-1">
                    {dayAppts.slice(0, 2).map((a) => (
                      <div key={a.id} className="px-2 py-1.5 bg-blue-50 dark:bg-[#0D1B35] border border-blue-100 dark:border-[#1E3A5F] rounded-lg truncate text-[9px] font-bold text-blue-600 dark:text-blue-400">
                        {a.time} - {a.title}
                      </div>
                    ))}
                    {dayAppts.length > 2 && (
                      <p className="text-[8px] font-bold text-slate-400 uppercase text-center">
                        {t('appointments.moreAppts' as any).replace('{count}', String(dayAppts.length - 2))}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onEdit: (a: Appointment) => void;
  onDetail: (a: Appointment) => void;
}

function WeekView({ currentDate, appointments, onEdit, onDetail }: WeekViewProps) {
  const { t } = useLanguage();
  const startOfWeekDate = new Date(currentDate);
  startOfWeekDate.setDate(currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1));
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeekDate);
    d.setDate(startOfWeekDate.getDate() + i);
    return d;
  });

  return (
    <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-sm overflow-hidden flex">
      <div className="w-16 border-r border-slate-100 dark:border-white/5 flex flex-col pt-[53px]">
        {workingHours.map(h => (
          <div key={h} className="h-16 flex items-start justify-center text-[9px] font-bold text-slate-400 py-1.5">{h}</div>
        ))}
      </div>
      <div className="flex-1 overflow-x-auto">
        <div className="min-w-[800px] h-full">
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-[#1E3A5F] sticky top-0 bg-white dark:bg-[#0D1B35] z-10 font-bold">
            {weekDays.map(d => (
              <div key={d.toISOString()} className={cn(
                "py-5 text-center border-r border-slate-200 dark:border-[#1E3A5F] last:border-0",
                new Date().toDateString() === d.toDateString() && "bg-blue-50/30 dark:bg-blue-600/10"
              )}>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {t(`appointments.days.${d.getDay() === 0 ? 6 : d.getDay() - 1}` as any)}
                </p>
                <p className={cn("text-sm font-black", new Date().toDateString() === d.toDateString() ? "text-[#1B4FD8]" : "text-slate-900 dark:text-white")}>{d.getDate()}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 h-[1536px] relative bg-slate-50/30 dark:bg-transparent">
            {weekDays.map(d => (
              <div key={d.toISOString()} className="border-r border-slate-100 dark:border-white/5 relative last:border-0">
                {workingHours.map(h => (
                  <div key={h} className="h-16 border-b border-slate-100 dark:border-white/5" />
                ))}
                {appointments.filter((a) => a.date === format(d, 'yyyy-MM-dd')).map((a) => {
                  const [hour, min] = a.time.split(':').map(Number);
                  const top = hour * 64 + (min / 60) * 64;
                  return (
                    <div 
                      key={a.id}
                      onClick={() => onDetail(a)}
                      className={cn(
                        "absolute left-1 right-1 p-2 rounded-xl border shadow-sm cursor-pointer transition-all hover:scale-[1.02] z-20 text-[10px] overflow-hidden",
                        a.type === 'llamada' ? "bg-blue-50 dark:bg-blue-600/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400" :
                        a.type === 'videollamada' ? "bg-green-50 dark:bg-green-600/10 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400" :
                        "bg-orange-50 dark:bg-orange-600/10 border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-400"
                      )}
                      style={{ top: `${top}px`, height: '60px' }}
                    >
                      <div className="flex items-center gap-1.5 font-black uppercase tracking-tighter mb-1">
                         {a.type === 'llamada' ? <Phone size={10} /> : a.type === 'videollamada' ? <Video size={10} /> : <MapPin size={10} />}
                         {a.time}
                      </div>
                      <p className="font-bold truncate">{a.title}</p>
                      <p className="opacity-70 truncate font-medium">{a.clients?.name}</p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DayViewProps {
  date: Date;
  appointments: Appointment[];
  onEdit: (a: Appointment) => void;
  onDelete: (id: string) => void;
  onDetail: (a: Appointment) => void;
  grupo: number;
}

function DayView({ date, appointments, onEdit, onDelete, onDetail, grupo }: DayViewProps) {
  const { t } = useLanguage();
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayAppts = appointments.filter((a) => a.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-8 card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] p-8 shadow-sm space-y-6">
        {workingHours.map(h => {
          const appsAtHour = dayAppts.filter((a) => {
            const [hour] = a.time.split(':').map(Number);
            return hour === parseInt(h.split(':')[0]);
          });
          return (
            <div key={h} className="flex gap-3 md:gap-6 group">
              <div className="w-10 md:w-12 text-[9px] md:text-[10px] font-black text-slate-400 pt-1 tracking-widest">{h}</div>
              <div className="flex-1 min-h-[90px] border-t border-slate-200 dark:border-[#1E3A5F] pt-4 transition-colors group-hover:border-blue-500/20">
                {appsAtHour.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {appsAtHour.map((a) => (
                      <div 
                        key={a.id} 
                        onClick={() => onDetail(a)}
                        className="bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between group/card hover:border-[#1B4FD8]/40 transition-all shadow-sm cursor-pointer"
                      >
                        <div className="flex gap-4 items-center min-w-0">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                            a.type === 'llamada' ? "bg-blue-50 dark:bg-blue-600/10 border-blue-200/30 text-blue-600" :
                            a.type === 'videollamada' ? "bg-green-50 dark:bg-green-600/10 border-green-200/30 text-green-600" :
                            "bg-orange-50 dark:bg-orange-500/10 border-orange-200/30 text-orange-600"
                          )}>
                            {a.type === 'llamada' ? <Phone size={18} /> : a.type === 'videollamada' ? <Video size={18} /> : <MapPin size={18} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{a.title}</p>
                            <p className="text-[10px] text-slate-500 font-medium truncate">{a.clients?.name} • <span className="text-blue-600">{a.time}</span></p>
                            <span className={cn(
                              "inline-block mt-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                              a.status === 'confirmada' ? "bg-green-100 text-green-700" : 
                              a.status === 'pendiente' ? "bg-amber-100 text-amber-700" :
                              "bg-slate-100 text-slate-700"
                            )}>{a.status}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 sm:opacity-0 sm:group-hover/card:opacity-100 transition-opacity w-full sm:w-auto justify-end mt-4 sm:mt-0 flex-shrink-0" onClick={e => e.stopPropagation()}>
                          <button onClick={() => onEdit(a)} className="flex-shrink-0 p-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"><Edit2 size={16}/></button>
                          <button onClick={() => onDelete(a.id)} className="flex-shrink-0 p-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-slate-400 hover:text-red-600 transition-all shadow-sm"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[9px] font-black text-slate-200 dark:text-slate-800 uppercase tracking-[0.3em] flex items-center h-full pt-1 opacity-20">{t('appointments.available' as any)}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] p-8 shadow-sm">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8 border-b pb-5 border-slate-100 dark:border-[#1E3A5F]">{t('appointments.summaryTitle' as any)}</h4>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600"><Check size={14}/></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('appointments.totalAgenda' as any)}</span>
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white">{dayAppts.length}</span>
            </div>
            {grupo !== 1 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-600/10 flex items-center justify-center text-green-600"><Video size={14}/></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('appointments.videoCalls' as any)}</span>
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white">{dayAppts.filter((a: Appointment)=>a.type==='videollamada').length}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-[#111F3A] text-white p-8 rounded-[24px] shadow-lg border border-blue-500/20 space-y-4">
          <Bot size={24} className="text-blue-400 mb-2" />
          <h4 className="text-lg font-bold tracking-tight">{t('appointments.aiAnalysis' as any)}</h4>
          <p className="text-xs text-blue-200/70 leading-relaxed font-medium">
            {t('appointments.aiAnalysisText' as any)
              .replace('{count}', String(dayAppts.length))
              .replace('{info}', grupo !== 1 
                ? t('appointments.aiAnalysisInfoVideo' as any).replace('{percent}', String(Math.round((dayAppts.filter((a: Appointment)=>a.type==='videollamada').length / (dayAppts.length || 1)) * 100)))
                : t('appointments.aiAnalysisInfoDefault' as any)
              )}
          </p>
        </div>
      </div>
    </div>
  );
}
