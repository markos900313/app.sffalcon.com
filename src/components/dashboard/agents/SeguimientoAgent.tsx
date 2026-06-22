'use client';

import React, { useState } from 'react';
import { Bell, Copy, Check, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AgentCard from './AgentCard';
import toast from 'react-hot-toast';
import { useOrganization } from '@/context/OrganizationContext';
import { useLanguage } from '@/lib/LanguageContext';

interface SeguimientoAgentProps {
  onAddLog: (log: any) => void;
}

export default function SeguimientoAgent({ onAddLog }: SeguimientoAgentProps) {
  const { organization } = useOrganization();
  const { t } = useLanguage();
  const isBelleza = organization?.sector_config?.grupo?.startsWith('1_belleza');
  const supabase = createClient();
  const [isActive, setIsActive] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const runAgent = async () => {
    setIsRunning(true);
    setSuggestions([]);
    onAddLog({ 
      agent: t('aiAgents.cards.followup.title'), 
      action: t('aiAgents.cards.logActionStart'), 
      result: t('aiAgents.cards.followup.logStart') 
    });

    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .in('status', ['lead', 'potencial'])
        .lt('last_contact', sevenDaysAgo);

      if (error) throw error;

      if (!clients || clients.length === 0) {
        onAddLog({ 
          agent: t('aiAgents.cards.followup.title'), 
          action: t('aiAgents.cards.logActionFinished'), 
          result: t('aiAgents.cards.followup.logFinished') 
        });
        toast.success(t('aiAgents.cards.followup.toastNoClients'));
        return;
      }

      onAddLog({ 
        agent: t('aiAgents.cards.followup.title'), 
        action: t('aiAgents.cards.logActionProcessing'), 
        result: t('aiAgents.cards.followup.logProcessing').replace('{count}', String(clients.length)) 
      });

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

        onAddLog({ 
          agent: t('aiAgents.cards.followup.title'), 
          action: t('aiAgents.cards.logActionSuggestion'), 
          result: t('aiAgents.cards.followup.logSuggestion').replace('{name}', client.name).replace('{days}', String(days)) 
        });
      }

      setLastRun(new Date().toLocaleString());
      toast.success(t('aiAgents.cards.followup.toastFinished'));

    } catch (err) {
      console.error(err);
      onAddLog({ 
        agent: t('aiAgents.cards.followup.title'), 
        action: t('aiAgents.cards.logActionError'), 
        result: t('aiAgents.cards.followup.logError') 
      });
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
      toast.success(t('aiAgents.cards.followup.toastContactedSuccess'));
    } catch (err) {
      toast.error(t('aiAgents.cards.followup.toastContactedError'));
    }
  };

  return (
    <div className="space-y-6">
      <AgentCard
        icon={Bell}
        iconColor="#F59E0B"
        title={t('aiAgents.cards.followup.title')}
        description={t('aiAgents.cards.followup.desc')}
        isActive={isActive}
        isRunning={isRunning}
        lastRun={lastRun}
        onToggle={() => setIsActive(!isActive)}
        onConfigure={() => toast.success(t('aiAgents.cards.followup.configOpen'))}
        onRun={runAgent}
      />

      {suggestions.length > 0 && (
        <div className="bg-white dark:bg-[#111F3A] rounded-[32px] border border-[#E2E8F0] dark:border-[#1E3A5F] p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">{t('aiAgents.cards.followup.suggestionsTitle')}</h4>
          <div className="grid grid-cols-1 gap-4">
            {suggestions.map((s, idx) => (
              <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-[#1E3A5F]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{s.client.name}</p>
                    <p className="text-xs text-slate-500">{t('aiAgents.cards.followup.daysNoContact').replace('{days}', String(s.days))} · {s.client.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(s.message);
                        toast.success(t('aiAgents.cards.followup.toastCopySuccess'));
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      title={t('aiAgents.cards.followup.copyTooltip')}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => markContacted(s.client.id)}
                      className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                      title={t('aiAgents.cards.followup.markContactedTooltip')}
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
