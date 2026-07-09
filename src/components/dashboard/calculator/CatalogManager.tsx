"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  Plus,
  Check,
  Edit2,
  Upload,
  RefreshCw,
  Folder,
  Tag,
  Hash,
  DollarSign,
  ChevronDown,
  Power,
  Trash2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { useLanguage } from "@/lib/LanguageContext";
import toast from "react-hot-toast";

interface CatalogItem {
  id: string;
  organization_id: string;
  category: string;
  name: string;
  description: string | null;
  unit: string | null;
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface CatalogManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CatalogManager({ isOpen, onClose }: CatalogManagerProps) {
  const supabase = createClient();
  const { organization } = useOrganization();
  const { language } = useLanguage();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");

  // Form states for new item
  const [newCategory, setNewCategory] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newUnit, setNewUnit] = useState("ud");
  const [newPrice, setNewPrice] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Inline editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bilingual Dictionary
  const translations = {
    es: {
      title: "Catálogo de Conceptos",
      searchPlaceholder: "Buscar por nombre o descripción...",
      filterCategory: "Categoría",
      allCategories: "Todas las categorías",
      addBtn: "Nuevo Item",
      colName: "Concepto",
      colCategory: "Categoría",
      colUnit: "Unidad",
      colPrice: "Precio",
      colStatus: "Estado",
      colActions: "Acciones",
      statusActive: "Activo",
      statusInactive: "Inactivo",
      noRecords: "No se encontraron conceptos en el catálogo.",
      save: "Guardar",
      cancel: "Cancelar",
      create: "Crear Concepto",
      categoryLabel: "Categoría (Nueva o Existente)",
      nameLabel: "Nombre del Concepto",
      descLabel: "Descripción",
      unitLabel: "Unidad (ej. ud, m2, hrs)",
      priceLabel: "Precio Unitario",
      csvImport: "Importar CSV",
      csvTemplate: "Formato CSV esperado: Categoría, Nombre, Descripción, Unidad, Precio",
      csvSuccess: "Conceptos importados correctamente: {count}",
      csvError: "Error al importar el archivo CSV. Verifica el formato.",
      toastSaveSuccess: "Concepto guardado con éxito",
      toastUpdateSuccess: "Concepto actualizado con éxito",
      toastToggleSuccess: "Estado del concepto actualizado",
      toastDeleteSuccess: "Concepto eliminado con éxito",
      toastError: "Ocurrió un error inesperado",
      toastFieldsRequired: "Por favor rellena los campos requeridos (Categoría, Nombre, Precio)",
      deleteConfirm: "¿Eliminar este item del catálogo?",
    },
    en: {
      title: "Catalog Manager",
      searchPlaceholder: "Search by name or description...",
      filterCategory: "Category",
      allCategories: "All categories",
      addBtn: "New Item",
      colName: "Concept",
      colCategory: "Category",
      colUnit: "Unit",
      colPrice: "Price",
      colStatus: "Status",
      colActions: "Actions",
      statusActive: "Active",
      statusInactive: "Inactive",
      noRecords: "No concepts found in the catalog.",
      save: "Save",
      cancel: "Cancel",
      create: "Create Concept",
      categoryLabel: "Category (New or Existing)",
      nameLabel: "Concept Name",
      descLabel: "Description",
      unitLabel: "Unit (e.g. ud, m2, hrs)",
      priceLabel: "Unit Price",
      csvImport: "Import CSV",
      csvTemplate: "Expected CSV Format: Category, Name, Description, Unit, Price",
      csvSuccess: "Concepts imported successfully: {count}",
      csvError: "Error importing CSV file. Verify the format.",
      toastSaveSuccess: "Concept saved successfully",
      toastUpdateSuccess: "Concept updated successfully",
      toastToggleSuccess: "Concept status updated",
      toastDeleteSuccess: "Concept deleted successfully",
      toastError: "An unexpected error occurred",
      toastFieldsRequired: "Please fill in the required fields (Category, Name, Price)",
      deleteConfirm: "Delete this item from the catalog?",
    }
  };

  const t = translations[language === "es" ? "es" : "en"];
  const currencySymbol = organization?.currency_symbol || "€";

  useEffect(() => {
    if (isOpen) {
      fetchCatalog();
    }
  }, [isOpen, organization]);

