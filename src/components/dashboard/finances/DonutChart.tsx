"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useLanguage } from "@/lib/LanguageContext";
import { useOrganization } from "@/context/OrganizationContext";

type FinanceEntry = {
  id: string;
  concept: string;
  type: string;
  amount: number;
};

const COLORS = ["#1B4FD8", "#EF4444", "#F59E0B", "#10B981", "#6366F1", "#EC4899"];

const getCategoryKey = (cat: string) => {
  return cat
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*\/\s*/g, '_')
    .replace(/\s+/g, '_');
};

export default function DonutChart({ entries, month }: { entries: FinanceEntry[], month: string }) {
  const { t } = useLanguage();
  const { organization } = useOrganization();
  const currencySymbol = organization?.currency_symbol || '€';

  const getTypeLabel = (type: string) => {
    const lower = type.toLowerCase();
    if (["gasto_fijo", "variable", "ingreso", "deuda", "ahorro", "suscripcion"].includes(lower)) {
      return t(`financesTable.types.${lower}` as any);
    }
    return t(`finances.categories.${getCategoryKey(type)}` as any, { defaultValue: type });
  };

  const chartData = useMemo(() => {
    const gastosOnly = entries.filter(e => e.type !== 'ingreso');
    const totalGastos = gastosOnly.reduce((sum, e) => sum + e.amount, 0);

    if (totalGastos === 0) return [];

    // Agrupar por tipo
    const grouped = gastosOnly.reduce((acc, e) => {
      const typeLabel = getTypeLabel(e.type);
      acc[typeLabel] = (acc[typeLabel] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value], i) => ({
      name,
      value: (value / totalGastos) * 100,
      amount: value,
      color: COLORS[i % COLORS.length]
    })).sort((a, b) => b.value - a.value);
  }, [entries, t]);

  const translatedMonth = t(('monthSelector.' + month) as any, { defaultValue: month });

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[16px] md:rounded-[20px] lg:rounded-[24px] p-4 md:p-6 lg:p-8 shadow-sm h-full flex flex-col min-h-[350px] md:min-h-[400px]">
      <h3 className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] mb-4 md:mb-8">
        {t('donutChart.title')}
      </h3>

      <div className="flex flex-col items-center justify-center gap-4 md:gap-8 flex-1">
        <div className="w-full h-[180px] md:h-[220px] relative flex items-center justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="85%"
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center p-4">
              <p className="text-xs text-slate-400">{t('donutChart.noData' as any, { month: translatedMonth })}</p>
            </div>
          )}
          {chartData.length > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pb-1">
              <span className="text-[10px] font-bold text-[#64748B] dark:text-[#475569] uppercase tracking-[0.15em] mb-1">{translatedMonth}</span>
              <span className="text-xl md:text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight tabular-nums">
                {`${chartData.reduce((s, d) => s + d.amount, 0).toLocaleString('es-ES', { maximumFractionDigits: 0 })}${currencySymbol}`}
              </span>
            </div>
          )}
        </div>

        <div className="w-full max-w-[320px] space-y-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between group px-1">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                <span className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-[#F1F5F9] transition-colors">
                  {item.name}
                </span>
              </div>
              <div className="flex items-baseline gap-2 text-right">
                <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F1F5F9] tabular-nums">
                  {item.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}{currencySymbol}
                </span>
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#475569] min-w-[50px]">
                  {item.value.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
