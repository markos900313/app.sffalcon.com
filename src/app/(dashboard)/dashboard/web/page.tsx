"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Instagram,
  Facebook,
  MapPin,
  FileText,
  Save,
  Loader2,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import toast from "react-hot-toast";

export default function MiWebPage() {
  const supabase = createClient();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncWithAI, setSyncWithAI] = useState(false);

  const [formData, setFormData] = useState({
    web_url: "",
    instagram_url: "",
    facebook_url: "",
    google_maps_url: "",
    public_description: ""
  });

  useEffect(() => {
    fetchWebSettings();
  }, [organization]);
  const fetchWebSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !organization) return;

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('organization_id', organization?.id)
        .maybeSingle();

      if (data) {
        setFormData({
          web_url: data.web_url || "",
          instagram_url: data.instagram_url || "",
          facebook_url: data.facebook_url || "",
          google_maps_url: data.google_maps_url || "",
          public_description: data.public_description || ""
        });
        setSyncWithAI(data.sync_with_ai || false);
      }
    } catch (err: any) {
      console.warn("Posible falta de columnas o acceso en settings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay usuario autenticado");

      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: user.id, // Necesario para RLS
          organization_id: organization?.id,
          ...formData,
          sync_with_ai: syncWithAI,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id'
        });

      if (syncWithAI) {
        const aiPrompt = [
          formData.public_description,
          formData.web_url ? `Web: ${formData.web_url}` : '',
          formData.instagram_url ? `Instagram: ${formData.instagram_url}` : '',
          formData.facebook_url ? `Facebook: ${formData.facebook_url}` : '',
          formData.google_maps_url ? `Ubicación: ${formData.google_maps_url}` : ''
        ].filter(Boolean).join('\n');

        await supabase
          .from('organizations')
          .update({ ai_sector_prompt: aiPrompt })
          .eq('id', organization?.id);
      }

      if (error) throw error;
      toast.success("Configuración de la web guardada");
    } catch (err: any) {
      toast.error("Error al guardar: " + (err.message === "Forbidden" ? "Permiso denegado (¿Has ejecutado el SQL?)" : err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-full text-[var(--text-primary)] animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-[16px] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Mi Web</h1>
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-[0.2em] font-bold">
            Configura el enlace a tu página web o redes sociales. La IA lo compartirá con tus contactos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Conexión Segura</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-[32px] overflow-hidden shadow-sm"
      >
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          {/* Links Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] flex items-center gap-2">
                <Globe className="w-4 h-4" /> Presencia Online
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">URL WEB</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1B4FD8] transition-colors" />
                    <input
                      type="url"
                      placeholder="https://www.tuproyecto.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.web_url}
                      onChange={(e) => setFormData({ ...formData, web_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">INSTAGRAM</label>
                  <div className="relative group">
                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="@tuperfil"
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">FACEBOOK</label>
                  <div className="relative group">
                    <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      placeholder="facebook.com/tuperfil"
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Ubicación
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">GOOGLE MAPS</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Link de Google Maps"
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-red-500 transition-all"
                      value={formData.google_maps_url}
                      onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="p-6 rounded-[24px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 mt-4 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                    Asegúrate de que los enlaces sean públicos para que la IA pueda compartirlos con tus contactos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* AI Info Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] flex items-center gap-2">
              <FileText className="w-4 h-4" /> Información para la IA
            </h3>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">DESCRIPCIÓN PÚBLICA / SEMÁNTICA</label>
              <textarea
                rows={6}
                placeholder="Describe tu actividad, ambiente, especialidades... La IA usará este texto para informar a los contactos de forma natural."
                className="w-full p-6 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-[24px] text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none shadow-inner"
                value={formData.public_description}
                onChange={(e) => setFormData({ ...formData, public_description: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 italic">Ej: "Somos una entidad de servicios profesionales con enfoque en calidad y atención personalizada."</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border-card)]">
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                Usar esta información para la IA
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                La IA compartirá tu web, redes y descripción con tus clientes automáticamente
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSyncWithAI(!syncWithAI)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                syncWithAI ? 'bg-[#1B4FD8]' : 'bg-[#1E3A5F]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                  syncWithAI ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-10 py-4 bg-[#1B4FD8] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-3 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              GUARDAR CONFIGURACIÓN
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}


