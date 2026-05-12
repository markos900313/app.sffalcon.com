'use client';

import React, { useState } from 'react';
import { Bell, Copy, Check, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AgentCard from './AgentCard';
import toast from 'react-hot-toast';

interface SeguimientoAgentProps {
  onAddLog: (log: any) => void;
}

import { useOrganization } from '@/context/OrganizationContext';

export default function SeguimientoAgent({ onAddLog }: SeguimientoAgentProps) {
  const { organization } = useOrganization();
  const isBelleza = organization?.sector_config?.grupo?.startsWith('1_belleza');
  const supabase = createClient();
  const [isActive, setIsActive] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const runAgent = async () => {
    setIsRunning(true);
    setSuggestions([]);
    onAddLog({ agent: 'Seguimiento', action: 'Inicio', result: 'Buscando clientes inactivos...' });

    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .in('status', ['lead', 'potencial'])
        .lt('last_contact', sevenDaysAgo);

      if (error) throw error;

      if (!clients || clients.length === 0) {
        onAddLog({ agent: 'Seguimiento', action: 'Finalizado', result: 'Sin clientes inactivos destacados.' });
        toast.success('No hay clientes inactivos para seguimiento.');
        return;
      }

      onAddLog({ agent: 'Seguimiento', action: 'Procesando', result: `Detectados ${clients.length} clientes sin contacto.` });

      for (const client of clients) {
        const days = Math.floor((Date.now() - new Date(client.last_contact).getTime()) / (1000 * 60 * 60 * 24));

        const response = await fetch('/api/ai-groq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            context: 'follow_up',
            client: {
              name: client.name,
              company: client.company,
              category: client.category,
              notes: client.notes,
              days
            }
          })
        });

        const { reply } = await response.json();

        setSuggestions(prev => [...prev, {
          client,
          message: reply,
          days
        }]);

        onAddLog({ agent: 'Seguimiento', action: 'Sugerencia', result: `Mensaje generado para ${client.name} (${days} días)` });
      }

      setLastRun(new Date().toLocaleString());
      toast.success('Agente de Seguimiento finalizado.');

    } catch (err) {
      console.error(err);
      onAddLog({ agent: 'Seguimiento', action: 'Error', result: 'Fallo en la ejecución del agente.' });
    } finally {
      setIsRunning(false);
    }
  };

  const markContacted = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ last_contact: new Date().toISOString() })
        .eq('id', clientId);

      if (error) throw error;
      setSuggestions(prev => prev.filter(s => s.client.id !== clientId));
      toast.success('Cliente marcado como contactado');
    } catch (err) {
      toast.error('Error al actualizar cliente');
    }
  };

  return (
    <div className="space-y-6">
      <AgentCard
        icon={Bell}
        iconColor="#F59E0B"
        title="Gestor Empresarial"
        description="Automatiza el seguimiento de preventa y posventa, asegurando que cada cliente reciba la atención que merece."
        isActive={isActive}
        isRunning={isRunning}
        lastRun={lastRun}
        onToggle={() => setIsActive(!isActive)}
        onConfigure={() => toast.success('Configuración de Seguimiento abierta')}
        onRun={runAgent}
      />

      {suggestions.length > 0 && (
        <div className="bg-white dark:bg-[#111F3A] rounded-[32px] border border-[#E2E8F0] dark:border-[#1E3A5F] p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Sugerencias del Agente</h4>
          <div className="grid grid-cols-1 gap-4">
            {suggestions.map((s, idx) => (
              <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-[#1E3A5F]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{s.client.name}</p>
                    <p className="text-xs text-slate-500">{s.days} días sin contacto · {s.client.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(s.message);
                        toast.success('Mensaje copiado');
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Copiar mensaje"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => markContacted(s.client.id)}
                      className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                      title="Marcar como contactado"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{s.message}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
