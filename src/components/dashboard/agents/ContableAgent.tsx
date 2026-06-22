'use client';

import React, { useState } from 'react';
import { Calculator, FileText, Copy, Download, Loader2 } from 'lucide-react';
import AgentCard from './AgentCard';
import toast from 'react-hot-toast';
import { useOrganization } from '@/context/OrganizationContext';
import { useLanguage } from '@/lib/LanguageContext';

interface ContableAgentProps {
  onAddLog: (log: any) => void;
  hogarContext: any;
  negocioContext: any;
}

export default function ContableAgent({ onAddLog, hogarContext, negocioContext }: ContableAgentProps) {
  const { organization } = useOrganization();
  const { t } = useLanguage();
  const isBelleza = organization?.sector_config?.grupo?.startsWith('1_belleza');
  const [isActive, setIsActive] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | undefined>(undefined);
  const [summary, setSummary] = useState('');

  const runAgent = async () => {
    setIsRunning(true);
    setSummary('');
    onAddLog({ 
      agent: t('aiAgents.cards.accounting.title'), 
      action: t('aiAgents.cards.logActionStart'), 
      result: t('aiAgents.cards.accounting.logStart') 
    });

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
      onAddLog({ 
        agent: t('aiAgents.cards.accounting.title'), 
        action: t('aiAgents.cards.logActionFinished'), 
        result: t('aiAgents.cards.accounting.logFinished') 
      });
      toast.success(t('aiAgents.cards.accounting.toastFinished'));

    } catch (err) {
      console.error(err);
      onAddLog({ 
        agent: t('aiAgents.cards.accounting.title'), 
        action: t('aiAgents.cards.logActionError'), 
        result: t('aiAgents.cards.accounting.logError') 
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <AgentCard 
        icon={Calculator}
        iconColor="#10B981"
        title={t('aiAgents.cards.accounting.title')}
        description={t('aiAgents.cards.accounting.desc')}
        isActive={isActive}
        isRunning={isRunning}
        lastRun={lastRun}
        onToggle={() => setIsActive(!isActive)}
        onConfigure={() => toast.success(t('aiAgents.cards.accounting.configOpen'))}
        onRun={runAgent}
      />

      {summary && (
        <div className="bg-white dark:bg-[#111F3A] rounded-[32px] border border-[#E2E8F0] dark:border-[#1E3A5F] p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">{t('aiAgents.cards.accounting.monthlyReportTitle')}</h4>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(summary);
                  toast.success(t('aiAgents.cards.accounting.toastCopySuccess'));
                }}
                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                title={t('aiAgents.cards.accounting.copyTooltip')}
              >
                <Copy className="w-4 h-4" />
              </button>
              <button 
                onClick={() => toast.success(t('aiAgents.cards.accounting.toastDownloadSuccess'))}
                className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                title={t('aiAgents.cards.accounting.downloadTooltip')}
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
