'use client';

import React from 'react';
import { Lock, Crown } from 'lucide-react';
import Link from 'next/link';
import { usePlan } from '@/hooks/usePlan';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

interface PlanGateProps {
  children: React.ReactNode;
  module: string;
}

const MODULE_NAMES: Record<string, string> = {
  projects: 'Proyectos',
  finances: 'Finanzas',
  invoices: 'Facturación',
  agents: 'Agentes IA',
  analytics: 'Analytics',
};

export const PlanGate = ({ children, module }: PlanGateProps) => {
  const { t } = useLanguage();
  // 🛡️ MODO AUDITORÍA TOTAL: Saltamos la validación de acceso.
  // El usuario necesita analizar todo el contenido para decidir qué dejar.
  return <>{children}</>;

  // Código original comentado para referencia rápida en la reversion posterior
  /*
  const { hasAccess, loading, isTrialExpired } = usePlan();
  const MODULE_NAMES: Record<string, string> = {
    projects: t('planGate.modules.projects'),
    finances: t('planGate.modules.finances'),
    invoices: t('planGate.modules.invoices'),
    agents: t('planGate.modules.agents'),
    analytics: t('planGate.modules.analytics'),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4FD8]"></div>
      </div>
    );
  }

  if (hasAccess(module)) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-[#1E3A5F] bg-white dark:bg-[#0D1B35] flex items-center justify-center p-8">
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#1B4FD8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="relative z-10 max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 mb-6 border border-blue-100 dark:border-blue-500/20">
          <Lock className="w-8 h-8 text-[#1B4FD8]" />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
          {isTrialExpired ? t('planGate.trialExpiredTitle') : t('planGate.planUnavailableTitle')}
        </h3>
        
        <p className="text-slate-500 dark:text-[#94A3B8] mb-8 leading-relaxed">
          {isTrialExpired 
            ? t('planGate.trialExpiredDesc')
            : t('planGate.planRequiredDesc', { module: MODULE_NAMES[module] || module })
          }
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard/settings"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E3A5F] text-slate-600 dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-[#162040] transition-all font-medium text-sm"
          >
            {t('planGate.back')}
          </Link>
          <Link
            href="/dashboard/settings"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1B4FD8] text-white hover:bg-[#1640B0] transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Crown className="w-4 h-4" />
            {t('planGate.viewPlans')}
          </Link>
        </div>
      </div>
    </div>
  );
  */
};
