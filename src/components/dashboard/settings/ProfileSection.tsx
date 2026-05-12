"use client";

import React, { useState, useEffect } from "react";
import { User, Camera, ChevronDown, Loader2 } from "lucide-react";
import { updateProfile } from "@/lib/supabase/queries/profile";
import toast from "react-hot-toast";

export default function ProfileSection({ 
  profile, 
  user,
  organization,
  onRefresh
}: { 
  profile: any, 
  user: any,
  organization?: any,
  onRefresh: () => void 
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    position: profile?.position || "",
    company: profile?.company || organization?.name || "",
    phone: profile?.phone || organization?.whatsapp_number || "",
    timezone: profile?.timezone || "(GMT+01:00) Madrid"
  });

  useEffect(() => {
    if (profile || organization) {
      setFormData({
        full_name: profile?.full_name || "",
        position: profile?.position || "",
        company: profile?.company || organization?.name || "",
        phone: profile?.phone || organization?.whatsapp_number || "",
        timezone: profile?.timezone || "(GMT+01:00) Madrid"
      });
    }
  }, [profile, organization]);

  const initials = formData.full_name
    ? formData.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : "??";

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(user.id, {
        full_name: formData.full_name.trim(),
        position: formData.position.trim(),
        company: formData.company.trim(),
        phone: formData.phone.trim(),
        timezone: formData.timezone
      });
      toast.success("Perfil actualizado");
      onRefresh();
    } catch (error) {
      toast.error("Error al guardar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] p-6 sm:p-8 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-8">
        <User className="w-5 h-5 text-[#1B4FD8]" />
        <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
          Configuración de Perfil
        </h3>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Avatar Area */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#1B4FD8] flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
              {initials}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-[#1E3A5F] border border-[#E2E8F0] dark:border-[#475569] rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-[#111F3A] transition-colors">
              <Camera className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
            </button>
          </div>
          <p className="mt-4 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-center">
            CAMBIAR FOTO
          </p>
        </div>

        {/* Fields Grid */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field 
              label="Nombre completo" 
              value={formData.full_name} 
              onChange={(v) => setFormData({...formData, full_name: v})} 
            />
            <div className="space-y-1.5 opacity-60">
              <label className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.08em] ml-1">
                Email
              </label>
              <input
                type="text"
                value={user?.email || ""}
                disabled
                className="w-full bg-[#F1F5F9] dark:bg-[#0D1B35] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-lg py-3 px-4 text-[14px] text-[#64748B] dark:text-[#94A3B8] font-normal outline-none cursor-not-allowed"
              />
            </div>
            <Field 
              label="Cargo" 
              value={formData.position} 
              onChange={(v) => setFormData({...formData, position: v})} 
            />
            <Field 
              label="Empresa" 
              value={formData.company} 
              onChange={(v) => setFormData({...formData, company: v})} 
            />
            <Field 
              label="Teléfono" 
              value={formData.phone} 
              placeholder="+34 000 000 000"
              onChange={(v) => setFormData({...formData, phone: v})} 
            />
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.08em] ml-1">
                Zona horaria
              </label>
              <div className="relative">
                <select 
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  className="w-full bg-[#F1F5F9] dark:bg-[#0D1B35] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-lg py-3 px-4 text-[14px] text-[#0F172A] dark:text-[#F1F5F9] font-normal appearance-none outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                >
                  <option>(GMT+01:00) Madrid</option>
                  <option>(GMT+00:00) Londres</option>
                  <option>(GMT-05:00) Nueva York</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-[#1E3A5F]">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-10 py-3.5 bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold text-[14px] rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] uppercase tracking-tight flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, placeholder, onChange }: { label: string, value: string, placeholder?: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.08em] ml-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#F1F5F9] dark:bg-[#0D1B35] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-lg py-3 px-4 text-base text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-[#475569] font-normal outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
      />
    </div>
  );
}
