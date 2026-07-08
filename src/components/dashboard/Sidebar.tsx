"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Mail,
  Users,
  CalendarCheck,
  Settings,
  TrendingUp,
  FileText,
  ClipboardList,
  LayoutDashboard,
  Briefcase,
  Bot,
  Globe,
  Package,
  Clock,
  BarChart3,
  Megaphone,
  Repeat,
  FileSearch,
  UserCheck,
  Key,
  UserPlus,
  Folder,
  X,
  LogOut,
  Check,
  Plus,
  Minus,
  Languages
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/contexts/SidebarContext";
import { useOrganization } from "@/context/OrganizationContext";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/lib/LanguageContext";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Home, Mail, Users, CalendarCheck, Settings,
  TrendingUp, FileText, LayoutDashboard, Briefcase, Bot,
  Folder, Package, Clock, BarChart3, Megaphone, Repeat,
  FileSearch, UserCheck, Key, UserPlus, Globe, ClipboardList
};

const NAV_SECTIONS = [
  {
    id: 'principal',
    titleKey: 'sections.principal',
    items: [
      { key: 'dashboard', path: '/dashboard', labelKey: 'sidebar.home', icon: 'Home' },
      { key: 'communications', path: '/dashboard/communications', labelKey: 'sidebar.communications', icon: 'Mail' },
      { key: 'web', path: '/dashboard/web', labelKey: 'sidebar.web', icon: 'Globe' },
    ]
  },
  {
    id: 'crm',
    titleKey: 'sections.crm',
    items: [
      { key: 'appointments', path: '/dashboard/appointments', labelKey: 'sidebar.appointments', icon: 'CalendarCheck' },
      { key: 'clients', path: '/dashboard/clients', labelKey: 'sidebar.clients', icon: 'Users' },
      { key: 'leads', path: '/dashboard/leads', labelKey: 'sidebar.leads', icon: 'UserPlus' },
      { key: 'pipeline', path: '/dashboard/pipeline', labelKey: 'sidebar.pipeline', icon: 'Folder' },
    ]
  },
  {
    id: 'negocio',
    titleKey: 'sections.negocio',
    items: [
      { key: 'inventory', path: '/dashboard/inventory', labelKey: 'sidebar.inventory', icon: 'Package' },
      { key: 'products', path: '/dashboard/products', labelKey: 'sidebar.products', icon: 'Package' },
      { key: 'projects', path: '/dashboard/projects', labelKey: 'sidebar.projects', icon: 'Briefcase' },
    ]
  },
  {
    id: 'equipo',
    titleKey: 'sections.equipo',
    items: [
      { key: 'team', path: '/dashboard/team', labelKey: 'sidebar.team', icon: 'Users' },
      { key: 'fichaje', path: '/dashboard/fichaje', labelKey: 'sidebar.fichaje', icon: 'UserCheck' },
      { key: 'shifts', path: '/dashboard/shifts', labelKey: 'sidebar.shifts', icon: 'Clock' },
    ]
  },
  {
    id: 'economia',
    titleKey: 'sections.economia',
    items: [
      { key: 'finances', path: '/dashboard/finances', labelKey: 'sidebar.finances', icon: 'TrendingUp' },
      { key: 'estimates', path: '/dashboard/presupuestos', labelKey: 'sidebar.estimates', icon: 'ClipboardList' },
      { key: 'invoices', path: '/dashboard/invoices', labelKey: 'sidebar.invoices', icon: 'FileText' },
    ]
  },
  {
    id: 'analisis',
    titleKey: 'sections.analisis',
    items: [
      { key: 'analytics', path: '/dashboard/analytics', labelKey: 'sidebar.analytics', icon: 'LayoutDashboard' },
      { key: 'performance', path: '/dashboard/performance', labelKey: 'sidebar.performance', icon: 'BarChart3' },
    ]
  },
  {
    id: 'agentes',
    title: 'Agentes IA',
    isIA: true,
    hidden: true,
    items: [
      { key: 'agents', path: '/dashboard/agents', label: 'SF IA', icon: 'Bot', hidden: true },
      { key: 'agent_reservations', path: '/dashboard/agent-reservations', label: 'Gestor de Agenda', icon: 'Repeat', hidden: true },
      { key: 'agent_marketing', path: '/dashboard/agent-marketing', label: 'Agente Marketing', icon: 'Megaphone', hidden: true },
      { key: 'agent_accounting', path: '/dashboard/agent-accounting', label: 'Agente Contable', icon: 'FileSearch', hidden: true },
      { key: 'agent_followup', path: '/dashboard/agent-followup', label: 'Agente Seguimiento', icon: 'UserCheck', hidden: true },
    ]
  },
  {
    id: 'sistema',
    title: 'Sistema',
    hidden: true,
    items: [
      { key: 'api_settings', path: '/dashboard/api-settings', label: 'API', icon: 'Key', hidden: true },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { isOpen, setIsOpen } = useSidebar();
  const { plan } = usePlan();
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);

  const getSectionTitle = (section: any) => {
    if (section.titleKey) return t(section.titleKey as any);
    if (section.id === 'agentes') return language === 'en' ? 'AI Agents' : 'Agentes IA';
    if (section.id === 'sistema') return language === 'en' ? 'System' : 'Sistema';
    return section.title;
  };

  const getItemLabel = (item: any) => {
    if (item.key === 'estimates') return language === 'en' ? 'Estimates' : 'Presupuestos';
    if (item.labelKey) return t(item.labelKey as any);
    if (item.key === 'agents') return language === 'en' ? 'SF AI' : 'SF IA';
    if (item.key === 'agent_reservations') return language === 'en' ? 'Schedule Agent' : 'Gestor de Agenda';
    if (item.key === 'agent_marketing') return language === 'en' ? 'Marketing Agent' : 'Agente Marketing';
    if (item.key === 'agent_accounting') return language === 'en' ? 'Accounting Agent' : 'Agente Contable';
    if (item.key === 'agent_followup') return language === 'en' ? 'Follow-up Agent' : 'Agente Seguimiento';
    if (item.key === 'api_settings') return 'API';
    return item.label;
  };
  
  // Estado para las secciones colapsables
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    principal: true,
    crm: true,
    negocio: true,
    equipo: true,
    economia: true,
    analisis: true,
    agentes: true,
    sistema: true
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url, full_name')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const closeSidebar = () => setIsOpen(false);

  const activeItemClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400";
  const inactiveItemClass = "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5";

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsSubModalOpen(true);
    window.addEventListener('openUpgradeModal', handler);
    return () => window.removeEventListener('openUpgradeModal', handler);
  }, []);

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: any) => n[0]).join('').slice(0, 2).toUpperCase()
    : "??";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside className={cn(
        "sidebar-container h-[100dvh] bg-[var(--bg-sidebar)] border-r border-[var(--border-sidebar)] flex flex-col fixed left-0 top-0 z-[110] transition-all duration-300",
        "w-full max-w-[280px] -translate-x-full",
        isOpen && "translate-x-0",
        "md:w-16 md:translate-x-0",
        "lg:w-56",
        "xl:w-60"
      )}>
        {/* CABECERA - LOGO SF + AVATAR */}
        <div className="h-16 lg:h-20 px-4 flex items-center justify-between border-b border-[var(--border-sidebar)]">
          <div className="flex items-center justify-start">
            <div className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-full border-2 border-white bg-[#1e3a5f] overflow-hidden flex items-center justify-center shrink-0 shadow-lg transition-transform hover:scale-105"
                style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.15)' }}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-bold">{initials}</span>
                )}
              </div>
              <div className="flex items-center gap-2 block md:hidden lg:flex">
                <span className="text-white text-xl font-bold italic tracking-tight" style={{ letterSpacing: '0.05em', fontFamily: 'Arial, sans-serif' }}>SF</span>
                <span className="text-[10px] font-medium" style={{ textTransform: 'none', color: '#A3B3D9', letterSpacing: '0' }}>Gestor Empresarial</span>
              </div>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden p-2 text-slate-400 hover:text-slate-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* NAVEGACIÓN - SECCIONES CON SCROLL */}
        <nav className="flex-1 min-h-0 px-2 lg:px-4 flex flex-col gap-6 py-6 overflow-y-auto scrollbar-hide">
          {NAV_SECTIONS.filter(s => !s.hidden).map((section) => {
            const isExpanded = expandedSections[section.id];
            
            return (
              <div key={section.id} className="flex flex-col gap-1">
                <div 
                  className="px-4 flex items-center justify-between mb-1 cursor-pointer group/title"
                  onClick={() => toggleSection(section.id)}
                >
                  <h3 className="block lg:block md:hidden text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-[0.15em] transition-colors group-hover/title:text-blue-500">
                    {getSectionTitle(section)}
                  </h3>
                  <div className="block lg:block md:hidden text-slate-400/70 group-hover/title:text-blue-500 transition-colors">
                    {isExpanded ? <Minus size={10} /> : <Plus size={10} />}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden flex flex-col gap-1"
                    >
                      {section.items.filter((i: any) => !i.hidden).map((item) => {
                        const isActive = pathname === item.path;
                        const IconComponent = ICON_MAP[item.icon] || LayoutDashboard;

                        return (
                          <Link
                            key={item.key}
                            href={item.path}
                            prefetch={true}
                            onClick={closeSidebar}
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 transition-all rounded-xl group h-11",
                              "md:justify-center md:px-2",
                              "lg:justify-start lg:px-4",
                              isActive ? activeItemClass : inactiveItemClass
                            )}
                            title={getItemLabel(item)}
                          >
                            <IconComponent className={cn(
                              "w-5 h-5 transition-transform group-hover:scale-110 shrink-0",
                              isActive ? "text-[#1B4FD8]" : "text-[#64748B] dark:text-[#94A3B8]"
                            )} />
                            <span className={cn(
                              "block md:hidden lg:block text-[13px] font-medium tracking-tight truncate",
                              isActive ? "text-blue-600 dark:text-blue-400" : "text-[#64748B] dark:text-[#94A3B8]"
                            )}>
                              {getItemLabel(item)}
                            </span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* PIE DE PÁGINA FIJO - AJUSTES */}
        <div className="p-4 border-t border-[var(--border-sidebar)]">
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className={cn(
              "flex items-center gap-3 px-3 py-3 transition-all rounded-xl group h-11 w-full mb-1",
              "md:justify-center md:px-2",
              "lg:justify-start lg:px-4",
              "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
            )}
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <Languages className="w-5 h-5 transition-transform group-hover:scale-110 shrink-0" />
            <span className="block md:hidden lg:block text-[13px] font-medium tracking-tight truncate">
              {language === 'es' ? 'EN' : 'ES'}
            </span>
          </button>
          <Link
            href="/dashboard/settings"
            onClick={closeSidebar}
            prefetch={true}
            className={cn(
              "flex items-center gap-3 px-3 py-3 transition-all rounded-xl group h-11",
              "md:justify-center md:px-2",
              "lg:justify-start lg:px-4",
              pathname === '/dashboard/settings' ? activeItemClass : inactiveItemClass
            )}
            title={t('sidebar.settings' as any)}
          >
            <Settings className={cn(
              "w-5 h-5 transition-transform group-hover:scale-110 shrink-0",
              pathname === '/dashboard/settings' ? "text-[#1B4FD8]" : "text-[#64748B] dark:text-[#94A3B8]"
            )} />
            <span className={cn(
              "block md:hidden lg:block text-[13px] font-medium tracking-tight truncate",
              pathname === '/dashboard/settings' ? "text-blue-600 dark:text-blue-400" : "text-[#64748B] dark:text-[#94A3B8]"
            )}>
              {t('sidebar.settings' as any)}
            </span>
          </Link>
        </div>
      </aside>

      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
      />
    </>
  );
}

// Subcomponente para el modal con el botón de prueba gratuito
function SubscriptionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const supabase = createClient()
  const { organization } = useOrganization()
  const [loading, setLoading] = useState(false)
  const { language, t } = useLanguage()

  const BENEFITS = [
    t('upgrade.features.crm'),
    language === 'en' ? 'Unlimited bookings and appointments' : 'Reservas y citas sin límites',
    language === 'en' ? 'Smart financial control' : 'Control financiero inteligente',
    t('upgrade.features.ai'),
    language === 'en' ? 'Pro statistics and metrics' : 'Estadísticas y métricas pro'
  ]

  const handleActivateTrial = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/activate-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.success) {
        toast.success(language === 'en' ? '90-day trial activated' : 'Prueba de 90 días activada')
        onClose()
        window.location.reload()
      } else {
        toast.error(data.error || (language === 'en' ? 'Error activating trial' : 'Error al activar la prueba'))
      }
    } catch (err) {
      toast.error(language === 'en' ? 'Connection error' : 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organization?.id,
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
          userId: user?.id
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || (language === 'en' ? 'Error processing payment' : 'Error al procesar el pago'))
      }
    } catch (error) {
      console.error(error)
      toast.error(language === 'en' ? 'Connection error' : 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
          >
            <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between">
              <h2 className="text-[16px] md:text-[17px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">
                {language === 'en' ? 'Activate Pro Plan' : 'Activar Plan Pro'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1E3A5F] rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 md:p-6 space-y-5 md:space-y-6 overflow-y-auto">
              <div className="space-y-2 md:space-y-3">
                <label className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">
                  {language === 'en' ? 'Selected Plan' : 'Plan Seleccionado'}
                </label>
                <div className="bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-xl p-4 md:p-5 flex items-center justify-between group transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20">
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-[14px] md:text-[15px] font-bold text-[#0F172A] dark:text-[#F1F5F9]">SF Gestor Empresarial</p>
                    <p className="text-[11px] md:text-[12px] text-slate-500 dark:text-slate-400">
                      {language === 'en' ? 'Full management & advanced AI' : 'Gestión completa e IA avanzada'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] md:text-[18px] font-black text-[#0F172A] dark:text-[#F1F5F9]">29€</p>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {language === 'en' ? '/ Month' : '/ Mes'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                <label className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">
                  {language === 'en' ? 'Included Benefits' : 'Beneficios Incluidos'}
                </label>
                <div className="space-y-1.5 md:space-y-2">
                  {BENEFITS.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 md:p-3 bg-slate-50 dark:bg-[#111F3A]/50 border border-slate-100 dark:border-[#1E3A5F]/50 rounded-lg md:rounded-xl group hover:bg-slate-100 dark:hover:bg-[#111F3A] transition-colors">
                      <div className="flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/40">
                        <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-500" />
                      </div>
                      <span className="text-[12px] md:text-[13px] text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6 border-t border-slate-100 dark:border-[#1E3A5F] flex flex-col">
              <div className="flex gap-3">
                {!organization?.trial_used && (
                  <button
                    onClick={handleActivateTrial}
                    disabled={loading}
                    className="flex-1 py-2.5 md:py-3 bg-[#10B981] hover:bg-[#059669] text-white text-[13px] md:text-sm font-bold rounded-lg md:rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50"
                  >
                    {language === 'en' ? '90 DAYS FREE' : '90 DÍAS GRATIS'}
                  </button>
                )}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="flex-1 py-2.5 md:py-3 bg-[#1B4FD8] hover:bg-blue-700 text-white text-[13px] md:text-sm font-bold rounded-lg md:rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading ? (language === 'en' ? 'Loading...' : 'Cargando...') : (language === 'en' ? 'Subscribe Plan' : 'Contratar Plan')}
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 mt-4 transition-colors uppercase tracking-widest font-bold"
              >
                {language === 'en' ? 'CANCEL' : 'CANCELAR'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
