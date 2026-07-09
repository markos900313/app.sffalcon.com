"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  RefreshCw, 
  FileText, 
  Users, 
  Type, 
  Euro, 
  Percent, 
  Calendar, 
  StickyNote, 
  ChevronDown,
  Trash2,
  Plus
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useOrganization } from '@/context/OrganizationContext';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  estimateToEdit?: any;
}

interface Item {
  description: string;
  quantity: number;
  unit_price: number;
}

export default function EstimateModal({ isOpen, onClose, onSaved, estimateToEdit }: EstimateModalProps) {
  const supabase = createClient();
  const { organization } = useOrganization();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  function getTaxLabel(country?: string): string {
    const c = (country || 'ES').toUpperCase();
    if (c === 'GB') return 'VAT';
    if (['US','CA','MX','AU'].includes(c)) return 'Tax';
    return 'IVA';
  }

  const taxLabel = getTaxLabel(organization?.country);

  // Local translations
  const modalTranslations = {
    es: {
      newTitle: "Nuevo Presupuesto",
      editTitle: "Editar Presupuesto {number}",
      desc: "Completa los datos del presupuesto para tu cliente.",
      clientLabel: "Cliente (Buscar o escribir)",
      clientPlaceholder: "Escribe para buscar cliente...",
      emailLabel: "Email del Cliente",
      phoneLabel: "Teléfono del Cliente",
      addressLabel: "Dirección del Cliente",
      itemsLabel: "Artículos / Conceptos",
      itemDesc: "Descripción del servicio o producto",
      itemQty: "Cant.",
      itemPrice: "Precio Unit.",
      itemTotal: "Total",
      addItem: "+ Añadir Item",
      subtotalLabel: "Subtotal",
      taxRateLabel: `${taxLabel} (%)`,
      totalLabel: "Total Presupuesto",
      notesLabel: "Notas adicionales",
      notesPlaceholder: "Términos, condiciones de pago, validez, etc...",
      validUntilLabel: "Válido hasta",
      statusLabel: "Estado",
      cancel: "Cancelar",
      saving: "Guardando...",
      saveChanges: "Guardar Cambios",
      createEstimate: "Crear Presupuesto",
      toastFieldsRequired: "Por favor rellena el nombre del cliente y añade al menos un artículo con descripción.",
      toastSaveSuccess: "Presupuesto guardado correctamente",
      toastSaveError: "Error al guardar el presupuesto",
      statusDraft: "Borrador",
      statusSent: "Enviado",
      statusAccepted: "Aceptado",
      statusRejected: "Rechazado",
      statusExpired: "Expirado",
    },
    en: {
      newTitle: "New Estimate",
      editTitle: "Edit Estimate {number}",
      desc: "Complete the estimate details for your customer.",
      clientLabel: "Customer (Search or write)",
      clientPlaceholder: "Type to search customer...",
      emailLabel: "Customer Email",
      phoneLabel: "Customer Phone",
      addressLabel: "Customer Address",
      itemsLabel: "Items / Concepts",
      itemDesc: "Service or product description",
      itemQty: "Qty",
      itemPrice: "Unit Price",
      itemTotal: "Total",
      addItem: "+ Add Item",
      subtotalLabel: "Subtotal",
      taxRateLabel: `${taxLabel} (%)`,
      totalLabel: "Estimate Total",
      notesLabel: "Additional Notes",
      notesPlaceholder: "Terms, payment conditions, validity, etc...",
      validUntilLabel: "Valid Until",
      statusLabel: "Status",
      cancel: "Cancel",
      saving: "Saving...",
      saveChanges: "Save Changes",
      createEstimate: "Create Estimate",
      toastFieldsRequired: "Please enter customer name and add at least one item with description.",
      toastSaveSuccess: "Estimate saved successfully",
      toastSaveError: "Error saving estimate",
      statusDraft: "Draft",
      statusSent: "Sent",
      statusAccepted: "Accepted",
      statusRejected: "Rejected",
      statusExpired: "Expired",
    }
  };

  const currentT = modalTranslations[language === 'es' ? 'es' : 'en'];

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, unit_price: 0 }]);
  const [taxRate, setTaxRate] = useState(21);
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState(format(addDays(new Date(), 15), 'yyyy-MM-dd'));
  const [status, setStatus] = useState<'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'>('draft');

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [clientResults, setClientResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch clients for autocompleting
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 1) {
      setClientResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      if (!organization?.id) return;
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, name, email, phone')
          .eq('organization_id', organization.id)
          .ilike('name', `%${searchTerm}%`)
          .limit(10);

        if (!error && data) setClientResults(data);
      } catch (err) {
        console.error("Error searching clients:", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, supabase, organization?.id]);

  // Load estimate details if editing
  useEffect(() => {
    if (!isOpen) return;

    if (estimateToEdit) {
      setCustomerName(estimateToEdit.customer_name || '');
      setSearchTerm(estimateToEdit.customer_name || '');
      setCustomerEmail(estimateToEdit.customer_email || '');
      setCustomerPhone(estimateToEdit.customer_phone || '');
      setCustomerAddress(estimateToEdit.customer_address || '');
      setItems(estimateToEdit.items || [{ description: '', quantity: 1, unit_price: 0 }]);
      setTaxRate(estimateToEdit.tax_rate ?? 21);
      setNotes(estimateToEdit.notes || '');
      setValidUntil(estimateToEdit.valid_until || format(addDays(new Date(), 15), 'yyyy-MM-dd'));
      setStatus(estimateToEdit.status || 'draft');
    } else {
      setCustomerName('');
      setSearchTerm('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerAddress('');
      setItems([{ description: '', quantity: 1, unit_price: 0 }]);
      setTaxRate(21);
      setNotes('');
      setValidUntil(format(addDays(new Date(), 15), 'yyyy-MM-dd'));
      setStatus('draft');
    }
  }, [isOpen, estimateToEdit]);

  if (!isOpen) return null;

  const handleSelectClient = (client: any) => {
    setCustomerName(client.name);
    setSearchTerm(client.name);
    setCustomerEmail(client.email || '');
    setCustomerPhone(client.phone || '');
    setCustomerAddress(client.address || '');
    setShowDropdown(false);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof Item, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + ((item.quantity || 0) * (item.unit_price || 0)), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  // Next estimate number generator
  const getNextEstimateNumber = async (orgId: string): Promise<string> => {
    const currentYear = new Date().getFullYear();
    const prefix = `PRE-${currentYear}-`;
    
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select('estimate_number')
        .eq('organization_id', orgId)
        .like('estimate_number', `${prefix}%`);
        
      if (error) throw error;
      
      let maxSeq = 0;
      if (data && data.length > 0) {
        data.forEach((est: any) => {
          const parts = est.estimate_number.split('-');
          if (parts.length >= 3) {
            const seq = parseInt(parts[2], 10);
            if (!isNaN(seq) && seq > maxSeq) {
              maxSeq = seq;
            }
          }
        });
      }
      
      const nextSeq = maxSeq + 1;
      return `${prefix}${String(nextSeq).padStart(3, '0')}`;
    } catch (err) {
      console.error("Error generating estimate number, fallback used:", err);
      return `${prefix}001`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = items.filter(item => item.description.trim() !== '');
    if (!customerName.trim() || validItems.length === 0) {
      toast.error(currentT.toastFieldsRequired);
      return;
    }

    if (!organization?.id) {
      toast.error("No se encontró ID de la organización.");
      return;
    }

    setLoading(true);
    try {
      let estimateNumber = estimateToEdit?.estimate_number;
      if (!estimateToEdit) {
        estimateNumber = await getNextEstimateNumber(organization.id);
      }

      const payload = {
        organization_id: organization.id,
        estimate_number: estimateNumber,
        customer_name: customerName,
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
        customer_address: customerAddress || null,
        items: validItems,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        notes: notes || null,
        status,
        valid_until: validUntil,
        updated_at: new Date().toISOString()
      };

      if (estimateToEdit) {
        const { error } = await supabase
          .from('estimates')
          .update(payload)
          .eq('id', estimateToEdit.id);

        if (error) throw error;
        toast.success(currentT.toastSaveSuccess);
      } else {
        const { error } = await supabase
          .from('estimates')
          .insert({
            ...payload,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success(currentT.toastSaveSuccess);
      }

      setTimeout(() => {
        onSaved();
        onClose();
      }, 300);
    } catch (error) {
      console.error("Error saving estimate:", error);
      toast.error(currentT.toastSaveError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-[#111F3A] rounded-[24px] w-full max-w-3xl my-auto flex flex-col max-h-[90vh] shadow-2xl border border-[#E2E8F0] dark:border-[#1E3A5F] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 md:px-8 py-4 md:py-6 border-b border-[#E2E8F0] dark:border-[#1E3A5F] flex items-center justify-between bg-white/50 dark:bg-[#111F3A]/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1B4FD8]" />
              {estimateToEdit ? currentT.editTitle.replace('{number}', estimateToEdit.estimate_number || '') : currentT.newTitle}
            </h2>
            <p className="hidden sm:block text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">{currentT.desc}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          <form id="estimate-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Customer Search & Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative">
                <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
                  {currentT.clientLabel}
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value);
                      setCustomerName(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    required
                    placeholder={currentT.clientPlaceholder}
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Client dropdown */}
                {showDropdown && clientResults.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-xl shadow-xl overflow-hidden divide-y divide-[#E2E8F0] dark:divide-[#1E3A5F]">
                    {clientResults.map(client => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleSelectClient(client)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#1C2C4E] transition-colors text-sm text-slate-700 dark:text-slate-200"
                      >
                        <p className="font-semibold">{client.name}</p>
                        {client.email && <p className="text-xs text-slate-400">{client.email}</p>}
                      </button>
                    ))}
                  </div>
                )}
                {showDropdown && searchTerm.length >= 1 && clientResults.length === 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-xl shadow-xl p-3 text-xs text-slate-400 text-center">
                    No se encontraron clientes coincidentes. Se creará de forma manual.
                  </div>
                )}
              </div>

              {/* Customer Email */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
                  {currentT.emailLabel}
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Customer Phone */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
                  {currentT.phoneLabel}
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Customer Address */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
                  {currentT.addressLabel}
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  placeholder="Calle, Ciudad, Código Postal"
                  className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Dynamic Items list */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
                {currentT.itemsLabel}
              </label>
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-[#F8FAFC] dark:bg-[#0D1B35]/40 p-4 rounded-2xl border border-slate-100 dark:border-[#1E3A5F]/40">
                    {/* Description */}
                    <div className="flex-1 w-full space-y-1">
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => handleUpdateItem(index, 'description', e.target.value)}
                        placeholder={currentT.itemDesc}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-[#162040] border border-slate-200 dark:border-[#1E3A5F] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1B4FD8]/20 text-slate-900 dark:text-white"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {/* Quantity */}
                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={e => handleUpdateItem(index, 'quantity', parseInt(e.target.value, 10) || 0)}
                          placeholder="1"
                          required
                          className="w-full px-3 py-2 bg-white dark:bg-[#162040] border border-slate-200 dark:border-[#1E3A5F] rounded-lg text-sm text-right outline-none focus:ring-2 focus:ring-[#1B4FD8]/20 text-slate-900 dark:text-white"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="w-28 relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={e => handleUpdateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          required
                          className="w-full pl-6 pr-3 py-2 bg-white dark:bg-[#162040] border border-slate-200 dark:border-[#1E3A5F] rounded-lg text-sm text-right outline-none focus:ring-2 focus:ring-[#1B4FD8]/20 text-slate-900 dark:text-white"
                        />
                        <Euro className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      </div>

                      {/* Line Total */}
                      <div className="w-24 text-right pr-2 text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                        {((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)} €
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-[#1B4FD8] dark:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-white/10"
              >
                <Plus className="w-4 h-4" />
                {currentT.addItem}
              </button>
            </div>

            {/* Calculations and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E2E8F0] dark:border-[#1E3A5F]">
              
              {/* Left Column: Dates and Status */}
              <div className="space-y-4">
                {/* Válido Hasta */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
                    {currentT.validUntilLabel}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={validUntil}
                      onChange={e => setValidUntil(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
                    {currentT.statusLabel}
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      required
                      className="w-full pl-4 pr-10 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white appearance-none cursor-pointer bg-[#111F3A]"
                    >
                      <option value="draft" className="bg-[#111F3A] text-white">{currentT.statusDraft}</option>
                      <option value="sent" className="bg-[#111F3A] text-white">{currentT.statusSent}</option>
                      <option value="accepted" className="bg-[#111F3A] text-white">{currentT.statusAccepted}</option>
                      <option value="rejected" className="bg-[#111F3A] text-white">{currentT.statusRejected}</option>
                      <option value="expired" className="bg-[#111F3A] text-white">{currentT.statusExpired}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Right Column: Calculations */}
              <div className="bg-[#F8FAFC] dark:bg-[#0D1B35]/30 p-5 rounded-2xl border border-slate-100 dark:border-[#1E3A5F] space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{currentT.subtotalLabel}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{subtotal.toFixed(2)} €</span>
                </div>

                {/* IVA Rate input */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{currentT.taxRateLabel}:</span>
                  <div className="relative w-24">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={taxRate}
                      onChange={e => setTaxRate(Number(e.target.value) || 0)}
                      className="w-full pr-7 pl-3 py-1 bg-white dark:bg-[#162040] border border-slate-200 dark:border-[#1E3A5F] rounded-lg text-sm text-right outline-none focus:ring-2 focus:ring-[#1B4FD8]/20 text-slate-900 dark:text-white"
                    />
                    <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* IVA Amount */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Cuota {taxLabel}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{taxAmount.toFixed(2)} €</span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-[#1E3A5F] text-base">
                  <span className="text-slate-900 dark:text-white font-bold">{currentT.totalLabel}:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black tabular-nums">{total.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
                {currentT.notesLabel}
              </label>
              <div className="relative">
                <StickyNote className="absolute left-3 top-4 w-4 h-4 text-slate-400" />
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder={currentT.notesPlaceholder}
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#162040] border border-transparent focus:border-[#1B4FD8]/30 rounded-xl text-base transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-5 md:px-8 py-4 md:py-6 border-t border-[#E2E8F0] dark:border-[#1E3A5F] flex flex-col sm:flex-row items-center justify-end gap-3 bg-white/50 dark:bg-[#111F3A]/50 backdrop-blur-md shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 md:py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all border border-slate-200 dark:border-white/10"
          >
            {currentT.cancel}
          </button>
          <button
            type="submit"
            form="estimate-form"
            disabled={loading}
            className={cn(
              "w-full sm:w-auto px-8 py-3 md:py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg uppercase tracking-wider",
              "bg-[#1B4FD8] text-white hover:bg-[#1642B5] shadow-blue-500/25 active:scale-95",
              loading && "opacity-50 cursor-not-allowed scale-95"
            )}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {currentT.saving}
              </>
            ) : (
              estimateToEdit ? currentT.saveChanges : currentT.createEstimate
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
