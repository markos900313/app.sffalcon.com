'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Edit2, Trash2, Mail, Phone, Building2, Calendar, 
  Euro, Tag, Clock, MessageSquare, Save, History, PlusCircle, FileText,
  ChevronRight, Globe, MapPin, ExternalLink, MoreVertical, Users
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { DashboardPageContainer } from "@/components/dashboard/DashboardPageContainer";

const STATUS_COLORS: Record<string, string> = {
  lead: 'border-t-blue-500',
  potencial: 'border-t-amber-500',
  activo: 'border-t-emerald-500',
  inactivo: 'border-t-slate-400'
};

const STATUS_BADGE: Record<string, string> = {
  lead: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  potencial: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  activo: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  inactivo: 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400'
};

export default function ClientDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClient();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comms, setComms] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const fetchData = async () => {
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (clientError) throw clientError;
      setClient(clientData);

      const identifiers = [clientData.email, clientData.phone].filter(Boolean);
      if (identifiers.length > 0) {
        const { data: commsData } = await supabase
          .from('communications')
          .select('*')
          .or(`contact_identifier.in.(${identifiers.map(i => `"${i}"`).join(',')})`)
          .order('created_at', { ascending: false })
          .limit(5);
        
        setComms(commsData || []);
      }
    } catch (error: any) {
      toast.error('Error al cargar el cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('organization_id', client.organization_id);
      
      if (error) throw error;
      setClient({ ...client, status: newStatus });
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al actualizar estado');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRegisterContact = async () => {
    if (!newNote.trim()) return;
    setIsRegistering(true);
    try {
      const updatedNotes = `${client.notes || ''}\n[${new Date().toLocaleDateString('es-ES')}]: ${newNote.trim()}`;
      const { error } = await supabase
        .from('clients')
        .update({ 
          notes: updatedNotes, 
          last_contact: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      setClient({ ...client, notes: updatedNotes, last_contact: new Date().toISOString() });
      setNewNote('');
      toast.success('Contacto registrado');
    } catch (error) {
      toast.error('Error al registrar contacto');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsSavingProfile(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          company: editForm.company,
          notes: editForm.notes
        })
      });
      if (!res.ok) throw new Error('Error al actualizar');
      setClient({ ...client, ...editForm });
      setIsEditing(false);
      toast.success('Cliente actualizado');
    } catch (error) {
      toast.error('Error al actualizar');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ notes: notesValue })
      });
      if (!res.ok) throw new Error('Error al guardar');
      setClient({ ...client, notes: notesValue });
      setEditingNotes(false);
      toast.success('Notas guardadas');
    } catch (error) {
      toast.error('Error al guardar notas');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) return;
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      toast.success('Cliente eliminado');
      router.push('/dashboard/clients');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
    </div>
  );

  if (!client) return (
    <div className="p-12 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
      <Users size={48} className="mx-auto text-slate-200 mb-4" />
      <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest">Cliente no encontrado</h2>
      <button onClick={() => router.push('/dashboard/clients')} className="mt-6 px-6 py-2.5 bg-[#1B4FD8] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
        Volver al Panel
      </button>
    </div>
  );

  const daysSinceCreated = Math.floor((new Date().getTime() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <DashboardPageContainer>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-4">
          <button 
            onClick={() => router.push('/dashboard/clients')}
            className="group flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-[#1B4FD8] transition-colors uppercase tracking-[0.2em]"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Volver a Clientes
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none group">
              {client.name}
            </h1>
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
              STATUS_BADGE[client.status] || STATUS_BADGE.lead
            )}>
              {client.status}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => { 
              setEditForm({ 
                name: client.name,
                email: client.email,
                phone: client.phone,
                company: client.company,
                notes: client.notes
              }); 
              setIsEditing(true); 
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-2xl text-[11px] font-black text-slate-600 dark:text-slate-300 hover:border-[#1B4FD8] transition-all shadow-sm active:scale-95 uppercase tracking-widest"
          >
            <Edit2 size={14} />
            Editar Perfil
          </button>
          <button onClick={handleDelete} className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all shadow-sm active:scale-95">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Content (70%) */}
        <div className="flex-1 space-y-8 min-w-0">
          
          {/* Overview Card */}
          <div className={cn(
            "card-premium p-8 border-t-4",
            STATUS_COLORS[client.status] || STATUS_COLORS.lead
          )}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ProfileItem icon={<Building2 size={18} />} label="Empresa / Entidad" value={client.company || 'Consumidor Final'} color="blue" />
              <ProfileItem icon={<Mail size={18} />} label="Correo Electrónico" value={client.email || 'No proporcionado'} color="indigo" />
              <ProfileItem icon={<Phone size={18} />} label="Teléfono móvil" value={client.phone || 'No proporcionado'} color="emerald" />
              <ProfileItem icon={<Tag size={18} />} label="Categoría" value={client.category || 'Otros'} color="amber" />
              <ProfileItem icon={<Globe size={18} />} label="Canal de Entrada" value={`Vía ${client.source}`} color="purple" />
              <ProfileItem icon={<MapPin size={18} />} label="Ubicación" value={client.city || 'Desconocida'} color="rose" />
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} /> 
                  Expediente y Notas Internas
                </h3>
                <button 
                  onClick={() => { setNotesValue(client.notes || ''); setEditingNotes(true); }}
                  className="text-[10px] font-black text-[#1B4FD8] uppercase hover:underline"
                >
                  Ampliar
                </button>
              </div>
              {editingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingNotes(false)} 
                      disabled={isSavingNotes}
                      className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A5F] text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSaveNotes} 
                      disabled={isSavingNotes}
                      className="flex-1 py-2 rounded-xl bg-[#1B4FD8] text-white text-sm font-bold hover:bg-[#1642B5] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSavingNotes ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800/50 min-h-[140px] text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 size={14} className="text-slate-300 cursor-pointer hover:text-[#1B4FD8]" 
                      onClick={() => { setNotesValue(client.notes || ''); setEditingNotes(true); }} />
                  </div>
                  {client.notes || 'Inicie el expediente registrando su primera nota de seguimiento para este cliente.'}
                </div>
              )}
            </div>
          </div>

          {/* Timeline / Communications */}
          <div className="card-premium p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-[#1B4FD8] rounded-xl shadow-sm">
                  <History size={20} />
                </div>
                Línea de Tiempo
              </h3>
              <div className="flex gap-2">
                 <button className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-colors">Todo</button>
                 <button className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</button>
              </div>
            </div>

            <div className="space-y-6">
              {comms.length > 0 ? (
                comms.map((msg, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 group-hover:bg-[#1B4FD8]/10 group-hover:border-[#1B4FD8]/30 transition-all">
                        <MessageSquare size={18} className="text-slate-400 group-hover:text-[#1B4FD8]" />
                      </div>
                      {i < comms.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 dark:bg-slate-800 my-2" />}
                    </div>
                    <div className="flex-1 pb-6 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black uppercase text-[#1B4FD8] tracking-widest">{msg.channel}</span>
                        <span className="text-[10px] font-bold text-slate-400">{new Date(msg.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent group-hover:border-slate-100 dark:group-hover:border-white/10 transition-all group-hover:shadow-sm">
                        <p className="text-[13px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-slate-50/50 dark:bg-white/5 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800/50">
                   <Clock size={40} className="mx-auto text-slate-200 mb-4" />
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sin actividad registrada</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Actions (30%) */}
        <div className="w-full lg:w-[380px] space-y-6 lg:sticky lg:top-24">
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <StatSmall label="Relación" value={`${daysSinceCreated} días`} icon={<Calendar size={16} />} color="blue" />
            <StatSmall label="Contrato" value={client.value ? `${Number(client.value).toLocaleString('es-ES')}€` : '0€'} icon={<Euro size={16} />} color="emerald" />
          </div>

          {/* Quick Status Update */}
          <div className="card-premium p-6 bg-slate-900 border-none shadow-2xl shadow-blue-500/10">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Gestión de Estado</h4>
            <div className="space-y-4">
              <div className="relative group">
                <select 
                  value={client.status} 
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={isUpdatingStatus}
                  className="w-full bg-white/5 border border-white/10 text-white text-xs font-bold rounded-2xl py-4 px-5 appearance-none focus:ring-2 focus:ring-blue-500/50 transition-all outline-none relative z-10"
                >
                  <option value="lead" className="bg-slate-900">LEAD (CAPTACIÓN)</option>
                  <option value="potencial" className="bg-slate-900">POTENCIAL (NEGOCIACIÓN)</option>
                  <option value="activo" className="bg-slate-900">ACTIVO (CLIENTE)</option>
                  <option value="inactivo" className="bg-slate-900">INACTIVO (CERRADO)</option>
                </select>
                <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 rotate-90" />
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1 text-center">
                Último cambio: {client.updated_at ? new Date(client.updated_at).toLocaleDateString('es-ES') : 'Nunca'}
              </p>
            </div>
          </div>

          {/* Log Interaction */}
          <div className="card-premium p-6 shadow-xl border-t-4 border-t-blue-500">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <PlusCircle size={16} className="text-[#1B4FD8]" /> 
              Registrar Interacción
            </h4>
            <div className="space-y-4">
              <textarea 
                placeholder="Escribe un resumen de la llamada o reunión..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-[13px] p-5 min-h-[140px] resize-none outline-none focus:ring-2 focus:ring-[#1B4FD8]/20 text-slate-800 dark:text-slate-200 font-medium placeholder:text-slate-400"
              />
              <button 
                onClick={handleRegisterContact}
                disabled={isRegistering || !newNote.trim()}
                className="w-full py-4 bg-[#1B4FD8] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#1642B5] transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {isRegistering ? 'Sincronizando...' : 'Guardar en Bitácora'}
                <Save size={16} />
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-white/5 dark:to-white/10 rounded-[32px] border border-slate-200 dark:border-white/10">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                  <Calendar size={18} className="text-slate-400" />
                </div>
                <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Metadata de Registro</span>
             </div>
             <div className="space-y-4">
               <div className="flex justify-between items-center group">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Último Contacto</span>
                 <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">{client.last_contact ? new Date(client.last_contact).toLocaleDateString('es-ES') : '--'}</span>
               </div>
               <div className="flex justify-between items-center group">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID Único</span>
                 <span className="text-[11px] font-black text-slate-400 font-mono text-[9px]">{id.toString().substring(0, 8)}...</span>
               </div>
                <button 
                  onClick={() => {
                    const content = `
FICHA DE CONTACTO
=================
Nombre: ${client.name}
Email: ${client.email || 'No proporcionado'}
Teléfono: ${client.phone || 'No proporcionado'}
Empresa: ${client.company || 'Consumidor Final'}
Estado: ${client.status}
Canal: ${client.source || 'Desconocido'}
Ciudad: ${client.city || 'Desconocida'}
Notas: ${client.notes || 'Sin notas'}
ID: ${id}
Generado: ${new Date().toLocaleDateString('es-ES')}
                    `.trim();
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ficha-${client.name.replace(/\s+/g, '-')}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success('Ficha descargada');
                  }}
                  className="w-full mt-4 flex items-center justify-center gap-2 text-[10px] font-black text-[#1B4FD8] uppercase tracking-widest hover:bg-[#1B4FD8]/5 py-2 rounded-lg transition-all"
                >
                  Descargar ficha TXT
                  <ExternalLink size={12} />
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
      {isEditing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111F3A] w-full max-w-lg rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-[#1E3A5F]">
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">Editar Contacto</h3>
              <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-8 space-y-4 overflow-y-auto max-h-[60vh]">
              {[
                { label: 'Nombre', field: 'name' },
                { label: 'Email', field: 'email' },
                { label: 'Teléfono', field: 'phone' },
                { label: 'Empresa', field: 'company' },
              ].map(({ label, field }) => (
                <div key={field} className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
                  <input
                    type="text"
                    value={editForm[field] || ''}
                    onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
              ))}
            </div>
            <div className="px-8 py-6 bg-slate-50 dark:bg-[#0D1B35] flex gap-3 border-t border-slate-100 dark:border-[#1E3A5F]">
              <button 
                onClick={() => setIsEditing(false)} 
                disabled={isSavingProfile}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-[#1E3A5F] text-sm font-bold text-slate-500 hover:bg-white dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveEdit} 
                disabled={isSavingProfile}
                className="flex-1 py-3 rounded-xl bg-[#1B4FD8] text-white text-sm font-bold hover:bg-[#1642B5] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSavingProfile ? 'Sincronizando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageContainer>
  );
}

function ProfileItem({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-500',
    indigo: 'text-indigo-500',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    purple: 'text-purple-500',
    rose: 'text-rose-500'
  };

  return (
    <div className="space-y-2 group">
      <div className="flex items-center gap-2 mb-1">
        <div className={cn("shrink-0 transition-transform group-hover:scale-110", colors[color])}>
          {icon}
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate pl-6.5">
        {value}
      </p>
    </div>
  );
}

function StatSmall({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: 'blue' | 'emerald' }) {
  const themes = {
    blue: 'bg-blue-50/50 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/10',
    emerald: 'bg-emerald-50/50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/10'
  };

  return (
    <div className={cn(
      "p-5 rounded-[28px] border shadow-sm transition-all hover:shadow-md group",
      themes[color]
    )}>
      <div className="mb-3 p-2 w-fit bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-inherit transition-transform group-hover:rotate-12">
        {icon}
      </div>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <p className="text-base font-black tabular-nums tracking-tight">{value}</p>
    </div>
  );
}
