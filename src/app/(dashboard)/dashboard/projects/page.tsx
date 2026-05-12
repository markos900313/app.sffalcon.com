'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Folder, 
  Plus, 
  Briefcase, 
  CheckCircle2, 
  Euro, 
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import ProjectsList from '@/components/dashboard/projects/ProjectsList';
import ProjectModal from '@/components/dashboard/projects/ProjectModal';
import { LayoutGrid, List, BarChart2 } from 'lucide-react';
import { useOrganization } from '@/context/OrganizationContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid 
} from 'recharts';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const { organization } = useOrganization();
  const symbol = organization?.currency_symbol || '€';
  const supabase = createClient();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [view, setView] = useState<'lista' | 'analytics'>('lista');

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          contactos:clients (
            name,
            company
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast.error('Error al cargar proyectos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel('projects-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Métricas
  const stats = {
    activos: projects.filter(p => p.status === 'activo').length,
    completados: projects.filter(p => p.status === 'completado').length,
    facturacion: projects.reduce((s, p) => s + Number(p.budget || 0), 0).toLocaleString('es-ES'),
    pendiente: projects.reduce((s, p) => s + (Number(p.budget || 0) - Number(p.paid || 0)), 0).toLocaleString('es-ES'),
  };

  const analyticsStats = useMemo(() => {
    const propuestas = projects.filter(p => p.status === 'propuesta' || p.status === 'lead').length;

    const validProjects = projects.filter(p => p.budget && p.status !== 'cancelado');
    const totalBudget = validProjects.reduce((sum, p) => sum + Number(p.budget), 0);
    const avgValue = validProjects.length > 0 ? totalBudget / validProjects.length : 0;

    // Ingresos por proyecto completado
    const completedProjects = projects
      .filter(p => p.status === 'completado' && p.budget)
      .map(p => ({
        name: p.name.substring(0, 15) + (p.name.length > 15 ? '...' : ''),
        ingresos: Number(p.budget)
      }))
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 5); // top 5 completados

    // Evolución mensual (ingresos de proyectos completados)
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        month: d.toLocaleString('es-ES', { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        ingresos: 0
      };
    }).reverse();

    projects.filter(p => p.status === 'completado' && p.budget).forEach(p => {
      const d = new Date(p.updated_at || p.created_at);
      const target = last6Months.find(m => m.monthNum === d.getMonth() && m.year === d.getFullYear());
      if (target) target.ingresos += Number(p.budget);
    });

    return { propuestas, avgValue, completedProjects, evolution: last6Months };
  }, [projects]);

  const pageTitle = organization?.sector_config?.['projects']?.label || 'Proyectos';

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="card-titulo !text-3xl flex items-center gap-3">
              <Folder className="w-8 h-8 text-[#1B4FD8]" />
              {pageTitle}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Control total de ejecución, facturación y plazos.</p>
          </div>
          <button 
            onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1B4FD8] text-white rounded-[18px] font-semibold text-sm shadow-xl shadow-blue-500/20 hover:bg-[#1642B5] transition-all active:scale-95 group shrink-0"
          >
            <Plus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            NUEVO REGISTRO
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-white/5 p-1 rounded-2xl w-fit border border-slate-200/50 dark:border-white/5">
          <button
            onClick={() => setView('lista')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-bold tracking-widest transition-all uppercase",
              view === 'lista' 
                ? "bg-white dark:bg-[var(--bg-sidebar-active)] text-[#1B4FD8] dark:text-white shadow-sm" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            <List className="w-4 h-4" />
            VISTA LISTADO
          </button>
          <button
            onClick={() => setView('analytics')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-bold tracking-widest transition-all uppercase",
              view === 'analytics' 
                ? "bg-white dark:bg-[var(--bg-sidebar-active)] text-[#1B4FD8] dark:text-white shadow-sm" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            <BarChart2 className="w-4 h-4" />
            ANÁLISIS
          </button>
        </div>

        {/* Content */}
        {view === 'lista' ? (
          <>
            {/* Stats Cards (Solo en Lista) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="ACTIVOS" value={stats.activos} icon={<Briefcase className="w-5 h-5" />} color="blue" />
              <StatCard label="COMPLETADOS" value={stats.completados} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
              <StatCard label="FACTURACIÓN TOTAL" value={`${stats.facturacion}${symbol}`} icon={<Euro className="w-5 h-5" />} color="indigo" sub="Total Presupuesto" />
              <StatCard label="PENDIENTE COBRO" value={`${stats.pendiente}${symbol}`} icon={<Clock className="w-5 h-5" />} color="orange" sub="Por Cobrar" />
            </div>

            <ProjectsList 
              projects={projects} 
              onEdit={(p) => { setEditingProject(p); setIsModalOpen(true); }}
            />
          </>
        ) : (
          <div className="space-y-6">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#111F3A] p-6 rounded-[24px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center rounded-xl shrink-0">
                     <Briefcase className="w-6 h-6 text-[#1B4FD8]" />
                   </div>
                   <div>
                     <p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Estado General</p>
                     <div className="flex items-center gap-3 mt-1">
                       <span className="text-[15px] font-bold text-[#0F172A] dark:text-[#F1F5F9]"><span className="text-blue-500">{stats.activos}</span> Act.</span>
                       <span className="text-[15px] font-bold text-[#0F172A] dark:text-[#F1F5F9]"><span className="text-green-500">{stats.completados}</span> Comp.</span>
                       <span className="text-[15px] font-bold text-[#0F172A] dark:text-[#F1F5F9]"><span className="text-yellow-500">{analyticsStats.propuestas}</span> Prop.</span>
                     </div>
                   </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111F3A] p-6 rounded-[24px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center rounded-xl shrink-0">
                  <Euro className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Valor Medio por Registro</p>
                  <p className="text-[24px] font-bold text-[#0F172A] dark:text-[#F1F5F9] mt-0.5">
                    {analyticsStats.avgValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#111F3A] p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Medio</span>
                <span className="text-2xl font-bold text-indigo-600 tabular-nums">
                  {analyticsStats.avgValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}
                </span>
                <span className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-tight">Valor por proyecto</span>
              </div>
              <div className="bg-white dark:bg-[#111F3A] p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-emerald-600 tabular-nums">{stats.activos}</span>
                  <span className="text-[15px] font-bold text-[#0F172A] dark:text-[#F1F5F9]">Activos</span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-tight"><span className="text-yellow-500">{analyticsStats.propuestas}</span> Propuestas</span>
              </div>
              <div className="bg-white dark:bg-[#111F3A] p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversión</span>
                <span className="text-2xl font-bold text-blue-600 tabular-nums">
                  {projects.length > 0 ? Math.round((stats.completados / projects.length) * 100) : 0}%
                </span>
                <span className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-tight">De éxito</span>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              <div className="bg-white dark:bg-[#111F3A] p-6 rounded-[24px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm w-full min-w-0">
                <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight mb-6">Ingresos por Proyecto (Completados)</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsStats.completedProjects} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} width={100} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${Number(value).toLocaleString('es-ES')} ${symbol}`, 'Ingresos']}
                      />
                      <Bar dataKey="ingresos" fill="#1B4FD8" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111F3A] p-6 rounded-[24px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm w-full min-w-0">
                <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight mb-6">Evolución Ingresos por Mes</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsStats.evolution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} width={60} 
                        tickFormatter={(val) => `${val/1000}k${symbol}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${Number(value).toLocaleString('es-ES')} ${symbol}`, 'Ingresos']}
                      />
                      <Line type="monotone" dataKey="ingresos" stroke="#1B4FD8" strokeWidth={3} dot={{ r: 4, fill: '#1B4FD8' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchProjects}
        editProject={editingProject}
      />
    </>
  );
}

function StatCard({ label, value, icon, color, sub }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  };

  return (
    <div className="card-premium card-proyectos p-6 shadow-sm hover:shadow-md transition-all group hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-2xl transition-transform group-hover:scale-110", colors[color])}>
          {icon}
        </div>
        <span className="kpi-label">{label}</span>
      </div>
      <div>
        <h3 className="kpi-numero">{value}</h3>
        {sub && <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{sub}</p>}
      </div>
    </div>
  );
}
