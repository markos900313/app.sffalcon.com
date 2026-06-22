"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  TrendingUp, Users, Calendar, FileText, ChevronRight,
  MessageSquare, Bot, Briefcase,
  ArrowUpRight, ArrowDownRight, Building2,
  Cpu, Wallet, Coins, Plus, List, ArrowRight,
  Clock, TrendingDown, Crown,
  Lock, Mail, CalendarCheck, Package, FileSearch, UserCheck,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
const DashboardSidebar = dynamic(() => import("@/components/dashboard/home/DashboardSidebar"), { ssr: false });
const OnboardingModal = dynamic(() => import("@/components/dashboard/onboarding/OnboardingModal"), { ssr: false });

const SubscriptionModal = dynamic(() => import("@/components/dashboard/settings/SubscriptionModal"), { ssr: false });
import Link from "next/link";
import { useOrganization } from "@/context/OrganizationContext";
import { usePlan, useTrialStats } from "@/hooks/usePlan";
import { useTheme } from "@/lib/ThemeContext";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLanguage } from "@/lib/LanguageContext";
import {
  getModuleLabel,
  getModuleEnabled
} from "@/lib/sectorConfig";

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });

const formatCurrency = (value: number, currencyCode: string = 'EUR') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value).replace(/\s/g, '');
};

