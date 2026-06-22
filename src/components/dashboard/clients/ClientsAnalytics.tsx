import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import { Target, TrendingUp, Users, PieChart as PieIcon, BarChart3, ArrowUpRight } from 'lucide-react';
import { Client } from '@/app/(dashboard)/dashboard/clients/types';

interface ClientsAnalyticsProps {
  clients: Client[];
}

interface MonthlyData {
  month: string;
  year: number;
  monthNum: number;
  count: number;
}

const COLORS = ['#1B4FD8', '#10B981', '#F59E0B', '#64748B', '#8B5CF6'];

const STATUS_LABELS: Record<string, string> = {
  lead: 'Lead',
  potencial: 'Potencial',
  activo: 'Activo',
  inactivo: 'Inactivo',
  nuevo: 'Nuevo',
};

export default function ClientsAnalytics({ clients }: ClientsAnalyticsProps) {
  const stats = useMemo(() => {
    const total = clients.length;
    const activos = clients.filter(c => (c.status || '').toLowerCase() === 'activo').length;
    const conversionRate = total > 0 ? ((activos / total) * 100).toFixed(1) : '0.0';

    // Canal más efectivo
    const sources = clients.reduce((acc: Record<string, number>, curr) => {
      const source = curr.source || 'otro';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    
    let topSource = 'N/A';
    let max = 0;
    Object.entries(sources).forEach(([key, val]) => {
      if (val > max) {
        max = val;
        topSource = key;
      }
    });

    const sourceMap: Record<string, string> = { web: 'Web', whatsapp: 'WhatsApp', email: 'Email', referido: 'Referido', otro: 'Otro' };
    topSource = sourceMap[topSource] || topSource;

    // Distribución por estado
    const statusGroups = clients.reduce((acc: Record<string, number>, curr) => {
      const s = curr.status || 'nuevo';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const pieData = Object.entries(statusGroups).map(([name, value]) => ({ 
      name: STATUS_LABELS[name] || name.toUpperCase(), 
      value 
    }));

    // Crecimiento mensual
    const last6Months: MonthlyData[] = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        month: d.toLocaleString('es-ES', { month: 'short' }).toUpperCase(),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        count: 0
      };
    }).reverse();

    clients.forEach(c => {
      if (!c.created_at) return;
      const d = new Date(c.created_at);
      const target = last6Months.find(m => m.monthNum === d.getMonth() && m.year === d.getFullYear());
      if (target) target.count++;
    });

    return { conversionRate, topSource, pieData, areaData: last6Months, total };
  }, [clients]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6 flex items-center gap-5 border-t-4 border-t-[#1B4FD8]">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-[#1B4FD8] flex items-center justify-center shrink-0 shadow-sm">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Volumen Total</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.total}</h4>
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                <ArrowUpRight size={12} />
                {(stats.total * 0.1).toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        <div className="card-premium p-6 flex items-center gap-5 border-t-4 border-t-[#10B981]">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-[#10B981] flex items-center justify-center shrink-0 shadow-sm">
            <Target size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Efectividad</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.conversionRate}%</h4>
          </div>
        </div>

        <div className="card-premium p-6 flex items-center gap-5 border-t-4 border-t-[#F59E0B]">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-[#F59E0B] flex items-center justify-center shrink-0 shadow-sm">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Principal Origen</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white leading-none uppercase">{stats.topSource}</h4>
          </div>
        </div>
      </div>

      {/* Gráficos Detallados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Curva de Crecimiento */}
        <div className="card-premium p-8 h-[450px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-[#1B4FD8] rounded-xl">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Curva de Adquisición</h3>
            </div>
            <select className="bg-slate-50 dark:bg-white/5 border-none rounded-xl text-[11px] font-bold text-slate-400 px-3 py-1.5 focus:ring-1 focus:ring-blue-500/20">
              <option>ÚLTIMOS 6 MESES</option>
              <option>ESTE AÑO</option>
            </select>
          </div>
          
          <div className="flex-1 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.areaData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B4FD8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1B4FD8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1B4FD8', 
                    border: 'none', 
                    borderRadius: '16px',
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(27, 79, 216, 0.3)'
                  }}
                  itemStyle={{ color: '#fff', fontWeight: 700, fontSize: '12px' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#1B4FD8" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución Circular */}
        <div className="card-premium p-8 h-[450px] flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-[#10B981] rounded-xl">
              <PieIcon size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Salud del Pipeline</h3>
          </div>

          <div className="flex-1 w-full mx-auto relative group">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={8}
                >
                  {stats.pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  iconType="circle"
                  formatter={(value) => <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Centro del Donut con Dato central */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mb-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activos</p>
              <p className="text-3xl font-black text-[#10B981] dark:text-emerald-400">
                {clients.length > 0 ? ((clients.filter(c => (c.status || '').toLowerCase() === 'activo').length / clients.length) * 100).toFixed(0) : '0'}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
