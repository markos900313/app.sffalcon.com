"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  ChevronDown, 
  Pencil, 
  X, 
  Target, 
  Users, 
  Clock, 
  Euro,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import PageSkeleton from "@/components/dashboard/ui/PageSkeleton";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "react-hot-toast";
import { DashboardPageContainer } from "@/components/dashboard/DashboardPageContainer";
import { useLanguage } from "@/lib/LanguageContext";

const DURATIONS = ["15 min", "30 min", "1h", "2h", "4h", "8h", "Personalizado"];

export default function CatalogPage() {
  const supabase = createClient();
  const { organization, loading: orgLoading } = useOrganization();
  const currencySymbol = organization?.currency_symbol || '€';
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "General",
    descripcion: "",
    que_incluye: "",
    precio: 0,
    duracion: "1h",
    capacidad: 1,
    estado: "Activo",
    deposit: 0,
    deposit_type: 'none'
  });

  useEffect(() => {
    fetchCatalog();
  }, [organization?.id]);

  const fetchCatalog = async () => {
    if (!organization) return;
    try {
      const { data, error } = await supabase
        .from('catalogo_items')
        .select('id, nombre, descripcion, precio, activo, deposit, deposit_type')
        .eq('organization_id', organization.id)
        .order('nombre');
      
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Error fetching catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        table: 'catalogo_items',
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: formData.precio,
        activo: formData.estado === 'Activo',
        organization_id: organization?.id,
        deposit: formData.deposit,
        deposit_type: formData.deposit_type
      };

      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { id: editingItem.id, ...payload } : payload;

      const res = await fetch('/api/inventory', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Error en la API');
      
      toast.success(editingItem ? t('inventory.toast.updated' as any) : t('inventory.toast.created' as any));
      setIsModalOpen(false);
      resetForm();
      fetchCatalog();
    } catch (err) {
      toast.error(t('inventory.toast.saveError' as any));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('inventory.deleteConfirm' as any))) return;
    try {
      const res = await fetch(`/api/inventory?table=catalogo_items&id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success(t('inventory.toast.deleted' as any));
      fetchCatalog();
    } catch (err) {
      toast.error(t('inventory.toast.deleteError' as any));
    }
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      categoria: 'General',
      descripcion: item.descripcion || "",
      que_incluye: "",
      precio: item.precio || 0,
      duracion: "1h",
      capacidad: 1,
      estado: item.activo ? "Activo" : "Pausado",
      deposit: item.deposit || 0,
      deposit_type: item.deposit_type || 'none'
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      categoria: "General",
      descripcion: "",
      que_incluye: "",
      precio: 0,
      duracion: "1h",
      capacidad: 1,
      estado: "Activo",
      deposit: 0,
      deposit_type: 'none'
    });
  };

  const stats = useMemo(() => {
    const total = items.length;
    const activos = items.filter(i => i.activo === true).length;
    const pausados = items.filter(i => i.activo === false).length;
    return { total, activos, pausados };
  }, [items]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (orgLoading || (loading && organization?.id)) return <PageSkeleton />;

  return (
    <>
      <DashboardPageContainer>
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 card-premium py-6 px-4 md:px-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{t('inventory.header.title' as any)}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold">
              {t('inventory.header.desc' as any)}
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setEditingItem(null); setIsModalOpen(true); }}
            className="bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 font-semibold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            {t('inventory.header.newItem' as any)}
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium border-t-[#1B4FD8] border-t-2 p-6 md:p-8 shadow-sm">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-2">{t('inventory.kpis.totalItems' as any)}</p>
            <p className="text-[28px] font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="card-premium border-t-emerald-500 border-t-2 p-6 md:p-8 shadow-sm">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-2">{t('inventory.kpis.activeItems' as any)}</p>
            <p className="text-[28px] font-bold text-slate-900 dark:text-white">{stats.activos}</p>
          </div>
          <div className="card-premium border-t-amber-500 border-t-2 p-6 md:p-8 shadow-sm">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-2">{t('inventory.kpis.pausedItems' as any)}</p>
            <p className="text-[28px] font-bold text-slate-900 dark:text-white">{stats.pausados}</p>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="card-premium overflow-hidden shadow-sm">
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder={t('inventory.searchPlaceholder' as any)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-white/5 text-[11px] font-bold uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4">{t('inventory.table.item' as any)}</th>
                    <th className="px-6 py-4">{t('inventory.table.category' as any)}</th>
                    <th className="px-6 py-4 text-right">{t('inventory.table.price' as any)}</th>
                    <th className="px-6 py-4 text-center">{t('inventory.table.status' as any)}</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 border-slate-100 dark:border-white/5">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.nombre}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{item.descripcion}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {t('inventory.categoryGeneral' as any)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{item.precio} {currencySymbol}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-1 rounded-full",
                          item.activo ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        )}>
                          {item.activo ? t('inventory.status.active' as any) : t('inventory.status.paused' as any)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setViewItem(item); setShowViewModal(true); }}
                            className="p-2 hover:bg-slate-500/10 rounded-lg text-slate-400 transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button onClick={() => openEditModal(item)} className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-500 transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        {t('inventory.noItems' as any)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </DashboardPageContainer>

      {/* Modal de Vista Previa */}
      {showViewModal && viewItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#111F3A] rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#1E3A5F] w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('inventory.viewModal.title' as any)}</h3>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('inventory.viewModal.nameLabel' as any)}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{viewItem.nombre}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('inventory.viewModal.descLabel' as any)}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{viewItem.descripcion || t('inventory.viewModal.noDesc' as any)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('inventory.table.price' as any)}</p>
                  <p className="text-sm font-black text-[#1B4FD8]">{viewItem.precio} {currencySymbol}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('inventory.table.status' as any)}</p>
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-1 rounded-full",
                    viewItem.activo ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                  )}>
                    {viewItem.activo ? t('inventory.status.active' as any) : t('inventory.status.paused' as any)}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-[#1E3A5F]">
              <button 
                onClick={() => setShowViewModal(false)}
                className="w-full py-3 bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] text-slate-600 dark:text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
              >
                {t('inventory.viewModal.close' as any)}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white dark:bg-[#111F3A] w-full max-w-2xl rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-slate-200 dark:border-[#1E3A5F] flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Target className="w-5 h-5 text-[#1B4FD8]" /> 
                    {editingItem ? t('inventory.editModal.editTitle' as any) : t('inventory.editModal.newTitle' as any)}
                  </h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} id="catalog-form" className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('inventory.editModal.nameLabel' as any)}</label>
                    <input 
                      type="text" 
                      required 
                      placeholder={t('inventory.editModal.namePlaceholder' as any)}
                      className="w-full p-3 bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white font-bold" 
                      value={formData.nombre} 
                      onChange={e => setFormData({...formData, nombre: e.target.value})} 
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('inventory.viewModal.descLabel' as any)}</label>
                    <textarea 
                      rows={3}
                      placeholder={t('inventory.editModal.descPlaceholder' as any)}
                      className="w-full p-3 bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-slate-900 dark:text-white font-bold" 
                      value={formData.descripcion} 
                      onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('inventory.editModal.priceLabel' as any).replace('€', currencySymbol)}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none">{currencySymbol}</span>
                      <input 
                        type="number" 
                        required
                        step="0.01"
                        className="w-full p-3 pl-10 bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white font-bold" 
                        value={formData.precio} 
                        onChange={e => setFormData({...formData, precio: Number(e.target.value)})} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('inventory.table.status' as any)}</label>
                    <select 
                      className="w-full p-3 bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white font-bold cursor-pointer" 
                      value={formData.estado} 
                      onChange={e => setFormData({...formData, estado: e.target.value})}
                    >
                      <option value="Activo" className="bg-[#111F3A] text-white">{t('inventory.status.active' as any)}</option>
                      <option value="Pausado" className="bg-[#111F3A] text-white">{t('inventory.status.paused' as any)}</option>
                    </select>
                  </div>
                </div>
              </form>
              
              <div className="px-8 py-6 border-t border-slate-200 dark:border-[#1E3A5F] flex flex-col sm:flex-row items-center justify-end gap-3 bg-slate-50 dark:bg-[#111F3A] shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
                >
                  {t('common.cancel' as any)}
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={saving} 
                  className="w-full sm:w-auto px-10 py-3 bg-[#1B4FD8] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? t('inventory.editModal.saving' as any) : t('inventory.editModal.save' as any)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
