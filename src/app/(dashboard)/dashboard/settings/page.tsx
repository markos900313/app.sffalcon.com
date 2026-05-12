"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import SecuritySection from "@/components/dashboard/settings/SecuritySection";
import AppearanceSection from "@/components/dashboard/settings/AppearanceSection";
import NotificationsSection from "@/components/dashboard/settings/NotificationsSection";
import IntegrationsSection from "@/components/dashboard/settings/IntegrationsSection";
import SystemSection from "@/components/dashboard/settings/SystemSection";
import { createClient } from "@/lib/supabase/client";
import { DashboardPageContainer, DashboardSection } from "@/components/dashboard/DashboardPageContainer";
import { getProfile, getNotificationSettings, getIntegrations } from "@/lib/supabase/queries/profile";
import { Loader2, Building2, Info, Bot, Smartphone, Calendar, Users, MessageSquare, Save, Clock, Globe, User, Camera, CreditCard, ChevronRight, Zap, X, Lock } from "lucide-react";
import { useOrganization } from "@/context/OrganizationContext";
import { usePlan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { SubscriptionModal } from "@/components/dashboard/settings/SubscriptionModal";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";

export default function SettingsPage() {
  const { organization, loading: orgLoading } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [notifs, setNotifs] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);


  const fetchOrganization = () => {
    window.location.reload();
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user: u } } = await supabase.auth.getUser();
        setUser(u)
        setUserId(u?.id || null)

        if (u) {
          const { data: member } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', u.id)
            .single()

          const { data: org } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', member?.organization_id)
            .single()

          let { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .single();

          if (!profileData) {
            const { data: newProfile, error: upsertError } = await supabase
              .from('profiles')
              .upsert({
                id: u.id,
                full_name: u.user_metadata?.full_name || u.user_metadata?.name || '',
                email: u.email || '',
                updated_at: new Date().toISOString()
              })
              .select('*')
              .single();

            if (!upsertError) profileData = newProfile;
          }

          setProfile(profileData);

          const [notifsData, integrationsData] = await Promise.all([
            getNotificationSettings(u.id),
            getIntegrations(u.id)
          ]);

          setNotifs(notifsData);
          setIntegrations(integrationsData);
        }
      } catch (error) {
        console.error("Error init settings:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading || orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DashboardPageContainer animate={false}>
      <div className="px-1 md:px-2">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-6 mt-6 ml-1">
          Ajustes
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* COLUMNA IZQUIERDA: Perfil, Organización, Horario, Suscripción, Seguridad */}
          <div className="flex flex-col gap-4">
            <ProfileSection
              profile={profile}
              user={user}
              userId={userId}
              organization={organization}
              onRefresh={() => userId && getProfile(userId).then(setProfile)}
            />
            <OrganizationSection
              organization={organization}
              onRefresh={fetchOrganization}
              userId={userId}
              user={user}
            />
            <WorkingHoursSection
              organization={organization}
              onRefresh={fetchOrganization}
              userId={userId}
              user={user}
            />
            <SubscriptionSection
              organization={organization}
              userId={userId}
              user={user}
              onRefresh={fetchOrganization}
            />
            <SecuritySection user={user} />
          </div>

          {/* COLUMNA DERECHA: IA Autónoma, Integraciones, Email Corporativo, Notificaciones, Sistema */}
          <div className="flex flex-col gap-4">
            <AutonomousAISection
              organization={organization}
              userId={userId}
              user={user}
              onRefresh={fetchOrganization}
            />
            <IntegrationsSection
              initialIntegrations={integrations}
              user={user}
              onRefresh={() => userId && getIntegrations(userId).then(setIntegrations)}
            />
            <WhatsAppSection organization={organization} />
            <EmailCorporativoSection organization={organization} />
            <NotificationsSection initialSettings={notifs} user={user} />
            <SystemSection user={user} />
          </div>
        </div>
      </div>
    </DashboardPageContainer>
  );
}



