'use client';

import React, { useState, useEffect } from 'react';
import { Bot, History } from "lucide-react";
import { DashboardPageContainer, DashboardSection } from "@/components/dashboard/DashboardPageContainer";
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { buildFinanceContext, buildBusinessContext } from '@/lib/financeContext';
import CaptacionAgent from '@/components/dashboard/agents/CaptacionAgent';
import SeguimientoAgent from '@/components/dashboard/agents/SeguimientoAgent';
import ContableAgent from '@/components/dashboard/agents/ContableAgent';
import VoiceAgent from '@/components/dashboard/agents/VoiceAgent';
import SyncAgent from '@/components/dashboard/agents/SyncAgent';
import { useOrganization } from '@/context/OrganizationContext';

interface AgentLog {
  date: string;
  agent: string;
  action: string;
  result: string;
}

export default function AgentsPage() {
  const supabase = createClient();
  const { organization } = useOrganization();
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [financeData, setFinanceData] = useState<any>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const tipoEmpresa = organization?.sector_config?.tipo === 'empresa';
  const [loading, setLoading] = useState(true);

  // Cargar logs de localStorage al iniciar
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const savedLogs = localStorage.getItem('asistente_agents_log');
      if (savedLogs) {
        try {
          setLogs(JSON.parse(savedLogs));
        } catch (e) {
          console.error('Error cargando logs');
        }
      }
      await loadFinancialContext();
      setLoading(false);
    };
    init();
  }, []);

  const loadFinancialContext = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [hogar, negocio] = await Promise.all([
      supabase.from('finance_entries').select('*').eq('user_id', user.id).eq('year', 2026),
      supabase.from('business_entries').select('*').eq('user_id', user.id).eq('year', 2026)
    ]);

    const currentMonth = new Date().getMonth();
    const currentYear = 2026;

    if (hogar.data) setFinanceData(buildFinanceContext(hogar.data, currentMonth, currentYear));
    if (negocio.data) setBusinessData(buildBusinessContext(negocio.data, currentMonth, currentYear));
  };

  const addLog = (entry: Omit<AgentLog, 'date'>) => {
    const newEntry = {
      ...entry,
      date: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    
    setLogs(prev => {
      const updated = [newEntry, ...prev].slice(0, 20); // Guardar últimas 20
      localStorage.setItem('asistente_agents_log', JSON.stringify(updated));
      return updated;
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
    </div>
  );

  return (
    <DashboardPageContainer>
      
      <div className="card-premium px-4 md:px-8 py-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-[#1B4FD8]" />
            Agentes Inteligentes
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 font-medium">
            Tus asistentes especializados trabajando 24/7 para tu proyecto
          </p>
        </div>
      </div>

      {/* Grid de Agentes */}
      <div className={cn(
        "grid gap-6 transition-all duration-500 mb-6",
        tipoEmpresa 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" 
          : "grid-cols-1 md:grid-cols-3"
      )}>
        <SyncAgent onAddLog={(l) => addLog(l)} />
        <CaptacionAgent onAddLog={(l) => addLog(l)} />
        <SeguimientoAgent onAddLog={(l) => addLog(l)} />
        <ContableAgent 
          onAddLog={(l) => addLog(l)} 
          hogarContext={financeData}
          negocioContext={businessData}
        />
        {tipoEmpresa && <VoiceAgent onAddLog={(l) => addLog(l)} />}
      </div>

      {/* Historial de Actividad Layout mejorado */}
      <div className="mb-6">
        <div className="bg-white dark:bg-[#111F3A] rounded-[24px] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 md:px-8 py-6 border-b border-slate-50 dark:border-[#1E3A5F] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-slate-400" />
              <h3 className="text-[12px] md:text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Historial de Ejecución</h3>
            </div>
            <button 
              onClick={() => {
                setLogs([]);
                localStorage.removeItem('asistente_agents_log');
              }}
              className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              Limpiar Historial
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-[#1E3A5F]">
                  <th className="px-4 md:px-8 py-4">Hora</th>
                  <th className="px-4 md:px-8 py-4">Agente</th>
                  <th className="px-8 py-4 hidden md:table-cell">Acción</th>
                  <th className="px-4 md:px-8 py-4">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-sm text-slate-400 italic">
                      No hay actividad reciente registrada.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 md:px-8 py-4 text-[11px] md:text-xs font-medium text-slate-500 tabular-nums">{log.date}</td>
                      <td className="px-4 md:px-8 py-4 text-center md:text-left">
                        <span className={cn(
                          "px-1.5 py-0.5 md:px-2 md:py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider",
                          log.agent === 'Captación' ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10" :
                          log.agent === 'Seguimiento' ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10" :
                          "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                        )}>
                          {log.agent}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-xs font-semibold text-slate-700 dark:text-slate-200 hidden md:table-cell">{log.action}</td>
                      <td className="px-4 md:px-8 py-4 text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-medium italic truncate max-w-[150px] md:max-w-xs">{log.result}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardPageContainer>
  );
}
