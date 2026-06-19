"use client";

import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useOrganization } from "@/context/OrganizationContext";
import { useLanguage } from "@/lib/LanguageContext";

type Alert = {
  type: 'warning' | 'success' | 'info';
  title: string;
  message: string;
};

interface Props {
  entries: any[];
  selectedMonth: number;
  year: number;
  aiAlerts?: Alert[];
  /** 'hogar' usa type='ingreso', 'business' usa type='ingreso_cliente' */
  mode?: 'hogar' | 'business';
}

export default function FinancialAlerts({ entries, selectedMonth, year, aiAlerts, mode = 'hogar' }: Props) {
  const { organization } = useOrganization();
  const symbol = organization?.currency_symbol || '€';
  const { t } = useLanguage();

  const monthsMap = useMemo(() => [
    t('common.months.january'),
    t('common.months.february'),
    t('common.months.march'),
    t('common.months.april'),
    t('common.months.may'),
    t('common.months.june'),
    t('common.months.july'),
    t('common.months.august'),
    t('common.months.september'),
    t('common.months.october'),
    t('common.months.november'),
    t('common.months.december'),
  ], [t]);

  const alerts: Alert[] = useMemo(() => {
    if (aiAlerts && aiAlerts.length > 0) return aiAlerts;
    const ingresoType = mode === 'business' ? 'ingreso_cliente' : 'ingreso';

    const mesEntries = entries.filter(e =>
      Number(e.month) === selectedMonth && Number(e.year) === year
    );
    const mesAnteriorEntries = entries.filter(e =>
      Number(e.month) === selectedMonth - 1 && Number(e.year) === year
    );

    const ingresos = mesEntries
      .filter(e => e.type === ingresoType)
      .reduce((s: number, e: any) => s + Number(e.amount), 0);
    const gastos = mesEntries
      .filter(e => e.type !== ingresoType)
      .reduce((s: number, e: any) => s + Number(e.amount), 0);
    const balance = ingresos - gastos;

    const gastosAnterior = mesAnteriorEntries
      .filter(e => e.type !== ingresoType)
      .reduce((s: number, e: any) => s + Number(e.amount), 0);

    const mesNombre = monthsMap[selectedMonth - 1] || t('financialAlerts.thisMonth');
    const result: Alert[] = [];

    if (ingresos === 0) {
      result.push({
        type: 'info',
        title: t('financialAlerts.noIncome.title'),
        message: t('financialAlerts.noIncome.message', { month: mesNombre })
      });
    }

    if (balance < 0) {
      result.push({
        type: 'warning',
        title: mode === 'business' ? t('financialAlerts.negativeProfit.title') : t('financialAlerts.budgetExceeded.title'),
        message: t('financialAlerts.expensesExceeded.message', {
          amount: Math.abs(balance).toLocaleString('es-ES', { minimumFractionDigits: 2 }),
          symbol
        })
      });
    }

    if (gastosAnterior > 0 && gastos > gastosAnterior * 1.2) {
      result.push({
        type: 'warning',
        title: t('financialAlerts.highExpenses.title'),
        message: t('financialAlerts.highExpenses.message', { percent: Math.round(((gastos / gastosAnterior) - 1) * 100) })
      });
    }

    if (result.length === 0) {
      result.push({
        type: 'success',
        title: mode === 'business' ? t('financialAlerts.balanced.businessTitle') : t('financialAlerts.balanced.hogarTitle'),
        message: t('financialAlerts.balanced.message', { month: mesNombre })
      });
    }

    return result;
  }, [entries, selectedMonth, year, mode, aiAlerts, monthsMap, symbol, t]);

  const styles = {
    warning: {
      container: 'bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400',
      title: 'text-amber-900 dark:text-amber-200',
      text: 'text-amber-700 dark:text-amber-400/80',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
    },
    success: {
      container: 'bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-emerald-400',
      title: 'text-emerald-900 dark:text-emerald-200',
      text: 'text-emerald-700 dark:text-emerald-400/80',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-400',
      title: 'text-blue-900 dark:text-blue-200',
      text: 'text-blue-700 dark:text-blue-400/80',
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
    },
  };

  return (
    <div className="space-y-4 md:space-y-5 lg:space-y-6 flex flex-col justify-center">
      <h3 className="text-sm md:text-base lg:text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] uppercase mb-1 md:mb-2">
        {t('financialAlerts.title')}
      </h3>
      {alerts.map((alert, i) => {
        const s = styles[alert.type];
        return (
          <div key={i} className={`${s.container} p-5 rounded-r-xl`}>
            <div className="flex gap-4">
              {s.icon}
              <div>
                <h4 className={`text-[14px] font-semibold ${s.title}`}>{alert.title}</h4>
                <p className={`text-[13px] font-normal mt-1 leading-relaxed ${s.text}`}>{alert.message}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
