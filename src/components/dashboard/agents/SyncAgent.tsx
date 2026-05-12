'use client';

import React, { useState } from 'react';
import { Repeat, Globe, Instagram, Calendar, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import AgentCard from './AgentCard';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SyncAgentProps {
  onAddLog: (log: any) => void;
}

export default function SyncAgent({ onAddLog }: SyncAgentProps) {
  const [isActive, setIsActive] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentSync, setCurrentSync] = useState('');

  const syncSources = [
    { id: 'google', name: 'Google Calendar', icon: <Calendar size={14} />, color: 'text-blue-500' },
    { id: 'instagram', name: 'Instagram Business', icon: <Instagram size={14} />, color: 'text-pink-500' },
    { id: 'whatsapp', name: 'WhatsApp Cloud', icon: <Globe size={14} />, color: 'text-emerald-500' },
    { id: 'email', name: 'Gmail / Outlook', icon: <Mail size={14} />, color: 'text-amber-500' }
  ];

  const runSync = async () => {
    setIsRunning(true);
    setIsSyncing(true);
    onAddLog({ agent: 'Sync', action: 'Conexión', result: 'Iniciando sincronización multicanal...' });

    for (const source of syncSources) {
      setCurrentSync(source.name);
      onAddLog({ agent: 'Sync', action: 'Sincronizando', result: `Obteniendo datos de ${source.name}...` });
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    const now = new Date().toLocaleString();
    setLastRun(now);
    setIsSyncing(false);
    setIsRunning(false);
    onAddLog({ agent: 'Sync', action: 'Completado', result: 'Todos los canales sincronizados correctamente.' });
    toast.success('Sincronización finalizada con éxito');
  };

  return (
    <div className="space-y-6">
      <AgentCard 
        icon={Repeat}
        iconColor="#6366F1"
        title="Recepcionista 24/7"
        description="Gestiona tus canales de entrada (WhatsApp, Instagram, Email) para que nunca pierdas una consulta o reserva."
        isActive={isActive}
        isRunning={isRunning}
        lastRun={lastRun}
        onToggle={() => setIsActive(!isActive)}
        onConfigure={() => toast.success('Configuración de Sync abierta')}
        onRun={runSync}
      />

      <AnimatePresence>
        {isSyncing && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-[#111F3A] rounded-[32px] border border-[#E2E8F0] dark:border-[#1E3A5F] p-8 space-y-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Estado de Sincronización</h4>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full">
                <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">En curso</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {syncSources.map((source) => {
                const isCurrent = currentSync === source.name;
                const isPast = !isCurrent && syncSources.indexOf(source) < syncSources.findIndex(s => s.name === currentSync);
                const isPending = !isCurrent && !isPast;

                return (
                  <div 
                    key={source.id} 
                    className={cn(
                      "p-4 rounded-2xl border transition-all duration-500 flex items-center justify-between",
                      isCurrent ? "bg-blue-500/5 border-blue-500/20 scale-[1.02]" : 
                      isPast ? "bg-emerald-500/5 border-emerald-500/10 opacity-60" :
                      "bg-slate-50 dark:bg-white/5 border-transparent opacity-40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm", source.color)}>
                        {source.icon}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white">{source.name}</p>
                        <p className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">
                          {isCurrent ? 'Actualizando...' : isPast ? 'Sincronizado' : 'Pendiente'}
                        </p>
                      </div>
                    </div>
                    {isPast && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {isCurrent && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-[#1E3A5F]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progreso Global</span>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                  {Math.round((syncSources.findIndex(s => s.name === currentSync) / syncSources.length) * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(syncSources.findIndex(s => s.name === currentSync) / syncSources.length) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
