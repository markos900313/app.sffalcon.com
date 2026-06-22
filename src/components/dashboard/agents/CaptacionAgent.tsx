'use client';

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AgentCard from './AgentCard';
import toast from 'react-hot-toast';
import { useOrganization } from '@/context/OrganizationContext';
import { useLanguage } from '@/lib/LanguageContext';

interface CaptacionAgentProps {
  onAddLog: (log: any) => void;
}

export default function CaptacionAgent({ onAddLog }: CaptacionAgentProps) {
  const { organization } = useOrganization();
  const { t } = useLanguage();
  const isBelleza = organization?.sector_config?.grupo?.startsWith('1_belleza');
  const supabase = createClient();
  const [isActive, setIsActive] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | undefined>(undefined);

  const runAgent = async () => {
    setIsRunning(true);
    onAddLog({ 
      agent: t('sidebar.leads'), 
      action: t('aiAgents.cards.logActionStart'), 
      result: t('aiAgents.cards.leads.logStart') 
    });

    try {
      // 1. Cargar comunicaciones pendientes
      const { data: comms, error } = await supabase
        .from('communications')
        .select('*, messages(*)')
        .eq('status', 'pending');

      if (error) throw error;

      if (!comms || comms.length === 0) {
        onAddLog({ 
          agent: t('sidebar.leads'), 
          action: t('aiAgents.cards.logActionFinished'), 
          result: t('aiAgents.cards.leads.logFinished') 
        });
        toast.success(t('aiAgents.cards.leads.toastNoMessages'));
        return;
      }

      onAddLog({ 
        agent: t('sidebar.leads'), 
        action: t('aiAgents.cards.logActionProcessing'), 
        result: t('aiAgents.cards.leads.logProcessing').replace('{count}', String(comms.length)) 
      });

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
            agent: t('sidebar.leads'), 
            action: t('aiAgents.cards.logActionQualification'), 
            result: t('aiAgents.cards.leads.logQualifying')
              .replace('{name}', conv.contact_name)
              .replace('{score}', String(score.score))
              .replace('{reason}', score.motivo || score.reason || '')
          });

          if (score.score >= 7) {
            onAddLog({ 
              agent: t('sidebar.leads'), 
              action: t('aiAgents.cards.logActionAlert'), 
              result: t('aiAgents.cards.leads.logAlert').replace('{name}', conv.contact_name) 
            });
            
            await supabase
              .from('communications')
              .update({ status: 'urgent' })
              .eq('id', conv.id);
          }
        } catch (e) {
          onAddLog({ 
            agent: t('sidebar.leads'), 
            action: t('aiAgents.cards.logActionError'), 
            result: t('aiAgents.cards.leads.logError').replace('{name}', conv.contact_name) 
          });
        }
      }

      const now = new Date().toLocaleString();
      setLastRun(now);
      onAddLog({ 
        agent: t('sidebar.leads'), 
        action: t('aiAgents.cards.logActionCompleted'), 
        result: t('aiAgents.cards.leads.logCompleted') 
      });
      toast.success(t('aiAgents.cards.leads.toastFinished'));

    } catch (err) {
      console.error(err);
      onAddLog({ 
        agent: t('sidebar.leads'), 
        action: t('aiAgents.cards.logActionCriticalError'), 
        result: t('aiAgents.cards.leads.logCriticalError') 
      });
      toast.error(t('aiAgents.cards.leads.toastError'));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <AgentCard 
      icon={UserPlus}
      iconColor="#1B4FD8"
      title={t('aiAgents.cards.leads.title')}
      description={t('aiAgents.cards.leads.desc')}
      isActive={isActive}
      isRunning={isRunning}
      lastRun={lastRun}
      onToggle={() => setIsActive(!isActive)}
      onConfigure={() => toast.success(t('aiAgents.cards.leads.configOpen'))}
      onRun={runAgent}
    />
  );
}
