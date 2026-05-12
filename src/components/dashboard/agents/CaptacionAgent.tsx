'use client';

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AgentCard from './AgentCard';
import toast from 'react-hot-toast';

interface CaptacionAgentProps {
  onAddLog: (log: any) => void;
}

import { useOrganization } from '@/context/OrganizationContext';

export default function CaptacionAgent({ onAddLog }: CaptacionAgentProps) {
  const { organization } = useOrganization();
  const isBelleza = organization?.sector_config?.grupo?.startsWith('1_belleza');
  const supabase = createClient();
  const [isActive, setIsActive] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | undefined>(undefined);

  const runAgent = async () => {
    setIsRunning(true);
    onAddLog({ agent: 'Captación', action: 'Inicio', result: 'Analizando comunicaciones...' });

    try {
      // 1. Cargar comunicaciones pendientes
      const { data: comms, error } = await supabase
        .from('communications')
        .select('*, messages(*)')
        .eq('status', 'pending');

      if (error) throw error;

      if (!comms || comms.length === 0) {
        onAddLog({ agent: 'Captación', action: 'Finalizado', result: 'Sin mensajes pendientes.' });
        toast.success('No hay mensajes pendientes para analizar.');
        return;
      }

      onAddLog({ agent: 'Captación', action: 'Procesando', result: `Detectadas ${comms.length} conversaciones.` });

      for (const conv of comms) {
        const lastMsg = conv.messages?.at(-1)?.content;
        if (!lastMsg) continue;

        const response = await fetch('/api/ai-groq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            context: 'lead_scoring',
            message: lastMsg,
            contact: conv.contact_name,
            channel: conv.channel
          })
        });

        const { response: reply } = await response.json();

        try {
          const score = JSON.parse(reply);
          onAddLog({ 
            agent: 'Captación', 
            action: 'Cualificación de Contacto', 
            result: `${conv.contact_name}: ${score.score}/10 — ${score.motivo}` 
          });

          if (score.score >= 7) {
            onAddLog({ 
              agent: 'Captación', 
              action: 'Alerta', 
              result: `🔥 CONTACTO PRIORITARIO: ${conv.contact_name} — Marcar como urgente` 
            });
            
            await supabase
              .from('communications')
              .update({ status: 'urgent' })
              .eq('id', conv.id);
          }
        } catch (e) {
          onAddLog({ agent: 'Captación', action: 'Error', result: `Fallo al parsear respuesta para ${conv.contact_name}` });
        }
      }

      const now = new Date().toLocaleString();
      setLastRun(now);
      onAddLog({ agent: 'Captación', action: 'Completado', result: 'Análisis de captación finalizado con éxito.' });
      toast.success('Agente de Captación finalizado.');

    } catch (err) {
      console.error(err);
      onAddLog({ agent: 'Captación', action: 'Error Crítico', result: 'Fallo en la ejecución del agente.' });
      toast.error('Error al ejecutar Agente de Captación');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <AgentCard 
      icon={UserPlus}
      iconColor="#1B4FD8"
      title="Dinamizador de eventos"
      description="Atrae y fideliza a tu público objetivo a través de campañas inteligentes y segmentación avanzada."
      isActive={isActive}
      isRunning={isRunning}
      lastRun={lastRun}
      onToggle={() => setIsActive(!isActive)}
      onConfigure={() => toast.success('Configuración de Captación abierta')}
      onRun={runAgent}
    />
  );
}
