"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Layers,
  BarChart3,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardPageContainer, DashboardSection } from "@/components/dashboard/DashboardPageContainer";
import ClientModal from "@/components/dashboard/clients/ClientModal";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { hasClientPipeline } from "@/lib/sectorConfig";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/LanguageContext";

// Componentes tipo pestaña
import ClientsList from "@/components/dashboard/clients/ClientsList";
import ClientsPipeline from "@/components/dashboard/clients/ClientsPipeline";
import ClientsAnalytics from "@/components/dashboard/clients/ClientsAnalytics";
import { Client } from "./types";

type TabType = 'list' | 'pipeline' | 'analytics';

export default function ClientsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState({ total: 0, newThisMonth: 0, reservationsThisMonth: 0 });
  const { organization } = useOrganization();
  const { t } = useLanguage();
  const supabase = createClient();

  const fetchClients = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Fetch appointments for metrics
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: apptsData } = await supabase
        .from('appointments')
        .select('id')
        .eq('user_id', user.id)
        .gte('date', startOfMonth.toISOString().split('T')[0]);

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const newClients = (clientsData || []).filter(c => {
        const d = new Date(c.created_at);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length;

      setStats({
        total: clientsData?.length || 0,
        newThisMonth: newClients,
        reservationsThisMonth: apptsData?.length || 0
      });
    } catch (error) {
      toast.error(t('clients.loadError' as any));
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [supabase, t]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleEdit = (client: Client) => {
    setEditClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('clients.deleteConfirm' as any))) return;
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('clients.deleteSuccess' as any));
      fetchClients();
    } catch (error) {
      toast.error(t('clients.deleteError' as any));
      console.error(error);
    }
  };

  const modules = organization?.sector_config;
  const normalizedSector = organization?.sector?.toLowerCase()?.normalize("NFD")?.replace(/[\u0300-\u036f]/g, "") || 'default';
  const isRestauracion = normalizedSector === 'restauracion' || 
                        normalizedSector === 'hosteleria' || 
                        normalizedSector === 'restaurante';
  
  const isSalud = modules?.grupo === '2_salud';
  const showPipeline = hasClientPipeline(modules);
  const grupoNum = modules?.grupo ? parseInt(modules.grupo.split('_')[0]) : 1;

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'list', label: isSalud ? t('clients.tabs.directory' as any) : t('clients.tabs.allContacts' as any), icon: Users },
    ...(showPipeline ? [
      { id: 'pipeline', label: t('clients.tabs.pipeline' as any), icon: Layers } as const,
      { id: 'analytics', label: t('clients.tabs.metrics' as any), icon: BarChart3 } as const
    ] : [])
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <DashboardPageContainer>
        <div className="flex flex-col gap-6">
          {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 card-premium py-6 px-4 md:px-8 bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500">{t('clients.header.dbLabel' as any)}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[6px] md:text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">{t('clients.header.updatedLabel' as any)}</span>
            </div>
            <h1 className="text-base md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none truncate border-b-2 border-emerald-500/20 pb-1">
              {t('clients.header.title' as any)}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm mt-2">
              {t('clients.header.desc' as any)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-[#1E3A5F] rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('clients.header.export' as any)}</span>
            </button>
            <button
              onClick={() => {
                setEditClient(null);
                setIsModalOpen(true);
              }} 
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#1B4FD8] hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 translate-y-0 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap">
                {t('clients.header.newContact' as any)}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium bg-white dark:bg-[#111F3A] p-6 md:p-8 border border-slate-200 dark:border-[#1E3A5F] shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('clients.stats.totalRecords' as any)}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</h3>
          </div>
          <div className="card-premium bg-white dark:bg-[#111F3A] p-6 md:p-8 border border-slate-200 dark:border-[#1E3A5F] shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('clients.stats.newThisMonth' as any)}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.newThisMonth}</h3>
          </div>
          <div className="card-premium bg-white dark:bg-[#111F3A] p-6 md:p-8 border border-slate-200 dark:border-[#1E3A5F] shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('clients.stats.appointmentsThisMonth' as any)}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.reservationsThisMonth}</h3>
          </div>
        </div>

        <div className="min-h-[400px] animate-in slide-in-from-bottom-2 duration-500">
          {!loading && (
            <ClientsList 
              clients={clients} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
              grupo={grupoNum}
            />
          )}
        </div>
      </div>
    </DashboardPageContainer>

      <ClientModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditClient(null);
        }}
        onSuccess={fetchClients}
        editClient={editClient}
      />
    </>
  );
}
