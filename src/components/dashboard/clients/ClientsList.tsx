'use client';

import React, { useState } from 'react';
import { Search, MoreVertical, Edit2, Eye, Trash2, User, Building2, Phone, Mail, Calendar, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Client } from '@/app/dashboard/clients/types';

interface ClientsListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  grupo?: number;
}

export default function ClientsList({ clients, onEdit, onDelete, grupo = 5 }: ClientsListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusVal = (c.status || '').toLowerCase();
    const matchesStatus = statusFilter === 'Todos' || statusVal === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string | null) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'activo': return "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case 'lead': return "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      case 'inactivo': return "bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-400/10 dark:text-slate-400 dark:border-slate-500/20";
      case 'potencial': return "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  const fmtCurrency = (val: number | null) => {
    if (val === null) return '--';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Search & Simple Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#111F3A] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-[#162040] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1B4FD8]/20 transition-all text-slate-900 dark:text-slate-100"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide pb-1 md:pb-0">
          {(grupo === 2 ? ['Todos', 'Nuevo', 'En tratamiento', 'Alta'] : (grupo === 1 ? ['Todos', 'Activo', 'Inactivo'] : ['Todos', 'Contacto', 'Potencial', 'Activo', 'Inactivo'])).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                statusFilter === st 
                  ? "bg-[#1B4FD8] text-white border-[#1B4FD8] shadow-lg shadow-blue-500/20" 
                  : "bg-white dark:bg-[#111F3A] text-slate-500 border-slate-200 dark:border-[#1E3A5F] hover:bg-slate-50"
              )}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div 
              key={client.id} 
              className="card-premium p-6 group hover:scale-[1.01] transition-all relative overflow-hidden flex flex-col justify-between min-h-[220px]"
              style={{ borderTop: '4px solid #1B4FD8' }}
            >
              <div className="space-y-4">
                {/* Upper Section */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20 shrink-0">
                      {(client.name || '').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[16px] font-bold text-slate-900 dark:text-white leading-tight truncate group-hover:text-[#1B4FD8] transition-colors">{client.name}</h4>
                      <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mt-1">
                        {grupo === 2 ? (
                          <>
                            <Info className="w-3.5 h-3.5" />
                            {(client.status || 'NUEVO').toUpperCase()}
                          </>
                        ) : grupo === 1 ? (
                          <>
                            <Info className="w-3.5 h-3.5" />
                            {(client.status || 'NUEVO').toUpperCase()}
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3.5 h-3.5" />
                            {(client.company || 'PARTICULAR').toUpperCase()}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0",
                    getStatusStyle(client.status)
                  )}>
                    {client.status === 'lead' ? 'CONTACTO' : (client.status || 'NUEVO')}
                  </span>
                </div>

                {/* Info Section */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {grupo !== 1 && grupo !== 2 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Presupuesto</p>
                      <p className="text-sm font-bold text-[#1B4FD8] dark:text-blue-400 tabular-nums">
                        {fmtCurrency(client.value)}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contacto</p>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {client.phone || '--'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {client.last_contact ? new Date(client.last_contact).toLocaleDateString() : 'Pendiente'}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                    className="p-2 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-[#1B4FD8] hover:bg-blue-50 rounded-xl transition-all" 
                    title="Ver Ficha"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => onEdit(client)}
                    className="p-2 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(client.id)}
                    className="p-2 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-premium p-20 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2">
          <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-200 dark:text-slate-800">
            <User size={40} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Empieza tu catálogo</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">No hay clientes que coincidan con tu búsqueda. Añade uno nuevo para empezar a gestionar.</p>
          </div>
        </div>
      )}
    </div>
  );
}
