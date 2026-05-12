"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/lib/ThemeContext";

interface TrendData {
  month: string;
  ingresos: number;
  gastos: number;
}

export default function FinanceTrendChart({ data }: { data: TrendData[] }) {
  const { theme } = useTheme();
  
  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[16px] md:rounded-[20px] lg:rounded-[24px] p-3 md:p-6 lg:p-8 shadow-sm h-[300px] md:h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <div>
          <h3 className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em]">
            Tendencia Anual
          </h3>
          <p className="text-[13px] font-bold text-[#0F172A] dark:text-[#F1F5F9] mt-1">
            Ingresos vs Gastos
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1B4FD8]" />
            <span className="text-[11px] font-medium text-[#64748B]">Ingresos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="text-[11px] font-medium text-[#64748B]">Gastos</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B4FD8" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#1B4FD8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "rgba(255,255,255,0.05)" : "#E2E8F0"} opacity={0.5} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }}
            />
            <Tooltip 
              cursor={{ stroke: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 2 }}
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? '#111F3A' : '#FFF', 
                borderRadius: '12px', 
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                color: theme === 'dark' ? '#FFF' : '#000'
              }}
              itemStyle={{ padding: '2px 0' }}
            />
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke="#1B4FD8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIngresos)"
            />
            <Area
              type="monotone"
              dataKey="gastos"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGastos)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
