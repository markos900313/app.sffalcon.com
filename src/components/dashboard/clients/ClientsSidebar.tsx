'use client';

import React from 'react';
import { Users, UserPlus, TrendingUp, PieChart, Clock, Euro, Target, ChevronRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientsSidebarProps {
  stats: {
    total: number;
    activos: number;
    leads: number;
    pipeline: string;
    cartera: string;
  };
  distribution: { category: string; count: number }[];
  lastAdded: any[];
  grupo?: number;
}

const STATUS_COLORS: Record<string, string> = {
  lead: 'bg-blue-500',
  potencial: 'bg-amber-500',
  activo: 'bg-emerald-500',
  inactivo: 'bg-slate-400'
};

const STATUS_LABELS: Record<string, string> = {
  lead: 'CONTACTO',
  potencial: 'POTENCIAL',
  activo: 'ACTIVO',
  inactivo: 'INACTIVO'
};

const STATUS_BG: Record<string, string> = {
  lead: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  potencial: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  activo: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  inactivo: 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400'
};

export default function ClientsSidebar({ stats, distribution, lastAdded, grupo = 5 }: ClientsSidebarProps) {
  const fmt = (v: string) => Number(v).toLocaleString('es-ES') + '€';
  const filteredDist = grupo === 1 
    ? distribution.filter(d => !['lead', 'potencial'].includes(d.category.toLowerCase()))
    : distribution;

  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      {/* Rendimiento General */}
      <div className="card-premium p-6 border-t-4 border-t-[#1B4FD8] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <TrendingUp size={14} className="text-[#1B4FD8]" />
            Rendimiento CRM
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[9px] font-bold text-[#1B4FD8] animate-pulse">
            LIVE
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatBox label="Contactos" value={stats.leads.toString()} icon={<Target size={16} />} color="blue" />
          <StatBox label="Activos" value={stats.activos.toString()} icon={<Target size={16} />} color="emerald" />
        </div>

        <div className="space-y-3">
          {grupo !== 1 && (
            <ValueCard 
              label="Proyección Pipeline" 
              value={fmt(stats.pipeline)} 
              icon={<TrendingUp size={18} />} 
              theme="blue"
            />
          )}
          <ValueCard 
            label="Recurrencia Cartera" 
            value={fmt(stats.cartera)} 
            icon={<Euro size={18} />} 
            theme="emerald"
          />
        </div>
      </div>

      {/* Salud del Listado */}
      <div className="card-premium p-6 shadow-sm border-t-4 border-t-slate-100 dark:border-t-slate-800">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
          <PieChart size={14} />
          Salud del Listado
        </h3>
        
        <div className="space-y-5">
          {filteredDist.map((item, idx) => {
             const key = item.category.toLowerCase();
             const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
             return (
               <div key={idx} className="group">
                 <div className="flex items-center justify-between text-[10px] mb-2">
                   <span className="font-bold text-slate-500 dark:text-slate-400 uppercase group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                     {STATUS_LABELS[key] || item.category}
                   </span>
                   <span className="font-black text-slate-900 dark:text-white">{item.count}</span>
                 </div>
                 <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className={cn("h-full rounded-full transition-all duration-1000 ease-out", STATUS_COLORS[key] || 'bg-slate-400')} 
                     style={{ width: `${percentage}%` }}
                   />
                 </div>
               </div>
             )
          })}
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="card-premium p-6 shadow-sm">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
          <Clock size={14} />
          Recién llegados
        </h3>
        
        <div className="space-y-4">
          {lastAdded.length > 0 ? (
            lastAdded.map((client, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-white/10">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black shadow-sm group-hover:scale-110 transition-transform",
                  STATUS_BG[client.status] || STATUS_BG.lead
                )}>
                  {client.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                    {client.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      STATUS_COLORS[client.status] || 'bg-blue-500'
                    )} />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(client.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </div>
            ))
          ) : (
            <div className="py-8 text-center bg-slate-50/50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-100 dark:border-white/5">
              <UserPlus size={24} className="mx-auto text-slate-200 mb-2" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">Sin registros recientes</p>
            </div>
          )}
        </div>

        <button className="w-full mt-6 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-[11px] font-black text-slate-500 hover:text-[#1B4FD8] hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
          Ver reporte completo
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: 'blue' | 'emerald' }) {
  const themes = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100/50 dark:border-blue-500/20',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-500/20'
  };

  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all hover:shadow-md group",
      themes[color]
    )}>
      <div className="flex items-center justify-between mb-3 text-current opacity-70">
        {icon}
        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-[9px] font-black uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-black tabular-nums tracking-tighter">{value}</p>
    </div>
  );
}

function ValueCard({ label, value, icon, theme }: { label: string; value: string; icon: React.ReactNode; theme: 'blue' | 'emerald' }) {
  const themes = {
    blue: 'bg-blue-50/30 dark:bg-blue-500/5 border-blue-100/30 dark:border-blue-500/10 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-100/30 dark:border-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.02]",
      themes[theme]
    )}>
      <div>
        <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-lg font-black tabular-nums">{value}</p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-inherit">
        {icon}
      </div>
    </div>
  );
}

