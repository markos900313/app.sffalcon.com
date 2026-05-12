"use client";

import React, { useState, useEffect } from "react";
import { 
  Palmtree, 
  Plus, 
  X, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

/*
SQL MIGRATION:
CREATE TABLE IF NOT EXISTS vacaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  dias INTEGER,
  motivo TEXT,
  estado TEXT DEFAULT 'pendiente', -- pendiente | aprobada | rechazada
  created_at TIMESTAMPTZ DEFAULT NOW()
);
*/

interface VacacionesProps {
  staff: any;
}

export default function Vacaciones({ staff }: VacacionesProps) {
  const supabase = createClient();
  const [requests, setRequests] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    motivo: ""
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const { data } = await supabase
        .from('vacaciones')
        .select('id, fecha_inicio, fecha_fin, dias, motivo, estado, created_at')
        .eq('staff_id', staff.id)
        .order('created_at', { ascending: false });
      
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching vacaciones", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCancelar = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vacaciones')
        .update({ estado: 'cancelada' })
        .eq('id', id)
        .eq('staff_id', staff.id);
      
      if (error) {
        toast.error('Error al cancelar');
        return;
      }
      
      toast.success('Solicitud cancelada');
      fetchRequests();
    } catch (err) {
      toast.error('Error al cancelar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const start = new Date(formData.fecha_inicio);
      const end = new Date(formData.fecha_fin);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // Obtener user_id real de auth
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('vacaciones')
        .insert({
          staff_id: staff.id,
          organization_id: staff.organization_id,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
          dias: diffDays,
          motivo: formData.motivo,
          estado: 'pendiente',
          employee_user_id: user?.id
        });

      if (error) throw error;

      // Obtener nombre del empleado
      const nombreEmpleado = staff.full_name || 'Un empleado';
      const fechaInicio = format(new Date(formData.fecha_inicio), "dd/MM/yyyy");
      const fechaFin = format(new Date(formData.fecha_fin), "dd/MM/yyyy");
      const motivo = formData.motivo;

      // Insertar notificación para el administrador
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          organization_id: staff.organization_id,
          title: '🌴 Solicitud de vacaciones',
          message: `${nombreEmpleado} ha solicitado vacaciones del ${fechaInicio} al ${fechaFin}. Motivo: ${motivo || 'Sin especificar'}.`,
          type: 'warning',
          read: false,
          target_user_id: null // visible para admin
        });

      if (notifError) {
        console.error('Error notificación vacaciones:', notifError);
      }

      toast.success("Solicitud enviada correctamente");
      setIsModalOpen(false);
      setFormData({ fecha_inicio: "", fecha_fin: "", motivo: "" });
      fetchRequests();
    } catch (err: any) {
      toast.error("Error al enviar solicitud: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'aprobada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
            <CheckCircle2 size={10} /> Aprobada
          </span>
        );
      case 'rechazada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest border border-rose-500/20">
            <XCircle size={10} /> Rechazada
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-500/20">
            <X size={10} /> Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
            <Clock size={10} /> Pendiente
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#111F3A] p-8 rounded-[32px] border border-slate-200 dark:border-[#1E3A5F]">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Palmtree className="text-[#1B4FD8] w-8 h-8" />
            Mis Vacaciones
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
             Gestiona tus periodos de descanso y solicitudes
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3.5 bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2.5 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={16} />
          Solicitar Vacaciones
        </button>
      </div>

      {/* List */}
      <div className="card-premium rounded-[32px] bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Periodo</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Días</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Motivo</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-none">
                          {format(new Date(req.fecha_inicio + 'T12:00:00'), "d MMM", { locale: es })} — {format(new Date(req.fecha_fin + 'T12:00:00'), "d MMM", { locale: es })}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 tabular-nums mt-1">{new Date(req.fecha_inicio).getFullYear()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/5 text-[#1B4FD8] font-black text-xs tabular-nums border border-blue-500/10">
                      {req.dias}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic max-w-xs truncate">
                      &quot;{req.motivo || 'Sin motivo especificado'}&quot;
                    </p>
                  </td>
                  <td className="px-8 py-6 flex items-center justify-between gap-4">
                    {getStatusBadge(req.estado)}
                    {req.estado === 'pendiente' && (
                      <button 
                        onClick={() => handleCancelar(req.id)}
                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-slate-500/20 hover:bg-slate-500/40 text-slate-400 hover:text-slate-200 transition-all border border-slate-500/20"
                      >
                         Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && requests.length === 0 && (
            <div className="px-8 py-16 text-center">
              <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
                 <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-200">
                   <Palmtree size={32} />
                 </div>
                 <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Sin solicitudes</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                   Todavía no has solicitado ningún periodo de vacaciones.
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#111F3A] w-full max-w-md rounded-[32px] shadow-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between text-slate-900 dark:text-white">
                 <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <Plus size={20} className="text-[#1B4FD8]" />
                    Nueva Solicitud
                 </h3>
                 <button 
                   onClick={() => setIsModalOpen(false)}
                   className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all text-slate-400"
                 >
                   <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inicio</label>
                     <input 
                       type="date"
                       required
                       className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-xs dark:text-white"
                       value={formData.fecha_inicio}
                       onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fin</label>
                     <input 
                       type="date"
                       required
                       className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-xs dark:text-white"
                       value={formData.fecha_fin}
                       onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo</label>
                    <textarea 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-xs dark:text-white h-24 resize-none"
                      placeholder="Ej: Viaje familiar..."
                      value={formData.motivo}
                      onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                    />
                 </div>

                 <button 
                   type="submit"
                   disabled={saving}
                   className="w-full py-4 bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 active:scale-95"
                 >
                   {saving ? 'Enviando...' : 'Enviar Solicitud'}
                 </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

/**
 * SQL RLS POLICY:
 * 
 * CREATE POLICY "Staff puede cancelar sus vacaciones"
 * ON vacaciones FOR UPDATE
 * USING (auth.uid() = staff_id)
 * WITH CHECK (auth.uid() = staff_id);
 */
