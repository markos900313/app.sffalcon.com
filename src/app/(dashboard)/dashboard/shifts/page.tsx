"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock3,
  Sun,
  Moon,
  Coffee,
  CalendarDays,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfWeek, addDays, subDays, startOfMonth, endOfMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";

const SHIFT_TYPES = [
  { id: "morning", label: "Mañana", icon: <Sun size={14} />, color: "text-amber-500 bg-amber-500/10" },
  { id: "afternoon", label: "Tarde", icon: <Sun size={14} />, color: "text-orange-500 bg-orange-500/10" },
  { id: "split", label: "Partido", icon: <Coffee size={14} />, color: "text-emerald-500 bg-emerald-500/10" },
  { id: "finde", label: "Fin de semana", icon: <Star size={14} />, color: "text-violet-500 bg-violet-500/10" }
];

export default function ShiftsPage() {
  const supabase = createClient();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    staff_id: "",
    tipo: "morning",
    fecha: format(new Date(), "yyyy-MM-dd"),
    fecha_fin: "",
    repetir: "none",
    hora_inicio: "08:00",
    hora_fin: "16:00",
    hora_inicio_2: "15:00",
    hora_fin_2: "20:00",
    notas: ""
  });

  useEffect(() => {
    if (organization) {
      fetchData();
    }
  }, [organization]);

  async function fetchData() {
    try {
      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .eq('organization_id', organization!.id)
        .order('full_name');
      
      setStaff(staffData || []);

      const { data: shiftData, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('organization_id', organization!.id)
        .order('fecha');
      
      if (error) throw error;
      setShifts(shiftData || []);
    } catch (err) {
      console.error("Error fetching shifts", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staff_id) return toast.error("Selecciona un empleado");

    setSaving(true);
    try {
      if (!editingShiftId && formData.fecha_fin && formData.fecha_fin > formData.fecha) {
        const start = new Date(formData.fecha);
        const end = new Date(formData.fecha_fin);
        const turnosACrear = [];
        const current = new Date(start);
        while (current <= end) {
          turnosACrear.push({
            ...formData,
            fecha: format(current, 'yyyy-MM-dd'),
            organization_id: organization!.id,
            status: 'confirmed',
            hora_inicio_2: formData.tipo === 'split' ? formData.hora_inicio_2 : null,
            hora_fin_2: formData.tipo === 'split' ? formData.hora_fin_2 : null,
          });
          current.setDate(current.getDate() + 1);
        }
        // Quitar fecha_fin y repetir del payload
        const turnosFinal = turnosACrear.map(({ fecha_fin, repetir, ...rest }) => rest);
        const { error } = await supabase.from('shifts').insert(turnosFinal);
        if (error) throw error;
        toast.success(`${turnosACrear.length} turnos creados`);
        setIsModalOpen(false);
        setEditingShiftId(null);
        fetchData();
        setSaving(false);
        return;
      }

      const payload = {
        ...formData,
        organization_id: organization!.id,
        status: 'confirmed',
        hora_inicio_2: formData.tipo === 'split' ? formData.hora_inicio_2 : null,
        hora_fin_2: formData.tipo === 'split' ? formData.hora_fin_2 : null,
      };
      const { fecha_fin, repetir, ...finalPayload } = payload;

      if (editingShiftId) {
        const { error } = await supabase
          .from('shifts')
          .update(finalPayload)
          .eq('id', editingShiftId);
        if (error) throw error;
        toast.success("Turno actualizado");
      } else {
        const { error } = await supabase
          .from('shifts')
          .insert([finalPayload]);
        if (error) throw error;
        toast.success("Turno asignado");
      }
      
      setIsModalOpen(false);
      setEditingShiftId(null);
      fetchData();
    } catch (err) {
      toast.error("Error al guardar turno");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este turno?")) return;
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success("Turno eliminado");
      fetchData();
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const openEditModal = (shift: any) => {
    setEditingShiftId(shift.id);
    setFormData({
      staff_id: shift.staff_id,
      tipo: shift.tipo,
      fecha: shift.fecha,
      fecha_fin: "",
      repetir: "none",
      hora_inicio: shift.hora_inicio,
      hora_fin: shift.hora_fin,
      hora_inicio_2: shift.hora_inicio_2 || "15:00",
      hora_fin_2: shift.hora_fin_2 || "20:00",
      notas: shift.notas || ""
    });
    setIsModalOpen(true);
  };

  const handlePrev = () => {
    if (view === "day") setSelectedDate(prev => subDays(prev, 1));
    else if (view === "week") setSelectedDate(prev => subDays(prev, 7));
    else setSelectedDate(prev => subMonths(prev, 1));
  };

  const handleNext = () => {
    if (view === "day") setSelectedDate(prev => addDays(prev, 1));
    else if (view === "week") setSelectedDate(prev => addDays(prev, 7));
    else setSelectedDate(prev => addMonths(prev, 1));
  };

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [selectedDate]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const startCal = startOfWeek(start, { weekStartsOn: 1 });
    return Array.from({ length: 42 }).map((_, i) => addDays(startCal, i));
  }, [selectedDate]);

  if (loading) return null;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Ultra-Banner: Calendar Control Center */}
      <div 
        className="w-full card-premium p-0 overflow-hidden shadow-2xl shadow-blue-500/5 relative group bg-white dark:bg-[#111F3A] border-4 border-emerald-500 rounded-3xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-indigo-500/10 opacity-50 transition-opacity group-hover:opacity-80" />
        
        <div className="relative p-4 md:p-6 flex flex-col lg:flex-row items-center justify-between gap-6 font-geist flex-wrap">
          {/* Left: Branding & Action */}
          <div className="flex flex-wrap items-center gap-3 md:gap-6 w-full xl:w-auto">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-[1.2rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
               <CalendarDays className="w-5 h-5 md:w-8 md:h-8 text-white" />
            </div>
            <div className="flex-1 min-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500">Gestión de Horarios</span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[6px] md:text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Activo</span>
              </div>
              <h1 className="text-base md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none truncate border-b-2 border-emerald-500/20 pb-1">
                 Planificación
              </h1>
            </div>
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-[8px] flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 ml-auto shrink-0"
            >
              <Plus size={14} />
              Añadir
            </motion.button>
          </div>

          {/* Center: Navigation & View Toggle */}
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 bg-slate-50 dark:bg-white/5 p-2 md:p-3 rounded-[24px] border border-slate-100 dark:border-white/5 w-full sm:w-auto">
            {/* Prev/Next */}
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-blue-500">
                <ChevronLeft size={20} />
              </button>
              <div className="flex flex-col items-center min-w-[120px]">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                   {format(selectedDate, view === "month" ? "MMMM yyyy" : "d MMMM", { locale: es })}
                </span>
                <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">
                   {view === "week" ? "Semanal" : view === "day" ? "Diaria" : "Mensual"}
                </span>
              </div>
              <button onClick={handleNext} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-blue-500">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            {/* View Select */}
            <div className="flex gap-1">
              {["day", "week", "month"].map((v: any) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all",
                    view === v 
                      ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-500/20" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  )}
                >
                  {v === "day" ? "Día" : v === "week" ? "Sem" : "Mes"}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Legend & Main CTA */}
          <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center lg:justify-end">
            <div className="hidden 2xl:flex items-center gap-6">
               {SHIFT_TYPES.map(type => (
                 <div key={type.id} className="flex flex-col items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full shadow-sm", 
                      type.id === 'morning' ? 'bg-amber-500' :
                      type.id === 'afternoon' ? 'bg-orange-500' :
                      type.id === 'split' ? 'bg-emerald-500' :
                      type.id === 'finde' ? 'bg-violet-500' : 'bg-slate-400'
                    )} />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{type.label}</span>
                 </div>
               ))}
            </div>
            
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden lg:flex px-6 xl:px-8 py-3.5 bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] items-center gap-2.5 transition-all shadow-lg shadow-blue-500/20 shrink-0"
            >
              <Plus size={14} />
              Añadir Turno
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content: Views */}
      <div className="card-premium border-none shadow-xl min-h-[600px] flex flex-col">
        {view === 'week' ? (
          <div className="flex-1 w-full overflow-x-auto scroll-smooth py-2">
            <div className="min-w-full inline-flex flex-col h-full bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
              {/* Header de días */}
              <div className="flex divide-x divide-slate-100 dark:divide-white/5 border-b border-slate-100 dark:border-white/5 shrink-0">
                {weekDays.map(day => (
                  <div key={day.toString()} className={cn(
                    "w-[200px] shrink-0 p-4 text-center",
                    isSameDay(day, new Date()) && "bg-blue-500/5"
                  )}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {format(day, "eee", { locale: es })}
                    </p>
                    <p className={cn(
                      "text-2xl font-black text-slate-900 dark:text-white tracking-tighter",
                      isSameDay(day, new Date()) && "text-blue-600 dark:text-blue-400"
                    )}>
                      {format(day, "d")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Cuerpo de turnos */}
              <div className="flex flex-1 divide-x divide-slate-100 dark:divide-white/5 bg-slate-50/20 dark:bg-transparent min-h-[600px]">
                {weekDays.map(day => {
                  const dayShifts = shifts.filter(s => isSameDay(new Date(s.fecha), day));
                  return (
                    <div key={day.toString()} className="w-[200px] shrink-0 p-3 flex flex-col gap-3 border-r dark:border-white/5">
                      {dayShifts.map(shift => {
                        const type = SHIFT_TYPES.find(t => t.id === shift.tipo);
                        return (
                          <motion.div 
                            key={shift.id}
                            layoutId={shift.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-[#0D1B3E] p-4 rounded-[20px] shadow-sm border border-slate-100 dark:border-white/5 group relative"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className={cn("px-2.5 py-1 rounded-lg flex items-center gap-1.5", type?.color)}>
                                {type?.icon}
                                <span className="text-[9px] font-black uppercase tracking-wider">{type?.label}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={(e) => { e.stopPropagation(); openEditModal(shift); }} className="p-1.5 hover:bg-blue-500/10 rounded-lg text-slate-400 hover:text-blue-500"><Pencil size={12} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(shift.id); }} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center border border-white dark:border-slate-800 shadow-sm overflow-hidden text-[10px] font-black text-blue-600">
                                 {staff.find(s => s.id === shift.staff_id)?.full_name?.substring(0, 2) || "??"}
                              </div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                 {staff.find(s => s.id === shift.staff_id)?.full_name || "Cargando..."}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              <Clock size={12} />
                              <span>{shift.hora_inicio} - {shift.hora_fin}</span>
                            </div>
                            {shift.hora_inicio_2 && (
                              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-wide mt-1">
                                <Clock size={12} />
                                <span>{shift.hora_inicio_2} - {shift.hora_fin_2}</span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                      {dayShifts.length === 0 && (
                        <div className="flex-1 flex items-center justify-center opacity-10">
                          <CalendarDays className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : view === 'month' ? (
          <div className="flex-1 w-full overflow-x-auto scroll-smooth py-2">
            <div className="min-w-full inline-flex flex-col bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
              <div className="flex divide-x divide-slate-100 dark:divide-white/5 border-b border-slate-100 dark:divide-white/5 bg-slate-50/10">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                  <div key={d} className="w-[180px] shrink-0 p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    {d}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap w-[1260px] divide-x divide-y divide-slate-100 dark:divide-white/5">
                {monthDays.map(day => {
                  const dayShifts = shifts.filter(s => isSameDay(new Date(s.fecha), day));
                  const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div key={day.toString()} className={cn(
                      "w-[180px] min-h-[140px] p-2 flex flex-col transition-colors shrink-0",
                      !isCurrentMonth && "bg-slate-50/50 dark:bg-black/10 opacity-40",
                      isToday && "bg-blue-500/5",
                      "hover:bg-slate-50 dark:hover:bg-white/5"
                    )}>
                      <span className={cn(
                        "text-xs font-bold mb-2 p-1.5 w-7 h-7 flex items-center justify-center rounded-lg",
                        isToday ? "bg-blue-600 text-white" : "text-slate-500 dark:text-slate-400"
                      )}>
                        {format(day, "d")}
                      </span>
                      
                      {dayShifts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {dayShifts.slice(0, 3).map(s => (
                            <div key={s.id} className={cn("w-2 h-2 rounded-full",
                              s.tipo === 'morning' ? 'bg-amber-500' :
                              s.tipo === 'afternoon' ? 'bg-orange-500' :
                              s.tipo === 'split' ? 'bg-emerald-500' :
                              s.tipo === 'finde' ? 'bg-violet-500' : 'bg-slate-400'
                            )} />
                          ))}
                        </div>
                      )}
                      {dayShifts.length > 0 && (
                        <div className="mt-1 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                          {dayShifts.length} {dayShifts.length === 1 ? 'turno' : 'turnos'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-8">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Turnos para hoy</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(selectedDate, "PPPP", { locale: es })}</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {shifts.filter(s => isSameDay(new Date(s.fecha), selectedDate)).map(shift => {
                   const type = SHIFT_TYPES.find(t => t.id === shift.tipo);
                   return (
                     <div key={shift.id} className="card-premium p-6 flex items-center gap-4 overflow-visible group">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", type?.color)}>
                           {type?.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{type?.label}</p>
                           <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{shift.hora_inicio} - {shift.hora_fin}</p>
                           <p className="text-[10px] text-blue-500 font-bold mt-1">
                              {staff.find(s => s.id === shift.staff_id)?.full_name || "Colaborador asignado"}
                           </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               openEditModal(shift);
                             }}
                             className="p-2.5 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl transition-all text-slate-400 hover:text-blue-500 shadow-sm"
                             title="Editar"
                           >
                              <Pencil size={18} />
                           </button>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               handleDelete(shift.id);
                             }}
                             className="p-2.5 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-all text-slate-400 hover:text-red-500 shadow-sm"
                             title="Eliminar"
                           >
                              <Trash2 size={18} />
                           </button>
                        </div>
                     </div>
                   );
               })}
               {shifts.filter(s => isSameDay(new Date(s.fecha), selectedDate)).length === 0 && (
                 <div className="col-span-full py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[40px] flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
                       <CalendarIcon size={32} className="text-slate-400" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No hay turnos asignados para este día</p>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Estandarizado */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#111F3A] w-full max-w-2xl rounded-[24px] shadow-2xl border border-[#E2E8F0] dark:border-[#1E3A5F] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-5 md:px-8 py-4 md:py-6 border-b border-[#E2E8F0] dark:border-[#1E3A5F] flex items-center justify-between bg-white/50 dark:bg-[#111F3A]/50 backdrop-blur-md sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-[#1B4FD8]" />
                    {editingShiftId ? 'Editar Turno' : 'Asignar Turno'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Organiza los horarios y planificación de tu equipo.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Empleado */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">PERSONAL ASIGNADO*</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        required
                        className="w-full pl-10 pr-10 py-3 bg-[#F8FAFC] dark:bg-[#111F3A] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white appearance-none cursor-pointer bg-[#111F3A]"
                        value={formData.staff_id}
                        onChange={(e) => setFormData({...formData, staff_id: e.target.value})}
                      >
                        <option value="" className="bg-[#111F3A] text-white">Seleccionar personal...</option>
                        {staff.map(m => <option key={m.id} value={m.id} className="bg-[#111F3A] text-white">{m.full_name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Fecha */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">FECHA DEL REGISTRO</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="date" 
                        required
                        className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#111F3A] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                        value={formData.fecha}
                        onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
                      HASTA (opcional)
                    </label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="date"
                        className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#111F3A] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                        value={formData.fecha_fin}
                        onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                        min={formData.fecha}
                      />
                    </div>
                  </div>

                  {/* Tipo de Turno */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">BLOQUE HORARIO</label>
                    <div className="relative">
                      <Clock3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        className="w-full pl-10 pr-10 py-3 bg-[#F8FAFC] dark:bg-[#111F3A] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white appearance-none cursor-pointer bg-[#111F3A]"
                        value={formData.tipo}
                        onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      >
                        {SHIFT_TYPES.map(t => <option key={t.id} value={t.id} className="bg-[#111F3A] text-white">{t.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Hora Inicio */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">HORA ENTRADA</label>
                    <div className="relative">
                      <Sun className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="time" 
                        required
                        className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#111F3A] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                        value={formData.hora_inicio}
                        onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Hora Fin */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">HORA SALIDA</label>
                    <div className="relative">
                      <Moon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="time" 
                        required
                        className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#111F3A] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                        value={formData.hora_fin}
                        onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                      />
                    </div>
                  </div>

                  {formData.tipo === 'split' && (
                    <>
                      <div className="md:col-span-2">
                        <div className="h-px bg-slate-100 dark:bg-white/5 my-2" />
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">
                          Segundo bloque (tarde)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
                          HORA ENTRADA 2
                        </label>
                        <div className="relative">
                          <Sun className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="time"
                            className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#111F3A] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all outline-none text-slate-900 dark:text-white"
                            value={formData.hora_inicio_2}
                            onChange={(e) => setFormData({...formData, hora_inicio_2: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
                          HORA SALIDA 2
                        </label>
                        <div className="relative">
                          <Moon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="time"
                            className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#111F3A] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all outline-none text-slate-900 dark:text-white"
                            value={formData.hora_fin_2}
                            onChange={(e) => setFormData({...formData, hora_fin_2: e.target.value})}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </form>

              {/* Footer */}
              <div className="px-5 md:px-8 py-4 md:py-6 border-t border-[#E2E8F0] dark:border-[#1E3A5F] flex flex-col sm:flex-row items-center justify-end gap-3 bg-white/50 dark:bg-[#111F3A]/50 backdrop-blur-md shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-6 py-3 md:py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all border border-slate-200 dark:border-white/10"
                >
                  CANCELAR
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={saving}
                  className={cn(
                    "w-full sm:w-auto px-8 py-3 md:py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg uppercase tracking-wider",
                    "bg-[#1B4FD8] text-white hover:bg-[#1642B5] shadow-blue-500/25 active:scale-95",
                    saving && "opacity-50 cursor-not-allowed scale-95"
                  )}
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      GUARDANDO...
                    </>
                  ) : (
                    editingShiftId ? 'ACTUALIZAR REGISTRO' : 'PLANIFICAR TURNO'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
