'use client';

import React from 'react';
import { LucideIcon, Settings, Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  isActive: boolean;
  isRunning: boolean;
  lastRun?: string;
  onToggle: () => void;
  onConfigure: () => void;
  onRun: () => void;
  badge?: string;
}

export default function AgentCard({
  icon: Icon,
  iconColor,
  title,
  description,
  isActive,
  isRunning,
  lastRun,
  onToggle,
  onConfigure,
  onRun,
  badge
}: AgentCardProps) {
  return (
    <div className="bg-white dark:bg-[#111F3A] rounded-[32px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm overflow-hidden p-6 md:p-8 flex flex-col h-full hover:shadow-md transition-all relative">
      {badge && (
        <div className="absolute top-4 right-8 bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-tighter z-10 animate-pulse">
          {badge}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center",
          isActive ? `bg-${iconColor}/10` : "bg-slate-100 dark:bg-slate-800"
        )}>
          <Icon className={cn("w-6 h-6", isActive ? `text-[${iconColor}]` : "text-slate-400")} style={{ color: isActive ? iconColor : undefined }} />
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={isActive}
            onChange={onToggle}
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B4FD8]"></div>
        </label>
      </div>

      <div className="flex-1">
        <h3 className="text-[18px] font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-8 space-y-4 pt-6 border-t border-slate-50 dark:border-[#1E3A5F]">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <span>Última ejecución</span>
          <span className="text-slate-500 dark:text-slate-300">{lastRun || 'Nunca'}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onConfigure}
            className="flex items-center justify-center gap-2 px-3 md:px-4 py-3 rounded-xl border border-slate-100 dark:border-[#1E3A5F] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-[10px] md:text-xs font-semibold uppercase tracking-widest"
          >
            <Settings className="w-3.5 h-3.5 md:w-4 md:h-4" /> Configurar
          </button>
          <button 
            onClick={onRun}
            disabled={!isActive || isRunning}
            className={cn(
              "flex items-center justify-center gap-2 px-3 md:px-4 py-3 rounded-xl text-white transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20",
              isActive && !isRunning ? "bg-[#1B4FD8] hover:bg-[#1642B5]" : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
            )}
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 md:w-4 md:h-4" />
            )}
            Exec. ahora
          </button>
        </div>
      </div>
    </div>
  );
}
