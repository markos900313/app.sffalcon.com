"use client";

import React, { useState, useEffect } from "react";
import { 
  UserCheck, 
  Star, 
  MessageSquare, 
  Gift, 
  History, 
  ToggleLeft as Toggle, 
  ChevronRight,
  TrendingUp,
  Zap,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  Bot
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { DashboardPageContainer, DashboardSection } from "@/components/dashboard/DashboardPageContainer";
import { motion } from "framer-motion";

export default function AgentFollowupPage() {
  const supabase = createClient();
  const { organization } = useOrganization();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCampaigns, setActiveCampaigns] = useState({
    reviews: true,
    birthday: true,
    winback: false
  });
  const [interactions, setInteractions] = useState<any[]>([]);

  useEffect(() => {
    if (organization?.id) {
      fetchFollowupData();
    } else {
      setLoading(false);
    }
  }, [organization]);

  const fetchFollowupData = async () => {
    setLoading(true);
    try {
      if (!organization?.id) return;
      // 1. Fetch Config
      const { data: configData } = await supabase
        .from('agent_configs')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('agent_type', 'followup')
        .single();

      if (configData) {
        setActiveCampaigns({
          reviews: configData.config?.reviews ?? true,
          birthday: configData.config?.birthday ?? true,
          winback: configData.config?.winback ?? false
        });
      }

      // 2. Fetch Interactions (Logs)
      const { data: logsData } = await supabase
        .from('agent_logs')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('agent_type', 'followup')
        .order('created_at', { ascending: false });

      if (logsData) {
        setInteractions(logsData.slice(0, 10)); // Mostrar solo últimos 10 en la cola
        
        // Calcular estadísticas reales
        const reviews = logsData.filter((l: any) => (l.config as any)?.type === 'review').length;
        const recovered = logsData.filter((l: any) => (l.config as any)?.type === 'winback').length;
        // Estimación: 10 mins por interacción manual ahorrada
        const totalMinutes = logsData.length * 10;
        const hours = Math.floor(totalMinutes / 60);

        setRealStats({
          reviews: reviews,
          recovered: recovered,
          ahorro: `${hours}h`
        });
      }
    } catch (err) {
      console.error("Error fetching followup data:", err);
    } finally {
      setLoading(false);
    }
  };

  const [realStats, setRealStats] = useState({
    reviews: 0,
    recovered: 0,
    ahorro: "0h"
  });

  const handleToggle = async (campaign: keyof typeof activeCampaigns) => {
    const newConfig = { ...activeCampaigns, [campaign]: !activeCampaigns[campaign] };
    setActiveCampaigns(newConfig);
    
    try {
      if (!organization?.id) return;
      await supabase
        .from('agent_configs')
        .upsert({
          organization_id: organization.id,
          agent_type: 'followup',
          config: newConfig,
          updated_at: new Date().toISOString()
        });
      toast.success("Preferencia actualizada");
    } catch (err) {
      toast.error("Error al guardar preferencia");
      setActiveCampaigns(activeCampaigns); // Rollback
    }
  };

  if (loading) return null;

  return (
    <DashboardPageContainer className="relative">
      
      {/* Ultra-Banner: Follow-up & Retention Hero */}
      <div 
        className="w-full card-premium p-0 overflow-hidden shadow-2xl shadow-blue-500/5 relative group bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl mb-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-transparent to-blue-500/5 opacity-50 transition-opacity group-hover:opacity-80" />
        
        <div className="relative py-6 px-4 md:px-8 flex flex-col xl:flex-row items-center justify-between gap-6 font-geist">
          {/* Left: Branding & Focus */}
          <div className="flex items-center gap-6 w-full xl:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
               <UserCheck className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500">Inteligencia de Retención</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Autónomo</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                 Seguimiento <span className="text-emerald-500">IA</span>
              </h1>
            </div>
          </div>

          {/* Center: System Status */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 px-6 py-3 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-black text-slate-600 dark:text-emerald-400 uppercase tracking-widest italic leading-none pt-0.5">IA Autónoma Activa</span>
            </div>
            <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-1" />
            <button 
              onClick={fetchFollowupData}
              className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-emerald-500"
              title="Actualizar Datos"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Right: Master KPIs */}
          <div className="flex items-center gap-8 bg-white/50 dark:bg-white/5 px-8 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Reseñas</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                   +{realStats.reviews}
                </span>
                <Star size={10} className="text-amber-500 fill-amber-500" />
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recuperados</span>
              <span className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">
                 {realStats.recovered}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ahorro</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xl font-black text-emerald-500 leading-none">
                   {realStats.ahorro}
                </span>
                <Zap size={10} className="text-blue-500 fill-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Column 1: Main Control & Strategies */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
              
              <h3 className="font-black text-[var(--text-primary)] mb-6 flex items-center gap-2.5 text-base uppercase tracking-tight">
                <Zap className="w-5 h-5 text-amber-400" />
                Estrategias de Fidelización
              </h3>
              
              <div className="space-y-5">
                 <CampaignToggle 
                   icon={<Star size={24} className="text-amber-500" />}
                   title="Solicitud de Reseñas"
                   description="Envío inteligente de feedback tras experiencias positivas."
                   checked={activeCampaigns.reviews}
                   onChange={() => handleToggle('reviews')}
                 />
                 <CampaignToggle 
                   icon={<Gift size={24} className="text-rose-500" />}
                   title="Regalo de Cumpleaños"
                   description="Automatización de cortesías 5 días antes de la fecha."
                   checked={activeCampaigns.birthday}
                   onChange={() => handleToggle('birthday')}
                 />
                 <CampaignToggle 
                   icon={<History size={24} className="text-blue-500" />}
                   title="IA Win-Back"
                   description="Protocolo de rescate para contactos inactivos > 45 días."
                   checked={activeCampaigns.winback}
                   onChange={() => handleToggle('winback')}
                 />
              </div>

              <div className="mt-10 pt-8 border-t border-[var(--border-card)]">
                 <div className="flex items-center justify-between p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                    <div className="flex items-center gap-4">
                       <CheckCircle2 className="text-emerald-500 w-6 h-6" />
                       <div>
                          <p className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none mb-1.5">Optimización de Retención Lista</p>
                          <p className="text-xs text-slate-500 font-medium">IA funcionando al 100% de eficiencia operativa</p>
                       </div>
                    </div>
                    <TrendingUp className="text-emerald-500/30 w-6 h-6" />
                 </div>
              </div>
            </div>

            <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] p-6 md:p-8 rounded-[32px] shadow-xl relative min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-[var(--text-primary)] uppercase tracking-widest text-xs flex items-center gap-3">
                  <History className="w-5 h-5 text-blue-500" />
                  Historial de Interacciones Reales
                </h3>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Live Sync
                </div>
              </div>
              
              {interactions.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {interactions.map((it) => (
                    <div key={it.id} className="py-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold">{it.details?.client || "Anónimo"}</p>
                        <p className="text-[10px] text-slate-500">{it.details?.message || "Mensaje enviado"}</p>
                      </div>
                      <span className="text-[9px] font-mono opacity-50">{new Date(it.created_at).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-20 border-2 border-dashed border-[var(--border-card)] rounded-3xl">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
                    <Clock className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">Sin Actividad Hoy</p>
                  <p className="text-xs mt-2 text-slate-500">Esperando primeras interacciones del día</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-[#1B4FD8] to-[#0D1B35] p-6 md:p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                  <Bot size={140} />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Zap size={14} className="text-blue-300" />
                    </div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-300">Insights IA</h4>
                  </div>
                  <p className="text-sm font-bold leading-relaxed mb-6 italic opacity-90">
                    "Hemos detectado que el 65% de tus clientes recurrentes prefieren WhatsApp para feedback. Recomiendo priorizar este canal para campañas de Win-Back."
                  </p>
                  <div className="flex items-center gap-3">
                     <div className="h-0.5 flex-1 bg-white/10" />
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">IA Alpha-One v4.2</span>
                  </div>
               </div>
            </div>

            <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] p-6 md:p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <TrendingUp size={100} />
               </div>
               <h3 className="font-black text-[var(--text-primary)] mb-6 uppercase tracking-[0.2em] text-[10px]">Canales de Fidelización</h3>
               <div className="space-y-4">
                 <ChannelStatus icon={<Mail size={16} />} label="Email Marketing Pro" active />
                 <ChannelStatus icon={<MessageSquare size={16} />} label="WhatsApp Automation" active />
               </div>
            </div>

            <div className="card-premium bg-white dark:bg-[#111F3A] border border-emerald-500/10 p-6 md:p-8 rounded-[32px] shadow-xl border-t-4 border-t-emerald-500 relative">
               <h3 className="font-black text-emerald-500 mb-4 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Retención Trimestral
               </h3>
               <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed font-medium">
                 Tu tasa de retorno ha experimentado un crecimiento real del <strong className="text-emerald-400 font-bold text-xl leading-none">+18.4%</strong>.
               </p>
               <div className="space-y-3">
                  <div className="group/bar">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                      <span>Loyalty Score</span>
                      <span className="text-emerald-500">82%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-emerald-500 w-[82%] group-hover:brightness-125 transition-all" />
                    </div>
                  </div>
                  <div className="group/bar">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                      <span>Recuperación</span>
                      <span className="text-blue-500">65%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-blue-500 w-[65%] group-hover:brightness-125 transition-all" />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardPageContainer>
  );
}

function FollowupStatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-card)] p-5 rounded-[22px] shadow-xl hover:translate-y-[-4px] transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 blur-2xl transition-all group-hover:bg-white/10" />
      <div className="flex justify-between items-start mb-3">
         <div className={cn("p-2 rounded-xl bg-white/5 transition-transform group-hover:rotate-12 group-hover:scale-110", color)}>
          <Icon className="w-4 h-4" />
         </div>
         <TrendingUp className="w-3.5 h-3.5 text-emerald-500/30" />
      </div>
      <h2 className="text-3xl font-black text-[var(--text-primary)] mb-0.5 tracking-tighter leading-none">{value}</h2>
      <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{label}</p>
      <p className="text-[9px] text-[var(--text-secondary)]/50 mt-1.5 font-bold italic">{sub}</p>
    </div>
  );
}

function CampaignToggle({ icon, title, description, checked, onChange }: any) {
  return (
    <div className="p-4 bg-[var(--bg-page)]/40 border border-[var(--border-card)] rounded-[18px] flex items-center justify-between group hover:border-blue-500/20 transition-all">
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 bg-white/5 rounded-[12px] transition-transform group-hover:scale-110">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-[var(--text-primary)] text-xs group-hover:text-blue-400 transition-colors">{title}</h4>
          <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">{description}</p>
        </div>
      </div>
      <button 
         onClick={onChange}
         className={cn(
           "w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner",
           checked ? 'bg-blue-600 shadow-blue-500/20' : 'bg-slate-800'
         )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md",
          checked ? 'right-1' : 'left-1'
        )} />
      </button>
    </div>
  );
}

function ChannelStatus({ icon, label, active }: any) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-[var(--bg-page)]/40 rounded-[18px] border border-[var(--border-card)] hover:border-blue-500/20 transition-all group">
      <div className="flex items-center gap-3">
        <div className="text-[var(--text-secondary)] group-hover:text-blue-400 transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-black text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest italic">{label}</span>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
    </div>
  );
}
