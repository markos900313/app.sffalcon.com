'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building2, Euro, FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useOrganization } from '@/context/OrganizationContext';
import { getClientCampos } from '@/lib/sectorConfig';
import { Client } from '@/app/dashboard/clients/types';

const categoriasPorSector: Record<string, string[]> = {
  restaurante: [
    'Cliente habitual',
    'Cliente nuevo',
    'Reserva grupo',
    'Evento especial',
    'Delivery',
    'Otro'
  ],
  clinica: [
    'Paciente general',
    'Paciente crónico',
    'Primera visita',
    'Urgencia',
    'Revisión',
    'Otro'
  ],
  default: [
    'Cliente nuevo',
    'Cliente habitual',
    'Potencial',
    'Otro'
  ]
};

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editClient?: Client | null;
}

export default function ClientModal({ isOpen, onClose, onSuccess, editClient }: ClientModalProps) {
  const supabase = createClient();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Client>({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'nuevo',
    category: '',
    source: null,
    value: null,
    notes: ''
  });

  useEffect(() => {
    if (editClient) {
      setFormData(editClient);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'nuevo',
        category: '',
        source: null,
        value: null,
        notes: ''
      });
    }
  }, [editClient, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error('El nombre es obligatorio');

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró el usuario');

      const dataToSave = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        company: null, // OCULTO
        status: formData.status,
        category: null, // OCULTO
        source: formData.source || 'web',
        value: null, // OCULTO
        notes: formData.notes || null,
        user_id: user.id,
        organization_id: organization?.id || null,
        last_contact: editClient ? formData.last_contact : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (editClient?.id) {
        const { error } = await supabase
          .from('clients')
          .update(dataToSave)
          .eq('id', editClient.id);
        if (error) throw error;
        toast.success('Contacto actualizado');
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([dataToSave]);
        if (error) throw error;
        toast.success('Contacto añadido');
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al guardar';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111F3A] w-full max-w-2xl rounded-[24px] shadow-2xl border border-[#E2E8F0] dark:border-[#1E3A5F] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 md:px-8 py-4 md:py-6 border-b border-[#E2E8F0] dark:border-[#1E3A5F] flex items-center justify-between bg-white/50 dark:bg-[#111F3A]/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#1B4FD8]" />
              {editClient ? 'Editar Contacto' : 'Nuevo Contacto'}
            </h2>
            <p className="hidden sm:block text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Completa los datos del contacto para su gestión.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">NOMBRE COMPLETO*</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#111F3A] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#111F3A] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                  placeholder="contacto@ejemplo.com"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">TELÉFONO</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#111F3A] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">ESTADO</label>
              <div className="relative">
                <select
                  value={formData.status || 'nuevo'}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#111F3A] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white appearance-none cursor-pointer bg-[#111F3A]"
                >
                  <option value="nuevo" className="bg-[#111F3A] text-white">Nuevo</option>
                  <option value="habitual" className="bg-[#111F3A] text-white">Habitual</option>
                  <option value="vip" className="bg-[#111F3A] text-white">VIP</option>
                  <option value="inactivo" className="bg-[#111F3A] text-white">Inactivo</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">NOTAS Y OBSERVACIONES</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#111F3A] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white min-h-[120px] resize-none"
                placeholder="Detalles relevantes del contacto..."
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 md:px-8 py-4 md:py-6 border-t border-[#E2E8F0] dark:border-[#1E3A5F] flex flex-col sm:flex-row items-center justify-end gap-3 bg-white/50 dark:bg-[#111F3A]/50 backdrop-blur-md">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={cn(
              "w-full sm:w-auto px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg",
              "bg-[#1B4FD8] text-white hover:bg-[#1642B5] shadow-blue-500/25 active:scale-95",
              loading && "opacity-50 cursor-not-allowed scale-95"
            )}
          >
            {loading ? 'Guardando...' : (editClient ? 'Actualizar Contacto' : 'Guardar Contacto')}
          </button>
        </div>
      </div>
    </div>
  );
}
