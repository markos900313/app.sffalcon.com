"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Settings,
  Calendar,
  MessageSquare,
  Zap,
  Activity,
  ShieldCheck,
  Clock,
  Play,
  Pause,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  BrainCircuit,
  ChevronDown,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";

export default function AgentReservationsPage() {
  const supabase = createClient();
  const { organization } = useOrganization();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const [config, setConfig] = useState({
    greeting: "¡Hola! Soy el asistente de SF. ¿En qué puedo ayudarte con tu agenda?",
    autoConfirm: true,
    detectConflicts: true,
    tone: "profesional"
  });
  const [whatsappInfo, setWhatsappInfo] = useState({
    enabled: false,
    number: ""
  });
  const [todayReservations, setTodayReservations] = useState(0);
  const [serviceLevel, setServiceLevel] = useState("100%");
  const [hoursSaved, setHoursSaved] = useState("0");

  useEffect(() => {
    if (organization?.id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [organization]);

  const fetchData = async () => {
    if (!organization?.id) return;
    setLoading(true);
    try {
      const { data: configData } = await supabase
        .from('agent_configs')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('agent_type', 'reservations')
        .single();

      if (configData) {
        setIsActive(configData.status === 'active');
        setConfig({
          greeting: configData.greeting || configData.config?.greeting || config.greeting,
          autoConfirm: configData.auto_confirm ?? configData.config?.autoConfirm ?? config.autoConfirm,
          detectConflicts: configData.detect_conflicts ?? configData.config?.detectConflicts ?? config.detectConflicts,
          tone: configData.tone || configData.config?.tone || config.tone
        });
      }

      const { data: orgData } = await supabase
        .from('organizations')
        .select('ai_whatsapp_enabled, whatsapp_number')
        .eq('id', organization.id)
        .single();

      if (orgData) {
        setWhatsappInfo({
          enabled: orgData.ai_whatsapp_enabled,
          number: orgData.whatsapp_number || ""
        });
      }

      const today = new Date().toISOString().split('T')[0];
      const { count: resCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('date', today);

      setTodayReservations(resCount || 0);

      const { data: logsData } = await supabase
        .from('agent_logs')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('agent_type', 'reservations')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsData) {
        setLogs(logsData.slice(0, 10));
        const total = logsData.length;
        if (total > 0) {
          const success = logsData.filter((l: any) => l.status === 'success').length;
          setServiceLevel(`${((success / total) * 100).toFixed(1)}%`);
          setHoursSaved(((total * 5) / 60).toFixed(1));
        }
      }
    } catch (err) {
      console.error("Error fetching agent data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAgent = async () => {
    if (!organization?.id) return;
    const newStatus = !isActive;
    setIsActive(newStatus);

    try {
      await supabase
        .from('agent_configs')
        .upsert({
          organization_id: organization?.id,
          agent_type: 'reservations',
          status: newStatus ? 'active' : 'paused',
          updated_at: new Date().toISOString()
        }, { onConflict: 'organization_id,agent_type' });

      toast.success(newStatus ? "Agente Activado" : "Agente Pausado");
    } catch (err) {
      toast.error("Error al actualizar estado");
      setIsActive(!newStatus);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('agent_configs')
        .upsert({
          organization_id: organization?.id,
          agent_type: 'reservations',
          greeting: config.greeting,
          tone: config.tone,
          auto_confirm: config.autoConfirm,
          detect_conflicts: config.detect_conflicts,
          config: config,
          updated_at: new Date().toISOString()
        }, { onConflict: 'organization_id,agent_type' });

      if (error) throw error;
      toast.success("Configuración guardada correctamente");
    } catch (err) {
      console.error("Error saving config:", err);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-full text-[var(--text-primary)] pb-32">
      {/* Standardized Header - No animations, instant loading */}
      <div className="bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-[16px] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0",
            isActive ? "bg-gradient-to-br from-[#1B4FD8] to-[#0891B2] shadow-blue-500/20" : "bg-slate-200 dark:bg-slate-800"
          )}>
            <BrainCircuit className={cn("w-8 h-8", isActive ? "text-white" : "text-slate-400")} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1B4FD8]">Gestor de Agenda IA</span>
              {whatsappInfo.number && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                  WS: {whatsappInfo.number}
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
               Gestor de <span className="text-[#1B4FD8]">Agenda</span>
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleToggleAgent}
            className={cn(
              "px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2.5 transition-all shadow-lg",
              isActive 
                ? "bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20" 
                : "bg-[#1B4FD8] text-white hover:bg-blue-700 shadow-blue-500/20"
            )}
          >
            {isActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            {isActive ? "Pausar Operaciones" : "Activar Gestor de Agenda"}
          </button>
          
          <div className="h-10 w-px bg-slate-100 dark:bg-[#1E3A5F] mx-2 hidden lg:block" />
          
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estado:</span>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  isActive ? "text-emerald-500" : "text-amber-500"
                )}>
                  {isActive ? "Disponible" : "En Pausa"}
                </span>
             </div>
             <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
               {isActive ? "En funcionamiento" : "Sistema Inactivo"}
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AIPerfCard title="AGENDA HOY" value={todayReservations} icon={<Zap className="text-amber-500" size={18} />} />
            <AIPerfCard title="NIVEL DE SERVICIO" value={serviceLevel} icon={<ShieldCheck className="text-emerald-500" size={18} />} />
            <AIPerfCard title="HORAS AHORRADAS" value={hoursSaved} icon={<Clock className="text-blue-500" size={18} />} />
          </div>

          <div className="card-premium p-6 md:p-8 bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50 dark:border-[#1E3A5F]">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">Registro de Operaciones</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actividad en tiempo real sincronizada con Supabase</p>
              </div>
              <button onClick={fetchData} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1B35] border border-slate-100 dark:border-[#1E3A5F] text-slate-400 hover:text-[#1B4FD8] transition-all active:scale-95 shadow-sm">
                <RefreshCw size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {logs.length > 0 ? logs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-[#0D1B35] hover:bg-slate-100 dark:hover:bg-[#0D1B35]/80 rounded-[24px] group transition-all border border-slate-100 dark:border-[#1E3A5F] hover:border-[#1B4FD8]/40">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border",
                      log.status === 'success' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    )}>
                      {log.action_type === 'reserva' ? <Calendar size={22} /> : <MessageSquare size={22} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{log.details?.client || "Sistema"}</p>
                        <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#111F3A] text-blue-500 dark:text-blue-400 uppercase tracking-widest border border-slate-200 dark:border-[#1E3A5F]">{log.action_type}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">{log.details?.message || "Operación automatizada"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 justify-end">
                      <CheckCircle2 size={12} />
                      Finalizado
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-12 flex flex-col items-center justify-center opacity-40">
                  <Activity size={40} className="mb-4 text-slate-600" />
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sin actividad reciente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 card-premium p-6 md:p-8 h-fit space-y-5 bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-sm rounded-3xl">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 flex items-center gap-3 uppercase tracking-tight">
              <Settings className="w-5 h-5 text-[#1B4FD8]" />
              Configuración
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entrenamiento y Comportamiento</p>
          </div>

          <div className="space-y-6">
            <div className="group space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saludo Personalizado</label>
                <span className="text-[9px] font-bold text-blue-500/80 uppercase">IA Entrenada</span>
              </div>
              <textarea
                className="w-full px-5 py-4 bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#1B4FD8] focus:border-transparent outline-none transition-all resize-none h-24 scrollbar-hide text-slate-900 dark:text-white shadow-inner"
                value={config.greeting}
                onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <ConfigToggle
                icon={<CheckCircle2 className="text-blue-500" size={18} />}
                label="Auto-confirmación"
                checked={config.autoConfirm}
                onChange={() => setConfig({ ...config, autoConfirm: !config.autoConfirm })}
              />
              <ConfigToggle
                icon={<BrainCircuit className="text-blue-500" size={18} />}
                label="Detección de Conflictos"
                checked={config.detectConflicts}
                onChange={() => setConfig({ ...config, detectConflicts: !config.detectConflicts })}
              />

              <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-2xl group hover:border-[#1B4FD8]/40 transition-all">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-[#1B4FD8]" size={18} />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Perfil IA</span>
                </div>
                <div className="relative">
                  <select
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-[#1B4FD8] border-none focus:ring-0 cursor-pointer appearance-none pr-6 [&>option]:bg-[#111F3A] text-slate-900 dark:text-white"
                    value={config.tone}
                    onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                  >
                    <option value="profesional">PROFESIONAL</option>
                    <option value="cercano">CERCANO</option>
                    <option value="informal">INFORMAL</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-[#1B4FD8] pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="w-full bg-[#1B4FD8] hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-[24px] transition-all shadow-xl shadow-blue-500/25 text-xs uppercase tracking-[2px] flex items-center justify-center gap-3 active:scale-95"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <SaveIcon size={16} />}
              {saving ? "Guardando..." : "Sincronizar IA"}
            </button>

            <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex gap-3">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-1" />
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                El cambio de configuración reinicia la memoria de contexto de las conversaciones activas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveIcon({ size }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function AIPerfCard({ title, value, icon }: any) {
  return (
    <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] p-6 md:p-8 flex flex-col justify-between group shadow-sm relative overflow-hidden rounded-3xl">
      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all" />
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-slate-200 dark:border-[#1E3A5F] flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110">
          {icon}
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-500 opacity-30" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{value}</h3>
      </div>
    </div>
  );
}

function ConfigToggle({ icon, label, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-2xl group hover:border-[#1B4FD8]/40 transition-all">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
      </label>
    </div>
  );
}
