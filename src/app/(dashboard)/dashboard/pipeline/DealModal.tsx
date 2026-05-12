"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { PipelineDeal, PipelineEtapa, Prioridad, OrigenLead } from "./types";
import { useOrganization } from "@/context/OrganizationContext";

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: PipelineDeal | null;
  onSave: () => void;
}

export default function DealModal({ isOpen, onClose, deal, onSave }: DealModalProps) {
  const supabase = createClient();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nombre: "",
    empresa: "",
    email: "",
    telefono: "",
    valor_estimado: 0,
    moneda: "EUR",
    etapa: "nuevo_lead" as PipelineEtapa,
    prioridad: "media" as Prioridad,
    origen: "manual" as OrigenLead,
    fecha_cierre_estimada: "",
    notas: "",
    client_id: ""
  });

  useEffect(() => {
    if (deal) {
      setFormData({
        nombre: deal.nombre || "",
        empresa: deal.empresa || "",
        email: deal.email || "",
        telefono: deal.telefono || "",
        valor_estimado: deal.valor_estimado || 0,
        moneda: deal.moneda || "EUR",
        etapa: deal.etapa || "nuevo_lead",
        prioridad: deal.prioridad || "media",
        origen: deal.origen || "manual",
        fecha_cierre_estimada: deal.fecha_cierre_estimada ? deal.fecha_cierre_estimada.split('T')[0] : "",
        notas: deal.notas || "",
        client_id: deal.client_id || ""
      });
    } else {
      setFormData({
        nombre: "",
        empresa: "",
        email: "",
        telefono: "",
        valor_estimado: 0,
        moneda: "EUR",
        etapa: "nuevo_lead",
        prioridad: "media",
        origen: "manual",
        fecha_cierre_estimada: "",
        notas: "",
        client_id: ""
      });
    }
  }, [deal, isOpen]);

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase.from('clients').select('id, name');
      if (data) setClients(data);
    }
    if (isOpen) loadClients();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const payload = {
        ...formData,
        client_id: formData.client_id || null,
        fecha_cierre_estimada: formData.fecha_cierre_estimada || null,
        user_id: user.id,
        organization_id: organization?.id || null,
        updated_at: new Date().toISOString()
      };

      if (deal) {
        const { error } = await supabase
          .from('pipeline_deals')
          .update(payload)
          .eq('id', deal.id);
        if (error) throw error;
        toast.success("Oportunidad actualizada con éxito");
      } else {
        const { error } = await supabase
          .from('pipeline_deals')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw error;
        toast.success("Oportunidad creada con éxito");
      }
      onSave();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al guardar el deal");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#111F3A] w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-[#1E3A5F] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header - Compact */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between flex-shrink-0">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {deal ? 'Editar Operación' : 'Nueva Operación'}
            </h3>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Gestión de Pipeline</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1E3A5F] rounded-full transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} id="deal-form" className="flex-1 overflow-y-auto p-5 md:p-8 space-y-4 sm:space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Contacto *</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold"
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Empresa</label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold"
                value={formData.empresa}
                onChange={e => setFormData({ ...formData, empresa: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Email</label>
              <input
                type="email"
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Teléfono</label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold"
                value={formData.telefono}
                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Valor Estimado</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold pl-9"
                  value={formData.valor_estimado}
                  onChange={e => setFormData({ ...formData, valor_estimado: Number(e.target.value) })}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">€</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Etapa</label>
              <select
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold appearance-none cursor-pointer dark:text-white dark:[&>option]:bg-[#111F3A]"
                value={formData.etapa}
                onChange={e => setFormData({ ...formData, etapa: e.target.value as PipelineEtapa })}
              >
                <option value="nuevo_lead" className="bg-[#111F3A] text-white">Prospecto</option>
                <option value="contactado" className="bg-[#111F3A] text-white">Contactado</option>
                <option value="propuesta" className="bg-[#111F3A] text-white">Propuesta</option>
                <option value="negociacion" className="bg-[#111F3A] text-white">Negociación</option>
                <option value="cerrado_ganado" className="bg-[#111F3A] text-white">Ganado</option>
                <option value="cerrado_perdido" className="bg-[#111F3A] text-white">Perdido</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Prioridad</label>
              <select
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold appearance-none cursor-pointer dark:text-white dark:[&>option]:bg-[#111F3A]"
                value={formData.prioridad}
                onChange={e => setFormData({ ...formData, prioridad: e.target.value as Prioridad })}
              >
                <option value="baja" className="bg-[#111F3A] text-white">Baja</option>
                <option value="media" className="bg-[#111F3A] text-white">Media</option>
                <option value="alta" className="bg-[#111F3A] text-white">Alta</option>
                <option value="urgente" className="bg-[#111F3A] text-white">Urgente</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Origen</label>
              <select
                className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold appearance-none cursor-pointer dark:text-white dark:[&>option]:bg-[#111F3A]"
                value={formData.origen}
                onChange={e => setFormData({ ...formData, origen: e.target.value as OrigenLead })}
              >
                <option value="web" className="bg-[#111F3A] text-white">Web</option>
                <option value="whatsapp" className="bg-[#111F3A] text-white">WhatsApp</option>
                <option value="email" className="bg-[#111F3A] text-white">Email</option>
                <option value="manual" className="bg-[#111F3A] text-white">Manual</option>
                <option value="referido" className="bg-[#111F3A] text-white">Referido</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Notas rápidas</label>
            <textarea
              rows={3}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-xs sm:text-sm font-bold resize-none"
              value={formData.notas}
              onChange={e => setFormData({ ...formData, notas: e.target.value })}
            />
          </div>
        </form>

        {/* Footer - Flexible */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-[#1E3A5F] flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            form="deal-form"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto order-1 sm:order-2 px-10 py-3 bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {deal ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
