"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Briefcase, 
  Trash2, 
  Pencil,
  UserPlus,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  X,
  Users,
  RefreshCw,
  ChevronDown,
  KeyRound,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import toast from "react-hot-toast";

export default function TeamPage() {
  const supabase = createClient();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [activeTab, setActiveTab] = useState<'colaboradores' | 'vacaciones'>('colaboradores');
  const [vacationRequests, setVacationRequests] = useState<any[]>([]);
  const [loadingVacations, setLoadingVacations] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [targetStaffId, setTargetStaffId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role: "General",
    status: "activo",
    access_level: "user"
  });

  useEffect(() => {
    if (organization) {
      if (activeTab === 'colaboradores') fetchTeam();
      else fetchVacationRequests();
    }
  }, [organization, activeTab]);

  async function fetchVacationRequests() {
    setLoadingVacations(true);
    try {
      const { data, error } = await supabase
        .from('vacaciones')
        .select('*, staff(full_name)')
        .eq('organization_id', organization!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVacationRequests(data || []);
    } catch (err) {
      console.error("Error fetching vacations", err);
    } finally {
      setLoadingVacations(false);
    }
  }

  const handleVacationAction = async (id: string, nuevoEstado: 'aprobada' | 'rechazada' | 'cancelada') => {
    try {
      const request = vacationRequests.find(r => r.id === id);
      
      const { error } = await supabase
        .from('vacaciones')
        .update({ estado: nuevoEstado })
        .eq('id', id);
      
      if (error) throw error;

      // Notificación al empleado
      if (request && (nuevoEstado === 'aprobada' || nuevoEstado === 'rechazada')) {
        const fechaInicio = new Date(request.fecha_inicio).toLocaleDateString();
        const fechaFin = new Date(request.fecha_fin).toLocaleDateString();
        const userId = request.staff_id; // El staff_id es el user_id del empleado
        
        await supabase
          .from('notifications')
          .insert({
            organization_id: organization!.id,
            title: nuevoEstado === 'aprobada' ? '✅ Vacaciones aprobadas' : '❌ Vacaciones rechazadas',
            message: nuevoEstado === 'aprobada' 
              ? `Tu solicitud de vacaciones del ${fechaInicio} al ${fechaFin} ha sido APROBADA por tu responsable.`
              : `Tu solicitud de vacaciones del ${fechaInicio} al ${fechaFin} ha sido RECHAZADA. Contacta con tu responsable para más información.`,
            type: nuevoEstado === 'aprobada' ? 'success' : 'error',
            read: false,
            target_user_id: userId
          });
      }

      toast.success(nuevoEstado === 'aprobada' ? "Vacaciones aprobadas" : nuevoEstado === 'cancelada' ? "Solicitud cancelada" : "Solicitud rechazada");
      fetchVacationRequests();
    } catch (err) {
      toast.error("Error al procesar solicitud");
    }
  };

  async function fetchTeam() {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('organization_id', organization!.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('not found')) {
            setTeam([]);
        } else {
            throw error;
        }
      }
      setTeam(data || []);
    } catch (err) {
      console.error("Error fetching team", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStaff) {
        const updateData = {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
          access_level: formData.access_level
        };
        const { error } = await supabase
          .from('staff')
          .update(updateData)
          .eq('id', editingStaff.id);
        if (error) throw error;
        toast.success("Información actualizada");
      } else {
        const res = await fetch('/api/admin/create-employee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            organization_id: organization?.id
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al crear empleado");
        toast.success(`Empleado creado. Código de fichaje: ${data.fichar_code}`, { duration: 6000 });
      }
      setIsModalOpen(false);
      resetForm();
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar a este colaborador?")) return;
    try {
      const staffMember = team.find(m => m.id === id);
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) throw error;
      
      const userIdToDelete = staffMember?.user_id || staffMember?.id;
      if (userIdToDelete) {
        await fetch('/api/admin/delete-employee', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userIdToDelete })
        });
      }
      toast.success("Colaborador eliminado completamente");
      fetchTeam();
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const openPasswordModal = (id: string) => {
    setTargetStaffId(id);
    setNewPassword("");
    setIsPasswordModalOpen(true);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch('/api/admin/change-employee-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetStaffId, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Contraseña actualizada");
      setIsPasswordModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar la contraseña");
    } finally {
      setSavingPassword(false);
    }
  };

  const openEditModal = (member: any) => {
    setEditingStaff(member);
    setFormData({
      full_name: member.full_name,
      email: member.email || "",
      password: "",
      phone: member.phone || "",
      role: member.role || "General",
      status: member.status || "active",
      access_level: member.access_level || "user"
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      password: "",
      phone: "",
      role: "General",
      status: "active",
      access_level: "user"
    });
  };

  const filteredTeam = team.filter(m => (
    m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role?.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  if (loading) return null;

  const pendingCount = vacationRequests.filter(r => r.estado === 'pendiente').length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-20">
      {/* Standardized Header - No animations, instant loading */}
      <div className="bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-[16px] p-4 md:p-6 flex flex-col xl:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
             <Users className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1B4FD8]">Gestión de Personal</span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
               Equipo <span className="opacity-30">/</span> <span className="text-[#1B4FD8]">{activeTab === 'colaboradores' ? 'Personal' : 'Vacaciones'}</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center xl:justify-end gap-4">
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
             <button onClick={() => setActiveTab('colaboradores')} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'colaboradores' ? "bg-white dark:bg-blue-600 text-[#1B4FD8] dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600")}>Personal</button>
             <button onClick={() => setActiveTab('vacaciones')} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center gap-2", activeTab === 'vacaciones' ? "bg-white dark:bg-blue-600 text-[#1B4FD8] dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600")}>
               <span>Vacaciones</span>
               {pendingCount > 0 && (
                 <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] flex items-center justify-center border-2 border-white dark:border-[#111F3A]">
                   {pendingCount}
                 </span>
               )}
             </button>
          </div>

          <button onClick={() => { resetForm(); setEditingStaff(null); setIsModalOpen(true); }} className="px-8 py-3.5 bg-[#1B4FD8] text-white rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2.5 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            <Plus size={14} /> Añadir Personal
          </button>
        </div>
      </div>

      <div>
        {activeTab === 'colaboradores' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {filteredTeam.map((member) => (
              <div key={member.id} className="bg-white dark:bg-[#111F3A] p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#1B4FD8] flex items-center justify-center text-white font-bold text-lg">{member.full_name?.split(' ').map((n: any) => n[0]).join('').slice(0, 2).toUpperCase()}</div>
                  <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                     <button onClick={() => openPasswordModal(member.id)} className="p-2 text-slate-400 hover:text-amber-500 transition-colors"><KeyRound size={18} /></button>
                     <button onClick={() => openEditModal(member)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Pencil size={18} /></button>
                     <button onClick={() => handleDelete(member.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{member.full_name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{member.role}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                    <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase", member.status === 'active' ? "bg-emerald-500/20 text-emerald-600" : "bg-slate-500/20 text-slate-600")}>{member.status === 'active' ? 'Disponible' : 'Ausente'}</div>
                    <span className="text-[10px] font-bold text-slate-400">{new Date(member.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="card-premium bg-white dark:bg-[#111F3A] rounded-[32px] border border-slate-200 dark:border-[#1E3A5F] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Periodo</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Días</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Motivo</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Estatus/Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {vacationRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6">
                           <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{req.staff?.full_name}</p>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Solicitante</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                            {new Date(req.fecha_inicio).toLocaleDateString()} — {new Date(req.fecha_fin).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-500/10">{req.dias}</div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-[11px] text-slate-500 italic max-w-xs truncate">&quot;{req.motivo || 'N/A'}&quot;</p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center justify-end gap-3">
                             {(req.estado === 'pendiente' || req.estado === 'aprobada') && (
                               <button
                                 onClick={() => handleVacationAction(req.id, 'cancelada')}
                                 className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-slate-500/20 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all border border-slate-500/20"
                               >
                                 Cancelar
                               </button>
                             )}
                             {req.estado === 'pendiente' ? (
                                <>
                                  <button onClick={() => handleVacationAction(req.id, 'aprobada')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 transition-all"> Aprobar </button>
                                  <button onClick={() => handleVacationAction(req.id, 'rechazada')} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-500/20 transition-all"> Rechazar </button>
                                </>
                             ) : (
                                <div className={cn(
                                  "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border flex items-center gap-1.5",
                                  req.estado === 'aprobada' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                  req.estado === 'rechazada' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                  "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                )}>
                                  {req.estado === 'aprobada' && <CheckCircle2 size={10} />}
                                  {req.estado === 'rechazada' && <XCircle size={10} />}
                                  {req.estado === 'cancelada' && <X size={10} />}
                                  {req.estado}
                                </div>
                             )}
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111F3A] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200 dark:border-[#1E3A5F]">
            <div className="px-6 py-5 md:px-8 border-b border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                <Users className="w-5 h-5 text-[#1B4FD8]" /> {editingStaff ? "Editar Colaborador" : "Nuevo Colaborador"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1E3A5F] rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} id="team-form" className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre completo</label>
                  <input type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 dark:text-white font-bold text-sm transition-all" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email corporativo</label>
                  <input type="email" required className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 dark:text-white font-bold text-sm transition-all" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                {!editingStaff && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contraseña temporal</label>
                    <input type="password" required className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 dark:text-white font-bold text-sm transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Puesto / Rol</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 dark:text-white font-bold text-sm transition-all" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nivel de Acceso</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 dark:text-white font-bold text-sm appearance-none cursor-pointer" value={formData.access_level} onChange={(e) => setFormData({...formData, access_level: e.target.value})}>
                    <option value="user" className="bg-[#111F3A] text-white">Usuario</option>
                    <option value="manager" className="bg-[#111F3A] text-white">Manager</option>
                    <option value="admin" className="bg-[#111F3A] text-white">Administrador</option>
                  </select>
                </div>
              </div>
            </form>
            <div className="p-6 border-t border-slate-100 dark:border-[#1E3A5F] flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors order-2 sm:order-1">Cancelar</button>
              <button type="submit" form="team-form" className="w-full sm:w-auto px-10 py-3.5 bg-[#1B4FD8] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all order-1 sm:order-2 disabled:opacity-50" disabled={saving}>
                {saving ? 'Guardando...' : editingStaff ? 'Actualizar Colaborador' : 'Crear Colaborador'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111F3A] w-full max-w-sm rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 border border-slate-200 dark:border-[#1E3A5F]">
             <div className="space-y-2">
               <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                 <KeyRound className="w-5 h-5 text-amber-500" /> Seguridad
               </h2>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Actualizar Contraseña</p>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nueva contraseña</label>
               <input type="password" required className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/10 dark:text-white font-bold text-sm transition-all" placeholder="Mínimo 6 caracteres" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
             </div>
             <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
               <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="w-full sm:w-auto order-2 sm:order-1 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
               <button type="submit" onClick={handlePasswordChange} className="w-full sm:w-auto order-1 sm:order-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all" disabled={savingPassword}>{savingPassword ? 'Procesando...' : 'Cambiar Clave'}</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
