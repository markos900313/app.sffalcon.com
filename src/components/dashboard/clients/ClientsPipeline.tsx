import React, { useState, useMemo, useEffect } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import { 
  Building2, 
  Calendar, 
  Eye, 
  Users, 
  Briefcase,
  Target,
  TrendingUp,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Client } from '@/app/(dashboard)/dashboard/clients/types';

interface ClientsPipelineProps {
  clients: Client[];
  onRefresh: () => void;
}

const COLUMNS = [
  { id: 'lead', title: 'NUEVOS CONTACTOS', color: '#1B4FD8' },
  { id: 'potencial', title: 'EN NEGOCIACIÓN', color: '#F59E0B' },
  { id: 'activo', title: 'CLIENTES ACTIVOS', color: '#10B981' },
  { id: 'inactivo', title: 'CERRADOS / PAUSA', color: '#64748B' },
];

export default function ClientsPipeline({ clients, onRefresh }: ClientsPipelineProps) {
  const router = useRouter();
  const supabase = createClient();
  const [localClients, setLocalClients] = useState<Client[]>(clients);

  useEffect(() => {
    setLocalClients(clients);
  }, [clients]);

  const columnsData = useMemo(() => {
    return COLUMNS.map(col => {
      const colClients = localClients.filter(c => (c.status || '').toLowerCase() === col.id);
      const totalValue = colClients.reduce((sum, c) => sum + Number(c.value || 0), 0);
      return {
        ...col,
        clients: colClients,
        totalValue,
        count: colClients.length
      };
    });
  }, [localClients]);

  const metrics = useMemo(() => {
    const leadsCount = localClients.filter(c => (c.status || '').toLowerCase() === 'lead').length;
    const potencialesCount = localClients.filter(c => (c.status || '').toLowerCase() === 'potencial').length;
    const activosCount = localClients.filter(c => (c.status || '').toLowerCase() === 'activo').length;
    
    const pipelineValue = localClients
      .filter(c => {
        const s = (c.status || '').toLowerCase();
        return s === 'lead' || s === 'potencial';
      })
      .reduce((sum, c) => sum + Number(c.value || 0), 0);

    const conversion = (leadsCount + potencialesCount + activosCount) > 0 
      ? ((activosCount / (leadsCount + potencialesCount + activosCount)) * 100).toFixed(1) 
      : '0.0';

    return { pipelineValue, activosCount, conversion };
  }, [localClients]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const updatedClients = localClients.map(c => 
      c.id === draggableId ? { ...c, status: newStatus } : c
    );
    setLocalClients(updatedClients);

    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', draggableId);

      if (error) throw error;
      toast.success(`Movido a ${newStatus.toUpperCase()}`);
      onRefresh();
    } catch (err) {
      toast.error('Error al mover cliente');
      setLocalClients(clients);
    }
  };

  const fmtValue = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  const getTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Pendiente';
    try {
      const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 0) return 'Hoy';
      if (diff < 0) return 'Próximamente';
      return `Hace ${diff}d`;
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Resumen Superior Estilizado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6 flex items-center gap-5 border-l-4 border-l-[#1B4FD8]">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-[#1B4FD8] flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor en Pipeline</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{fmtValue(metrics.pipelineValue)}</h4>
          </div>
        </div>
        <div className="card-premium p-6 flex items-center gap-5 border-l-4 border-l-[#10B981]">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-[#10B981] flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Clientes Activos</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.activosCount}</h4>
          </div>
        </div>
        <div className="card-premium p-6 flex items-center gap-5 border-l-4 border-l-[#F59E0B]">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-[#F59E0B] flex items-center justify-center shrink-0">
            <Target size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tasa Conversión</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.conversion}%</h4>
          </div>
        </div>
      </div>

      {/* Tablero Kanban */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {columnsData.map((column) => (
            <div key={column.id} className="flex-1 min-w-[300px] flex flex-col gap-4">
              {/* Header de Columna */}
              <div 
                className="card-premium p-4 shadow-sm relative overflow-hidden shrink-0"
                style={{ borderTop: `4px solid ${column.color}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {column.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500">
                    {column.count}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                    {fmtValue(column.totalValue)}
                  </span>
                </div>
              </div>

              {/* Área de Soltar */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "flex-1 flex flex-col gap-4 p-2 rounded-2xl transition-all min-h-[500px]",
                      snapshot.isDraggingOver ? "bg-blue-50/30 dark:bg-blue-500/5 ring-2 ring-blue-500/10 ring-inset" : "bg-transparent"
                    )}
                  >
                    {column.clients.map((client, index) => (
                      <Draggable key={client.id} draggableId={client.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "card-premium p-5 group/card transition-all relative overflow-hidden border-l-2",
                              snapshot.isDragging ? "shadow-2xl ring-2 ring-blue-500/20 scale-[1.02] z-50 bg-white dark:bg-[#1A2B4D]" : "hover:shadow-lg hover:border-blue-500/50"
                            )}
                            style={{ borderLeftColor: column.color }}
                          >
                            <div className="space-y-4">
                              <div className="flex justify-between items-start">
                                <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight group-hover/card:text-[#1B4FD8] transition-colors line-clamp-2">
                                  {client.name}
                                </h4>
                                <button 
                                  onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                  className="p-1.5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-blue-600 rounded-lg transition-all shrink-0"
                                >
                                  <Eye size={14} />
                                </button>
                              </div>

                              <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wide">
                                  <Building2 className="w-3 h-3" /> {client.company || 'PARTICULAR'}
                                </p>
                                <div className="flex gap-2">
                                  <span className="text-[9px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">
                                    {client.category || 'OTROS'}
                                  </span>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-[14px] font-bold text-[#1B4FD8] dark:text-blue-400 tabular-nums">
                                    {fmtValue(client.value || 0)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                  <Clock className="w-3 h-3" /> {getTimeAgo(client.last_contact)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
