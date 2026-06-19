"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Phone, Video, MapPin, Loader2, ChevronDown, Tag } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { useOrganization } from "@/context/OrganizationContext";
import { useLanguage } from "@/lib/LanguageContext";
import { 
  getModuleLabel, 
  getAppointmentModalidades,
  getSectorGrupo 
} from "@/lib/sectorConfig";

interface Client {
  id: string;
  name: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  appointment?: any;
  initialData?: any;
}

export default function AppointmentModal({
  isOpen,
  onClose,
  onSave,
  appointment,
  initialData
}: AppointmentModalProps) {
  const supabase = createClient();
  const { organization } = useOrganization();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    client_id: "",
    customer_name: "",
    customer_phone: "",
    date: "",
    time: "",
    type: "presencial",
    notes: "",
    status: "pendiente",
    servicio: "",
    duracion: "1 hora",
    personas: "",
    zona: ""
  });

  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        setFormData({
          title: appointment.title || "",
          client_id: appointment.client_id || "",
          customer_name: appointment.customer_name || "",
          customer_phone: appointment.customer_phone || "",
          date: appointment.date,
          time: appointment.time,
          type: 'presencial',
          notes: appointment.notes || "",
          status: appointment.status,
          servicio: appointment.servicio || "",
          duracion: appointment.duracion || "1 hora",
          personas: appointment.personas || "",
          zona: appointment.zona || ""
        } as any);
      } else if (initialData) {
        setFormData(prev => ({ ...prev, ...initialData }));
      }
    }
  }, [isOpen, appointment, initialData]);

  const handleSave = async () => {
    if (!formData.customer_name || !formData.date || !formData.time) {
      toast.error(t('appointments.modal.errors.requiredFields'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        title: `Reserva: ${formData.customer_name}`,
        created_by: 'human',
        organization_id: organization?.id
      };

      const res = await fetch('/api/appointments', {
        method: appointment ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment ? { ...payload, id: appointment.id } : payload)
      });

      if (!res.ok) throw new Error(t('appointments.modal.errors.saveError'));

      toast.success(appointment ? t('appointments.modal.toast.updated') : t('appointments.modal.toast.success'));
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white dark:bg-[#111F3A] w-full max-w-lg rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-8 py-4 md:py-6 border-b border-slate-100 dark:border-[#1E3A5F]">
          <h3 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            {appointment ? t('appointments.modal.editTitle') : t('appointments.modal.newTitle')}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 md:p-8 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('appointments.modal.contactNameLabel')}</label>
              <input 
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                placeholder={t('appointments.modal.contactNamePlaceholder')}
                className="w-full bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('appointments.modal.phoneLabel')}</label>
              <input 
                type="text"
                value={formData.customer_phone}
                onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                placeholder={t('appointments.modal.phonePlaceholder')}
                className="w-full bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('appointments.modal.activityLabel')}</label>
            <div className="relative">
              <input 
                type="text"
                value={formData.servicio}
                onChange={(e) => setFormData({...formData, servicio: e.target.value})}
                placeholder={t('appointments.modal.activityPlaceholder')}
                className="w-full bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('appointments.modal.dateLabel')}</label>
              <input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('appointments.modal.timeLabel')}</label>
              <input 
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                placeholder="00:00"
                className="w-full bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('appointments.modal.peopleLabel')}</label>
              <input 
                type="number"
                value={formData.personas}
                onChange={(e) => setFormData({...formData, personas: e.target.value})}
                placeholder="1"
                min="1"
                className="w-full bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('appointments.modal.zoneLabel')}</label>
              <div className="relative">
                <input 
                  type="text"
                  value={formData.zona}
                  onChange={(e) => setFormData({...formData, zona: e.target.value})}
                  placeholder={t('appointments.modal.zonePlaceholder')}
                  className="w-full bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('appointments.modal.modalityLabel')}</label>
            <div className="relative">
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white appearance-none cursor-pointer bg-[#111F3A]"
              >
                <option value="reserva" className="bg-[#111F3A] text-white">{t('appointments.modal.modalities.reserva')}</option>
                <option value="telefonica" className="bg-[#111F3A] text-white">{t('appointments.modal.modalities.telefonica')}</option>
                <option value="presencial" className="bg-[#111F3A] text-white">{t('appointments.modal.modalities.presencial')}</option>
                <option value="videollamada" className="bg-[#111F3A] text-white">{t('appointments.modal.modalities.videollamada')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('appointments.modal.notesLabel')}</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white resize-none"
              placeholder={t('appointments.modal.notesPlaceholder')}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 md:px-8 py-4 md:py-6 bg-slate-50 dark:bg-[#0D1B35] flex flex-col sm:flex-row items-center gap-3 border-t border-slate-100 dark:border-[#1E3A5F]">
          <button 
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto flex-1 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1E3A5F]/40 rounded-xl transition-all"
          >
            {t('common.cancel')}
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto flex-1 px-4 py-3 bg-[#1B4FD8] hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('appointments.modal.confirmButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
