'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Trash2, 
  Pencil, 
  Eye,
  Boxes,
  AlertTriangle,
  DollarSign,
  X,
  PlusCircle,
  Loader2,
  Tag,
  Hash,
  Scale
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardPageContainer } from "@/components/dashboard/DashboardPageContainer";
import { createClient } from '@/lib/supabase/client';
import { useOrganization } from '@/context/OrganizationContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Item {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  stock_minimo: number;
  unidad: string;
  organization_id: string;
}

export default function ProductsPage() {
  const supabase = createClient();
  const { organization } = useOrganization();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'General',
    precio: '',
    stock: '',
    stock_minimo: '0',
    unidad: 'unidades'
  });

  const [editFormData, setEditFormData] = useState<any>({});

  useEffect(() => {
    fetchItems();
  }, [organization?.id]);

  async function fetchItems() {
    if (!organization?.id) return;
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('organization_id', organization.id)
        .order('nombre');

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'inventory_items',
          nombre: formData.nombre,
          categoria: formData.categoria,
          precio: parseFloat(formData.precio),
          stock: parseInt(formData.stock),
          stock_minimo: parseInt(formData.stock_minimo),
          unidad: formData.unidad,
          organization_id: organization.id
        })
      });

      if (!res.ok) throw new Error('Error al añadir');
      
      toast.success("Item añadido correctamente");
      setShowAddModal(false);
      setFormData({ nombre: '', categoria: 'General', precio: '', stock: '', stock_minimo: '0', unidad: 'unidades' });
      fetchItems();
    } catch (err) {
      toast.error("Error al añadir el item");
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSaving(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedItem.id,
          table: 'inventory_items',
          nombre: editFormData.nombre,
          categoria: editFormData.categoria,
          precio: parseFloat(editFormData.precio),
          stock: parseInt(editFormData.stock),
          stock_minimo: parseInt(editFormData.stock_minimo),
          unidad: editFormData.unidad
        })
      });

      if (!res.ok) throw new Error('Error al actualizar');
      
      toast.success("Item actualizado");
      setShowEditModal(false);
      fetchItems();
    } catch (err) {
      toast.error("Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este item permanentemente?')) return;
    try {
      const res = await fetch(`/api/inventory?id=${id}&table=inventory_items`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success('Item eliminado');
      fetchItems();
    } catch (err) {
      toast.error('No se pudo eliminar el item');
    }
  };

  const stats = useMemo(() => {
    return {
      total: items.length,
      stockBajo: items.filter(i => i.stock <= i.stock_minimo).length,
      valorTotal: items.reduce((acc, curr) => acc + (curr.precio * curr.stock), 0)
    };
  }, [items]);

  const filteredItems = items.filter(item => 
    item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#080F1E]">
      <div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <DashboardPageContainer>
      {/* Header Section */}
      <div className="card-premium px-4 md:px-8 py-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111F3A] border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-[#1B4FD8]" />
            Inventario de Productos
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Control de stock y valoración de activos comerciales
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 text-sm group"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Añadir Producto
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Productos" value={stats.total} icon={Boxes} color="blue" />
        <StatCard title="Stock Crítico" value={stats.stockBajo} icon={AlertTriangle} color="red" />
        <StatCard title="Valorización" value={`€${stats.valorTotal.toLocaleString()}`} icon={DollarSign} color="emerald" />
      </div>

      {/* Controls */}
      <div className="card-premium p-4 mb-6 bg-[#111F3A] border-white/5">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Buscar por nombre o categoría..."
            className="w-full pl-12 pr-4 py-3 bg-[#080F1E] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="card-premium overflow-hidden bg-[#111F3A] border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#080F1E]/50 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Producto</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Categoría</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Precio</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Stock</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-white">{item.nombre}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-tight">{item.unidad}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold uppercase">
                      {item.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-white text-right">
                    €{item.precio.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={cn(
                      "text-sm font-mono font-bold",
                      item.stock <= item.stock_minimo ? "text-red-500" : "text-emerald-500"
                    )}>
                      {item.stock}
                    </div>
                    {item.stock <= item.stock_minimo && (
                      <div className="text-[9px] text-red-500/60 uppercase font-black tracking-tighter">Bajo Mínimo</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => { setSelectedItem(item); setShowViewModal(true); }}
                        className="p-2 hover:bg-white/10 text-slate-400 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => { 
                          setSelectedItem(item); 
                          setEditFormData({ ...item });
                          setShowEditModal(true); 
                        }}
                        className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="p-12 text-center text-slate-500 text-sm italic">
              No se encontraron productos en el inventario.
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111F3A] rounded-[24px] shadow-2xl border border-white/10 w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#080F1E]/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Detalle del Producto
              </h3>
              <button onClick={() => setShowViewModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <DetailField label="Nombre" value={selectedItem.nombre} icon={Tag} />
                <DetailField label="Categoría" value={selectedItem.categoria} icon={Hash} />
                <DetailField label="Precio" value={`€${selectedItem.precio.toFixed(2)}`} icon={DollarSign} />
                <DetailField label="Unidad" value={selectedItem.unidad} icon={Scale} />
                <DetailField label="Stock Actual" value={selectedItem.stock} icon={Boxes} highlight={selectedItem.stock <= selectedItem.stock_minimo ? 'red' : 'green'} />
                <DetailField label="Stock Mínimo" value={selectedItem.stock_minimo} icon={AlertTriangle} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/5 bg-[#080F1E]/30">
              <button onClick={() => setShowViewModal(false)} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                Cerrar Vista
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-[#111F3A] rounded-[24px] shadow-2xl border border-white/10 w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#080F1E]/50">
                <h3 className="text-lg font-bold text-white">Nuevo Producto</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddItem} className="p-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre del Producto</label>
                  <input required type="text" className="form-input-premium" placeholder="Ej: Cable de Cobre 2mm" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Categoría</label>
                    <input required type="text" className="form-input-premium" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unidad (Kg, m, ud)</label>
                    <input required type="text" className="form-input-premium" value={formData.unidad} onChange={e => setFormData({...formData, unidad: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Precio (€)</label>
                    <input required type="number" step="0.01" className="form-input-premium" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stock</label>
                    <input required type="number" className="form-input-premium" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mínimo</label>
                    <input required type="number" className="form-input-premium" value={formData.stock_minimo} onChange={e => setFormData({...formData, stock_minimo: e.target.value})} />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Cancelar</button>
                  <button type="submit" disabled={saving} className="flex-1 py-4 bg-[#1B4FD8] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Producto"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111F3A] rounded-[24px] shadow-2xl border border-white/10 w-full max-w-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#080F1E]/50">
              <h3 className="text-lg font-bold text-white">Editar Producto</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditItem} className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre</label>
                <input required type="text" className="form-input-premium" value={editFormData.nombre} onChange={e => setEditFormData({...editFormData, nombre: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Categoría</label>
                  <input required type="text" className="form-input-premium" value={editFormData.categoria} onChange={e => setEditFormData({...editFormData, categoria: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unidad</label>
                  <input required type="text" className="form-input-premium" value={editFormData.unidad} onChange={e => setEditFormData({...editFormData, unidad: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Precio</label>
                  <input required type="number" step="0.01" className="form-input-premium" value={editFormData.precio} onChange={e => setEditFormData({...editFormData, precio: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stock</label>
                  <input required type="number" className="form-input-premium" value={editFormData.stock} onChange={e => setEditFormData({...editFormData, stock: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mínimo</label>
                  <input required type="number" className="form-input-premium" value={editFormData.stock_minimo} onChange={e => setEditFormData({...editFormData, stock_minimo: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-4 bg-[#1B4FD8] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50">
                  {saving ? "Guardando..." : "Actualizar Producto"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <style jsx global>{`
        .form-input-premium {
          width: 100%;
          padding: 12px 16px;
          background-color: #080F1E;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          transition: all 0.2s;
        }
        .form-input-premium:focus {
          border-color: #1B4FD8;
          box-shadow: 0 0 0 4px rgba(27,79,216,0.1);
        }
      `}</style>
    </DashboardPageContainer>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10",
    red: "text-red-500 bg-red-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10"
  };

  return (
    <div className="card-premium p-6 flex items-center gap-4 group bg-[#111F3A] border-white/5 transition-transform hover:scale-[1.02]">
      <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</div>
        <div className="text-xl font-bold text-white mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function DetailField({ label, value, icon: Icon, highlight }: any) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3 text-slate-500" />
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn(
        "text-sm font-bold",
        highlight === 'red' ? "text-red-500" : highlight === 'green' ? "text-emerald-500" : "text-white"
      )}>
        {value}
      </div>
    </div>
  );
}
