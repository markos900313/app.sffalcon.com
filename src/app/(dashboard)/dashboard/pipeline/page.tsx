"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Trello, UserPlus, MessageSquare, FileText, TrendingUp, 
  CheckCircle2, XCircle, Search, Calendar, Plus, 
  MoreHorizontal, Edit2, Trash2, Globe, Mail, 
  MessageCircle, User, Users, Handshake, Lock, ArrowRight,
  Filter, Loader2, ArrowUpRight, DollarSign, Target, BarChart
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { createPortal } from 'react-dom';
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { formatDistanceToNow, isSameMonth, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";
import PageSkeleton from "@/components/dashboard/ui/PageSkeleton";
import Dynamic from "next/dynamic";
import { DashboardPageContainer, DashboardSection } from "@/components/dashboard/DashboardPageContainer";
import { useLanguage } from "@/lib/LanguageContext";

import { PipelineDeal, PipelineEtapa, PipelineColumn, Prioridad, OrigenLead } from "./types";
import DealModal from "./DealModal";

// Evitar errores de SSR con DnD
const DragDropContextDynamic = Dynamic(() => Promise.resolve(DragDropContext), { ssr: false });

const COLUMNS: any[] = [
  { id: 'nuevo_lead', labelKey: 'pipeline.columns.nuevo_lead', bgColor: 'bg-blue-500/15 dark:bg-blue-500/20', iconColor: 'text-blue-500', icon: UserPlus },
  { id: 'contactado', labelKey: 'pipeline.columns.contactado', bgColor: 'bg-cyan-500/15 dark:bg-cyan-500/20', iconColor: 'text-cyan-500', icon: MessageSquare },
  { id: 'propuesta', labelKey: 'pipeline.columns.propuesta', bgColor: 'bg-amber-500/15 dark:bg-amber-500/20', iconColor: 'text-amber-500', icon: FileText },
  { id: 'negociacion', labelKey: 'pipeline.columns.negociacion', bgColor: 'bg-purple-500/15 dark:bg-purple-500/20', iconColor: 'text-purple-500', icon: TrendingUp },
  { id: 'cerrado_ganado', labelKey: 'pipeline.columns.cerrado_ganado', bgColor: 'bg-emerald-500/15 dark:bg-emerald-500/20', iconColor: 'text-emerald-500', icon: CheckCircle2 },
  { id: 'cerrado_perdido', labelKey: 'pipeline.columns.cerrado_perdido', bgColor: 'bg-red-500/15 dark:bg-red-500/20', iconColor: 'text-red-500', icon: XCircle },
];

const prioridadStyles: Record<string, string> = {
  baja: 'bg-slate-100 dark:bg-white/5 text-slate-500',
  media: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  alta: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  urgente: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
};

function PortalAwareItem({ 
  provided, 
  snapshot, 
  children 
}: { 
  provided: any; 
  snapshot: any; 
  children: React.ReactNode 
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const child = (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        ...provided.draggableProps.style,
        zIndex: snapshot.isDragging ? 9999 : 'auto',
      }}
      className={cn(
        "mx-3 mb-3 p-4 bg-white dark:bg-[#111F3A] rounded-xl border border-slate-200/80 dark:border-white/[0.06] shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-white/10 transition-all cursor-grab active:cursor-grabbing group",
        snapshot.isDragging && "shadow-2xl ring-2 ring-blue-500/30"
      )}
    >
      {children}
    </div>
  );

  if (!mounted) return child;
  
  if (snapshot.isDragging) {
    return createPortal(child, document.body);
  }
  
  return child;
}