export default function DashboardPage() {
  const supabase = createClient();
  const { organization, loading: orgLoading } = useOrganization();
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    financeHome: any[];
    financeBiz: any[];
    clients: any[];
    appointments: any[];
    invoices: any[];
    comms: any[];
    projects: any[];
    messages: any[];
    inventory: any[];
    org: any;
    user: any;
    profile?: any;
    apiConfigs: any[];
    agentLogs: any[];
  }>({
    financeHome: [],
    financeBiz: [],
    clients: [],
    appointments: [],
    invoices: [],
    comms: [],
    projects: [],
    messages: [],
    inventory: [],
    org: { auto_reply_enabled: false },
    user: null,
    apiConfigs: [],
    agentLogs: []
  });

  const { plan, trialEndsAt, createdAt, isTrialExpired, loading: planLoading } = usePlan();

  useEffect(() => {
    // Check using organization context instead of usePlan
    if (organization && organization.onboarding_completed === false) {
      setShowOnboarding(true);
    }
  }, [organization]);

  useEffect(() => {
    async function fetchAll() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Obtener la organización primero para usar su ID en el resto de las consultas
        const { data: orgData } = await supabase.from('organizations').select('*').limit(1).single();
        const orgId = orgData?.id;

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

        const [
          financeHome,
          financeBiz,
          clients,
          appointments,
          invoices,
          comms,
          projects,
          messages,
          inventory,
          sessionProfile,
          apiConfigs,
          agentLogs
        ] = await Promise.all([
          supabase.from('finance_entries').select('*').eq('organization_id', orgId),
          supabase.from('business_entries').select('*').eq('organization_id', orgId),
          supabase.from('clients').select('*').eq('organization_id', orgId),
          supabase.from('appointments').select('*, clients(name)').eq('organization_id', orgId),
          supabase.from('invoices').select('*').eq('organization_id', orgId),
          supabase.from('communications').select('*').eq('organization_id', orgId).order('updated_at', { ascending: false }),
          supabase.from('projects').select('*, clients(name)').eq('organization_id', orgId).order('created_at', { ascending: false }),
          supabase.from('messages').select('*, communications!inner(organization_id)').eq('communications.organization_id', orgId).gte('created_at', startOfMonth),
          supabase.from('inventory_items').select('*'),
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('api_configs').select('*').limit(1),
          supabase.from('agent_logs').select('*').order('created_at', { ascending: false }).limit(50)
        ]);
        console.log('INVOICES DATA:', invoices.data, 'ORG ID:', orgId)

        setData({
          financeHome: financeHome.data || [],
          financeBiz: financeBiz.data || [],
          clients: clients.data || [],
          appointments: appointments.data || [],
          invoices: invoices.data || [],
          comms: comms.data || [],
          projects: projects.data || [],
          messages: messages.data || [],
          inventory: inventory.data || [],
          org: orgData || { auto_reply_enabled: false },
          user: user,
          profile: sessionProfile.data,
          apiConfigs: apiConfigs.data || [],
          agentLogs: agentLogs.data || []
        } as any);
      } catch (err) {
        // Los logs se mantienen en silencio para producción
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const stats = useMemo(() => {
    if (loading) return null;

    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // 1. Clientes
    const activeClientsTotal = data.clients.length;
    const clientsLastWeekCount = data.clients.filter(c => new Date(c.created_at) < oneWeekAgo).length;
    const clientsTrend: 'up' | 'down' | 'none' = activeClientsTotal > clientsLastWeekCount ? 'up' : 'none';
    const clientsPerc = clientsLastWeekCount > 0 ? Math.round(((activeClientsTotal - clientsLastWeekCount) / clientsLastWeekCount) * 100) : 100;

    // 2. Proyectos
    const activeProjectsCount = data.projects.filter(p => p.status === 'activo').length;
    const projectsValue = activeProjectsCount > 0 ? activeProjectsCount : data.projects.length;

    // 3. Facturación
    const billingCurrent = data.invoices.filter(i => {
      const d = new Date(i.issue_date || i.date || i.created_at);
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    }).reduce((s, i) => s + Number(i.total || i.amount || 0), 0);

    // 4. Comunicaciones
    const totalComms = data.comms.length;
    const commsLastMonthCount = data.comms.filter(c => new Date(c.updated_at).getMonth() + 1 === lastMonth).length;
    const commsPerc = commsLastMonthCount > 0 ? Math.round(((totalComms - commsLastMonthCount) / commsLastMonthCount) * 100) : 100;
    const commsTrend: 'up' | 'down' | 'none' = totalComms > commsLastMonthCount ? 'up' : 'none';

    // 5. Citas
    const apptsTodayCount = data.appointments.filter(a => a.date === todayStr).length;
    const apptsThisMonth = data.appointments.filter(a => new Date(a.date).getMonth() + 1 === currentMonth).length;
    const apptsLastMonthCount = data.appointments.filter(a => new Date(a.date).getMonth() + 1 === lastMonth).length;
    const apptsPerc = apptsLastMonthCount > 0 ? Math.round(((apptsThisMonth - apptsLastMonthCount) / apptsLastMonthCount) * 100) : 100;
    const apptsTrend: 'up' | 'down' | 'none' = apptsThisMonth > apptsLastMonthCount ? 'up' : 'none';

    // 6. Agentes IA
    const aiMessagesThisMonth = data.messages.filter(m => m.sender === 'ai').length;
    const totalMessagesThisMonth = data.messages.length;
    const aiApptsThisMonth = data.appointments.filter(a => a.created_by === 'ai' && new Date(a.created_at).getMonth() + 1 === currentMonth).length;

    // 7. Finanzas
    const hSet = data.financeHome.filter(f => Number(f.month) === currentMonth && 
      new Date(f.created_at).getFullYear() === currentYear);
    const hIng = hSet.filter(f => f.type === 'ingreso').reduce((s, f) => s + Number(f.amount), 0);
    const hGas = hSet.filter(f => f.type !== 'ingreso').reduce((s, f) => s + Number(f.amount), 0);
    const bSet = data.financeBiz.filter(f => Number(f.month) === currentMonth && 
      new Date(f.created_at).getFullYear() === currentYear);
    const bIng = bSet.filter(f => (f.type === 'ingreso_cliente' || f.type === 'ingreso')).reduce((s, f) => s + Number(f.amount), 0);
    const bGas = bSet.filter(f => (f.type !== 'ingreso_cliente' && f.type !== 'ingreso')).reduce((s, f) => s + Number(f.amount), 0);

    // 8. Evolución
    const evolution = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const inc = [
        ...data.financeHome, 
        ...data.financeBiz,
        ...data.invoices.map(i => ({ 
          month: new Date(i.issue_date || i.created_at).getMonth() + 1,
          amount: i.total || i.amount || 0,
          type: 'ingreso',
          created_at: i.issue_date || i.created_at
        }))
      ].filter(f => Number(f.month) === m && 
        new Date(f.created_at || new Date()).getFullYear() === y && 
        (f.type === 'ingreso' || f.type === 'ingreso_cliente'))
      .reduce((s, f) => s + Number(f.amount), 0);
      const exp = data.financeHome.concat(data.financeBiz).filter(f => Number(f.month) === m && 
        new Date(f.created_at).getFullYear() === y && !(f.type === 'ingreso' || f.type === 'ingreso_cliente')).reduce((s, f) => s + Number(f.amount), 0);
      return { name: format(d, 'MMM', { locale: language === 'en' ? enUS : es }).toUpperCase(), ingresos: inc, gastos: exp };
    });

    const upcomingAppts = data.appointments
      .filter(a => a.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
      .slice(0, 3);

    const recentActivity = data.comms.slice(0, 4);

    const allFinances = [...data.financeHome, ...data.financeBiz];
    const uniqueMonths = new Set(allFinances.map(e => `${e.year}-${e.month}`));
    const showGrowth = uniqueMonths.size >= 2;

    // 9. Inventario (Restauración)
    const lowStockCount = data.inventory.filter(i => i.stock <= i.stock_minimo).length;

    // 10. Ultra Stats (Automation score)
    const totalMensajesCliente = data.comms.length;
    const respondidosPorIA = data.comms.filter(
      (c: any) => c.responded_by === 'ai'
    ).length;
    const automationRateReal = totalMensajesCliente > 0 
      ? Math.round((respondidosPorIA / totalMensajesCliente) * 100) 
      : 0;

    return {
      activeClientsTotal, clientsPerc, clientsTrend,
      projectsValue, billingCurrent, totalComms, commsPerc, commsTrend,
      apptsTodayCount, apptsThisMonth, apptsPerc, apptsTrend,
      aiMessagesThisMonth, totalMessagesThisMonth, automationRate: automationRateReal, aiApptsThisMonth,
      hIng, hGas, hBal: hIng - hGas,
      bIng, bGas, bBal: bIng - bGas,
      evolution, upcomingAppts, recentActivity,
      topProjects: data.projects.slice(0, 3),
      showGrowth,
      lowStockCount,
      reservationLogs: 0,
      apiActive: (data as any).apiConfigs?.length > 0
    };
  }, [data, loading, todayStr, currentMonth, currentYear]);

  const trialStats = useTrialStats(trialEndsAt, createdAt);
  const isGlobalLoading = loading || !stats;

  const modules = organization?.sector_config;
  const grupoNum = modules?.grupo ? parseInt(modules.grupo.split('_')[0]) : 1;

  if (loading) return null;

  return (
    <>
      {stats && (
        <div className="flex flex-col gap-6 w-full max-w-full text-[var(--text-primary)] overflow-x-hidden">
          {/* Header / Greeting */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4 md:px-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight leading-none mb-2">
                {new Date().getHours() < 12 ? t('dashboard.goodMorning' as any) : new Date().getHours() < 20 ? t('dashboard.goodAfternoon' as any) : t('dashboard.goodEvening' as any)}, {(data.profile?.full_name || data.profile?.name || data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || data.user?.email?.split('@')[0] || t('dashboard.user' as any)).split(' ')[0]}
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                  {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6 relative w-full">
            {/* Bloqueo por Expiración */}
            {isTrialExpired && (
              <div className="absolute inset-0 z-50 backdrop-blur-md bg-black/30 flex items-center justify-center rounded-[32px]">
                <div className="bg-[var(--bg-card)] p-10 rounded-[40px] border border-[var(--border-card)] shadow-2xl flex flex-col items-center text-center max-w-md mx-4 animate-in zoom-in duration-300">
                  <div className="w-20 h-20 rounded-[28px] bg-red-500/10 flex items-center justify-center mb-8">
                    <Lock className="w-10 h-10 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3 tracking-tight lowercase">
                    {t('dashboard.trialEndedTitle' as any)}
                  </h2>
                  <p className="text-[var(--text-secondary)] mb-10 leading-relaxed font-medium">
                    {t('dashboard.trialEndedDesc' as any)}
                  </p>
                  <div className="w-full flex flex-col gap-3">
                    <Link
                      href="/dashboard/settings/plan"
                      className="w-full bg-[#1B4FD8] hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
                    >
                      {t('dashboard.viewPlans' as any)}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => window.location.href = 'mailto:soporte@soportefacil.com'}
                      className="w-full py-4 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {t('dashboard.contactSupport' as any)}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* COLUMNA IZQUIERDA (70%) */}
            <div className="flex flex-col gap-6">

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <CompactKPI
                  title={t('dashboard.kpis.appointments' as any)}
                  value={stats.apptsThisMonth}
                  icon={<CalendarCheck size={20} />}
                  category="agenda"
                  label={t('dashboard.kpis.appointmentsLabel' as any)}
                  showGrowth={stats.showGrowth}
                />
                <CompactKPI
                  title={t('dashboard.kpis.contacts' as any)}
                  value={stats.activeClientsTotal}
                  icon={<Users size={20} />}
                  category="clientes"
                  label={t('dashboard.kpis.contactsLabel' as any)}
                  percentage={stats.clientsPerc}
                  trend={stats.clientsTrend}
                  showGrowth={stats.showGrowth}
                />
                <CompactKPI
                  title={t('dashboard.kpis.messages' as any)}
                  value={data.comms.filter((c: any) => !c.is_read).length}
                  icon={<MessageSquare size={20} />}
                  category="mensajes"
                  label={t('dashboard.kpis.messagesLabel' as any)}
                  showGrowth={stats.showGrowth}
                />
                <CompactKPI
                  title={t('dashboard.kpis.billing' as any)}
                  value={formatCurrency(stats.billingCurrent, data.org?.currency)}
                  icon={<FileText size={20} />}
                  category="finanzas"
                  label={t('dashboard.kpis.billingLabel' as any)}
                  showGrowth={stats.showGrowth}
                />
              </div>
              {/* Evolución Financiera (Bloqueado en gratuito) */}
              <div className="relative card-premium card-finanzas p-8 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="card-titulo">{t('dashboard.financeEvolution' as any)}</h3>
                  </div>
                  {true && (
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1B4FD8]" />
                        <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">{t('dashboard.income' as any)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                        <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">{t('dashboard.expenses' as any)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className={cn("h-[300px] w-full")}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.evolution}>
                      <CartesianGrid strokeDasharray="0" vertical={false} stroke={theme === 'dark' ? "rgba(255,255,255,0.05)" : "#F1F5F9"} />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#94A3B8" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        cursor={{ stroke: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 2 }}
                        contentStyle={{
                          borderRadius: '16px',
                          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          fontSize: '11px',
                          backgroundColor: theme === 'dark' ? '#111F3A' : '#fff',
                          color: theme === 'dark' ? '#fff' : '#000'
                        }}
                      />
                      <Line type="monotone" dataKey="ingresos" stroke="#1B4FD8" strokeWidth={4} dot={{ r: 4, fill: '#1B4FD8', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="gastos" stroke="#EF4444" strokeWidth={4} dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Últimos Mensajes */}
              <div className="card-premium card-mensajes p-8 flex flex-col min-h-[400px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="card-titulo">{t('dashboard.latestMessages' as any)}</h3>
                  <Link href="/dashboard/communications" className="text-blue-600 hover:text-blue-700">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                <div className="flex-1 space-y-4">
                  {stats.recentActivity.length > 0 ? (
                    stats.recentActivity.slice(0, 4).map((msg, i) => (
                      <div key={i} className="flex items-center gap-5 p-4 rounded-2xl border border-[var(--border-card)] hover:bg-[var(--bg-page)] transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                          <MessageSquare size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[var(--text-primary)] truncate mb-1">
                            {msg.contact_name || msg.contact || t('dashboard.contactFallback' as any)}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] truncate leading-relaxed">
                            {msg.last_message_content || msg.content || msg.last_message || t('dashboard.newConversation' as any)}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-[var(--text-secondary)]/30 group-hover:text-blue-500 transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[var(--border-card)] rounded-3xl">
                      <Mail className="w-10 h-10 text-[var(--text-secondary)]/20 mb-4" />
                      <p className="text-sm text-[var(--text-secondary)] max-w-[200px] leading-relaxed">
                        {t('dashboard.noMessages' as any)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA (30%) */}
            <div className="flex flex-col gap-6">

              {/* Próximas Citas */}
              <div className="card-premium card-agenda p-8 flex flex-col min-h-[350px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="card-titulo">{t('dashboard.nextActivity' as any)}</h3>
                  <Link href="/dashboard/appointments" className="text-blue-600 hover:text-blue-700">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                <div className="flex-1 space-y-4">
                  {stats.upcomingAppts.length > 0 ? (
                    stats.upcomingAppts.slice(0, 4).map((appt, i) => (
                      <div key={i} className="flex items-center gap-5 p-4 rounded-2xl border border-[var(--border-card)] hover:bg-[var(--bg-page)] transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Calendar size={20} className="text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[var(--text-primary)] truncate mb-1">
                            {appt.customer_name || appt.title || appt.clients?.name || t('dashboard.noName' as any)}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest">
                            {new Date(appt.date).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'short' })} • {appt.time}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-[var(--text-secondary)]/30 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[var(--border-card)] rounded-3xl">
                      <CalendarCheck className="w-10 h-10 text-[var(--text-secondary)]/20 mb-4" />
                      <p className="text-sm text-[var(--text-secondary)] max-w-[200px] leading-relaxed">
                        {t('dashboard.noAppointments' as any)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* FIX 2: RESUMEN DEL MES */}
              <div className="card-premium card-resumen p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                <h3 className="card-titulo mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0891B2]" />
                  {t('dashboard.monthSummary' as any)}
                </h3>
                <div className="space-y-4">
                  {[
                    { label: t('dashboard.newContacts' as any), value: stats.activeClientsTotal || '0' },
                    { label: t('dashboard.registeredActivity' as any), value: stats.apptsThisMonth || '0' },
                    { label: t('dashboard.receivedMessages' as any), value: stats.totalComms || '0' },
                    { label: t('dashboard.responseRate' as any), value: data.comms.length > 0 
                      ? Math.round((data.comms.filter((c:any) => 
                          c.responded_by === 'ai' || c.responded_by === 'human'
                        ).length / data.comms.length) * 100) + '%'
                      : '—'
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-[var(--text-secondary)] font-medium">{item.label}</span>
                      <span className="text-[var(--text-primary)] font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FIX 2: ACCIONES RÁPIDAS */}
              <div className="card-premium p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                <h3 className="card-titulo mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1B4FD8]" />
                  {t('dashboard.quickActions' as any)}
                </h3>
                <div className="flex flex-col gap-3">
                  <Link href="/dashboard/invoices" className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs font-bold text-[var(--text-primary)]/80 hover:bg-blue-500/10 transition-colors group">
                    <FileText className="w-4 h-4 text-blue-500" />
                    {t('dashboard.newInvoice' as any)}
                  </Link>
                  <Link href="/dashboard/clients" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs font-bold text-[var(--text-primary)]/80 hover:bg-emerald-500/10 transition-colors group">
                    <Users className="w-4 h-4 text-emerald-500" />
                    {t('dashboard.viewContacts' as any)}
                  </Link>
                  <Link href="/dashboard/inventory" className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs font-bold text-[var(--text-primary)]/80 hover:bg-amber-500/10 transition-colors group">
                    <Package className="w-4 h-4 text-amber-500" />
                    {t('dashboard.manageCatalog' as any)}
                  </Link>
                  <div className="h-px bg-[var(--border-card)] my-1" />
                  <Link href="/dashboard/clients" className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-page)] text-xs font-bold text-[var(--text-primary)]/80 hover:bg-blue-500/10 transition-colors group">
                    <Plus className="w-4 h-4 text-[#1B4FD8] group-hover:rotate-90 transition-transform" />
                    {t('dashboard.addNewContact' as any)}
                  </Link>
                  <Link href="/dashboard/appointments" className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-page)] text-xs font-bold text-[var(--text-primary)]/80 hover:bg-emerald-500/10 transition-colors group">
                    <Plus className="w-4 h-4 text-emerald-500 group-hover:rotate-90 transition-transform" />
                    {t('dashboard.addNewAppointment' as any)}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
      />
    </>
  );
}

function CompactKPI({ title, value, icon, variant = "default", locked, unlockTip, category, percentage, trend, label, showGrowth }: any) {
  if (variant === "compact") {
    return (
      <div className="px-[16px] py-[16px] bg-transparent flex flex-col group transition-all hover:bg-slate-50/50 dark:hover:bg-white/5 relative">
        <p className="kpi-label mb-1">{title}</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-end">
            <h3 className="kpi-numero leading-none !text-[20px] text-[var(--text-primary)]">{value}</h3>
            {percentage !== undefined && showGrowth && (
              <span className={cn(
                "text-[10px] font-bold flex items-center gap-0.5",
                trend === 'up' ? "text-emerald-500" : trend === 'down' ? "text-rose-500" : "text-[var(--text-secondary)]"
              )}>
                {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{Math.abs(percentage)}%
              </span>
            )}
          </div>
          {locked ? (
            <span className="text-[8px] font-black bg-[var(--bg-page)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded shadow-sm border border-[var(--border-card)]">
              {unlockTip}
            </span>
          ) : (
            <div className="text-[var(--text-secondary)]/30 group-hover:scale-110 transition-transform">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "card-premium p-6 flex flex-col justify-between group transition-all hover:bg-[var(--bg-page)] bg-[var(--bg-card)] border-[var(--border-card)]",
      category && `card-${category}`
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[var(--text-secondary)]/50 group-hover:scale-110 transition-transform">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="kpi-label mb-1 uppercase tracking-[0.2em] text-[var(--text-secondary)] font-black text-[9px]">{title}</p>
          <h3 className="kpi-numero tracking-tighter leading-none text-[var(--text-primary)]" title={String(value)}>{value}</h3>
          {label && <p className="text-[10px] font-medium text-[var(--text-secondary)]/60 mt-2 uppercase tracking-wide">{label}</p>}
        </div>
        {percentage !== undefined && showGrowth && (
          <div className={cn(
            "px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1",
            trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : trend === 'down' ? "bg-rose-500/10 text-rose-500" : "bg-[var(--bg-page)] text-[var(--text-secondary)]"
          )}>
            {trend === 'up' ? <TrendingUp size={10} /> : trend === 'down' ? <TrendingDown size={10} /> : null}
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{Math.abs(percentage)}%
          </div>
        )}
      </div>
    </div>
  );
}



// ✅ app/dashboard/page.tsx — responsive completado
