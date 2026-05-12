import React from "react";
import { MessageCircle, Wallet, ArrowUpRight, ArrowDownRight, Building2, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";

type MetricCardsProps = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  pendingMessages: number;
  currentMonthLabel: string;
  balanceLabel?: string;
  balanceSubtexto?: string;
  hogarNeto: number;
  negocioNeto: number;
};

export default function MetricCards({
  totalIncome,
  totalExpenses,
  balance,
  pendingMessages,
  currentMonthLabel,
  balanceLabel,
  balanceSubtexto,
  hogarNeto,
  negocioNeto,
}: MetricCardsProps) {
  const displayMetrics = [
    {
      title: balanceLabel ?? "BALANCE TOTAL",
      value: formatCurrency(balance),
      valueColor: balance < 0 ? "text-[#EF4444]" : "text-[#10B981]",
      trend: balance < 0 ? "↓" : "↑",
      subtext: balanceSubtexto ?? "Global",
      subtextColor: "text-[#64748B] dark:text-[#94A3B8]",
      icon: Wallet,
    },
    {
      title: `INGRESOS ${currentMonthLabel}`,
      value: formatCurrency(totalIncome),
      valueColor: "text-[#10B981]",
      trend: "↑",
      subtext: "Total ingresos",
      subtextColor: "text-[#64748B] dark:text-[#94A3B8]",
      icon: ArrowUpRight,
    },
    {
      title: `GASTOS ${currentMonthLabel}`,
      value: formatCurrency(totalExpenses),
      valueColor: "text-[#EF4444]",
      trend: "↓",
      subtext: "Total gastos",
      subtextColor: "text-[#64748B] dark:text-[#94A3B8]",
      icon: ArrowDownRight,
    },
    {
      title: "NEGOCIO (NETO)",
      value: formatCurrency(negocioNeto),
      valueColor: negocioNeto < 0 ? "text-[#EF4444]" : "text-[#10B981]",
      trend: negocioNeto < 0 ? "↓" : "↑",
      subtext: "Resultado Negocio",
      subtextColor: "text-[#64748B] dark:text-[#94A3B8]",
      icon: Building2,
    },
    {
      title: "HOGAR (NETO)",
      value: formatCurrency(hogarNeto),
      valueColor: hogarNeto < 0 ? "text-[#EF4444]" : "text-[#10B981]",
      trend: hogarNeto < 0 ? "↓" : "↑",
      subtext: "Hogar Resultado",
      subtextColor: "text-[#64748B] dark:text-[#94A3B8]",
      icon: Home,
    },
    {
      title: "MSJS. PENDIENTES",
      value: String(pendingMessages),
      valueColor: "text-[#3B82F6]",
      trend: "→",
      subtext: "Comunicaciones",
      subtextColor: "text-[#3B82F6]",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {displayMetrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-default flex flex-col justify-between"
        >
          <div>
            <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-4 truncate">
              {metric.title}
            </p>
            <div className="flex items-center justify-between mb-2">
              <h3
                className={cn(
                  "text-2xl font-bold tracking-tight leading-tight tabular-nums",
                  metric.valueColor
                )}
              >
                {metric.value}
              </h3>
              <div className="w-10 h-10 bg-slate-50 dark:bg-[#0D1B35] rounded-xl flex items-center justify-center flex-shrink-0">
                <metric.icon className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
              </div>
            </div>
          </div>
          <p className={cn("text-[12px] font-medium flex items-center gap-1 mt-auto", metric.subtextColor)}>
            <span className="text-sm">{metric.trend}</span> {metric.subtext}
          </p>
        </div>
      ))}
    </div>
  );
}
