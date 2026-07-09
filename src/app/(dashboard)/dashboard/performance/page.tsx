"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  ShoppingBag,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  FileText,
  Activity,
  MessageSquare
} from "lucide-react";
import jsPDF from "jspdf";
import PageSkeleton from "@/components/dashboard/ui/PageSkeleton";
import autoTable from "jspdf-autotable";
import { cn } from "@/lib/utils";
import { DashboardPageContainer, DashboardSection } from "@/components/dashboard/DashboardPageContainer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useOrganization } from "@/context/OrganizationContext";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/LanguageContext";

const REVENUE_DATA: any[] = [];

const TOP_ITEMS: any[] = [];

const COLORS = ['#1B4FD8', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

export default function PerformancePage() {
  const { t, language } = useLanguage();
  const supabase = createClient();
  const { organization, loading: orgLoading } = useOrganization();
  const currencySymbol = organization?.currency_symbol || '€';
  const [period, setPeriod] = useState("week"); // "today" | "week" | "month"
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalAppointments: 0,
    averageTicket: 0,
    occupancy: 0,
    revenueTrend: "up",
    appointmentsTrend: "up",
    avgTicketTrend: "up",
    chartData: [] as any[]
  });

  useEffect(() => {
    fetchData();
  }, [organization, period]);

  function buildChartData(invs: any[], period: string) {
    if (period === "today") {
      const slots = Array.from({ length: 24 }, (_, h) => ({
        name: `${String(h).padStart(2, '0')}h`,
        revenue: 0,
        actividad: 0
      }));
      invs?.forEach(inv => {
        const h = new Date(inv.issue_date).getHours();
        slots[h].revenue += Number(inv.total || 0);
        slots[h].actividad += 1;
      });
      return slots;
    }
    
    if (period === "week") {
      const days = language === 'es'
        ? ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
        : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const slots = days.map(d => ({ name: d, revenue: 0, actividad: 0 }));
      invs?.forEach(inv => {
        const d = new Date(inv.issue_date).getDay();
        const idx = d === 0 ? 6 : d - 1;
        slots[idx].revenue += Number(inv.total || 0);
        slots[idx].actividad += 1;
      });
      return slots;
    }
    
    const slots = [
      { name: language === 'es' ? 'Sem 1' : 'Wk 1', revenue: 0, actividad: 0 },
      { name: language === 'es' ? 'Sem 2' : 'Wk 2', revenue: 0, actividad: 0 },
      { name: language === 'es' ? 'Sem 3' : 'Wk 3', revenue: 0, actividad: 0 },
      { name: language === 'es' ? 'Sem 4' : 'Wk 4', revenue: 0, actividad: 0 },
    ];
    invs?.forEach(inv => {
      const day = new Date(inv.issue_date).getDate();
      const weekIdx = Math.min(Math.floor((day - 1) / 7), 3);
      slots[weekIdx].revenue += Number(inv.total || 0);
      slots[weekIdx].actividad += 1;
    });
    return slots;
  }

  const fetchData = async () => {
    if (!organization) return;
    setLoading(true);
    try {
      let start, end;
      const now = new Date();
      
      if (period === "today") {
        start = startOfDay(now).toISOString();
        end = endOfDay(now).toISOString();
      } else if (period === "week") {
        start = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
        end = endOfWeek(now, { weekStartsOn: 1 }).toISOString();
      } else {
        start = startOfMonth(now).toISOString();
        end = endOfMonth(now).toISOString();
      }

      const { data: invs } = await supabase
        .from('invoices')
        .select('total, status, issue_date')
        .eq('organization_id', organization.id)
        .gte('issue_date', start)
        .lte('issue_date', end)
        .not('status', 'eq', 'cancelada');

      const revenue = invs?.reduce((acc: number, curr: any) => acc + Number(curr.total || 0), 0) || 0;
      const invoicesCount = invs?.length || 0;
      const average = invoicesCount > 0 ? revenue / invoicesCount : 0;

      setMetrics({
        totalRevenue: revenue,
        totalAppointments: invoicesCount,
        averageTicket: average,
        occupancy: invoicesCount > 0 ? 78 : 0, 
        revenueTrend: "up",
        appointmentsTrend: "up",
        avgTicketTrend: "up",
        chartData: buildChartData(invs || [], period)
      });

    } catch (err) {
      console.error("Error fetching performance data:", err);
      toast.error(t('performance.toast.loadError' as any));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(20, 30, 50);
      doc.text(t('performance.pdf.reportTitle' as any), 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${t('performance.pdf.company' as any)}: ${organization?.name || 'Sistema'}`, 20, 30);
      doc.text(`${t('performance.pdf.period' as any)}: ${t(`performance.periods.${period}` as any)}`, 20, 35);
      doc.text(`${t('performance.pdf.exportDate' as any)}: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 40);

      // Table Data
      const tableData = [
        [t('performance.pdf.mainMetric' as any), t('performance.pdf.value' as any)],
        [t('performance.pdf.totalRevenue' as any), `${metrics.totalRevenue.toLocaleString('es-ES')} ${currencySymbol}`],
        [t('performance.pdf.avgTicket' as any), `${metrics.averageTicket.toLocaleString('es-ES', { maximumFractionDigits: 2 })} ${currencySymbol}`],
        [t('performance.pdf.totalRecords' as any), metrics.totalAppointments.toString()],
        [t('performance.pdf.serviceCapacity' as any), `${metrics.occupancy}%`]
      ];

      autoTable(doc, {
        startY: 50,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [27, 79, 216] } 
      });

      doc.save(`rendimiento_${organization?.name || 'report'}_${t(`performance.periods.${period}` as any)}.pdf`);
      toast.success(t('performance.toast.pdfSuccess' as any));
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error(t('performance.toast.pdfError' as any));
    }
  };

  if (orgLoading || (loading && organization?.id)) return <PageSkeleton />;

  return (
    <DashboardPageContainer animate={false}>
      {/* Ultra-Banner: Performance Command Center */}
      <div 
        className="w-full card-premium p-0 overflow-hidden shadow-2xl shadow-blue-500/5 relative group bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl mb-6"
      >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-indigo-500/5 opacity-50 transition-opacity group-hover:opacity-80" />
          
          <div className="relative py-6 px-4 md:px-8 flex flex-col xl:flex-row items-center justify-between gap-6 font-geist">
            {/* Left: Branding */}
            <div className="flex items-center gap-6 w-full xl:w-auto">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B4FD8] to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                 <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1B4FD8]">{t('performance.growthAnalysis' as any)}</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-500/20">{t('performance.advanced' as any)}</span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                   {t('performance.title' as any)} <span className="text-[#1B4FD8]">{t('performance.subtitle' as any)}</span>
                </h1>
              </div>
            </div>

            {/* Center: Period Selector & Actions */}
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
              {["today", "week", "month"].map((v) => (
                <button
                  key={v}
                  onClick={() => setPeriod(v)}
                  className={cn(
                    "px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all",
                    period === v 
                      ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-500/20" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  )}
                >
                  {t(`performance.periods.${v}` as any)}
                </button>
              ))}
              <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />
              <button 
                onClick={handleDownload}
                className="p-2.5 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-blue-500"
                title={t('performance.exportPDF' as any)}
              >
                <Download size={18} />
              </button>
            </div>

            {/* Right: Real-time Stats */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 bg-white/50 dark:bg-white/5 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5">
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('performance.kpis.revenue' as any)}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
                    {loading ? "..." : `${metrics.totalRevenue.toLocaleString('es-ES')}${currencySymbol}`}
                  </span>
                  <ArrowUpRight size={10} className="text-emerald-500 font-black" />
                </div>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('performance.kpis.avgTicket' as any)}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">
                  {loading ? "..." : `${metrics.averageTicket.toLocaleString('es-ES', { maximumFractionDigits: 0 })}${currencySymbol}`}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('performance.kpis.totalInvoices' as any)}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">
                  {loading ? "..." : metrics.totalAppointments}
                </span>
              </div>
            </div>
          </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-8 card-premium p-8 h-[450px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('performance.charts.salesVsActivity' as any)}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('performance.charts.weeklyDistribution' as any)}</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#1B4FD8]" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('performance.charts.revenue' as any)}</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-200 dark:bg-blue-500/20" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('performance.charts.activity' as any)}</span>
               </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.chartData.length > 0 ? metrics.chartData : REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B4FD8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1B4FD8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111F3A', 
                    border: 'none', 
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    color: '#FFF'
                  }}
                  cursor={{ stroke: '#1B4FD8', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1B4FD8" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="actividad" 
                  stroke="#3B82F6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 card-premium p-8 h-[450px] flex flex-col">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('performance.charts.topItems' as any)}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('performance.charts.periodHighlights' as any)}</p>
          </div>
          <div className="flex-1 w-full flex flex-col items-center justify-center">
             {TOP_ITEMS.length > 0 ? (
               <>
                 <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={TOP_ITEMS}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {TOP_ITEMS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="mt-4 space-y-2 w-full">
                    {TOP_ITEMS.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{item.name}</span>
                        </div>
                        <span className="text-[11px] font-black text-slate-900 dark:text-white">{item.value} {t('performance.charts.units' as any)}</span>
                      </div>
                    ))}
                 </div>
               </>
             ) : (
               <div className="flex flex-col items-center gap-2 text-slate-400">
                 <ShoppingBag size={32} opacity={0.2} />
                 <p className="text-[10px] font-bold uppercase tracking-widest">{t('performance.charts.noData' as any)}</p>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EfficiencyCard 
          icon={<Clock className="text-blue-500" size={18}/>}
          label={t('performance.efficiency.responseTime' as any)}
          value="N/A"
          trend={t('performance.efficiency.pending' as any)}
          trendColor="text-slate-400"
        />
        <EfficiencyCard 
          icon={<Users className="text-blue-500" size={18}/>}
          label={t('performance.efficiency.serviceAttention' as any)}
          value="N/A"
          trend={t('performance.efficiency.pending' as any)}
          trendColor="text-slate-400"
        />
        <EfficiencyCard 
          icon={<Star className="text-blue-500" size={18}/>}
          label={t('performance.efficiency.contactSatisfaction' as any)}
          value="N/A"
          trend={t('performance.efficiency.noVotes' as any)}
          trendColor="text-slate-400"
        />
        <EfficiencyCard 
          icon={<Activity className="text-blue-500" size={18}/>}
          label={t('performance.efficiency.incidentsClaims' as any)}
          value="0%"
          trend={t('performance.efficiency.excellent' as any)}
          trendColor="text-emerald-500"
        />
      </div>
    </DashboardPageContainer>
  );
}

function MetricCard({ title, value, change, trend, description }: any) {
  return (
    <div className="card-premium p-6 md:p-8 flex flex-col group hover:scale-[1.02] transition-transform cursor-pointer">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{value}</h3>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
        )}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </div>
      </div>
      <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-wide">{description}</p>
    </div>
  );
}

function EfficiencyCard({ icon, label, value, trend, trendColor }: any) {
  return (
    <div className="card-premium p-6 md:p-8 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-lg font-black text-slate-900 dark:text-white">{value}</span>
          <span className={cn("text-[9px] font-black", trendColor)}>{trend}</span>
        </div>
      </div>
    </div>
  );
}