function ProfileSection({ profile, user, userId, organization, onRefresh }: { profile: any, user: any, userId: string | null, organization?: any, onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "",
    cargo: profile?.cargo || "",
    company: profile?.company || organization?.name || "",
    phone: profile?.phone || organization?.whatsapp_number || ""
  });

  useEffect(() => {
    if (profile?.avatar_url) {
      setPreviewUrl(null);
    }
  }, [profile?.avatar_url]);

  useEffect(() => {
    if (profile || organization || user) {
      setFormData({
        full_name: profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "",
        cargo: profile?.cargo || "",
        company: profile?.company || organization?.name || "",
        phone: profile?.phone || organization?.whatsapp_number || ""
      });
    }
  }, [profile, organization, user]);



  const initials = formData.full_name
    ? formData.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : "??";

  const handleSave = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          cargo: formData.cargo.trim(),
          company: formData.company.trim(),
          phone: formData.phone.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      toast.success("Perfil actualizado");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // 1. Preview inmediato
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      const filePath = fileName;

      // 2. Subir a Supabase Storage (bucket 'avatars')
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // 3. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 4. Actualizar profiles.avatar_url
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // 5. Sincronizar con el resto de la App (Sidebar, etc)
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      // Emitir evento global para que componentes como el Sidebar se actualicen
      window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: { avatar_url: publicUrl }
      }));

      toast.success("Foto actualizada");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al subir la imagen");
      setPreviewUrl(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] p-5 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <User className="w-5 h-5 text-[#1B4FD8]" />
        <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Configuración de Perfil</h3>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-center shrink-0">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-20 h-20 rounded-full bg-[#1B4FD8] flex items-center justify-center text-white text-2xl font-semibold shadow-lg overflow-hidden border-4 border-white dark:border-[#1E3A5F]">
              {previewUrl || profile?.avatar_url ? (
                <img src={previewUrl || profile?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-white dark:bg-[#1E3A5F] border border-[#E2E8F0] dark:border-[#475569] rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Camera className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nombre completo" value={formData.full_name} onChange={(v) => setFormData({ ...formData, full_name: v })} />
            <div className="space-y-1.5 opacity-60">
              <label className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.08em] ml-1">Email</label>
              <input type="text" value={user?.email || profile?.email || ""} disabled className="w-full bg-[#F1F5F9] dark:bg-[#0D1B35] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-lg py-3 px-4 text-[14px] text-[#64748B] dark:text-[#94A3B8] outline-none cursor-not-allowed" />
            </div>
            <Field label="Cargo" value={formData.cargo} onChange={(v) => setFormData({ ...formData, cargo: v })} />
            <Field label="Empresa" value={formData.company} onChange={(v) => setFormData({ ...formData, company: v })} />
            <Field label="Teléfono" value={formData.phone} placeholder="+34..." onChange={(v) => setFormData({ ...formData, phone: v })} />
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-[#1E3A5F]">
            <button onClick={handleSave} disabled={loading} className="w-full sm:w-auto px-6 py-2.5 bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold text-[14px] rounded-xl transition-all shadow-lg active:scale-[0.98] uppercase tracking-tight flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrganizationSection({ organization, onRefresh, userId, user }: { organization: any, onRefresh: () => void, userId: string | null, user: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sector: "",
    country: "",
    currency: "",
    currency_symbol: "",
    phone: "",
    logo_url: "",
    email: "",
    nif: "",
    address: "",
    city: "",
    bizum_number: "",
    iban: ""
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        sector: organization.ai_sector_prompt || "",
        country: organization.country || "",
        currency: organization.currency || "",
        currency_symbol: organization.currency_symbol || "",
        phone: organization.whatsapp_number || "",
        logo_url: organization.logo_url || "",
        email: organization.email_channel || "",
        nif: organization.nif || "",
        address: organization.address || "",
        city: organization.city || "",
        bizum_number: organization.bizum_number || "",
        iban: organization.iban || ""
      });
    }
  }, [organization]);



  const handleSave = async () => {
    if (!organization?.id) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          ai_sector_prompt: formData.sector,
          country: formData.country,
          currency: formData.currency,
          currency_symbol: formData.currency_symbol,
          whatsapp_number: formData.phone,
          logo_url: formData.logo_url,
          email_channel: formData.email,
          nif: formData.nif,
          address: formData.address,
          city: formData.city,
          bizum_number: formData.bizum_number,
          iban: formData.iban,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (error) {
        if (error.code === '42703') {
          toast.error("Ejecuta primero el SQL en Supabase");
          return;
        }
        throw error;
      }
      toast.success("Organización actualizada");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar organización");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] p-5 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="w-5 h-5 text-[#1B4FD8]" />
        <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Mi Organización</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Nombre del negocio" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
        <Field label="Actividad del negocio" value={formData.sector} onChange={(v) => setFormData({ ...formData, sector: v })} />
        <Field label="NIF / CIF" value={formData.nif} placeholder="B-12345678" onChange={(v) => setFormData({ ...formData, nif: v })} />
        <Field label="Dirección fiscal" value={formData.address} placeholder="Calle..." onChange={(v) => setFormData({ ...formData, address: v })} />
        <Field label="Ciudad" value={formData.city} placeholder="Madrid" onChange={(v) => setFormData({ ...formData, city: v })} />
        <Field label="País" value={formData.country} placeholder="ES" onChange={(v) => setFormData({ ...formData, country: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Moneda" value={formData.currency} placeholder="EUR" onChange={(v) => setFormData({ ...formData, currency: v })} />
          <Field label="Símbolo" value={formData.currency_symbol} placeholder="€" onChange={(v) => setFormData({ ...formData, currency_symbol: v })} />
        </div>
        <Field label="Teléfono" value={formData.phone} placeholder="+34..." onChange={(v) => setFormData({ ...formData, phone: v })} />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#1E3A5F]">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-[#1B4FD8]" />
          <div>
            <h4 className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Métodos de cobro</h4>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Estos datos se usan cuando un cliente pregunta cómo pagarte. La IA los comunicará solo si el cliente lo pregunta.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Número Bizum" value={formData.bizum_number} placeholder="+34 6XX XXX XXX" onChange={(v) => setFormData({ ...formData, bizum_number: v })} />
          <Field label="IBAN para transferencia" value={formData.iban} placeholder="ES00 0000..." onChange={(v) => setFormData({ ...formData, iban: v })} />
        </div>
      </div>

      <div className="flex justify-end pt-4 mt-4 border-t border-slate-100 dark:border-[#1E3A5F]">
        <button onClick={handleSave} disabled={loading} className="w-full sm:w-auto px-6 py-2.5 bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold text-[14px] rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 flex items-center justify-center gap-2 uppercase tracking-tight">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar Negocio
        </button>
      </div>
    </div>
  );
}

function WorkingHoursSection({ organization, onRefresh, userId, user }: { organization: any, onRefresh: () => void, userId: string | null, user: any }) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    working_hours_start: 540,
    working_hours_end: 1080,
    working_days: [1, 2, 3, 4, 5]
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        working_hours_start: organization.working_hours_start ?? 540,
        working_hours_end: organization.working_hours_end ?? 1080,
        working_days: organization.working_days || [1, 2, 3, 4, 5]
      });
    }
  }, [organization]);



  const handleSave = async () => {
    if (!organization?.id || !user?.id) return;
    setLoading(true);
    try {
      const supabase = createClient();
      // Update organizations
      const { error: orgError } = await supabase
        .from('organizations')
        .update({
          working_hours_start: formData.working_hours_start,
          working_hours_end: formData.working_hours_end,
          working_days: formData.working_days,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (orgError) throw orgError;

      // 4. Actualización consolidada en organization

      toast.success("Horarios actualizados");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar horarios");
    } finally {
      setLoading(false);
    }
  };

  const DAYS = [
    { id: 1, label: 'L' }, { id: 2, label: 'M' }, { id: 3, label: 'X' },
    { id: 4, label: 'J' }, { id: 5, label: 'V' }, { id: 6, label: 'S' }, { id: 7, label: 'D' }
  ];

  const HORAS = Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, '0')}:00`
  );

  const minutosAHora = (min: number): string => {
    if (!min && min !== 0) return '00:00'
    const horas = Math.floor(min / 60)
    return `${horas.toString().padStart(2, '0')}:00`
  }

  const horaAMinutos = (hora: string) =>
    parseInt(hora.split(':')[0]) * 60;

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] p-5 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-[#1B4FD8]" />
        <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Horario Comercial</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Días Laborables</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(d => (
              <button
                key={d.id}
                onClick={() => setFormData(prev => ({
                  ...prev,
                  working_days: prev.working_days.includes(d.id)
                    ? prev.working_days.filter(idx => idx !== d.id)
                    : [...prev.working_days, d.id]
                }))}
                className={cn(
                  "w-9 h-9 rounded-lg border-2 font-bold transition-all text-xs",
                  formData.working_days.includes(d.id)
                    ? "bg-blue-500/10 border-blue-500 text-blue-500"
                    : "bg-slate-50 dark:bg-[#111F3A] border-transparent text-slate-400"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Apertura</label>
            <select
              value={minutosAHora(formData.working_hours_start)}
              onChange={(e) => setFormData({ ...formData, working_hours_start: horaAMinutos(e.target.value) })}
              className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-100 dark:border-[#1E3A5F] rounded-xl py-2 px-3 text-sm text-[#0F172A] dark:text-[#F1F5F9] outline-none appearance-none"
            >
              {HORAS.map(h => <option key={h} value={h} className="bg-[#111F3A] text-white">{h}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Cierre</label>
            <select
              value={minutosAHora(formData.working_hours_end)}
              onChange={(e) => setFormData({ ...formData, working_hours_end: horaAMinutos(e.target.value) })}
              className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-100 dark:border-[#1E3A5F] rounded-xl py-2 px-3 text-sm text-[#0F172A] dark:text-[#F1F5F9] outline-none appearance-none"
            >
              {HORAS.map(h => <option key={h} value={h} className="bg-[#111F3A] text-white">{h}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 mt-4 border-t border-slate-100 dark:border-[#1E3A5F]">
        <button onClick={handleSave} disabled={loading} className="w-full sm:w-auto px-6 py-2.5 bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold text-[14px] rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 flex items-center justify-center gap-2 uppercase tracking-tight">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar Horario
        </button>
      </div>
    </div>
  );
}

function PaymentMethodsSection({ organization, onRefresh, userId, user }: { organization: any, onRefresh: () => void, userId: string | null, user: any }) {
  const [loading, setLoading] = useState(false);
  const [bizumEnabled, setBizumEnabled] = useState(false);
  const [ibanEnabled, setIbanEnabled] = useState(false);
  const [bizumNumber, setBizumNumber] = useState("");
  const [ibanNumber, setIbanNumber] = useState("");

  useEffect(() => {
    if (organization) {
      setBizumNumber(organization.payment_bizum || "");
      setIbanNumber(organization.payment_iban || "");
      setBizumEnabled(!!organization.payment_bizum);
      setIbanEnabled(!!organization.payment_iban);
    }
  }, [organization]);

  const handleSave = async () => {
    if (!organization?.id) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('organizations')
        .update({
          payment_bizum: bizumEnabled ? bizumNumber : null,
          payment_iban: ibanEnabled ? ibanNumber : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (error) throw error;
      toast.success("Métodos de pago actualizados");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar métodos de pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] p-5 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-[#1B4FD8]" />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Métodos de Pago</h3>
          <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Registra cómo quieres que tus clientes te paguen. La IA usará estos datos exactos cuando un cliente pregunte.</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="text-[14px] font-bold text-[#0F172A] dark:text-[#F1F5F9]">Bizum</h4>
            </div>
            <button
              onClick={() => setBizumEnabled(!bizumEnabled)}
              className={cn("relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors", bizumEnabled ? "bg-[#1B4FD8]" : "bg-slate-300 dark:bg-[#1E3A5F]")}
            >
              <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", bizumEnabled ? "translate-x-5" : "translate-x-0")} />
            </button>
          </div>
          {bizumEnabled && (
            <Field label="Número de teléfono Bizum" value={bizumNumber} placeholder="600 000 000" onChange={setBizumNumber} />
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="text-[14px] font-bold text-[#0F172A] dark:text-[#F1F5F9]">Transferencia bancaria</h4>
            </div>
            <button
              onClick={() => setIbanEnabled(!ibanEnabled)}
              className={cn("relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors", ibanEnabled ? "bg-[#1B4FD8]" : "bg-slate-300 dark:bg-[#1E3A5F]")}
            >
              <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", ibanEnabled ? "translate-x-5" : "translate-x-0")} />
            </button>
          </div>
          {ibanEnabled && (
            <Field label="Número de cuenta (IBAN)" value={ibanNumber} placeholder="ES00 0000 0000 0000 0000 0000" onChange={setIbanNumber} />
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 mt-4 border-t border-slate-100 dark:border-[#1E3A5F]">
        <button onClick={handleSave} disabled={loading} className="w-full sm:w-auto px-6 py-2.5 bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold text-[14px] rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 flex items-center justify-center gap-2 uppercase tracking-tight">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar Métodos de Pago
        </button>
      </div>
    </div>
  );
}

function EmailCorporativoSection({ organization }: { organization: any }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    email_inbound: "",
    email_display_name: "",
    email_signature: "",
    email_ai_enabled: false,
    alert_email: ""
  });

  useEffect(() => {
    async function fetchSettings() {
      if (!organization?.id) return;
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('organization_id', organization.id)
          .single();

        if (data && !error) {
          setFormData({
            email_inbound: data.email_inbound || "",
            email_display_name: data.email_display_name || "",
            email_signature: data.email_signature || "",
            email_ai_enabled: data.email_ai_enabled ?? false,
            alert_email: data.alert_email || ""
          });
        }
      } catch (err) {
        console.error("Error fetching email settings:", err);
      } finally {
        setFetching(false);
      }
    }
    fetchSettings();
  }, [organization?.id]);



  const handleSave = async () => {
    if (!organization?.id) return;

    // Validación: alert_email es obligatorio
    if (!formData.alert_email.trim()) {
      toast.error("El Correo de Alertas es obligatorio");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.alert_email.trim())) {
      toast.error("Introduce un email válido para las alertas");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('settings')
        .upsert({
          organization_id: organization.id,
          email_inbound: formData.email_inbound.trim(),
          email_display_name: formData.email_display_name.trim(),
          email_signature: formData.email_signature.trim(),
          email_ai_enabled: formData.email_ai_enabled,
          alert_email: formData.alert_email.trim(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'organization_id' });

      if (error) throw error;
      toast.success("Configuración de email guardada");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar configuración");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return null;

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] p-5 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="w-5 h-5 text-[#1B4FD8]" />
        <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Email Corporativo</h3>
      </div>

      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
        <h4 className="flex items-center gap-2 text-[12px] font-bold text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-tight">
          <Info className="w-4 h-4" /> Conexión
        </h4>
        <div className="space-y-2 text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed font-medium">
          <p>Reenvío automático (Forwarding) a: <span className="font-bold text-blue-600 dark:text-blue-400 select-all underline">tu_usuario@sffalcon.com</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Field label="Tu email de negocio" value={formData.email_inbound} placeholder="info@tunegocio.com" onChange={(v) => setFormData({ ...formData, email_inbound: v })} />
        <Field label="Nombre visible" value={formData.email_display_name} placeholder="Mi Negocio" onChange={(v) => setFormData({ ...formData, email_display_name: v })} />
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.08em] ml-1">Firma automática</label>
          <textarea
            value={formData.email_signature}
            onChange={(e) => setFormData({ ...formData, email_signature: e.target.value })}
            placeholder="Atentamente..."
            className="w-full bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-lg py-3 px-4 text-[14px] text-[#0F172A] dark:text-[#F1F5F9] font-normal outline-none transition-all min-h-[80px]"
          />
        </div>
        <ToggleCard title="Responder con IA" subtitle="Activa la respuesta automática para emails" active={formData.email_ai_enabled} onChange={(v) => setFormData({ ...formData, email_ai_enabled: v })} />

        {/* Alert Email — campo obligatorio */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 ml-1">
            <label className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.08em]">
              Correo de Alertas <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-[#64748B] dark:text-[#475569]">(Asistencia Humana)</span>
          </div>
          <input
            type="email"
            value={formData.alert_email}
            onChange={(e) => setFormData({ ...formData, alert_email: e.target.value })}
            placeholder="alertas@tunegocio.com"
            required
            className={`w-full bg-white dark:bg-[#111F3A] border rounded-lg py-3 px-4 text-[14px] text-[#0F172A] dark:text-[#F1F5F9] font-normal outline-none transition-all ${
              !formData.alert_email.trim()
                ? 'border-amber-400 dark:border-amber-500 focus:border-amber-500 ring-1 ring-amber-300/40'
                : 'border-[#E2E8F0] dark:border-[#1E3A5F] focus:border-[#1B4FD8]'
            }`}
          />
          <p className="text-[11px] text-[#64748B] dark:text-[#475569] ml-1 leading-relaxed">
            Email donde tu Asistente IA te notificará cuando un cliente exija hablar con una persona.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4 mt-4 border-t border-slate-100 dark:border-[#1E3A5F]">
        <button onClick={handleSave} disabled={loading} className="w-full sm:w-auto px-6 py-2.5 bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold text-[14px] rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 flex items-center justify-center gap-2 uppercase tracking-tight">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar Email
        </button>
      </div>
    </div>
  );
}

function AutonomousAISection({ organization, userId, user, onRefresh }: { organization: any, userId: string | null, user: any, onRefresh: () => void }) {
  const [saving, setSaving] = useState(false);
  const { plan: currentPlan, loading: planLoading } = usePlan();
  const isPro = planLoading ? true : currentPlan !== 'free';

  const [settings, setSettings] = useState({
    auto_reply_enabled: false,
    ai_whatsapp_enabled: false,
    ai_auto_appointments: false,
    ai_auto_clients: false,
    ai_personality: 'amigable',
    ai_sector_prompt: '',
    ai_max_messages: 10
  });

  useEffect(() => {
    async function loadSettings() {
      const orgId = organization?.id;
      if (!orgId) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from('organizations')
        .select('ai_enabled, ai_whatsapp_enabled, ai_auto_appointments, ai_auto_clients, ai_personality, ai_sector_prompt, ai_max_messages')
        .eq('id', orgId)
        .single();

      if (!error && data) {
        setSettings({
          auto_reply_enabled: isPro ? (data.ai_whatsapp_enabled ?? false) : false,
          ai_whatsapp_enabled: isPro ? (data.ai_whatsapp_enabled ?? false) : false,
          ai_auto_appointments: isPro ? (data.ai_auto_appointments ?? false) : false,
          ai_auto_clients: isPro ? (data.ai_auto_clients ?? false) : false,
          ai_personality: data.ai_personality || 'amigable',
          ai_sector_prompt: data.ai_sector_prompt || '',
          ai_max_messages: data.ai_max_messages ?? 10
        });
      }
    }
    loadSettings();
  }, [organization?.id, isPro]);



  const handleSave = async () => {
    if (!organization?.id) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error: orgErr } = await supabase
        .from('organizations')
        .update({
          ai_personality: settings.ai_personality,
          ai_sector_prompt: settings.ai_sector_prompt,
          ai_enabled: settings.ai_whatsapp_enabled,
          ai_auto_appointments: settings.ai_auto_appointments,
          ai_auto_clients: settings.ai_auto_clients,
          ai_whatsapp_enabled: settings.ai_whatsapp_enabled,
          ai_max_messages: settings.ai_max_messages,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (orgErr) throw orgErr;

      toast.success("Configuración de IA actualizada");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] p-5 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-[#1B4FD8]" />
          <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">IA Autónoma</h3>
        </div>
        {!isPro && (
          <span className="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-bold rounded-full border border-amber-500/20">
            PREMIUM
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Funciones</label>
          <ToggleCard
            title="Citas automáticas"
            active={settings.ai_auto_appointments}
            onChange={(v) => setSettings({ ...settings, ai_auto_appointments: v })}
            disabled={!isPro}
            showLock={!isPro}
          />
          <ToggleCard
            title="Crear clientes CRM"
            active={settings.ai_auto_clients}
            onChange={(v) => setSettings({ ...settings, ai_auto_clients: v })}
            disabled={!isPro}
            showLock={!isPro}
          />
        </div>

        <div className={cn("space-y-3", !isPro && "opacity-50 pointer-events-none")}>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Personalidad</label>
            <div className="flex gap-2 p-1 bg-slate-50 dark:bg-[#111F3A] rounded-xl w-fit">
              {['amigable', 'profesional'].map(p => (
                <button
                  key={p} onClick={() => setSettings({ ...settings, ai_personality: p })}
                  className={cn("px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all capitalize", settings.ai_personality === p ? "bg-[#1B4FD8] text-white" : "text-slate-400")}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Descripción del negocio</label>
            <textarea
              value={settings.ai_sector_prompt} onChange={(e) => setSettings({ ...settings, ai_sector_prompt: e.target.value })}
              className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-100 dark:border-[#1E3A5F] rounded-xl p-3 text-sm min-h-[80px] outline-none"
              placeholder="Describe tu negocio..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-[#1E3A5F]">
          <button onClick={handleSave} disabled={saving || !isPro} className="w-full sm:w-auto px-6 py-2.5 bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold text-[14px] rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-tight">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar IA
          </button>
        </div>
      </div>
    </div>
  );
}

function SubscriptionSection({ organization, userId, user, onRefresh }: { organization: any, userId: string | null, user: any, onRefresh: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const trialEndsAt = organization?.trial_ends_at

  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil(
      (new Date(trialEndsAt).getTime() - Date.now())
      / (1000 * 60 * 60 * 24)
    ))
    : 0

  const handleCancelSubscription = async () => {
    if (!confirm('¿Estás seguro de que deseas cancelar tu suscripción? Seguirá activa hasta el final del periodo actual.')) return;

    setCancelling(true);
    try {
      const res = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: organization?.id })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        onRefresh();
      } else {
        toast.error(data.error || 'Error al cancelar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] p-5 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="w-5 h-5 text-[#1B4FD8]" />
        <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Suscripción</h3>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-[#111F3A] border border-slate-100 dark:border-[#1E3A5F] rounded-xl space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-500 fill-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[14px] font-bold text-[#0F172A] dark:text-[#F1F5F9]">Plan Empresarial</h4>
              <span className="px-2 py-0.5 rounded-full text-white text-[9px] font-black bg-indigo-600 uppercase">PRO</span>
            </div>
            {daysLeft > 0 ? (
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Trial: <span className="font-bold text-[#1B4FD8]">{daysLeft} días</span>
              </p>
            ) : (
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Activo</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {daysLeft > 0 ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 bg-[#1B4FD8] hover:bg-blue-700 text-white font-bold text-[12px] rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase"
            >
              Activar Suscripción
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="py-2 bg-white dark:bg-transparent border border-red-500/30 text-red-500 font-bold text-[11px] rounded-xl transition-all uppercase disabled:opacity-50"
              >
                {cancelling ? "..." : "Cancelar"}
              </button>
              <button
                onClick={() => toast.success("Cargando Stripe...")}
                className="py-2 bg-[#1B4FD8] text-white font-bold text-[11px] rounded-xl transition-all shadow-lg uppercase"
              >
                Facturas
              </button>
            </div>
          )}
        </div>
      </div>

      <UpgradeModalInternal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

function UpgradeModalInternal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { organization } = useOrganization()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO

      if (!priceId) {
        toast.error('Configuración de precio no encontrada')
        return
      }

      if (!organization?.id) {
        toast.error('Error: No se encontró el ID de la organización')
        return
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organization.id,
          priceId,
          userId: user.id
        })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Error al procesar el pago')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    "Clientes y agenda ilimitados",
    "Comunicaciones WhatsApp + Email",
    "IA responde por ti 24/7",
    "Finanzas y facturas",
    "Productos e inventario",
    "Estadísticas y métricas",
    "Equipo y fichajes",
    "SF IA en el panel"
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">Actualiza a SF Gestor Empresarial</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1E3A5F] rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                  <Zap className="w-3 h-3 text-blue-500 fill-blue-500" />
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">90 DÍAS GRATIS</span>
                </div>
                <h2 className="text-xl font-black text-[#0F172A] dark:text-[#F1F5F9] mb-2 uppercase tracking-tighter">PLAN SF Gestor Empresarial</h2>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">Todo lo que necesitas para crecer</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center mb-4 pb-4 border-b border-slate-100 dark:border-[#1E3A5F]/50">
                  <div className="text-center">
                    <p className="text-2xl font-black text-[#0F172A] dark:text-[#F1F5F9]">29€</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">por mes facturado</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 bg-blue-500/10 p-0.5 rounded-full">
                        <Check className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 tracking-tight leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 bg-[#1B4FD8] hover:bg-blue-700 text-white font-black text-[14px] uppercase transition-all flex items-center justify-center gap-3 disabled:opacity-50 rounded-2xl shadow-lg shadow-blue-500/20 italic"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    ACTIVAR PLAN SF Gestor Empresarial →
                  </>
                )}
              </button>
              <p className="text-center mt-3 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                Cancela en cualquier momento
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function ToggleCard({ title, subtitle, active, onChange, disabled, showLock, onDisabledClick }: { title: string, subtitle?: string, active: boolean, onChange: (v: boolean) => void, disabled?: boolean, showLock?: boolean, onDisabledClick?: () => void }) {
  const handleClick = () => {
    if (disabled) {
      onDisabledClick?.();
      return;
    }
    onChange(!active);
  };

  return (
    <div className={cn(
      "flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] transition-all",
      disabled && "opacity-80"
    )}>
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <h4 className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">{title}</h4>
          {showLock && <Lock className="w-3 h-3 text-amber-500" />}
        </div>
        {subtitle && <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{subtitle}</p>}
      </div>
      <button
        onClick={handleClick}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
          active ? "bg-[#1B4FD8]" : "bg-slate-300 dark:bg-[#1E3A5F]",
          disabled && "cursor-not-allowed"
        )}
      >
        <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition", active ? "translate-x-5" : "translate-x-0")} />
      </button>
    </div>
  );
}

function Field({ label, value, placeholder, onChange }: { label: string, value: string, placeholder?: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.08em] ml-1">{label}</label>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-lg py-3 px-4 text-[14px] text-[#0F172A] dark:text-[#F1F5F9] font-normal outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
      />
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ✅ app/dashboard/settings/page.tsx — fixes aplicados (v1.0.0 Beta & Appearance hidden)

function WhatsAppSection({ organization }: { organization: any }) {
  const orgName = organization?.name || 'empresa';
  const link = `https://wa.me/34651398878?text=Hola,%20soy%20${encodeURIComponent(orgName)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    toast.success("Enlace copiado");
  };

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] p-5 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="w-5 h-5 text-[#1B4FD8]" />
        <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">WhatsApp</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-2">
          <h4 className="text-[14px] font-bold text-[#0F172A] dark:text-[#F1F5F9]">Opción A — Mensaje de ausencia</h4>
          <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            Copia este enlace y ponlo en tu mensaje de ausencia de WhatsApp y en tus redes sociales. Tus clientes serán atendidos automáticamente.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              readOnly
              value={link}
              className="flex-1 bg-white dark:bg-[#0D1B35] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-lg py-2 px-3 text-[13px] text-[#0F172A] dark:text-[#F1F5F9] outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold text-[13px] rounded-lg transition-all whitespace-nowrap"
            >
              Copiar
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-2">
          <h4 className="text-[14px] font-bold text-[#0F172A] dark:text-[#F1F5F9]">Opción B — Tu número en Meta API</h4>
          <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            Registra tu número en Meta Business API. La IA responderá respetando la ventana de 24 horas desde el último mensaje del cliente.
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[14px] font-bold text-[#0F172A] dark:text-[#F1F5F9]">Opción C — Número dedicado</h4>
            <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Recomendado</span>
          </div>
          <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            Contrata una SIM nueva y regístrala en Meta Business API. Máxima profesionalidad sin mezclar con tu número personal.
          </p>
        </div>
      </div>
    </div>
  );
}
