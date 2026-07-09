"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  Plus,
  Trash2,
  Save,
  FileText,
  ChevronDown,
  User,
  Mail,
  Info,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Calculator,
  Percent,
  PlusCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { useLanguage } from "@/lib/LanguageContext";
import { getTaxLabel } from "@/lib/regionConfig";
import { format, addDays } from "date-fns";
import toast from "react-hot-toast";

interface QuoteCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  calculationToEdit?: any;
}

interface ItemRow {
  id: string; // client-side local id
  category: string;
  catalog_item_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
}

export default function QuoteCalculator({
  isOpen,
  onClose,
  onSaved,
  calculationToEdit
}: QuoteCalculatorProps) {
  const supabase = createClient();
  const { organization } = useOrganization();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const taxLabel = getTaxLabel(organization?.country);
  const currencySymbol = organization?.currency_symbol || "€";

  // Bilingual Dictionary
  const translations = {
    es: {
      newTitle: "Nueva Calculación",
      editTitle: "Editar Calculación",
      secBasic: "Sección 1: Datos Básicos",
      secItems: "Sección 2: Conceptos y Fórmulas",
      secAdjustments: "Sección 3: Ajustes y Resumen",
      secNotes: "Sección 4: Notas del Cálculo",
      calcTitle: "Título del Cálculo (Obligatorio)",
      calcTitlePlaceholder: "ej. Presupuesto Reforma Local Comercial",
      clientSearch: "Buscar Cliente (Tabla clients)",
      clientPlaceholder: "Escribe para buscar cliente...",
      manualClient: "Nombre del Cliente (Manual si no existe)",
      emailLabel: "Email del Cliente",
      colCategory: "Categoría",
      colItem: "Concepto del Catálogo",
      colDesc: "Descripción libre / Detalle",
      colQty: "Cant.",
      colPrice: "Precio Unit.",
      colTotal: "Total",
      addItem: "Añadir Concepto",
      subtotalLabel: "Subtotal",
      markupLabel: "Margen / Markup (%)",
      markupAmountLabel: "Importe Margen",
      discountLabel: "Descuento (%)",
      discountAmountLabel: "Importe Descuento",
      taxLabelText: `Impuesto ${taxLabel} (%)`,
      taxAmountLabel: `Cuota ${taxLabel}`,
      totalLabel: "Total del Cálculo",
      notesLabel: "Notas y Términos adicionales",
      notesPlaceholder: "Notas internas, forma de pago, validez de la oferta...",
      saveBtn: "Guardar Cálculo",
      newBtn: "Limpiar todo",
      estimateBtn: "Usar en Presupuesto",
      deleteBtn: "Eliminar Cálculo",
      toastFieldsRequired: "El título, el cliente y al menos un concepto son obligatorios.",
      toastSaveSuccess: "Cálculo guardado con éxito",
      toastExportSuccess: "Presupuesto creado con éxito como {num}",
      toastDeleteSuccess: "Cálculo eliminado",
      toastError: "Ocurrió un error inesperado",
      deleteConfirm: "¿Estás seguro de que quieres eliminar este cálculo?",
      exportConfirm: "¿Deseas exportar este cálculo a la tabla de Presupuestos?",
      noCatalogItems: "Sin items. Crea algunos en Gestionar Catálogo.",
      selectCategoryFirst: "Selecciona una categoría",
      searchCatalogPlaceholder: "Buscar concepto...",
    },
    en: {
      newTitle: "New Calculation",
      editTitle: "Edit Calculation",
      secBasic: "Section 1: Basic Information",
      secItems: "Section 2: Items & Formulas",
      secAdjustments: "Section 3: Adjustments & Summary",
      secNotes: "Section 4: Calculations Notes",
      calcTitle: "Calculation Title (Required)",
      calcTitlePlaceholder: "e.g. Commercial Local Renovation Quote",
      clientSearch: "Search Customer (clients table)",
      clientPlaceholder: "Type to search customer...",
      manualClient: "Customer Name (Manual if not in DB)",
      emailLabel: "Customer Email",
      colCategory: "Category",
      colItem: "Catalog Item",
      colDesc: "Free description / Detail",
      colQty: "Qty",
      colPrice: "Unit Price",
      colTotal: "Total",
      addItem: "Add Concept",
      subtotalLabel: "Subtotal",
      markupLabel: "Margin / Markup (%)",
      markupAmountLabel: "Markup Amount",
      discountLabel: "Discount (%)",
      discountAmountLabel: "Discount Amount",
      taxLabelText: `Tax ${taxLabel} (%)`,
      taxAmountLabel: `Tax Amount`,
      totalLabel: "Final Total",
      notesLabel: "Additional Notes & Terms",
      notesPlaceholder: "Internal remarks, payment terms, offer validity...",
      saveBtn: "Save Calculation",
      newBtn: "Clear all",
      estimateBtn: "Use in Estimate",
      deleteBtn: "Delete Calculation",
      toastFieldsRequired: "Title, customer, and at least one item are required.",
      toastSaveSuccess: "Calculation saved successfully",
      toastExportSuccess: "Estimate successfully created as {num}",
      toastDeleteSuccess: "Calculation deleted",
      toastError: "An unexpected error occurred",
      deleteConfirm: "Are you sure you want to delete this calculation?",
      exportConfirm: "Do you want to export this calculation to the Estimates table?",
      noCatalogItems: "No items. Create some in Manage Catalog.",
      selectCategoryFirst: "Select a category first",
      searchCatalogPlaceholder: "Search concept...",
    }
  };

  const t = translations[language === "es" ? "es" : "en"];

  // Page Form State
  const [calcId, setCalcId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [items, setItems] = useState<ItemRow[]>([
    { id: Math.random().toString(), category: "", catalog_item_id: null, description: "", quantity: 1, unit_price: 0 }
  ]);
  const [markupPercent, setMarkupPercent] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxRate, setTaxRate] = useState(21);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("draft");
  const [estimateId, setEstimateId] = useState<string | null>(null);

  // Db Catalog items
  const [catalogItems, setCatalogItems] = useState<any[]>([]);

  // Search states for clients
  const [searchClientQuery, setSearchClientQuery] = useState("");
  const [clientSearchResults, setClientSearchResults] = useState<any[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Dropdown UI states for searchable catalog dropdowns per row
  const [activeCatalogRowId, setActiveCatalogRowId] = useState<string | null>(null);
  const [catalogSearchQueries, setCatalogSearchQueries] = useState<{ [rowId: string]: string }>({});

  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const catalogDropdownRefs = useRef<{ [rowId: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (isOpen) {
      fetchCatalogItems();
    }
  }, [isOpen, organization?.id]);

  useEffect(() => {
    // Click outside handler for dropdowns
    function handleClickOutside(event: MouseEvent) {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false);
      }
      
      if (activeCatalogRowId) {
        const ref = catalogDropdownRefs.current[activeCatalogRowId];
        if (ref && !ref.contains(event.target as Node)) {
          setActiveCatalogRowId(null);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeCatalogRowId]);

  // Load calculation details if editing
  useEffect(() => {
    if (!isOpen) return;

    if (calculationToEdit) {
      setCalcId(calculationToEdit.id);
      setTitle(calculationToEdit.title || "");
      setClientName(calculationToEdit.client_name || "");
      setSearchClientQuery(calculationToEdit.client_name || "");
      setClientEmail(calculationToEdit.client_email || "");
      
      // Items parser
      if (calculationToEdit.items && Array.isArray(calculationToEdit.items)) {
        const mappedItems = calculationToEdit.items.map((it: any) => ({
          id: it.id || Math.random().toString(),
          category: it.category || "",
          catalog_item_id: it.catalog_item_id || null,
          description: it.description || "",
          quantity: it.quantity ?? 1,
          unit_price: it.unit_price ?? 0
        }));
        setItems(mappedItems);
      } else {
        setItems([{ id: Math.random().toString(), category: "", catalog_item_id: null, description: "", quantity: 1, unit_price: 0 }]);
      }
      
      setMarkupPercent(calculationToEdit.markup_percent ?? 0);
      setDiscountPercent(calculationToEdit.discount_percent ?? 0);
      setTaxRate(calculationToEdit.tax_rate ?? 21);
      setNotes(calculationToEdit.notes || "");
      setStatus(calculationToEdit.status || "draft");
      setEstimateId(calculationToEdit.estimate_id || null);
    } else {
      handleReset();
    }
  }, [isOpen, calculationToEdit]);

  async function fetchCatalogItems() {
    if (!organization?.id) return;
    try {
      const { data, error } = await supabase
        .from("quote_catalog")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      setCatalogItems(data || []);
    } catch (err) {
      console.error("Error fetching quote catalog items:", err);
    }
  }

  // Client search logic
  useEffect(() => {
    if (!searchClientQuery || searchClientQuery.length < 1) {
      setClientSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      if (!organization?.id) return;
      try {
        const { data, error } = await supabase
          .from("clients")
          .select("id, name, email")
          .eq("organization_id", organization.id)
          .ilike("name", `%${searchClientQuery}%`)
          .limit(10);

        if (!error && data) {
          setClientSearchResults(data);
        }
      } catch (err) {
        console.error("Error searching clients:", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchClientQuery, organization?.id]);

  const handleReset = () => {
    setCalcId(null);
    setTitle("");
    setClientName("");
    setSearchClientQuery("");
    setClientEmail("");
    setItems([{ id: Math.random().toString(), category: "", catalog_item_id: null, description: "", quantity: 1, unit_price: 0 }]);
    setMarkupPercent(0);
    setDiscountPercent(0);
    setTaxRate(21);
    setNotes("");
    setStatus("draft");
    setEstimateId(null);
  };

  const handleSelectClient = (client: any) => {
    setClientName(client.name);
    setSearchClientQuery(client.name);
    setClientEmail(client.email || "");
    setShowClientDropdown(false);
  };

  // Row Manipulation
  const handleAddRow = () => {
    setItems([
      ...items,
      { id: Math.random().toString(), category: "", catalog_item_id: null, description: "", quantity: 1, unit_price: 0 }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateRow = (id: string, field: keyof ItemRow, value: any) => {
    setItems(
      items.map((row) => {
        if (row.id === id) {
          const updated = { ...row, [field]: value };
          // If category changes, reset catalog item selection
          if (field === "category") {
            updated.catalog_item_id = null;
            updated.description = "";
            updated.unit_price = 0;
          }
          return updated;
        }
        return row;
      })
    );
  };

  const handleSelectCatalogItem = (rowId: string, catItem: any) => {
    setItems(
      items.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            catalog_item_id: catItem.id,
            description: `${catItem.name}${catItem.description ? ` - ${catItem.description}` : ""}`,
            unit_price: catItem.price || 0
          };
        }
        return row;
      })
    );
    setActiveCatalogRowId(null);
  };

  // Calculations
  const subtotal = items.reduce((acc, row) => acc + (row.quantity || 0) * (row.unit_price || 0), 0);
  const markupAmount = subtotal * (markupPercent / 100);
  const discountAmount = (subtotal + markupAmount) * (discountPercent / 100);
  const taxableAmount = subtotal + markupAmount - discountAmount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const total = taxableAmount + taxAmount;

  // Extract unique categories from catalog
  const uniqueCategories = Array.from(new Set(catalogItems.map((item) => item.category).filter(Boolean)));
  const finalCategories = uniqueCategories.length > 0 ? uniqueCategories : ["Materiales", "Mano de obra", "Servicios", "Equipos"];

  // Save calculation
  const handleSaveCalculation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const validItems = items.filter((row) => row.description.trim() !== "");
    if (!title.trim() || !clientName.trim() || validItems.length === 0) {
      toast.error(t.toastFieldsRequired);
      return false;
    }

    if (!organization?.id) return false;

    setSaving(true);
    try {
      const payload = {
        organization_id: organization.id,
        estimate_id: estimateId || null,
        title: title.trim(),
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || null,
        items: validItems,
        subtotal,
        markup_percent: markupPercent,
        markup_amount: markupAmount,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        notes: notes.trim() || null,
        status: status,
        updated_at: new Date().toISOString()
      };

      if (calcId) {
        const { error } = await supabase
          .from("quote_calculations")
          .update(payload)
          .eq("id", calcId);

        if (error) throw error;
        toast.success(t.toastSaveSuccess);
      } else {
        const { data, error } = await supabase
          .from("quote_calculations")
          .insert({
            ...payload,
            created_at: new Date().toISOString()
          })
          .select("id")
          .single();

        if (error) throw error;
        if (data) setCalcId(data.id);
        toast.success(t.toastSaveSuccess);
      }

      onSaved();
      return true;
    } catch (err) {
      console.error("Error saving quote calculation:", err);
      toast.error(t.toastError);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Generate Estimate number
  const getNextEstimateNumber = async (orgId: string): Promise<string> => {
    const currentYear = new Date().getFullYear();
    const prefix = `PRE-${currentYear}-`;
    
    try {
      const { data, error } = await supabase
        .from("estimates")
        .select("estimate_number")
        .eq("organization_id", orgId)
        .like("estimate_number", `${prefix}%`);
        
      if (error) throw error;
      
      let maxSeq = 0;
      if (data && data.length > 0) {
        data.forEach((est: any) => {
          const parts = est.estimate_number.split("-");
          if (parts.length >= 3) {
            const seq = parseInt(parts[2], 10);
            if (!isNaN(seq) && seq > maxSeq) {
              maxSeq = seq;
            }
          }
        });
      }
      
      const nextSeq = maxSeq + 1;
      return `${prefix}${String(nextSeq).padStart(3, "0")}`;
    } catch (err) {
      console.error("Error generating estimate number, fallback used:", err);
      return `${prefix}001`;
    }
  };

  // Export to Estimates
  const handleExportToEstimate = async () => {
    if (!confirm(t.exportConfirm)) return;

    // Save calculation first to ensure database consistency
    const saved = await handleSaveCalculation();
    if (!saved) return;

    setLoading(true);
    try {
      const validItems = items.filter((row) => row.description.trim() !== "");
      const estimateNumber = await getNextEstimateNumber(organization!.id);

      // Create estimate items format: { description, quantity, unit_price }
      const estimateItems: any[] = validItems.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price
      }));

      // Append markup as a line item if greater than 0
      if (markupAmount > 0) {
        estimateItems.push({
          description: `Margen / Markup (${markupPercent}%)`,
          quantity: 1,
          unit_price: markupAmount
        });
      }

      // Append discount as a line item if greater than 0
      if (discountAmount > 0) {
        estimateItems.push({
          description: `Descuento / Discount (${discountPercent}%)`,
          quantity: 1,
          unit_price: -discountAmount
        });
      }

      // Insert estimate
      const { data: newEst, error: estError } = await supabase
        .from("estimates")
        .insert({
          organization_id: organization!.id,
          estimate_number: estimateNumber,
          customer_name: clientName,
          customer_email: clientEmail || null,
          items: estimateItems,
          subtotal: taxableAmount, // Subtotal of estimate matches our taxable subtotal (including markup & discount lines)
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total: total,
          notes: notes || null,
          status: "draft",
          valid_until: format(addDays(new Date(), 15), "yyyy-MM-dd"),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select("id")
        .single();

      if (estError) throw estError;

      // Update quote calculation with estimate_id and status
      if (newEst) {
        const { error: calcUpdateError } = await supabase
          .from("quote_calculations")
          .update({
            estimate_id: newEst.id,
            status: "converted",
            updated_at: new Date().toISOString()
          })
          .eq("id", calcId || ""); // Wait! If it wasn't saved, calcId is set in handleSaveCalculation.

        if (calcUpdateError) throw calcUpdateError;
        setEstimateId(newEst.id);
        setStatus("converted");
        toast.success(t.toastExportSuccess.replace("{num}", estimateNumber));
      }

      onSaved();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      console.error("Error exporting to estimate:", err);
      toast.error(t.toastError);
    } finally {
      setLoading(false);
    }
  };

  // Delete calculation
  const handleDeleteCalculation = async () => {
    if (!calcId) return;
    if (!confirm(t.deleteConfirm)) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("quote_calculations").delete().eq("id", calcId);
      if (error) throw error;
      toast.success(t.toastDeleteSuccess);
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error deleting calculation:", err);
      toast.error(t.toastError);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[#111F3A] w-full h-full md:h-auto md:max-h-[95vh] md:rounded-[24px] flex flex-col shadow-2xl border-none md:border md:border-[#1E3A5F] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E3A5F] flex items-center justify-between bg-[#111F3A]/80 backdrop-blur-md sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B4FD8] to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                {calculationToEdit ? t.editTitle : t.newTitle}
                {status === "converted" && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/25">
                    CONVERTIDO
                  </span>
                )}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content double column */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column: Sections 1 & 2 */}
          <div className="xl:col-span-2 space-y-6">
            {/* Section 1: Basic Information */}
            <div className="bg-[#162040]/40 p-5 md:p-6 rounded-2xl border border-[#1E3A5F] space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Info className="w-4 h-4 text-[#1B4FD8]" />
                {t.secBasic}
              </h3>

              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t.calcTitle}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder={t.calcTitlePlaceholder}
                    className="w-full px-4 py-3 bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Client Search */}
                  <div className="space-y-1.5 relative" ref={clientDropdownRef}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      {t.clientSearch}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchClientQuery}
                        onChange={(e) => {
                          setSearchClientQuery(e.target.value);
                          setClientName(e.target.value);
                          setShowClientDropdown(true);
                        }}
                        onFocus={() => setShowClientDropdown(true)}
                        placeholder={t.clientPlaceholder}
                        className="w-full pl-10 pr-4 py-3 bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-white"
                      />
                    </div>

                    {showClientDropdown && clientSearchResults.length > 0 && (
                      <div className="absolute z-[99] top-full left-0 right-0 mt-1 bg-[#111F3A] border border-[#1E3A5F] rounded-xl shadow-2xl overflow-hidden divide-y divide-[#1E3A5F] max-h-60 overflow-y-auto">
                        {clientSearchResults.map((cli) => (
                          <button
                            key={cli.id}
                            type="button"
                            onClick={() => handleSelectClient(cli)}
                            className="w-full text-left px-4 py-3 hover:bg-[#1C2C4E] transition-colors text-sm text-slate-200"
                          >
                            <p className="font-bold text-white">{cli.name}</p>
                            {cli.email && <p className="text-xs text-slate-400">{cli.email}</p>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Client Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      {t.emailLabel}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="w-full pl-10 pr-4 py-3 bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Items & Dynamic Rows */}
            <div className="bg-[#162040]/40 p-5 md:p-6 rounded-2xl border border-[#1E3A5F] space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-[#1B4FD8]" />
                  {t.secItems}
                </span>
                <span className="text-[10px] font-bold text-slate-500 italic">
                  Subtotal: {subtotal.toFixed(2)} {currencySymbol}
                </span>
              </h3>

              <div className="space-y-4">
                {items.map((row, index) => {
                  // Filter catalog items for this category
                  const filteredCatalog = catalogItems.filter(
                    (it) => it.category === row.category
                  );
                  const searchQuery = catalogSearchQueries[row.id] || "";
                  const doubleFilteredCatalog = filteredCatalog.filter(
                    (it) =>
                      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (it.description &&
                        it.description.toLowerCase().includes(searchQuery.toLowerCase()))
                  );

                  return (
                    <div
                      key={row.id}
                      className="bg-[#162040]/30 p-4 rounded-xl border border-[#1E3A5F]/40 flex flex-col gap-3 relative group"
                    >
                      {/* Grid for Selectors */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Category Selector */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                            {t.colCategory}
                          </label>
                          <div className="relative">
                            <select
                              value={row.category}
                              onChange={(e) => handleUpdateRow(row.id, "category", e.target.value)}
                              className="w-full pl-3 pr-8 py-2 bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-lg text-xs transition-all outline-none text-white appearance-none cursor-pointer"
                            >
                              <option value="">{t.selectCategoryFirst}</option>
                              {finalCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Catalog Item Custom Dropdown Searcher */}
                        <div
                          className="space-y-1 relative md:col-span-2"
                          ref={(el) => {
                            catalogDropdownRefs.current[row.id] = el;
                          }}
                        >
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                            {t.colItem}
                          </label>

                          <button
                            type="button"
                            disabled={!row.category}
                            onClick={() => {
                              setActiveCatalogRowId(row.id);
                              setCatalogSearchQueries({
                                ...catalogSearchQueries,
                                [row.id]: ""
                              });
                            }}
                            className="w-full px-3 py-2 bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-lg text-xs text-left text-white flex items-center justify-between transition-all disabled:opacity-40"
                          >
                            <span className="truncate">
                              {row.catalog_item_id
                                ? catalogItems.find((it) => it.id === row.catalog_item_id)?.name ||
                                  "Selected Item"
                                : row.category
                                ? "Seleccionar Concepto..."
                                : "Selecciona una categoría primero"}
                            </span>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          </button>

                          {/* Float Search Dropdown */}
                          {activeCatalogRowId === row.id && (
                            <div className="absolute z-[999] top-full left-0 right-0 mt-1 bg-[#111F3A] border border-[#1E3A5F] rounded-xl shadow-2xl overflow-hidden p-2 space-y-2">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder={t.searchCatalogPlaceholder}
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setCatalogSearchQueries({
                                      ...catalogSearchQueries,
                                      [row.id]: e.target.value
                                    })
                                  }
                                  className="w-full bg-[#162040] border border-[#1E3A5F] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none"
                                />
                              </div>

                              <div className="max-h-40 overflow-y-auto divide-y divide-[#1E3A5F]/40">
                                {doubleFilteredCatalog.length === 0 ? (
                                  <p className="text-[11px] text-slate-400 text-center py-2">
                                    {filteredCatalog.length === 0 ? t.noCatalogItems : "Sin resultados"}
                                  </p>
                                ) : (
                                  doubleFilteredCatalog.map((catItem) => (
                                    <button
                                      key={catItem.id}
                                      type="button"
                                      onClick={() => handleSelectCatalogItem(row.id, catItem)}
                                      className="w-full text-left px-2 py-2 hover:bg-[#1C2C4E] rounded-lg transition-colors text-[11px] text-slate-200"
                                    >
                                      <p className="font-bold text-white">{catItem.name}</p>
                                      {catItem.description && (
                                        <p className="text-[10px] text-slate-400 truncate">
                                          {catItem.description}
                                        </p>
                                      )}
                                      <p className="text-[10px] text-[#60A5FA] font-bold mt-0.5">
                                        Price: {catItem.price} {currencySymbol} {catItem.unit ? `/${catItem.unit}` : ""}
                                      </p>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Line description, inputs and results */}
                      <div className="flex flex-col md:flex-row gap-3 items-end">
                        {/* Description field */}
                        <div className="flex-1 w-full space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                            {t.colDesc}
                          </label>
                          <input
                            type="text"
                            value={row.description}
                            onChange={(e) => handleUpdateRow(row.id, "description", e.target.value)}
                            placeholder="Detalle o descripción específica..."
                            className="w-full px-3 py-2 bg-[#162040] border border-transparent focus:border-[#1B4FD8]/25 rounded-lg text-xs outline-none text-white font-medium"
                          />
                        </div>

                        {/* Quantity */}
                        <div className="w-full md:w-20 space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                            {t.colQty}
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) =>
                              handleUpdateRow(row.id, "quantity", parseInt(e.target.value, 10) || 0)
                            }
                            className="w-full px-3 py-2 bg-[#162040] border border-transparent focus:border-[#1B4FD8]/25 rounded-lg text-xs text-right outline-none text-white"
                          />
                        </div>

                        {/* Price Unit */}
                        <div className="w-full md:w-28 space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                            {t.colPrice}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              value={row.unit_price}
                              onChange={(e) =>
                                handleUpdateRow(row.id, "unit_price", parseFloat(e.target.value) || 0)
                              }
                              className="w-full pl-6 pr-3 py-2 bg-[#162040] border border-transparent focus:border-[#1B4FD8]/25 rounded-lg text-xs text-right outline-none text-white font-bold"
                            />
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                              {currencySymbol}
                            </span>
                          </div>
                        </div>

                        {/* Row Total */}
                        <div className="w-full md:w-24 text-right pr-2 text-xs font-bold text-slate-300 tabular-nums self-center mb-1">
                          <span className="text-[9px] text-slate-500 uppercase block tracking-wider md:hidden mb-0.5">
                            {t.colTotal}
                          </span>
                          {((row.quantity || 0) * (row.unit_price || 0)).toFixed(2)} {currencySymbol}
                        </div>

                        {/* Trash */}
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          disabled={items.length === 1}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 mb-0.5 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-2 bg-[#1B4FD8]/10 hover:bg-[#1B4FD8]/20 text-[#60A5FA] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-[#1B4FD8]/20"
              >
                <PlusCircle className="w-4 h-4" />
                {t.addItem}
              </button>
            </div>
          </div>

          {/* Right Column: Section 3 (Adjustments) & Section 4 (Notes) & Actions */}
          <div className="space-y-6">
            {/* Section 3: Summary and adjustments */}
            <div className="bg-[#162040]/40 p-5 md:p-6 rounded-2xl border border-[#1E3A5F] space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Percent className="w-4 h-4 text-[#1B4FD8]" />
                {t.secAdjustments}
              </h3>

              <div className="space-y-3.5 text-slate-300">
                {/* Subtotal Display */}
                <div className="flex justify-between items-center text-sm border-b border-[#1E3A5F]/40 pb-2">
                  <span className="text-slate-400 font-medium">{t.subtotalLabel}:</span>
                  <span className="font-bold text-white tabular-nums">
                    {subtotal.toFixed(2)} {currencySymbol}
                  </span>
                </div>

                {/* Markup Percent */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">{t.markupLabel}:</span>
                  <div className="relative w-24">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={markupPercent}
                      onChange={(e) => setMarkupPercent(parseFloat(e.target.value) || 0)}
                      className="w-full pr-6 pl-3 py-1 bg-[#162040] border border-[#1E3A5F] rounded-lg text-sm text-right outline-none text-white font-bold"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      %
                    </span>
                  </div>
                </div>

                {/* Markup Amount Display */}
                {markupPercent > 0 && (
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>{t.markupAmountLabel}:</span>
                    <span className="font-bold tabular-nums">
                      +{markupAmount.toFixed(2)} {currencySymbol}
                    </span>
                  </div>
                )}

                {/* Discount Percent */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">{t.discountLabel}:</span>
                  <div className="relative w-24">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                      className="w-full pr-6 pl-3 py-1 bg-[#162040] border border-[#1E3A5F] rounded-lg text-sm text-right outline-none text-white font-bold"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      %
                    </span>
                  </div>
                </div>

                {/* Discount Amount Display */}
                {discountPercent > 0 && (
                  <div className="flex justify-between items-center text-xs text-slate-400 border-b border-[#1E3A5F]/40 pb-2">
                    <span>{t.discountAmountLabel}:</span>
                    <span className="font-bold text-red-400 tabular-nums">
                      -{discountAmount.toFixed(2)} {currencySymbol}
                    </span>
                  </div>
                )}

                {/* Tax Rate Percent */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">{t.taxLabelText}:</span>
                  <div className="relative w-24">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-full pr-6 pl-3 py-1 bg-[#162040] border border-[#1E3A5F] rounded-lg text-sm text-right outline-none text-white font-bold"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      %
                    </span>
                  </div>
                </div>

                {/* Tax Amount Display */}
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>{t.taxAmountLabel}:</span>
                  <span className="font-bold tabular-nums">
                    {taxAmount.toFixed(2)} {currencySymbol}
                  </span>
                </div>

                {/* Final Total Display */}
                <div className="flex justify-between items-center text-base border-t border-[#1E3A5F] pt-3 mt-1 bg-[#1B4FD8]/10 p-3 rounded-xl border border-dashed border-[#1B4FD8]/30">
                  <span className="text-white font-black uppercase tracking-wider">{t.totalLabel}:</span>
                  <span className="font-black text-white text-lg tabular-nums">
                    {total.toFixed(2)} {currencySymbol}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4: Notes */}
            <div className="bg-[#162040]/40 p-5 md:p-6 rounded-2xl border border-[#1E3A5F] space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <FileText className="w-4 h-4 text-[#1B4FD8]" />
                {t.secNotes}
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                rows={4}
                className="w-full p-3 bg-[#162040] border border-[#1E3A5F] rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#1B4FD8]/20 transition-all resize-none"
              />
            </div>

            {/* General Actions */}
            <div className="flex flex-col gap-3">
              {/* Save Button */}
              <button
                type="button"
                onClick={() => handleSaveCalculation()}
                disabled={saving || loading}
                className="flex items-center justify-center gap-2 bg-[#1B4FD8] hover:bg-blue-700 text-white w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {t.saveBtn}
              </button>

              {/* Estimate Button */}
              {calcId && status !== "converted" && (
                <button
                  type="button"
                  onClick={handleExportToEstimate}
                  disabled={loading || saving}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 animate-pulse"
                >
                  <FileCheck className="w-4 h-4" />
                  {t.estimateBtn}
                </button>
              )}

              {/* New/Clear Button */}
              <button
                type="button"
                onClick={handleReset}
                disabled={loading || saving}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-slate-700 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t.newBtn}
              </button>

              {/* Delete Button */}
              {calcId && (
                <button
                  type="button"
                  onClick={handleDeleteCalculation}
                  disabled={loading || saving}
                  className="flex items-center justify-center gap-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-red-500/20 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.deleteBtn}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
