"use client";

import React from "react";
import { TrendingUp, TrendingDown, Euro, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/context/OrganizationContext";
import { formatCurrency } from "@/lib/formatCurrency";

interface Props {
  ingresos: number;
  gastos: number;
  beneficio: number;
  loading: boolean;
}

export default function BusinessSummaryCards({ ingresos, gastos, beneficio, loading }: Props) {
  const { organization } = useOrganization();
  const symbol = organization?.currency_symbol || '€';
  
  const fmt = (val: number) => {
     return val.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' ' + symbol;
  };

  const cards = [
    {
      label: "INGRESOS CLIENTES",
      value: fmt(ingresos),
      subtext: "Facturado este mes",
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      valueColor: "text-[#0F172A] dark:text-[#F1F5F9]",
      bg: "bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F]",
      subColor: "text-emerald-500",
    },
    {
      label: "GASTOS OPERATIVOS",
      value: fmt(gastos),
      subtext: "Costes del negocio",
      icon: <TrendingDown className="w-5 h-5 text-red-400" />,
      valueColor: "text-[#0F172A] dark:text-[#F1F5F9]",
      bg: "bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F]",
      subColor: "text-red-400",
    },
    {
      label: "BENEFICIO NETO",
      value: fmt(beneficio),
      subtext: beneficio >= 0 ? "Resultado positivo" : "Resultado negativo",
      icon: <Euro className="w-5 h-5 text-white/70" />,
      valueColor: "text-white",
      bg: "bg-[#1B4FD8] border border-transparent shadow-blue-500/20",
      subColor: "text-blue-100/80",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={cn("p-5 rounded-xl shadow-sm transition-all hover:scale-[1.02] min-w-0 xl:max-w-[320px] w-full", card.bg)}
        >
          <div className="flex flex-col gap-2.5 min-w-0">
            <div className="flex items-center justify-between gap-4 min-w-0">
              <p className={cn(
                "text-[11px] font-medium uppercase tracking-wider truncate",
                idx === 2 ? "text-blue-100/70" : "text-[#64748B] dark:text-[#94A3B8]"
              )}>
                {card.label}
              </p>
              <div className="shrink-0">{card.icon}</div>
            </div>
            <h2 className={cn("text-xl md:text-2xl lg:text-3xl font-bold tracking-tight tabular-nums truncate text-ellipsis overflow-hidden whitespace-nowrap", card.valueColor)}>
              {loading ? <span className="inline-block h-8 w-24 bg-white/20 rounded animate-pulse" /> : card.value}
            </h2>
            <p className={cn("text-[12px] font-medium truncate", card.subColor)}>
              {loading ? <span className="inline-block h-4 w-28 bg-white/10 rounded animate-pulse" /> : card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
