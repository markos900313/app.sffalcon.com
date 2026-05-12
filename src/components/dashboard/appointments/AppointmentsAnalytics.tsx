import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, Area, AreaChart
} from 'recharts';
import { Calendar as CalendarIcon, Target, Users, Zap, TrendingUp, Clock } from 'lucide-react';

interface AppointmentsAnalyticsProps {
  appointments: any[];
}

const COLORS = ['#1B4FD8', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

const CustomTooltip = ({ active, payload, label, prefix = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#111F3A] p-4 rounded-2xl border border-slate-200 dark:border-[#1E3A5F] shadow-xl backdrop-blur-md">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].fill }} />
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {payload[0].value} {prefix}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function AppointmentsAnalytics({ appointments }: AppointmentsAnalyticsProps) {
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let thisMonthCount = 0;
    let completedCount = 0;
    const totals = appointments.length;

    const statusMap: any = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };

    const hourMap: any = {};

    appointments.forEach(a => {
      // Estado
      if (statusMap[a.status] !== undefined) {
        statusMap[a.status]++;
      } else {
        statusMap[a.status] = 1; 
      }

      if (a.status === 'completed') {
        completedCount++;
      }

      // Mes actual
      if (a.date) {
        const d = new Date(a.date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          thisMonthCount++;
        }
      }

      // Hora del día
      if (a.time) {
        const hour = a.time.split(':')[0];
        hourMap[`${hour}:00`] = (hourMap[`${hour}:00`] || 0) + 1;
      }
    });

    const completionRate = totals > 0 ? Math.round((completedCount / totals) * 100) : 0;

    const donutData = Object.entries(statusMap)
      .filter(([_, value]) => value !== 0)
      .map(([key, value]) => {
        const labelMap: any = { pending: 'Pendientes', confirmed: 'Confirmadas', completed: 'Completadas', cancelled: 'Canceladas' };
        return { name: labelMap[key] || key, value };
      });

    const hoursData = Object.entries(hourMap)
      .map(([hour, count]) => ({ hora: hour, count }))
      .sort((a, b) => {
        const hA = parseInt(a.hora.split(':')[0]);
        const hB = parseInt(b.hora.split(':')[0]);
        return hA - hB;
      });

    return { thisMonthCount, completionRate, donutData, hoursData };
  }, [appointments]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <CalendarIcon size={80} />
          </div>
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center rounded-2xl">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Este Mes</p>
            <div className="flex items-baseline gap-2">
               <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.thisMonthCount}</p>
               <span className="text-[10px] font-bold text-green-500 flex items-center gap-0.5"><TrendingUp size={10}/> +12%</span>
            </div>
          </div>
        </div>

        <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <Target size={80} />
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center rounded-2xl">
            <Target className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Ratio de Asistencia / Cumplimiento</p>
            <div className="flex items-baseline gap-2">
               <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.completionRate}%</p>
               <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden min-w-[60px]">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.completionRate}%` }} />
               </div>
            </div>
          </div>
        </div>

        <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <Zap size={80} />
          </div>
          <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 flex items-center justify-center rounded-2xl">
            <Zap className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Nuevos Registros</p>
            <div className="flex items-baseline gap-2">
               <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">8</p>
               <span className="text-[10px] font-bold text-blue-500">PROMEDIO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Estado Global</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1">DISTRIBUCIÓN POR ESTADO</p>
             </div>
             <div className="p-2.5 bg-slate-50 dark:bg-[#0D1B35] border border-slate-100 dark:border-[#1E3A5F] rounded-xl">
               <Users size={16} className="text-slate-400" />
             </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                   <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#D97706" stopOpacity={1}/>
                   </linearGradient>
                   <linearGradient id="gradConfirmed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={1}/>
                   </linearGradient>
                   <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={1}/>
                   </linearGradient>
                </defs>
                <Pie
                  data={stats.donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {stats.donutData.map((entry: any, index: number) => {
                    const customColors: any = {
                      'Pendientes': 'url(#gradPending)',
                      'Confirmadas': 'url(#gradConfirmed)',
                      'Completadas': 'url(#gradCompleted)',
                      'Canceladas': '#EF4444'
                    };
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={customColors[entry.name] || COLORS[index % COLORS.length]}
                        stroke="none"
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip prefix="Citas / Reservas" />} />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Picos de Actividad</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1">VOLUMEN POR HORA DEL DÍA</p>
             </div>
             <div className="p-2.5 bg-slate-50 dark:bg-[#0D1B35] border border-slate-100 dark:border-[#1E3A5F] rounded-xl">
               <Clock size={16} className="text-slate-400" />
             </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.hoursData}>
                <defs>
                   <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B4FD8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1B4FD8" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E3A5F" opacity={0.3} />
                <XAxis 
                  dataKey="hora" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip prefix="Reservas" />} cursor={{ stroke: '#1B4FD8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#1B4FD8" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#barGradient)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