  async function fetchCatalog() {
    if (!organization?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quote_catalog")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("active", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Error fetching quote catalog:", err);
      toast.error(t.toastError);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  // Extract unique categories
  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "todos" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim() || !newName.trim() || newPrice === "") {
      toast.error(t.toastFieldsRequired);
      return;
    }

    if (!organization?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("quote_catalog").insert({
        organization_id: organization.id,
        category: newCategory.trim(),
        name: newName.trim(),
        description: newDescription.trim() || null,
        unit: newUnit.trim() || null,
        price: parseFloat(newPrice) || 0,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success(t.toastSaveSuccess);
      // Reset form
      setNewCategory("");
      setNewName("");
      setNewDescription("");
      setNewUnit("ud");
      setNewPrice("");
      setIsAdding(false);

      fetchCatalog();
    } catch (err) {
      console.error("Error creating catalog item:", err);
      toast.error(t.toastError);
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
  };

  const handleSaveInline = async (item: CatalogItem) => {
    if (!editName.trim() || editPrice === "") {
      toast.error(t.toastFieldsRequired);
      return;
    }

    try {
      const { error } = await supabase
        .from("quote_catalog")
        .update({
          name: editName.trim(),
          price: parseFloat(editPrice) || 0,
          updated_at: new Date().toISOString()
        })
        .eq("id", item.id);

      if (error) throw error;

      toast.success(t.toastUpdateSuccess);
      setEditingId(null);
      fetchCatalog();
    } catch (err) {
      console.error("Error updating catalog item inline:", err);
      toast.error(t.toastError);
    }
  };

  const handleToggleActive = async (item: CatalogItem) => {
    try {
      const { error } = await supabase
        .from("quote_catalog")
        .update({
          active: !item.active,
          updated_at: new Date().toISOString()
        })
        .eq("id", item.id);

      if (error) throw error;

      toast.success(t.toastToggleSuccess);
      fetchCatalog();
    } catch (err) {
      console.error("Error toggling item status:", err);
      toast.error(t.toastError);
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, item: CatalogItem) => {
    e.stopPropagation();
    if (window.confirm(t.deleteConfirm)) {
      try {
        const { error } = await supabase
          .from("quote_catalog")
          .update({
            active: false,
            updated_at: new Date().toISOString()
          })
          .eq("id", item.id);

        if (error) throw error;

        toast.success(t.toastDeleteSuccess);
        fetchCatalog();
      } catch (err) {
        console.error("Error deleting catalog item:", err);
        toast.error(t.toastError);
      }
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !organization?.id) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split("\n");
        const insertPayload: any[] = [];

        // Simple CSV parser
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Skip headers if matches typical keywords
          if (i === 0 && (line.toLowerCase().includes("category") || line.toLowerCase().includes("categoria"))) {
            continue;
          }

          // Regex to parse CSV correctly handling quotes if any
          const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((p) => p.replace(/^"|"$/g, "").trim());

          if (parts.length >= 2) {
            const category = parts[0] || "General";
            const name = parts[1];
            const description = parts[2] || null;
            const unit = parts[3] || "ud";
            const price = parseFloat(parts[4]) || 0;

            if (name) {
              insertPayload.push({
                organization_id: organization.id,
                category,
                name,
                description,
                unit,
                price,
                active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          }
        }

        if (insertPayload.length > 0) {
          const { error } = await supabase.from("quote_catalog").insert(insertPayload);
          if (error) throw error;
          toast.success(t.csvSuccess.replace("{count}", insertPayload.length.toString()));
          fetchCatalog();
        } else {
          toast.error(t.csvError);
        }
      } catch (err) {
        console.error("Error parsing CSV:", err);
        toast.error(t.csvError);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[#111F3A] rounded-[24px] w-full max-w-4xl my-auto flex flex-col max-h-[90vh] shadow-2xl border border-[#1E3A5F] overflow-hidden">
        {/* Header */}
        <div className="px-6 md:px-8 py-5 border-b border-[#1E3A5F] flex items-center justify-between bg-[#111F3A]/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2 tracking-tight uppercase">
              <Tag className="w-5 h-5 text-[#1B4FD8]" />
              {t.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* CSV Import / New Item Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-2 bg-[#1B4FD8] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                {t.addBtn}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-slate-700 active:scale-95"
              >
                <Upload className="w-4 h-4" />
                {t.csvImport}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium italic">{t.csvTemplate}</p>
          </div>

          {/* Add Concept Form Card */}
          {isAdding && (
            <form
              onSubmit={handleCreateItem}
              className="bg-[#162040]/40 p-5 rounded-2xl border border-[#1E3A5F] space-y-4 animate-in slide-in-from-top-4 duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category */}
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t.categoryLabel}
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    list="existing-categories"
                    required
                    placeholder="e.g. Materiales"
                    className="w-full px-4 py-2.5 bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-white"
                  />
                  <datalist id="existing-categories">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                {/* Concept Name */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="e.g. Interruptor Magnetotérmico 16A"
                    className="w-full px-4 py-2.5 bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-white"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t.descLabel}
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="e.g. Instalación y conexión en cuadro de mando"
                    className="w-full px-4 py-2.5 bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-white"
                  />
                </div>

                {/* Unit */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t.unitLabel}
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="ud"
                    className="w-full px-4 py-2.5 bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-white"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t.priceLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      required
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-white"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      {currencySymbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="bg-transparent hover:bg-white/5 text-slate-300 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#1B4FD8] hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {t.create}
                </button>
              </div>
            </form>
          )}

          {/* Search, Filter bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#162040] border border-[#1E3A5F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#1B4FD8]/25 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#162040] border border-[#1E3A5F] rounded-xl shrink-0">
              <Folder className="w-4 h-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-300 uppercase tracking-tight outline-none cursor-pointer"
              >
                <option value="todos" className="bg-[#111F3A] text-white">
                  {t.allCategories}
                </option>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#111F3A] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Catalog items table */}
          <div className="border border-[#1E3A5F] rounded-2xl overflow-hidden bg-[#162040]/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#162040]/60 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-[#1E3A5F]">
                    <th className="px-5 py-4 w-1/3">{t.colName}</th>
                    <th className="px-5 py-4">{t.colCategory}</th>
                    <th className="px-5 py-4">{t.colUnit}</th>
                    <th className="px-5 py-4 text-right">{t.colPrice}</th>
                    <th className="px-5 py-4 text-center">{t.colStatus}</th>
                    <th className="px-5 py-4 text-center">{t.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E3A5F]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#1B4FD8] mb-2" />
                        Cargando catálogo...
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                        {t.noRecords}
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const isEditing = editingId === item.id;
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#162040]/30 transition-colors text-sm text-slate-200"
                        >
                          {/* Name */}
                          <td className="px-5 py-4">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-3 py-1 bg-[#162040] border border-[#1B4FD8]/45 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/20"
                              />
                            ) : (
                              <div>
                                <p className="font-semibold text-white">{item.name}</p>
                                {item.description && (
                                  <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Category */}
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 bg-blue-500/10 text-[#60A5FA] text-xs font-semibold rounded-lg border border-blue-500/20">
                              {item.category}
                            </span>
                          </td>

                          {/* Unit */}
                          <td className="px-5 py-4 font-mono text-xs text-slate-300">
                            {item.unit || "-"}
                          </td>

                          {/* Price */}
                          <td className="px-5 py-4 text-right">
                            {isEditing ? (
                              <div className="relative inline-block w-24">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  className="w-full pl-5 pr-2 py-1 bg-[#162040] border border-[#1B4FD8]/45 rounded-lg text-sm text-right text-white focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/20"
                                />
                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                  {currencySymbol}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold text-white tabular-nums">
                                {item.price.toFixed(2)} {currencySymbol}
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => handleToggleActive(item)}
                              title="Toggle status"
                              className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 mx-auto transition-colors border ${
                                item.active
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                  : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                              }`}
                            >
                              <Power className="w-3 h-3" />
                              {item.active ? t.statusActive : t.statusInactive}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveInline(item)}
                                    className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 rounded-lg transition-colors"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1.5 text-slate-400 hover:bg-white/5 border border-transparent hover:border-[#1E3A5F] rounded-lg transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEdit(item)}
                                    className="p-1.5 text-slate-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-[#1E3A5F] rounded-lg transition-colors"
                                    title={language === "es" ? "Editar" : "Edit"}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteItem(e, item)}
                                    className="p-1.5 text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-colors"
                                    title={language === "es" ? "Eliminar" : "Delete"}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
