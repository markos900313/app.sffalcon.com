"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Copy,
  RefreshCw,
  ShieldCheck,
  FileText,
  Code,
  Check,
  Globe,
  Webhook,
  Save,
  AlertCircle,
  X,
  Info,
  Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { cn } from "@/lib/utils";
import { DashboardPageContainer, DashboardSection } from "@/components/dashboard/DashboardPageContainer";
import { motion, AnimatePresence } from "framer-motion";

export default function ApiSettingsPage() {
  const supabase = createClient();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (organization?.id) {
      fetchApiConfig();
    } else {
      setLoading(false);
    }
  }, [organization]);

  async function fetchApiConfig() {
    if (!organization?.id) return;
    try {
      const { data, error } = await supabase
        .from('api_configs')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setApiKey(data[0].api_key);
        setWebhookUrl(data[0].webhook_url || "");
      } else {
        generateNewKey(false);
      }
    } catch (err) {
      console.error("Error fetching API config:", err);
    } finally {
      setLoading(false);
    }
  }

  const generateNewKey = (showToast = true) => {
    const newKey = `sf_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newKey);
    if (showToast) {
      toast.success("Nueva API Key generada localmente. Haz clic en Guardar.");
    }
  };

  const handleSave = async () => {
    if (!organization?.id) return;
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('api_configs')
        .select('id')
        .eq('organization_id', organization.id)
        .limit(1)
        .single();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const payload = {
        organization_id: organization.id,
        user_id: user.id,
        api_key: apiKey,
        webhook_url: webhookUrl,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      let error;
      if (existing) {
        ({ error } = await supabase
          .from('api_configs')
          .update(payload)
          .eq('id', existing.id));
      } else {
        ({ error } = await supabase
          .from('api_configs')
          .insert([payload]));
      }

      if (error) throw error;
      toast.success("Configuración guardada correctamente");
    } catch (err) {
      console.error("Error saving API config:", err);
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success("API Key copiada al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DashboardPageContainer>
      {/* Header */}
      <DashboardSection className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Key className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">API Pública & Integraciones</h1>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Conecta SF con tus propias herramientas, TPV o sitio web.</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Plan Ultra Activo</span>
          </div>
        </div>
      </DashboardSection>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-32">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-card)] p-8 rounded-2xl shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 text-lg">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  Tu Credencial de Acceso
                </h3>
                <button
                  onClick={() => generateNewKey(true)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerar Key
                </button>
              </div>

              <div className="relative group/key">
                <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover/key:bg-blue-500/10 transition-all rounded-xl" />
                <div className="relative bg-[var(--bg-page)] border border-[var(--border-card)] p-6 rounded-xl flex items-center justify-between gap-4 shadow-inner">
                  <span className="font-mono text-sm text-blue-500 dark:text-blue-300 break-all select-all">{apiKey || 'Generando...'}</span>
                  <button
                    onClick={handleCopy}
                    className={cn(
                      "p-3 rounded-lg transition-all flex-shrink-0",
                      copied ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-4 leading-relaxed flex items-start gap-2 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Seguridad Crítica:</strong> Nunca expongas esta API Key en el lado del cliente (frontend).
                  Implementa siempre tus llamadas desde un servidor seguro.
                </span>
              </p>
            </div>

            <div className="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-card)] p-8 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 text-lg">
                  <Webhook className="w-5 h-5 text-emerald-400" />
                  Webhooks (Notificaciones)
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">Endpoint de Destino (URL)</label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://tu-servidor.com/api/webhooks"
                      className="flex-1 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-[var(--text-primary)]"
                    />
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-card)]">
                      <Globe className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <WebhookItem event="activity.created" description="Entrada de registro IA." active />
                  <WebhookItem event="contact.notified" description="Tras campaña de comunicación." />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-card)] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-[var(--border-card)] flex items-center gap-2 text-[var(--text-primary)] font-bold">
                <Code className="w-4 h-4 text-indigo-400" />
                Ejemplo (Node.js)
              </div>
              <div className="bg-[var(--bg-page)] p-6 font-mono text-xs overflow-x-auto">
                <pre className="text-[var(--text-secondary)]">
                  {`const response = await fetch('https://api.soportefacil.com/v1/records', {
    headers: {
      'Authorization': 'Bearer ${apiKey || 'TU_API_KEY'}',
      'X-Org-ID': '${organization?.id || 'ID_DE_TU_ORG'}'
    }
  });`}
                </pre>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] p-6 md:p-8 rounded-2xl shadow-xl relative overflow-hidden group">
              <h3 className="font-bold text-[var(--text-primary)] mb-2 relative z-10">Integración Global</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 relative z-10">
                Sincroniza tus datos con cualquier sistema POS o automatiza procesos vía Zapier.
              </p>
              <div className="flex flex-wrap gap-2 relative z-10">
                <span className="px-2 py-1 bg-white/5 rounded-md text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] border border-[var(--border-card)]">REST</span>
                <span className="px-2 py-1 bg-white/5 rounded-md text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] border border-[var(--border-card)]">Webhooks</span>
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/20 p-6 md:p-8 rounded-2xl shadow-xl border-l-4 border-l-blue-500/50">
              <h4 className="font-bold text-blue-400 mb-2 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                ¿Necesitas Ayuda?
              </h4>
              <p className="text-[11px] text-slate-300 mb-4 leading-relaxed">
                Consulta nuestra guía técnica para una integración rápida y segura.
              </p>
              <button
                onClick={() => setShowGuide(true)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                Ver Guía de Inicio Rápido
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuide(false)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#111F3A] rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 md:px-6 py-4 md:py-5 border-b border-slate-100 dark:border-[#1E3A5F]">
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                  Guía de Inicio Rápido
                </h3>
                <button onClick={() => setShowGuide(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 md:p-6 space-y-5 max-h-[60vh] md:max-h-[65vh] overflow-y-auto scrollbar-hide">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Autenticación *</label>
                    <div className="w-full bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl px-4 py-3 text-sm min-h-[44px] flex items-center">
                      <p className="text-blue-500 font-bold truncate">
                        <span className="text-slate-500 mr-2 uppercase text-[10px] font-black">Bearer</span> sf_live_...
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Webhooks</label>
                    <div className="w-full bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl px-4 py-3 text-sm min-h-[44px] flex items-center">
                      <p className="text-slate-400 font-medium">Eventos Real-time</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Endpoints Principales</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl group hover:border-blue-500/20 transition-all cursor-default">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200/30 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-blue-600">GET</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">/v1/activity</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Listado de registros</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl group hover:border-blue-500/20 transition-all cursor-default">
                      <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-600/10 border border-green-200/30 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-green-600">POST</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">/v1/contacts</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Creación de perfiles</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-4 mt-4">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Implementa estas llamadas desde el <span className="text-blue-500 font-bold">servidor</span> para seguridad máxima. Nunca expongas tu API Key en el front-end.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 md:p-6 bg-slate-50 dark:bg-[#0D1B35] flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => setShowGuide(false)}
                  className="w-full sm:flex-1 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1E3A5F]/40 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowGuide(false)}
                  className="w-full sm:flex-1 px-4 py-3 bg-[#1B4FD8] hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  Confirmar Lectura
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardPageContainer>
  );
}

function WebhookItem({ event, description, active = false }: any) {
  return (
    <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl hover:border-blue-500/30 transition-all cursor-pointer group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-wider">{event}</span>
        <div className={cn(
          "px-2 py-0.5 rounded text-[8px] font-black uppercase",
          active ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-[var(--text-secondary)]"
        )}>
          {active ? 'Habilitado' : 'Deshabilitado'}
        </div>
      </div>
      <p className="text-[10px] text-[var(--text-secondary)] leading-tight">{description}</p>
    </div>
  );
}
