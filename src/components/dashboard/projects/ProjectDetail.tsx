'use client';

import React, { useState } from 'react';
import { 
  Calendar,
  FileText, 
  ExternalLink,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Save,
  CreditCard,
  Target,
  Clock,
  DollarSign,
  Plus,
  PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

interface ProjectDetailProps {
  project: {
    id: string;
    name: string;
    status: string;
    category: string;
    progress: number;
    budget: number;
    paid: number;
    start_date: string;
    end_date: string;
    description: string;
    notes: string;
    clients?: {
      id: string;
      name: string;
      email?: string;
      company?: string;
      phone?: string;
    };
  };
  onRefresh: () => void;
}

export default function ProjectDetail({ project, onRefresh }: ProjectDetailProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [newProgress, setNewProgress] = useState(project.progress || 0);
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleUpdateStatus = async (status: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', project.id);
      
      if (error) throw error;
      toast.success(`Estado actualizado a ${status.toUpperCase()}`);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar estado');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ progress: newProgress, updated_at: new Date().toISOString() })
        .eq('id', project.id);
      
      if (error) throw error;
      toast.success(`Progreso actualizado al ${newProgress}%`);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar progreso');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Cantidad no válida');
      return;
    }

    setLoading(true);
    try {
      const newPaid = Number(project.paid || 0) + amount;
      const { error } = await supabase
        .from('projects')
        .update({ paid: newPaid, updated_at: new Date().toISOString() })
        .eq('id', project.id);
      
      if (error) throw error;
      toast.success(`Pago de ${amount}€ registrado`);
      setPaymentAmount('');
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  const budget = Number(project.budget || 0);
  const paid = Number(project.paid || 0);
  const remaining = budget - paid;
  const payPercentage = budget > 0 ? (paid / budget) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* Columna Izquierda (65%) */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Card Datos Proyecto */}
        <div className="bg-white dark:bg-[#111F3A] rounded-[32px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm overflow-hidden p-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-[#1B4FD8] dark:text-blue-400 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-blue-100 dark:border-blue-500/20">
                {project.category}
              </span>
              <span className={cn(
                "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border",
                project.status === 'activo' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                project.status === 'propuesta' ? "bg-blue-50 text-blue-600 border-blue-100" :
                project.status === 'pausado' ? "bg-orange-50 text-orange-600 border-orange-100" :
                "bg-slate-50 text-slate-500 border-slate-100"
              )}>
                {project.status}
              </span>
            </div>

            <div>
              <h1 className="text-[20px] font-semibold text-slate-900 dark:text-white tracking-tight">{project.name}</h1>
              {project.clients && (
                <Link href={`/dashboard/clients/${project.clients.id}`} className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-[#1B4FD8] hover:underline">
                  Ver Cliente: {project.clients.name} <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Descripción</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-slate-200 dark:border-[#1E3A5F] pl-4">
                  {project.description || 'Sin descripción.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Inicio: {project.start_date ? format(new Date(project.start_date), 'dd/MM/yyyy') : '---'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">Fin: {project.end_date ? format(new Date(project.end_date), 'dd/MM/yyyy') : '---'}</span>
                </div>
              </div>

              {project.notes && (
                <div className="pt-4 border-t border-slate-100 dark:border-[#1E3A5F]">
                  <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Notas Internas</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{project.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Progreso */}
        <div className="bg-white dark:bg-[#111F3A] rounded-[32px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm p-8">
           <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-[#1B4FD8]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Progreso en Ejecución</h3>
            </div>
            <span className="text-2xl font-semibold text-[#1B4FD8]">{newProgress}%</span>
          </div>

          <div className="space-y-6">
            <div className="w-full h-3 bg-[#E2E8F0] dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#1B4FD8] transition-all duration-500" style={{ width: `${newProgress}%` }} />
            </div>
            
            <input 
              type="range"
              min="0" max="100"
              value={newProgress}
              onChange={(e) => setNewProgress(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#1B4FD8]"
            />

            <button 
              onClick={handleUpdateProgress}
              disabled={loading || newProgress === project.progress}
              className="px-6 py-3 bg-[#1B4FD8] text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-[#1642B5] transition-all disabled:opacity-50"
            >
              Actualizar Progreso
            </button>
          </div>
        </div>

        {/* Card Facturación */}
        <div className="bg-white dark:bg-[#111F3A] rounded-[32px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#059669]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Análisis de Facturación</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Presupuesto</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">{budget.toLocaleString('es-ES')}€</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Cobrado</p>
              <p className="text-xl font-semibold text-emerald-600">{paid.toLocaleString('es-ES')}€</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Pendiente</p>
              <p className="text-xl font-semibold text-orange-600">{remaining.toLocaleString('es-ES')}€</p>
            </div>
          </div>

          <div className="mt-8">
             <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
              <span>Nivel de Cobro</span>
              <span>{Math.round(payPercentage)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${payPercentage}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha (35%) */}
      <div className="space-y-8">
        
        {/* Card Estado */}
        <div className="bg-white dark:bg-[#111F3A] p-6 rounded-[32px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-6">Actualizar Estado</h3>
          <div className="flex flex-col gap-3">
            <StatusButton 
              active={project.status === 'propuesta'} 
              label="Propuesta" 
              icon={<FileText className="w-4 h-4" />} 
              color="blue"
              onClick={() => handleUpdateStatus('propuesta')}
            />
            <StatusButton 
              active={project.status === 'activo'} 
              label="En Marcha" 
              icon={<PlayCircle className="w-4 h-4" />} 
              color="emerald"
              onClick={() => handleUpdateStatus('activo')}
            />
            <StatusButton 
              active={project.status === 'pausado'} 
              label="Pausado" 
              icon={<PauseCircle className="w-4 h-4" />} 
              color="orange"
              onClick={() => handleUpdateStatus('pausado')}
            />
            <StatusButton 
              active={project.status === 'completado'} 
              label="Completado" 
              icon={<CheckCircle2 className="w-4 h-4" />} 
              color="slate"
              onClick={() => handleUpdateStatus('completado')}
            />
            <StatusButton 
              active={project.status === 'cancelado'} 
              label="Cancelado" 
              icon={<XCircle className="w-4 h-4" />} 
              color="red"
              onClick={() => handleUpdateStatus('cancelado')}
            />
          </div>
        </div>

        {/* Card Pago */}
        <div className="bg-white dark:bg-[#111F3A] p-6 rounded-[32px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-6">Registrar Pago</h3>
          <div className="space-y-4">
            <div className="relative">
              <input 
                type="number"
                placeholder="Importe del pago..."
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
            </div>
            <button 
              onClick={handleAddPayment}
              disabled={loading || !paymentAmount}
              className="w-full py-4 bg-[#1B4FD8] text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-[#1642B5] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Registrar Pago
            </button>
          </div>
        </div>

        {/* Card Cliente */}
        {project.clients && (
          <div className="bg-white dark:bg-[#111F3A] p-6 rounded-[32px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm">
            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-6">Cliente</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 text-[#1B4FD8] rounded-2xl flex items-center justify-center font-bold text-lg">
                {project.clients.name?.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{project.clients.name}</p>
                <p className="text-xs text-slate-500 truncate">{project.clients.company || 'Sin empresa'}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6 pt-4 border-t border-slate-50 dark:border-[#1E3A5F]">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate">{project.clients.email || 'Sin email'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                 <CreditCard className="w-3.5 h-3.5" />
                 <span className="truncate">{(project.clients as any).phone || 'Sin teléfono'}</span>
              </div>
            </div>

            <Link 
              href={`/dashboard/clients/${project.clients.id}`}
              className="block w-full text-center py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100 dark:border-slate-800"
            >
              Ver ficha cliente →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusButton({ active, label, icon, color, onClick }: { 
  active: boolean; 
  label: string; 
  icon: React.ReactNode; 
  color: string; 
  onClick: () => void; 
}) {
  const colors: any = {
    blue: "hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/20 active:bg-blue-100",
    emerald: "hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 active:bg-emerald-100",
    orange: "hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/20 active:bg-orange-100",
    slate: "hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-400/20 active:bg-slate-100",
    red: "hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 active:bg-red-100",
  };

  const activeColors: any = {
    blue: "bg-blue-100 dark:bg-blue-500/30 text-blue-600 dark:text-blue-400 border border-blue-500/30",
    emerald: "bg-emerald-100 dark:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    orange: "bg-orange-100 dark:bg-orange-500/30 text-orange-600 dark:text-orange-400 border border-orange-500/30",
    slate: "bg-slate-100 dark:bg-slate-400/30 text-slate-600 dark:text-slate-400 border border-slate-500/30",
    red: "bg-red-100 dark:bg-red-500/30 text-red-600 dark:text-red-400 border border-red-500/30",
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-2xl border border-transparent font-semibold text-sm transition-all uppercase tracking-widest",
        active ? activeColors[color] : "bg-slate-100/50 dark:bg-[#162040] text-slate-400 " + colors[color]
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {active && <CheckCircle2 className="w-4 h-4" />}
    </button>
  );
}
