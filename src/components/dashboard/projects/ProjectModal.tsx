'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Loader2, 
  Briefcase, 
  User, 
  Calendar, 
  DollarSign, 
  Layout, 
  FileText,
  Target
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useOrganization } from '@/context/OrganizationContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editProject?: {
    id: string;
    name: string;
    client_id: string;
    status: string;
    budget: number;
    paid: number;
    progress: number;
    start_date: string;
    end_date: string;
    description: string;
    notes: string;
  };
}

const STATUSES = ['propuesta', 'activo', 'completado', 'cancelado'];

export default function ProjectModal({ isOpen, onClose, onSuccess, editProject }: ProjectModalProps) {
  const supabase = createClient();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    status: 'propuesta',
    budget: '',
    paid: '0',
    progress: 0,
    start_date: '',
    end_date: '',
    description: '',
    notes: ''
  });

  const fetchClients = React.useCallback(async () => {
    const { data } = await supabase.from('clients').select('id, name').order('name');
    setClients(data || []);
  }, [supabase]);

  useEffect(() => {
    if (isOpen) {
      if (editProject) {
        setFormData({
          name: editProject.name || '',
          client_id: editProject.client_id || '',
          status: editProject.status || 'propuesta',
          budget: editProject.budget?.toString() || '',
          paid: editProject.paid?.toString() || '0',
          progress: editProject.progress || 0,
          start_date: editProject.start_date || '',
          end_date: editProject.end_date || '',
          description: editProject.description || '',
          notes: editProject.notes || ''
        });
      } else {
        setFormData({
          name: '',
          client_id: '',
          status: 'propuesta',
          budget: '',
          paid: '0',
          progress: 0,
          start_date: format(new Date(), 'yyyy-MM-dd'),
          end_date: '',
          description: '',
          notes: ''
        });
      }
      fetchClients();
    }
  }, [isOpen, editProject, fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const payload = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        budget: formData.budget === '' ? null : parseFloat(formData.budget),
        paid: formData.paid === '' ? 0 : parseFloat(formData.paid),
        progress: formData.progress,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        notes: formData.notes || null,
        client_id: formData.client_id === '' ? null : formData.client_id,
        user_id: user.id,
        organization_id: organization?.id || null,
        updated_at: new Date().toISOString()
      };

      if (editProject) {
        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', editProject.id);
        if (error) throw error;
        toast.success('Proyecto actualizado');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([payload]);
        if (error) throw error;
        toast.success('Proyecto creado correctamente');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Error al guardar el proyecto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111F3A] rounded-[32px] border border-white/20 dark:border-[#1E3A5F] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 md:px-8 py-4 md:py-6 border-b border-slate-100 dark:border-[#1E3A5F] bg-slate-50/50 dark:bg-[#162040]/50 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1B4FD8] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white uppercase tracking-tight">
                {editProject ? 'EDITAR PROYECTO' : 'NUEVO PROYECTO'}
              </h2>
              <p className="hidden sm:block text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">Define los parámetros del nuevo encargo.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nombre */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> Nombre del Proyecto
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Diseño Web Corp"
                className="w-full bg-slate-100/50 dark:bg-[#111F3A] border-none rounded-2xl px-5 py-4 text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1B4FD8]/20 transition-all"
              />
            </div>

            {/* Cliente */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Contacto Vinculado
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full bg-slate-100/50 dark:bg-[#111F3A] border-none rounded-2xl px-5 py-4 text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1B4FD8]/20 transition-all cursor-pointer bg-[#111F3A]"
              >
                <option value="" className="bg-[#111F3A] text-white">Sin Contacto / Particular</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#111F3A] text-white">{c.name}</option>
                ))}
              </select>
            </div>



            {/* Presupuesto */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" /> Presupuesto Total
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="0.00€"
                className="w-full bg-slate-100/50 dark:bg-[#111F3A] border-none rounded-2xl px-5 py-4 text-base font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#1B4FD8]/20 transition-all"
              />
            </div>

            {/* Cobrado */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" /> Cobrado hasta hoy
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.paid}
                onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
                placeholder="0.00€"
                className="w-full bg-slate-100/50 dark:bg-[#111F3A] border-none rounded-2xl px-5 py-4 text-base font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#1B4FD8]/20 transition-all"
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Estado Inicial
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-100/50 dark:bg-[#111F3A] border-none rounded-2xl px-5 py-4 text-base font-semibold text-slate-900 dark:text-white uppercase focus:ring-1 focus:ring-[#1B4FD8]/20 transition-all cursor-pointer bg-[#111F3A]"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s} className="bg-[#111F3A] text-white">{s}</option>
                ))}
              </select>
            </div>

            {/* Progreso */}
            <div className="md:col-span-2 space-y-4 py-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" /> Progreso Real: {formData.progress}%
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#1B4FD8]"
              />
            </div>

            {/* Fechas */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Fecha Inicio
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full bg-slate-100/50 dark:bg-[#111F3A] border-none rounded-2xl px-5 py-4 text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1B4FD8]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Fin Estimado
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full bg-slate-100/50 dark:bg-[#111F3A] border-none rounded-2xl px-5 py-4 text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1B4FD8]/20 transition-all"
              />
            </div>


            {/* Descripción */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Descripción del Proyecto
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Breve resumen del alcance..."
                className="w-full bg-slate-100/50 dark:bg-[#111F3A] border-none rounded-2xl px-5 py-3 text-base font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#1B4FD8]/20 transition-all resize-none"
              />
            </div>

            {/* Notas */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Notas Internas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Notas privadas sobre el cliente o el pago..."
                className="w-full bg-slate-100/50 dark:bg-[#111F3A] border-none rounded-2xl px-5 py-3 text-base font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#1B4FD8]/20 transition-all resize-none"
              />
            </div>


          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-10">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto flex-1 py-4 px-6 border border-slate-200 dark:border-[#1E3A5F] text-slate-600 dark:text-slate-400 rounded-2xl font-semibold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex-[2] py-4 px-6 bg-[#1B4FD8] text-white rounded-2xl font-semibold text-sm shadow-xl shadow-blue-500/20 hover:bg-[#1642B5] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {editProject ? 'GUARDAR CAMBIOS' : 'CREAR PROYECTO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
