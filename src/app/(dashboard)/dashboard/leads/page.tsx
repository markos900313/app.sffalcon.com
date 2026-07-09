'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, Search, Filter, Globe, MessageCircle, Mail, PenLine, 
  Handshake, Share2, MoreHorizontal, Edit, ArrowRightCircle, 
  XCircle, Trash2, Calendar, Phone, Building, Briefcase, ChevronRight,
  TrendingUp, Activity, Flame, Clock, Lock, ArrowRight, RefreshCcw,
  Loader2, Zap
} from 'lucide-react';
import { Lead, LeadEstado, LeadTemperatura, LeadOrigen } from './types';
import { createClient } from '@/lib/supabase/client';
import { useOrganization } from '@/context/OrganizationContext';
import { useTheme } from "@/lib/ThemeContext";
import { DashboardPageContainer, DashboardSection } from "@/components/dashboard/DashboardPageContainer";
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import PageSkeleton from "@/components/dashboard/ui/PageSkeleton";
import LeadModal from './LeadModal';
import ConvertModal from './ConvertModal';
import DiscardModal from './DiscardModal';
import { useLanguage } from '@/lib/LanguageContext';

// --- CONFIGURACIÓN DE ESTILOS ---

const temperaturaStyles: Record<string, { bg: string; text: string; labelKey: string }> = {
  frio: { bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', labelKey: 'leads.temperatures.frio' },
  tibio: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', labelKey: 'leads.temperatures.tibio' },
  caliente: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', labelKey: 'leads.temperatures.caliente' },
};

const estadoStyles: Record<string, { bg: string; text: string; labelKey: string }> = {
  nuevo: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', labelKey: 'leads.status.nuevo' },
  contactado: { bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', labelKey: 'leads.status.contactado' },
  cualificado: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', labelKey: 'leads.status.cualificado' },
  descartado: { bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-500', labelKey: 'leads.status.descartado' },
  convertido: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', labelKey: 'leads.status.convertido' },
};

const origenConfig: Record<string, any> = {
  web: { icon: Globe, labelKey: 'leads.origins.web' },
  whatsapp: { icon: MessageCircle, labelKey: 'leads.origins.whatsapp' },
  email: { icon: Mail, labelKey: 'leads.origins.email' },
  manual: { icon: PenLine, labelKey: 'leads.origins.manual' },
  referido: { icon: Handshake, labelKey: 'leads.origins.referido' },
  redes_sociales: { icon: Share2, labelKey: 'leads.origins.socialNetworksShort' },
};

export default function LeadsPage() {
  const supabase = createClient();
  const { organization, loading: orgLoading } = useOrganization();
  const { t } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterTemp, setFilterTemp] = useState<string>('todos');
  const [filterOrigen, setFilterOrigen] = useState<string>('todos');
  
  // Modal states
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 25;

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error(t('leads.toast.loadError' as any));
    } finally {
      setLoading(false);
    }
  };

  const reactivateLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ estado: 'nuevo', motivo_descarte: null })
        .eq('id', id);
      if (error) throw error;
      toast.success(t('leads.toast.reactivateSuccess' as any));
      fetchLeads();
    } catch (error) {
      toast.error(t('leads.toast.reactivateError' as any));
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm(t('leads.deleteConfirm' as any))) return;
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('leads.toast.deleteSuccess' as any));
      fetchLeads();
    } catch (error) {
      toast.error(t('leads.toast.deleteError' as any));
    }
  };

  // --- CÁLCULOS KPI ---
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const activos = leads.filter(l => l.estado !== 'convertido' && l.estado !== 'descartado').length;
    const calientes = leads.filter(l => l.temperatura === 'caliente').length;
    const convertidos = leads.filter(l => l.estado === 'convertido').length;
    const total = leads.length;
    const tasaConversion = total > 0 ? (convertidos / total) * 100 : 0;
    const pendientesHoy = leads.filter(l => l.proximo_seguimiento === today).length;

    return { activos, calientes, tasaConversion, pendientesHoy };
  }, [leads]);

  // --- FILTRADO Y BÚSQUEDA ---
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = 
        l.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (l.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      const matchesEstado = filterEstado === 'todos' || l.estado === filterEstado;
      const matchesTemp = filterTemp === 'todos' || l.temperatura === filterTemp;
      const matchesOrigen = filterOrigen === 'todos' || l.origen === filterOrigen;

      return matchesSearch && matchesEstado && matchesTemp && matchesOrigen;
    });
  }, [leads, searchTerm, filterEstado, filterTemp, filterOrigen]);

  // Ordenación: Hoy/Vencido > Calientes > Recientes
  const sortedLeads = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return [...filteredLeads].sort((a, b) => {
      // Prioridad 1: Seguimiento hoy
      const aHoy = a.proximo_seguimiento === today ? 1 : 0;
      const bHoy = b.proximo_seguimiento === today ? 1 : 0;
      if (aHoy !== bHoy) return bHoy - aHoy;

      // Prioridad 2: Calientes
      const aCaliente = a.temperatura === 'caliente' ? 1 : 0;
      const bCaliente = b.temperatura === 'caliente' ? 1 : 0;
      if (aCaliente !== bCaliente) return bCaliente - aCaliente;

      // Prioridad 3: Más nuevos
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredLeads]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * leadsPerPage;
    return sortedLeads.slice(start, start + leadsPerPage);
  }, [sortedLeads, currentPage]);

  // --- BLOQUEO DE ACCESO (PROTECCIÓN EMPRESA) ---
  // UNLOCKED FOR TESTING: if (organization && organization.business_type !== 'empresa') {
  if (false) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center mt-20">
        <div className="card-premium p-12 flex flex-col items-center gap-6">
          <div className="p-6 bg-amber-500/10 rounded-full">
            <Lock size={64} className="text-amber-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">{t('leads.locked.title' as any)}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 font-medium">
              {t('leads.locked.desc' as any)}
            </p>
            <Link 
              href="/dashboard/settings/plan"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20"
            >
              {t('leads.locked.upgradePlan' as any)} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orgLoading || (loading && organization?.id)) return <PageSkeleton />;

  return (
    <>
      <DashboardPageContainer>
        <div className="flex flex-col gap-6">
          {/* Cabecera */}
          <div className="card-premium py-6 px-4 md:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-[#1B4FD8]/10 rounded-2xl">
                  <UserPlus className="text-[#1B4FD8]" size={28} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('leads.header.title' as any)}</h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold ml-1 text-sm sm:text-base">{t('leads.header.desc' as any)}</p>
            </div>
            <button 
              onClick={() => { setSelectedLead(null); setIsLeadModalOpen(true); }}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20"
            >
              <UserPlus size={18} /> {t('leads.header.newContact' as any)}
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="card-premium p-4 md:p-8 border-l-4 border-l-blue-500">
                <Activity size={20} className="text-blue-500 mb-4" />
                <p className="kpi-label mb-1">{t('leads.kpis.active' as any)}</p>
                <h3 className="kpi-numero">{stats.activos}</h3>
              </div>
              <div className="card-premium p-4 md:p-8 border-l-4 border-l-red-500">
                <div className="h-5 mb-4" /> {/* Espaciador para mantener alineación */}
                <p className="kpi-label mb-1">{t('leads.kpis.hot' as any)}</p>
                <h3 className="kpi-numero">{stats.calientes}</h3>
              </div>
              <div className="card-premium p-4 md:p-8 border-l-4 border-l-purple-500">
                <TrendingUp size={20} className="text-purple-500 mb-4" />
                <p className="kpi-label mb-1">{t('leads.kpis.conversionRate' as any)}</p>
                <h3 className="kpi-numero">{stats.tasaConversion.toFixed(1)}%</h3>
              </div>
              <div className="card-premium p-4 md:p-8 border-l-4 border-l-emerald-500">
                <Calendar size={20} className="text-emerald-500 mb-4" />
                <p className="kpi-label mb-1">{t('leads.kpis.followupsToday' as any)}</p>
                <h3 className="kpi-numero">{stats.pendientesHoy}</h3>
              </div>
            </div>

            {/* Barra de Filtros */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Buscador */}
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder={t('leads.searchPlaceholder' as any)}
                    className="w-full bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filtro Estado */}
                <select 
                  className="bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 outline-none font-bold text-xs uppercase tracking-widest cursor-pointer"
                  value={filterEstado}
                  onChange={e => setFilterEstado(e.target.value)}
                >
                  <option value="todos" className="bg-[#111F3A] text-white">{t('leads.filters.allStates' as any)}</option>
                  <option value="nuevo" className="bg-[#111F3A] text-white">{t('leads.status.nuevo' as any)}</option>
                  <option value="contactado" className="bg-[#111F3A] text-white">{t('leads.status.contactado' as any)}</option>
                  <option value="cualificado" className="bg-[#111F3A] text-white">{t('leads.status.cualificado' as any)}</option>
                  <option value="convertido" className="bg-[#111F3A] text-white">{t('leads.status.convertido' as any)}</option>
                  <option value="descartado" className="bg-[#111F3A] text-white">{t('leads.status.descartado' as any)}</option>
                </select>

                {/* Filtro Temp */}
                <select 
                  className="bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 outline-none font-bold text-xs uppercase tracking-widest cursor-pointer"
                  value={filterTemp}
                  onChange={e => setFilterTemp(e.target.value)}
                >
                  <option value="todos" className="bg-[#111F3A] text-white">{t('leads.filters.allTemps' as any)}</option>
                  <option value="frio" className="bg-[#111F3A] text-white">{t('leads.temperatures.frio' as any)}</option>
                  <option value="tibio" className="bg-[#111F3A] text-white">{t('leads.temperatures.tibio' as any)}</option>
                  <option value="caliente" className="bg-[#111F3A] text-white">{t('leads.temperatures.caliente' as any)}</option>
                </select>

                {/* Filtro Origen */}
                <select 
                  className="bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 outline-none font-bold text-xs uppercase tracking-widest cursor-pointer"
                  value={filterOrigen}
                  onChange={e => setFilterOrigen(e.target.value)}
                >
                  <option value="todos" className="bg-[#111F3A] text-white">{t('leads.filters.allOrigins' as any)}</option>
                  <option value="web" className="bg-[#111F3A] text-white">{t('leads.origins.web' as any)}</option>
                  <option value="whatsapp" className="bg-[#111F3A] text-white">{t('leads.origins.whatsapp' as any)}</option>
                  <option value="email" className="bg-[#111F3A] text-white">{t('leads.origins.email' as any)}</option>
                  <option value="manual" className="bg-[#111F3A] text-white">{t('leads.origins.manual' as any)}</option>
                  <option value="referido" className="bg-[#111F3A] text-white">{t('leads.origins.referido' as any)}</option>
                  <option value="redes_sociales" className="bg-[#111F3A] text-white">{t('leads.origins.socialNetworks' as any)}</option>
                </select>
              </div>
            </div>

            {/* Lista de Captación */}
            <div className="card-premium overflow-hidden">
              {sortedLeads.length === 0 ? (
                <div className="p-20 text-center text-slate-400">
                  <p className="text-sm font-bold">{t('leads.noLeadsFound' as any)}</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                          <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('leads.table.contactCompany' as any)}</th>
                          <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('leads.table.contactInfo' as any)}</th>
                          <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">{t('leads.table.temperature' as any)}</th>
                          <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">{t('leads.table.status' as any)}</th>
                          <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('leads.table.valueOrigin' as any)}</th>
                          <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">{t('leads.table.metrics' as any)}</th>
                          <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{t('leads.table.actions' as any)}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {paginatedLeads.map(lead => {
                          const temp = temperaturaStyles[lead.temperatura] || temperaturaStyles.frio;
                          const est = estadoStyles[lead.estado] || estadoStyles.nuevo;
                          const org = origenConfig[lead.origen] || origenConfig.manual;
                          
                          return (
                            <tr key={lead.id} className={`group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors ${lead.estado === 'descartado' ? 'opacity-50 grayscale' : ''}`}>
                              <td className="px-4 md:px-8 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-xl bg-white dark:bg-white/5 shadow-sm`}>
                                    <Building size={16} className="text-slate-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{lead.nombre}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1">{lead.empresa || t('leads.particular' as any)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 md:px-8 py-4">
                                <div className="space-y-1">
                                  {lead.email && (
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                      <Mail size={12} className="text-slate-300" /> {lead.email}
                                    </div>
                                  )}
                                  {lead.telefono && (
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                      <Phone size={12} className="text-slate-300" /> {lead.telefono}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 md:px-8 py-4 text-center">
                                <span className={`inline-flex px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${temp.bg} ${temp.text}`}>
                                  {t(temp.labelKey as any)}
                                </span>
                              </td>
                              <td className="px-4 md:px-8 py-4 text-center">
                                <span className={`inline-flex px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${est.bg} ${est.text}`}>
                                  {t(est.labelKey as any)}
                                </span>
                              </td>
                              <td className="px-4 md:px-8 py-4">
                                <div>
                                  <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight">{lead.valor_estimado.toLocaleString()} {lead.moneda}</p>
                                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                    {org && <org.icon size={10} />} {org ? t(org.labelKey as any) : ''}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 md:px-8 py-4">
                                {lead.proximo_seguimiento ? (
                                  <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('leads.next' as any)}</p>
                                    <div className={`inline-flex px-2 py-1 rounded-md text-[9px] font-black ${
                                      new Date(lead.proximo_seguimiento) < new Date() && lead.estado !== 'convertido'
                                        ? 'bg-red-500/10 text-red-500' 
                                        : 'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                      {new Date(lead.proximo_seguimiento).toLocaleDateString()}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center text-[10px] font-bold text-slate-300 italic">{t('leads.noDate' as any)}</div>
                                )}
                              </td>
                              <td className="px-4 md:px-8 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  {lead.estado === 'descartado' ? (
                                    <button 
                                      onClick={() => reactivateLead(lead.id)}
                                      className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-xl transition-all"
                                      title={t('leads.actions.reactivate' as any)}
                                    >
                                      <RefreshCcw size={18} />
                                    </button>
                                  ) : lead.estado !== 'convertido' ? (
                                    <>
                                      <button 
                                        onClick={() => { setSelectedLead(lead); setIsConvertModalOpen(true); }}
                                        className="p-2 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl transition-all"
                                        title={t('leads.actions.convert' as any)}
                                      >
                                        <ArrowRightCircle size={18} />
                                      </button>
                                      <button 
                                        onClick={() => { setSelectedLead(lead); setIsDiscardModalOpen(true); }}
                                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all"
                                        title={t('leads.actions.discard' as any)}
                                      >
                                        <XCircle size={18} />
                                      </button>
                                      <button 
                                        onClick={() => { setSelectedLead(lead); setIsLeadModalOpen(true); }}
                                        className="p-2 hover:bg-slate-500/10 text-slate-400 rounded-xl transition-all"
                                        title={t('leads.actions.edit' as any)}
                                      >
                                        <Edit size={18} />
                                      </button>
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                      <Zap size={12} /> {t('leads.status.convertido' as any)}
                                    </div>
                                  )}
                                  <button 
                                    onClick={() => deleteLead(lead.id)}
                                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="md:hidden flex flex-col gap-4 p-4">
                    {paginatedLeads.map(lead => {
                      const temp = temperaturaStyles[lead.temperatura] || temperaturaStyles.frio;
                      const est = estadoStyles[lead.estado] || estadoStyles.nuevo;
                      const org = origenConfig[lead.origen] || origenConfig.manual;
                      
                      return (
                        <div key={lead.id} className={`card-premium p-6 space-y-4 relative overflow-hidden transition-all active:scale-[0.98] ${lead.estado === 'descartado' ? 'opacity-60 grayscale' : ''}`}>
                          {/* Decorative bar */}
                          <div className={`absolute top-0 left-0 w-full h-1 ${temp.bg.replace('bg-', 'bg-').split(' ')[0]}`} />
                          
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <h4 className="font-black text-slate-800 dark:text-white text-base leading-tight">{lead.nombre}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Building size={14} className="text-slate-400" />
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lead.empresa || t('leads.particular' as any)}</p>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest leading-none ${temp.bg} ${temp.text}`}>
                              {t(temp.labelKey as any)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest leading-none ${est.bg} ${est.text}`}>
                              {t(est.labelKey as any)}
                            </span>
                            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500">
                              {lead.valor_estimado.toLocaleString()} {lead.moneda}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-white/5">
                            <div className="flex gap-3 text-slate-400">
                              {lead.email && <Mail size={18} className="hover:text-blue-500 transition-colors" />}
                              {lead.telefono && <Phone size={18} className="hover:text-emerald-500 transition-colors" />}
                            </div>
                            <div className="flex gap-2">
                              {lead.estado === 'descartado' ? (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); reactivateLead(lead.id); }}
                                  className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl"
                                >
                                  <RefreshCcw size={16} />
                                </button>
                              ) : lead.estado !== 'convertido' ? (
                                <>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setIsConvertModalOpen(true); }}
                                    className="p-2.5 bg-purple-500/10 text-purple-600 rounded-xl"
                                  >
                                    <ArrowRightCircle size={16} />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setIsLeadModalOpen(true); }}
                                    className="p-2.5 bg-slate-500/10 text-slate-400 rounded-xl"
                                  >
                                    <Edit size={16} />
                                  </button>
                                </>
                              ) : (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                  <Zap size={12} /> {t('leads.status.convertido' as any)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Paginación */}
                  <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {t('leads.showingPrefix' as any)} {Math.min(paginatedLeads.length, leadsPerPage)} {t('leads.showingOf' as any)} {sortedLeads.length} {t('leads.showingSuffix' as any)}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all"
                      >
                        {t('leads.prev' as any)}
                      </button>
                      <button 
                        disabled={currentPage * leadsPerPage >= sortedLeads.length}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all"
                      >
                        {t('leads.nextPage' as any)}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modales */}
        <LeadModal 
          isOpen={isLeadModalOpen}
          onClose={() => setIsLeadModalOpen(false)}
          lead={selectedLead}
          onSuccess={fetchLeads}
        />

        {selectedLead && (
          <>
            <ConvertModal 
              isOpen={isConvertModalOpen}
              onClose={() => setIsConvertModalOpen(false)}
              lead={selectedLead}
              onSuccess={fetchLeads}
            />
            <DiscardModal 
              isOpen={isDiscardModalOpen}
              onClose={() => setIsDiscardModalOpen(false)}
              lead={selectedLead}
              onSuccess={fetchLeads}
            />
          </>
        )}
      </DashboardPageContainer>

      {/* SQL Script Link (Informative for user) */}
      <div className="text-[9px] text-slate-300 dark:text-slate-700 font-mono italic mt-10 p-8">
        -- Tabla leads ya implementada en el backend.
      </div>
    </>
  );
}

