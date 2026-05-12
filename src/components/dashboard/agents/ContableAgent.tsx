'use client';

import React, { useState } from 'react';
import { Calculator, FileText, Copy, Download, Loader2 } from 'lucide-react';
import AgentCard from './AgentCard';
import toast from 'react-hot-toast';

interface ContableAgentProps {
  onAddLog: (log: any) => void;
  hogarContext: any;
  negocioContext: any;
}

import { useOrganization } from '@/context/OrganizationContext';

export default function ContableAgent({ onAddLog, hogarContext, negocioContext }: ContableAgentProps) {
  const { organization } = useOrganization();
  const isBelleza = organization?.sector_config?.grupo?.startsWith('1_belleza');
  const [isActive, setIsActive] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | undefined>(undefined);
  const [summary, setSummary] = useState('');

  const runAgent = async () => {
    setIsRunning(true);
    setSummary('');
    onAddLog({ agent: 'Contable', action: 'Inicio', result: 'Analizando datos financieros y normativa fiscal...' });

    try {
      const response = await fetch('/api/ai-groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: 'accounting',
          financeData: hogarContext,
          businessData: negocioContext
        })
      });

      const { reply } = await response.json();
      setSummary(reply);
      setLastRun(new Date().toLocaleString());
      onAddLog({ agent: 'Contable', action: 'Finalizado', result: 'Resumen contable generado con éxito.' });
      toast.success('Agente Contable finalizado.');

    } catch (err) {
      console.error(err);
      onAddLog({ agent: 'Contable', action: 'Error', result: 'Fallo al generar informe contable.' });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <AgentCard 
        icon={Calculator}
        iconColor="#10B981"
        title="Agente de Fidelización"
        description="Analiza la recurrencia de tus clientes y sugiere campañas de fidelización, bonos y promociones para aumentar el valor de vida del cliente."
        isActive={isActive}
        isRunning={isRunning}
        lastRun={lastRun}
        onToggle={() => setIsActive(!isActive)}
        onConfigure={() => toast.success('Configuración de Contable abierta')}
        onRun={runAgent}
      />

      {summary && (
        <div className="bg-white dark:bg-[#111F3A] rounded-[32px] border border-[#E2E8F0] dark:border-[#1E3A5F] p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Informe Mensual de Gestoría</h4>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(summary);
                  toast.success('Informe copiado');
                }}
                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                title="Copiar informe"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button 
                onClick={() => toast.success('Descarga de PDF iniciada (Demo)')}
                className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                title="Descargar PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-[#1E3A5F]">
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {summary}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
