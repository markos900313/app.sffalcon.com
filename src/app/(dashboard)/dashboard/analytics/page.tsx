'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart2, TrendingUp, Users, Calendar, 
  Zap
} from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useOrganization } from '@/context/OrganizationContext';
import { useTheme } from '@/lib/ThemeContext';
import { getModuleLabel } from '@/lib/sectorConfig';
import { DashboardPageContainer, DashboardSection } from "@/components/dashboard/DashboardPageContainer";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useLanguage } from '@/lib/LanguageContext';
import { 
  BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid 
} from 'recharts';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  prefix?: string;
}

const CustomTooltip = ({ active, payload, label, prefix = '' }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0]?.value ?? 0;
    const color = payload[0]?.color ?? payload[0]?.fill ?? '#1B4FD8';
    return (
      <div className="bg-white dark:bg-[#111F3A] p-4 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-xl backdrop-blur-md">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {value} {prefix}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { t, language } = useLanguage();
  const dateLocale = language === 'es' ? es : enUS;
  const supabase = createClient();
  const { organization } = useOrganization();
  const { theme } = useTheme();
  const modules = organization?.sector_config;
  const grupoText = modules?.grupo || '';
  const isSalud = grupoText === '2_salud';
  
  interface KPIStat {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    cat: string;
  }

  interface ChartDataPoint {
    month: string;
    monthNum: string;
    year: string;
    citas: number;
    clientes: number;
    label: string;
  }

  const [stats, setStats] = useState<KPIStat[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const firstDayMonth = startOfMonth(now);

      // KPIs
      const { count: totalClients } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('organization_id', organization?.id);
      const { count: newClientsMonth } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('organization_id', organization?.id).gte('created_at', firstDayMonth.toISOString());
      const { count: apptsMonth } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('organization_id', organization?.id).gte('date', format(firstDayMonth, 'yyyy-MM-dd'));
      const { data: invoices } = await supabase.from('invoices').select('total').eq('organization_id', organization?.id).eq('status', 'pagada').gte('issue_date', format(firstDayMonth, 'yyyy-MM-dd'));
      const totalRevenue = invoices?.reduce((sum: number, inv: { total: number }) => sum + (inv.total || 0), 0) || 0;

      const avgRevenue = apptsMonth > 0 ? (totalRevenue / apptsMonth).toFixed(2) : '0';
      const newClientsRate = totalClients && totalClients > 0 ? ((newClientsMonth || 0) / totalClients * 100).toFixed(1) : '0';

      const kpis = [
        { label: t('analytics.kpis.totalActivity' as any), value: apptsMonth || 0, icon: Calendar, color: 'text-blue-500', cat: 'agenda' },
        { label: t('analytics.kpis.occupancyRate' as any), value: '78%', icon: Zap, color: 'text-amber-500', cat: 'stats' },
        { label: t('analytics.kpis.avgRevenueItem' as any), value: `${avgRevenue}€`, icon: BarChart2, color: 'text-indigo-500', cat: 'finanzas' },
        { label: t('analytics.kpis.newContactsRate' as any), value: `${newClientsRate}%`, icon: TrendingUp, color: 'text-emerald-500', cat: 'clientes' },
      ];
      setStats(kpis);

      const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const d = subMonths(new Date(), 5 - i);
        return { month: format(d, 'MMM', { locale: dateLocale }), monthNum: format(d, 'MM'), year: format(d, 'yyyy'), citas: 0, clientes: 0, label: format(d, 'MMMM', { locale: dateLocale }) };
      });

      const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
      const { data: allAppts } = await supabase.from('appointments').select('date').eq('organization_id', organization?.id).gte('date', format(sixMonthsAgo, 'yyyy-MM-dd'));
      const { data: allClients } = await supabase.from('clients').select('created_at').eq('organization_id', organization?.id).gte('created_at', sixMonthsAgo.toISOString());

      const processedChartData = last6Months.map(m => {
        const citasCount = allAppts?.filter((a: { date: string }) => format(parseISO(a.date), 'MM') === m.monthNum && format(parseISO(a.date), 'yyyy') === m.year).length || 0;
        const clientsCount = allClients?.filter((c: { created_at: string }) => format(parseISO(c.created_at), 'MM') === m.monthNum && format(parseISO(c.created_at), 'yyyy') === m.year).length || 0;
        return { ...m, citas: citasCount, clientes: clientsCount };
      });
      setChartData(processedChartData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchAnalytics();
  }, [organization?.id, language]);

  const finalChartData = useMemo(() => {
    if (isDemo) {
      const months = chartData.length > 0 ? chartData : Array.from({ length: 6 }).map((_, i) => {
        const d = subMonths(new Date(), 5 - i);
        return { month: format(d, 'MMM', { locale: dateLocale }), label: format(d, 'MMMM', { locale: dateLocale }) };
      });
      const exampleValues = [12, 19, 15, 25, 32, 28];
      const clientValues = [4, 6, 5, 8, 12, 10];
      return months.map((m, i) => ({ ...m, citas: exampleValues[i] || 0, clientes: clientValues[i] || 0 }));
    }
    return chartData;
  }, [chartData, isDemo, dateLocale]);

  const monthsWithData = useMemo(() => chartData.filter(d => d.citas > 0 || d.clientes > 0).length, [chartData]);
  const showIndicator = isDemo || monthsWithData >= 2;

  const finalStats = useMemo(() => {
    if (isDemo) {
      const labelCitas = (getModuleLabel as any)(modules, 'appointments', 'CITAS');
      return [
        { label: t('analytics.kpis.registeredContacts' as any), value: 124, icon: Users, color: 'text-blue-500', cat: 'clientes' },
        { label: t('analytics.kpis.newContactsMonth' as any), value: 12, icon: TrendingUp, color: 'text-emerald-500', cat: 'stats' },
        { label: t('analytics.kpis.activityAppointments' as any), value: 48, icon: Calendar, color: 'text-amber-500', cat: 'agenda' },
        { label: t('analytics.kpis.totalRevenue' as any), value: '3.420€', icon: BarChart2, color: 'text-indigo-500', cat: 'finanzas' },
      ];
    }
    return stats;
  }, [stats, isDemo, modules, isSalud, language]);

  if (loading && stats.length === 0) return null;

  return (
    <DashboardPageContainer animate={false}>
      {/* Ultra-Banner: Business Intelligence Center */}
      <div 
        className="w-full card-premium p-0 overflow-hidden shadow-2xl shadow-blue-500/5 relative group bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl mb-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-indigo-500/5 opacity-50 transition-opacity group-hover:opacity-80" />
        
        <div className="relative py-6 px-4 md:px-8 flex flex-col xl:flex-row items-center justify-between gap-6 font-geist">
          {/* Left: Branding */}
          <div className="flex items-center gap-6 w-full xl:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B4FD8] to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
               <BarChart2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1B4FD8]">Business Intelligence</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">{t('analytics.realTime' as any)}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                 {t('analytics.title' as any)}
              </h1>
            </div>
          </div>

          {/* Center: Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
            {!isDemo && (
              <button 
                onClick={() => setIsDemo(true)} 
                className="px-4 py-2 bg-amber-500/10 text-[9px] font-black uppercase text-amber-600 rounded-xl transition-all hover:bg-amber-500/20"
              >
                {t('analytics.viewDemo' as any)}
              </button>
            )}
            <button 
              onClick={() => { setIsDemo(false); fetchAnalytics(); }}
              className={cn(
                "px-4 py-2 text-[9px] font-black uppercase rounded-xl transition-all", 
                !isDemo ? "bg-white dark:bg-blue-600 dark:text-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {isDemo ? t('analytics.realData' as any) : t('analytics.update' as any)}
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />
            <button 
              onClick={() => {
                const doc = new jsPDF();
                doc.setFontSize(20);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(27, 79, 216);
                doc.text(t('analytics.pdf.title' as any), 14, 20);
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(100, 116, 139);
                doc.text(`${t('analytics.pdf.generated' as any)}: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 28);
                doc.setDrawColor(226, 232, 240);
                doc.line(14, 33, 196, 33);
                autoTable(doc, {
                  startY: 40,
                  head: [[t('analytics.pdf.metric' as any), t('analytics.pdf.value' as any)]],
                  body: [
                    [finalStats[0]?.label || t('analytics.kpis.totalActivity' as any), String(finalStats[0]?.value || 0)],
                    [finalStats[1]?.label || t('analytics.kpis.occupancyRate' as any), String(finalStats[1]?.value || '—')],
                    [finalStats[2]?.label || t('analytics.kpis.avgRevenueItem' as any), String(finalStats[2]?.value || '—')],
                    [finalStats[3]?.label || t('analytics.kpis.newContactsRate' as any), String(finalStats[3]?.value || '—')],
                  ],
                  headStyles: { fillColor: [27, 79, 216] },
                  styles: { fontSize: 10, cellPadding: 6 },
                });
                const y = (doc as any).lastAutoTable.finalY + 12;
                autoTable(doc, {
                  startY: y,
                  head: [[t('analytics.pdf.month' as any), t('analytics.pdf.activity' as any), t('analytics.pdf.contacts' as any)]],
                  body: finalChartData.map(d => [d.month, String(d.citas), String(d.clientes)]),
                  headStyles: { fillColor: [27, 79, 216] },
                  styles: { fontSize: 10, cellPadding: 6 },
                });
                doc.save(`analiticas_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
              }} 
              className="px-4 py-2 text-[9px] font-black uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all flex items-center gap-2"
            >
              {t('analytics.exportPDF' as any)}
            </button>
          </div>

          {/* Right: Key KPIs */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 bg-white/50 dark:bg-white/5 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5">
            {finalStats.slice(0, 3).map((stat, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label.split(' ')[0]}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{stat.value}</span>
                    {showIndicator && (
                      <TrendingUp size={10} className="text-emerald-500" />
                    )}
                  </div>
                </div>
                {i < 2 && <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 xl:col-span-7 card-premium p-8 shadow-sm flex flex-col h-[450px]">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8">{t('analytics.activityVolume' as any)}</h4>
          <div className="flex-1 w-full relative">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} stroke={theme === 'dark' ? "#fff" : "#64748b"} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}} />
                  <Tooltip cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} content={<CustomTooltip prefix={t('analytics.records' as any)} />} />
                  <Bar dataKey="citas" fill="#1B4FD8" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-12 xl:col-span-5 card-premium p-8 shadow-sm flex flex-col h-[450px]">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8">{t('analytics.growth' as any)}</h4>
          <div className="flex-1 w-full relative">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={finalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} stroke={theme === 'dark' ? "#fff" : "#64748b"} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}} />
                  <Tooltip cursor={{ stroke: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', strokeWidth: 2 }} content={<CustomTooltip prefix={t('analytics.contacts' as any)} />} />
                  <Area type="monotone" dataKey="clientes" stroke="#10B981" strokeWidth={3} fillOpacity={0.3} fill="#10B981" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </DashboardPageContainer>
  );
}