export default function PipelinePage() {
  const supabase = createClient();
  const { organization, loading: orgLoading } = useOrganization();
  const currencySymbol = organization?.currency_symbol || '€';
  const { language, t } = useLanguage();
  const [deals, setDeals] = useState<PipelineDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all");
  
  // Modales
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<PipelineDeal | null>(null);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [tempDropResult, setTempDropResult] = useState<any>(null);
  const [motivoPerdida, setMotivoPerdida] = useState("");

  const loadDeals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pipeline_deals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setDeals(data);
    setLoading(false);
  };

  useEffect(() => {
    if (organization) loadDeals();
  }, [organization]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val).replace('€', currencySymbol);
  };

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchSearch = deal.nombre.toLowerCase().includes(search.toLowerCase()) || 
                          (deal.empresa?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchStage = filterStage === "all" || deal.etapa === filterStage;
      
      let matchDate = true;
      if (filterDate === "month") {
        matchDate = isSameMonth(new Date(deal.created_at), new Date());
      } else if (filterDate === "3months") {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        matchDate = new Date(deal.created_at) >= threeMonthsAgo;
      }

      return matchSearch && matchStage && matchDate;
    });
  }, [deals, search, filterStage, filterDate]);

  const stats = useMemo(() => {
    const activeDeals = deals.filter(d => d.etapa !== 'cerrado_ganado' && d.etapa !== 'cerrado_perdido');
    const wonDeals = deals.filter(d => d.etapa === 'cerrado_ganado');
    const wonThisMonth = wonDeals.filter(d => isSameMonth(new Date(d.fecha_cierre_real || d.updated_at), new Date()));

    const totalClosed = deals.filter(d => d.etapa === 'cerrado_ganado' || d.etapa === 'cerrado_perdido').length;
    const closureRate = totalClosed > 0 ? (wonDeals.length / totalClosed) * 100 : 0;

    return {
      activeCount: activeDeals.length,
      pipelineValue: activeDeals.reduce((acc, d) => acc + (d.valor_estimado || 0), 0),
      closureRate: Math.round(closureRate),
      wonValueMonth: wonThisMonth.reduce((acc, d) => acc + (d.valor_estimado || 0), 0)
    };
  }, [deals]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStage = destination.droppableId as PipelineEtapa;
    
    if (newStage === 'cerrado_perdido') {
      setTempDropResult(result);
      setIsReasonModalOpen(true);
      return;
    }

    await updateDealStage(draggableId, newStage);
  };

  const updateDealStage = async (id: string, stage: PipelineEtapa, reason?: string) => {
    // Actualización optimista — actualizar UI inmediatamente
    setDeals(prev => prev.map(d => 
      d.id === id ? { ...d, etapa: stage } : d
    ));
    
    try {
      const updates: any = {
        etapa: stage,
        updated_at: new Date().toISOString()
      };

      if (stage === 'cerrado_ganado') updates.fecha_cierre_real = new Date().toISOString();
      if (stage === 'cerrado_perdido') updates.motivo_perdida = reason || null;

      const { error } = await supabase.from('pipeline_deals').update(updates).eq('id', id);
      if (error) throw error;

      toast.success(`${t('pipeline.toast.movedSuccess' as any)} ${t(COLUMNS.find(c => c.id === stage)?.labelKey as any)}`);
      loadDeals();
    } catch (err) {
      toast.error(t('pipeline.toast.moveError' as any));
    }
  };

  const handleLossReasonSubmit = async () => {
    if (!tempDropResult) return;
    await updateDealStage(tempDropResult.draggableId, 'cerrado_perdido', motivoPerdida);
    setIsReasonModalOpen(false);
    setMotivoPerdida("");
    setTempDropResult(null);
  };

  const deleteDeal = async (id: string) => {
    if (!confirm(t('pipeline.deleteConfirm' as any))) return;
    const { error } = await supabase.from('pipeline_deals').delete().eq('id', id);
    if (!error) {
      toast.success(t('pipeline.toast.deleteSuccess' as any));
      loadDeals();
    }
  };

  const tipo = (organization as any)?.business_type;

  if (orgLoading || (loading && organization?.id)) return <PageSkeleton />;

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-full text-[var(--text-primary)] pb-32">
        <div className="flex flex-col gap-6">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Trello className="w-8 h-8 text-[#1B4FD8]" />
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{t('pipeline.header.title' as any)}</h1>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('pipeline.header.desc' as any)}</p>
              </div>
          <button 
            onClick={() => { setSelectedDeal(null); setIsDealModalOpen(true); }}
            className="px-6 py-3 bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> {t('pipeline.header.newOpportunity' as any)}
          </button>
        </div>

        <div className="flex flex-col gap-6 mt-6">
          {/* KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t('pipeline.kpis.activeLeads' as any), value: stats.activeCount, icon: Users, color: 'text-blue-500', cat: 'clientes' },
              { label: t('pipeline.kpis.pipelineValue' as any), value: formatCurrency(stats.pipelineValue), icon: BarChart, color: 'text-indigo-500', cat: 'finanzas' },
              { label: t('pipeline.kpis.closureRate' as any), value: `${stats.closureRate}%`, icon: Target, color: 'text-emerald-500', cat: 'ia' },
              { label: t('pipeline.kpis.wonThisMonth' as any), value: formatCurrency(stats.wonValueMonth), icon: DollarSign, color: 'text-amber-500', cat: 'stats' },
            ].map((stat, i) => (
              <div key={i} className={cn("card-premium p-5 shadow-sm min-w-0 xl:max-w-[280px] w-full flex flex-col justify-between", stat.cat && `card-${stat.cat}`)}>
                <p className="kpi-label mb-1 truncate uppercase tracking-[0.2em] text-[9px] font-black">{stat.label}</p>
                <h3 className="kpi-numero text-xl md:text-2xl lg:text-3xl truncate text-ellipsis overflow-hidden whitespace-nowrap" title={String(stat.value)}>{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* FILTERS BAR */}
          <div className="flex flex-col md:flex-row gap-3 items-center bg-white dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm w-full">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder={t('pipeline.searchPlaceholder' as any)}
                className="w-full bg-slate-50 dark:bg-black/20 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select 
                className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 dark:bg-[#111F3A] rounded-xl text-xs font-bold border-none outline-none cursor-pointer"
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
              >
                <option value="all" className="bg-[#111F3A] text-white">{t('pipeline.filters.allStages' as any)}</option>
                {COLUMNS.map(c => <option key={c.id} value={c.id} className="bg-[#111F3A] text-white">{t(c.labelKey as any)}</option>)}
              </select>
              <select 
                className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 dark:bg-[#111F3A] rounded-xl text-xs font-bold border-none outline-none cursor-pointer"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              >
                <option value="all" className="bg-[#111F3A] text-white">{t('pipeline.filters.allTime' as any)}</option>
                <option value="month" className="bg-[#111F3A] text-white">{t('pipeline.filters.thisMonth' as any)}</option>
                <option value="3months" className="bg-[#111F3A] text-white">{t('pipeline.filters.threeMonths' as any)}</option>
              </select>
            </div>
          </div>
        </div>

        {/* KANBAN BOARD */}
        <div 
          className="w-full pb-4 mt-6 pipeline-board"
          style={{ overflowX: 'auto', overflowY: 'visible' }}
        >
          <div className="flex gap-4 min-w-max xl:min-w-0 xl:w-full">
            <DragDropContextDynamic onDragEnd={onDragEnd}>
              {COLUMNS.map((column) => {
                const columnDeals = filteredDeals.filter(d => d.etapa === column.id);
                const columnTotal = columnDeals.reduce((acc, d) => acc + (d.valor_estimado || 0), 0);
                const Icon = column.icon;

                return (
                  <div key={column.id} className="w-[280px] sm:w-[300px] lg:w-[320px] xl:flex-1 xl:min-w-[280px] flex-shrink-0 xl:flex-shrink flex flex-col bg-slate-50/80 dark:bg-white/[0.03] backdrop-blur-sm border border-slate-200 dark:border-white/[0.06] rounded-2xl min-h-[600px] pipeline-column relative">
                    
                    {/* Column Header */}
                    <div className="p-4 border-b border-slate-200/50 dark:border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", column.bgColor)}>
                          <Icon className={cn("w-4 h-4", column.iconColor)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-700 dark:text-white truncate">
                            {t(column.labelKey as any)}
                          </h3>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            {formatCurrency(columnTotal)} · {columnDeals.length} {columnDeals.length === 1 ? t('pipeline.opportunity' as any) : t('pipeline.opportunities' as any)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Deals Container */}
                    <Droppable droppableId={column.id}>
                      {(provided) => (
                        <div 
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="flex-1 py-3 overflow-y-auto"
                        >
                          {columnDeals.length > 0 ? (
                            columnDeals.map((deal, index) => (
                              <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                {(provided, snapshot) => (
                                  <PortalAwareItem provided={provided} snapshot={snapshot}>
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{deal.nombre}</p>
                                        {deal.empresa && (
                                          <p className="text-[11px] text-slate-400 truncate">{deal.empresa}</p>
                                        )}
                                      </div>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setSelectedDeal(deal); setIsDealModalOpen(true); }}
                                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                                        >
                                          <Edit2 size={12} className="text-slate-400" />
                                        </button>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); deleteDeal(deal.id); }}
                                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                                        >
                                          <Trash2 size={12} className="text-slate-400 hover:text-red-500" />
                                        </button>
                                      </div>
                                    </div>

                                    <p className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                                      {formatCurrency(deal.valor_estimado)}
                                    </p>

                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={cn(
                                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                        prioridadStyles[deal.prioridad]
                                      )}>
                                        {t(`pipeline.priorities.${deal.prioridad}` as any)}
                                      </span>
                                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                                         {deal.origen === 'web' && <Globe size={10} />}
                                         {deal.origen === 'whatsapp' && <MessageCircle size={10} />}
                                         {deal.origen === 'email' && <Mail size={10} />}
                                         {deal.origen === 'manual' && <User size={10} />}
                                         {deal.origen === 'referido' && <Handshake size={10} />}
                                         {t(`leads.origins.${deal.origen}` as any)}
                                      </div>
                                    </div>

                                    <p className="text-[10px] text-slate-400 mt-2">
                                      {t('pipeline.agoPrefix' as any)} {formatDistanceToNow(new Date(deal.created_at), { locale: language === 'en' ? enUS : es })} {t('pipeline.agoSuffix' as any)}
                                    </p>
                                  </PortalAwareItem>
                                )}
                              </Draggable>
                            ))
                          ) : (
                            // Column Empty State
                            <div className="flex-1 flex items-center justify-center p-6 h-full min-h-[200px]">
                              <div className="text-center">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-2">
                                  <Plus size={16} className="text-slate-300 dark:text-slate-600" />
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">
                                  {t('pipeline.emptyStateText' as any)}
                                </p>
                              </div>
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </DragDropContextDynamic>
          </div>
        </div>
      </div>

        {/* REASON MODAL (LOST DEAL) */}
        {isReasonModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white dark:bg-[#111F3A] w-full max-w-md rounded-t-[32px] sm:rounded-[32px] border border-slate-200 dark:border-[#1E3A5F] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                
                {/* Header - Fixed */}
                <div className="p-6 border-b border-slate-100 dark:border-[#1E3A5F] shrink-0">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('pipeline.lostModal.title' as any)}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('pipeline.lostModal.subtitle' as any)}</p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 custom-scrollbar">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('pipeline.lostModal.desc' as any)}</p>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pipeline.lostModal.reasonLabel' as any)}</label>
                    <textarea 
                      className="w-full bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                      rows={4}
                      placeholder={t('pipeline.lostModal.placeholder' as any)}
                      value={motivoPerdida}
                      onChange={(e) => setMotivoPerdida(e.target.value)}
                    />
                  </div>
                </div>

                {/* Footer - Fixed */}
                 <div className="p-6 md:p-8 border-t border-slate-100 dark:border-[#1E3A5F] bg-slate-50/50 dark:bg-[#111F3A] flex flex-col gap-3 shrink-0">
                  <button 
                    onClick={handleLossReasonSubmit}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 transition-all order-1 active:scale-95"
                  >
                    {t('pipeline.lostModal.saveAndClose' as any)}
                  </button>
                  <button 
                    onClick={() => setIsReasonModalOpen(false)}
                    className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors order-2 active:scale-95"
                  >
                    {t('common.cancel' as any)}
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* MAIN DEAL MODAL */}
        <DealModal 
          isOpen={isDealModalOpen}
          deal={selectedDeal}
          onClose={() => { setIsDealModalOpen(false); setSelectedDeal(null); }}
          onSave={loadDeals}
        />
      </div>
    </>
  );
}
