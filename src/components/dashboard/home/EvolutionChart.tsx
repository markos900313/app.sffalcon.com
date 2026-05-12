"use client";

import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { cn } from "@/lib/utils";

type EvolutionRow = {
  mes: "ENE" | "FEB" | "MAR" | "ABR" | "MAY" | "JUN" | "JUL" | "AGO" | "SEP" | "OCT" | "NOV" | "DIC";
  ingresos: number;
  gastos: number;
  balance: number;
};

const FALLBACK_DATA: EvolutionRow[] = [
  { mes: "ENE", ingresos: 2052.66, gastos: 2082.16, balance: -29.5 },
  { mes: "FEB", ingresos: 2354.33, gastos: 2000.46, balance: 353.87 },
  { mes: "MAR", ingresos: 1559.62, gastos: 1656.51, balance: -96.89 },
  { mes: "ABR", ingresos: 0, gastos: 632.75, balance: -632.75 },
];

export default function EvolutionChart({ data }: { data: EvolutionRow[] }) {
  const chartData = data && data.length > 0 ? data : FALLBACK_DATA;

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] md:rounded-[16px] p-4 md:p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h3 className="text-sm md:text-base lg:text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
            Evolución 2026
          </h3>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase tracking-wider mt-1">
            Ingresos vs Gastos vs Balance
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:gap-5">
          <LegendItem color="#1B4FD8" label="Ingresos" />
          <LegendItem color="#EF4444" label="Gastos" isDashed />
          <LegendItem color="#10B981" label="Balance" />
        </div>
      </div>

      <div className="h-[200px] md:h-[240px] lg:h-[280px] w-full -mx-2 md:-mx-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#1E3A5F' : '#F1F5F9'} />
            <XAxis 
              dataKey="mes"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                backgroundColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#111F3A' : '#FFFFFF',
                border: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '1px solid #1E3A5F' : '1px solid #E2E8F0',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px',
                fontSize: '11px'
              }}
              itemStyle={{ fontSize: '11px', fontWeight: '700' }}
              labelStyle={{ color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#F1F5F9' : '#0F172A', fontWeight: '800', marginBottom: '4px', fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="ingresos" 
              stroke="#1B4FD8" 
              strokeWidth={3} 
              dot={{ r: 3, fill: '#1B4FD8', strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Line 
              type="monotone" 
              dataKey="gastos" 
              stroke="#EF4444" 
              strokeWidth={2} 
              strokeDasharray="6 6"
              dot={{ r: 2, fill: '#EF4444', strokeWidth: 0 }}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#10B981" 
              strokeWidth={2} 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function LegendItem({ color, label, isDashed }: { color: string, label: string, isDashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 md:gap-2">
      <div 
        className={cn(
          "h-1.5 rounded-full",
          isDashed ? "w-4 md:w-6 border-b-2 border-dashed" : "w-2 md:w-3"
        )} 
        style={{ borderColor: color, backgroundColor: isDashed ? 'transparent' : color }} 
      />
      <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
