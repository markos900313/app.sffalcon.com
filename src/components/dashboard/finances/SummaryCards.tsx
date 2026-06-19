"use client";

import React from "react";
import { Wallet, ArrowDownRight, ArrowUpRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";
import { useLanguage } from "@/lib/LanguageContext";

interface SummaryCardsProps {
  data: { ingresos: number; gastos: number; balance: number } | null;
  loading: boolean;
}

export default function SummaryCards({ data, loading }: SummaryCardsProps) {
  const { t } = useLanguage();
  const ingresos = data?.ingresos ?? 0;
  const gastos = data?.gastos ?? 0;
  const balance = data?.balance ?? ingresos - gastos;

  const cards = [
    {
      label: t('summaryCards.ingresos'),
      value: formatCurrency(ingresos),
      subtext: t('summaryCards.esteMes'),
      color: "text-[#0F172A]",
      icon: <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#64748B]/40" />,
      trend: "neutral"
    },
    {
      label: t('summaryCards.gastos'),
      value: formatCurrency(gastos),
      trendText: "↓",
      subtext: t('summaryCards.esteMes'),
      color: "text-[#0F172A] dark:text-[#F1F5F9]",
      icon: <ArrowDownRight className="w-5 h-5 text-[#EF4444]" />,
      trend: "down"
    },
    {
      label: t('summaryCards.balanceTotal'),
      value: formatCurrency(balance),
      subtext: t('summaryCards.calculoTiempoReal'),
      color: "text-white",
      bg: "bg-[#1B4FD8]",
      icon: <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/60" />,
      trend: "realtime"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
      {cards.map((card, idx) => (
        <div 
          key={idx}
          className={cn(
            "card-premium p-6 shadow-sm transition-all hover:scale-[1.02] flex flex-col gap-4",
            idx < 2 && "card-finanzas",
            card.bg ? `${card.bg} border-transparent shadow-blue-500/10` : "bg-[var(--bg-card)] border-[var(--border-card)]"
          )}
        >
          <div className="flex flex-col gap-1.5">
            <p className={cn(
              "card-titulo",
              card.bg && "text-blue-100/90"
            )}>
              {card.label}
            </p>
            <div className="flex items-center justify-between">
              <h2
                className={cn(
                  "text-3xl font-bold tracking-tight tabular-nums",
                  card.bg ? "text-white" : "text-[var(--text-primary)]"
                )}
              >
                {loading ? <span className="inline-block h-8 w-24 bg-slate-200/30 rounded animate-pulse" /> : card.value}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5 h-5">
            <span className={cn(
              "text-[12px] font-medium",
              card.bg ? "text-blue-50/80" : 
              card.trend === "down" ? "text-[#EF4444]" : "text-[#64748B] dark:text-[#475569]"
            )}>
              {loading ? <span className="inline-block h-4 w-28 bg-slate-200/60 rounded animate-pulse" /> : (
                <span className="flex items-center gap-1">
                  {card.trendText} {card.subtext}
                </span>
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
