'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  Edit2, 
  Search,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  client_id: string | null;
  status: 'propuesta' | 'activo' | 'completado' | 'cancelado';
  budget: number | null;
  paid: number | null;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  clients?: {
    name: string;
    company: string | null;
  } | null;
}

interface ProjectsListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete?: (id: string) => void;
}

export default function ProjectsList({ projects, onEdit, onDelete }: ProjectsListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || p.status === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'propuesta': return 'bg-[#EFF6FF] text-[#1B4FD8] border-[#1B4FD8]/10';
      case 'activo': return 'bg-[#D1FAE5] text-[#059669] border-[#059669]/10';
      case 'completado': return 'bg-[#F1F5F9] text-[#64748B] border-[#64748B]/10';
      case 'cancelado': return 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/10';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };


  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#111F3A] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar proyecto o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#162040] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1B4FD8]/20 transition-all text-slate-900 dark:text-slate-100"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-44 py-2 px-3 bg-[#F8FAFC] dark:bg-[#162040] border-none rounded-xl text-sm text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-[#1B4FD8]/20 cursor-pointer"
        >
          <option>Todos</option>
          <option>Propuesta</option>
          <option>Activo</option>
          <option>Completado</option>
          <option>Cancelado</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-[#111F3A] rounded-3xl border border-[#E2E8F0] dark:border-[#1E3A5F] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#162040]/50 border-b border-[#E2E8F0] dark:border-[#1E3A5F]">
                <th className="px-4 md:px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">PROYECTO</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] hidden sm:table-cell">CLIENTE</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">ESTADO</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] hidden lg:table-cell">PROGRESO</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] text-right">PRESUPUESTO</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E3A5F]">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-[#162040]/30 transition-colors group">
                    <td className="px-4 md:px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-[13px] md:text-[14px] group-hover:text-[#1B4FD8] transition-colors truncate max-w-[120px] md:max-w-none">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[10px] font-medium text-blue-600">
                          {p.clients?.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[100px]">{p.clients?.name || '---'}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-5">
                       <span className={cn(
                        "px-2 px-1 md:py-1 rounded-full text-[9px] md:text-[10px] font-semibold border uppercase tracking-wider",
                        getStatusStyle(p.status)
                      )}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 min-w-[140px] hidden lg:table-cell">
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">
                          <span>{p.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#E2E8F0] dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1B4FD8] rounded-full transition-all duration-500"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-5 text-right">
                       <p className="text-[12px] md:text-[14px] font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {p.budget ? `${Number(p.budget).toLocaleString('es-ES')}€` : '--'}
                      </p>
                      <p className="text-[10px] md:text-[11px] font-medium text-emerald-500 tabular-nums hidden md:block">
                        Pagado: {Number(p.paid || 0).toLocaleString('es-ES')}€
                      </p>
                    </td>
                    <td className="px-4 md:px-6 py-5">
                      <div className="flex items-center justify-center gap-1 md:gap-2">
                        <button 
                          onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                          className="p-1.5 md:p-2 text-slate-400 hover:text-[#1B4FD8] hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                        >
                          <Eye className="w-4 h-4 md:w-4.5 md:h-4.5" />
                        </button>
                        <button 
                          onClick={() => onEdit(p)}
                          className="p-1.5 md:p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
                        >
                          <Edit2 className="w-4 h-4 md:w-4.5 md:h-4.5" />
                        </button>
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(p.id)}
                            className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4 md:w-4.5 md:h-4.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                     <p className="text-slate-400 font-semibold uppercase tracking-widest text-sm">No se encontraron proyectos</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
