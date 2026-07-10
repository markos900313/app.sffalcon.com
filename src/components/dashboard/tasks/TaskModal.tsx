'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, User, FileText, ChevronDown, Clipboard, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useOrganization } from '@/context/OrganizationContext';
import { useLanguage } from '@/lib/LanguageContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTask?: any;
}

export default function TaskModal({ isOpen, onClose, onSuccess, editTask }: TaskModalProps) {
  const supabase = createClient();
  const { organization } = useOrganization();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('manual');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('12:00');
  
  const [relatedType, setRelatedType] = useState<string>('');
  const [relatedId, setRelatedId] = useState<string | null>(null);
  const [relatedName, setRelatedName] = useState<string | null>(null);
  
  const [autoAction, setAutoAction] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Autocomplete search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const localT = {
    es: {
      newTitle: "Nueva Tarea",
      editTitle: "Editar Tarea",
      titleLabel: "Título",
      descLabel: "Descripción",
      typeLabel: "Tipo de Tarea",
      priorityLabel: "Prioridad",
      dueDateLabel: "Fecha Límite",
      dueTimeLabel: "Hora Límite",
      relatedLabel: "Vincular a",
      searchPlaceholder: "Escribe para buscar...",
      notesLabel: "Notas adicionales",
      autoActionLabel: "Acción Automatizada (IA)",
      saveBtn: "Guardar Tarea",
      cancelBtn: "Cancelar",
      fieldsRequired: "El título es obligatorio.",
      loadError: "Error al realizar la búsqueda.",
      saveSuccess: "Tarea guardada correctamente.",
      saveError: "Error al guardar la tarea.",
      typeManual: "Manual",
      typeReminder: "Recordatorio",
      typeFollowUp: "Seguimiento",
      typeAI: "Ejecución IA",
      prioLow: "Baja",
      prioMedium: "Media",
      prioHigh: "Alta",
      prioUrgent: "Urgente",
      noLinkedRecord: "Sin vinculación",
      linkedPlaceholder: "Selecciona tipo primero...",
      autoNone: "Ninguna",
      autoEmail: "Enviar Correo (Seguimiento)",
      autoWhatsapp: "Enviar WhatsApp (Seguimiento)",
    },
    en: {
      newTitle: "New Task",
      editTitle: "Edit Task",
      titleLabel: "Title",
      descLabel: "Description",
      typeLabel: "Task Type",
      priorityLabel: "Priority",
      dueDateLabel: "Due Date",
      dueTimeLabel: "Due Time",
      relatedLabel: "Link to",
      searchPlaceholder: "Type to search...",
      notesLabel: "Additional notes",
      autoActionLabel: "Automated Action (AI)",
      saveBtn: "Save Task",
      cancelBtn: "Cancel",
      fieldsRequired: "Title is required.",
      loadError: "Error searching records.",
      saveSuccess: "Task saved successfully.",
      saveError: "Error saving task.",
      typeManual: "Manual",
      typeReminder: "Reminder",
      typeFollowUp: "Follow-up",
      typeAI: "AI Execution",
      prioLow: "Low",
      prioMedium: "Medium",
      prioHigh: "High",
      prioUrgent: "Urgent",
      noLinkedRecord: "No link",
      linkedPlaceholder: "Select type first...",
      autoNone: "None",
      autoEmail: "Send Email (Follow-up)",
      autoWhatsapp: "Send WhatsApp (Follow-up)",
    }
  }[language === 'en' ? 'en' : 'es'];

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || '');
      setDescription(editTask.description || '');
      setType(editTask.type || 'manual');
      setPriority(editTask.priority || 'medium');
      
      if (editTask.due_date) {
        const dateObj = new Date(editTask.due_date);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        setDueDate(`${yyyy}-${mm}-${dd}`);
        
        const hh = String(dateObj.getHours()).padStart(2, '0');
        const min = String(dateObj.getMinutes()).padStart(2, '0');
        setDueTime(`${hh}:${min}`);
      } else {
        setDueDate('');
        setDueTime('12:00');
      }

      setRelatedType(editTask.related_type || '');
      setRelatedId(editTask.related_id || null);
      setRelatedName(editTask.related_name || null);
      setSearchQuery(editTask.related_name || '');
      setAutoAction(editTask.auto_action || '');
      setNotes(editTask.notes || '');
    } else {
      setTitle('');
      setDescription('');
      setType('manual');
      setPriority('medium');
      setDueDate('');
      setDueTime('12:00');
      setRelatedType('');
      setRelatedId(null);
      setRelatedName(null);
      setSearchQuery('');
      setAutoAction('');
      setNotes('');
    }
    setSearchResults([]);
  }, [editTask, isOpen]);

  // Autocomplete dynamic search
  useEffect(() => {
    if (!relatedType || !searchQuery.trim() || searchQuery === relatedName || !organization?.id) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const query = searchQuery.trim();
        let res: any;

        if (relatedType === 'client') {
          res = await supabase
            .from('clients')
            .select('id, name')
            .eq('organization_id', organization.id)
            .ilike('name', `%${query}%`)
            .limit(8);
        } else if (relatedType === 'lead') {
          res = await supabase
            .from('leads')
            .select('id, nombre')
            .eq('organization_id', organization.id)
            .ilike('nombre', `%${query}%`)
            .limit(8);
        } else if (relatedType === 'estimate') {
          res = await supabase
            .from('estimates')
            .select('id, estimate_number, customer_name')
            .eq('organization_id', organization.id)
            .or(`estimate_number.ilike.%${query}%,customer_name.ilike.%${query}%`)
            .limit(8);
        } else if (relatedType === 'invoice') {
          res = await supabase
            .from('invoices')
            .select('id, invoice_number, concept')
            .eq('organization_id', organization.id)
            .or(`invoice_number.ilike.%${query}%,concept.ilike.%${query}%`)
            .limit(8);
        } else if (relatedType === 'project') {
          res = await supabase
            .from('projects')
            .select('id, name')
            .eq('organization_id', organization.id)
            .ilike('name', `%${query}%`)
            .limit(8);
        }

        if (res && !res.error) {
          setSearchResults(res.data || []);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, relatedType, organization?.id, relatedName, supabase]);

  const handleSelectResult = (item: any) => {
    let name = '';
    if (relatedType === 'client' || relatedType === 'project') {
      name = item.name;
    } else if (relatedType === 'lead') {
      name = item.nombre;
    } else if (relatedType === 'estimate') {
      name = `${item.estimate_number} - ${item.customer_name || ''}`;
    } else if (relatedType === 'invoice') {
      name = `${item.invoice_number} - ${item.concept || ''}`;
    }
    
    setRelatedId(item.id);
    setRelatedName(name);
    setSearchQuery(name);
    setSearchResults([]);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setRelatedType(val);
    setRelatedId(null);
    setRelatedName(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(localT.fieldsRequired);
      return;
    }

    if (!organization?.id) {
      toast.error("No se encontró ID de la organización.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autorizado");

      let formattedDueDate: string | null = null;
      if (dueDate) {
        formattedDueDate = new Date(`${dueDate}T${dueTime || '12:00'}:00`).toISOString();
      }

      const taskData = {
        organization_id: organization.id,
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        type,
        status: editTask ? editTask.status : 'pending',
        priority,
        due_date: formattedDueDate,
        related_type: relatedType || null,
        related_id: relatedId,
        related_name: relatedName,
        auto_action: autoAction || null,
        notes: notes.trim() || null,
        created_by: editTask ? editTask.created_by : 'human',
        updated_at: new Date().toISOString()
      };

      if (editTask?.id) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editTask.id);

        if (error) throw error;
        toast.success(localT.saveSuccess);
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert({
            ...taskData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success(localT.saveSuccess);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(localT.saveError);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111F3A] w-full max-w-2xl rounded-[24px] shadow-2xl border border-[#E2E8F0] dark:border-[#1E3A5F] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 md:px-8 py-4 md:py-6 border-b border-[#E2E8F0] dark:border-[#1E3A5F] flex items-center justify-between bg-white/50 dark:bg-[#111F3A]/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#1B4FD8]" />
              {editTask ? localT.editTitle : localT.newTitle}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-8 space-y-5 custom-scrollbar">
          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
              {localT.titleLabel}*
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0D1B2E] border border-[#E2E8F0] dark:border-[#1E3A5F] focus:border-[#1B4FD8]/40 rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
              placeholder={language === 'en' ? "Task summary..." : "Resumen de la tarea..."}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
              {localT.descLabel}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-[#F8FAFC] dark:bg-[#0D1B2E] border border-[#E2E8F0] dark:border-[#1E3A5F] focus:border-[#1B4FD8]/40 rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white min-h-[70px] resize-none"
              placeholder={language === 'en' ? "Details..." : "Detalles..."}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipo */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
                {localT.typeLabel}
              </label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0D1B2E] border border-[#E2E8F0] dark:border-[#1E3A5F] focus:border-[#1B4FD8]/40 rounded-xl text-sm transition-all outline-none text-slate-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="manual" className="bg-[#111F3A] text-white">{localT.typeManual}</option>
                  <option value="reminder" className="bg-[#111F3A] text-white">{localT.typeReminder}</option>
                  <option value="follow_up" className="bg-[#111F3A] text-white">{localT.typeFollowUp}</option>
                  <option value="ai_execute" className="bg-[#111F3A] text-white">{localT.typeAI}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Prioridad */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
                {localT.priorityLabel}
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0D1B2E] border border-[#E2E8F0] dark:border-[#1E3A5F] focus:border-[#1B4FD8]/40 rounded-xl text-sm transition-all outline-none text-slate-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="low" className="bg-[#111F3A] text-white">{localT.prioLow}</option>
                  <option value="medium" className="bg-[#111F3A] text-white">{localT.prioMedium}</option>
                  <option value="high" className="bg-[#111F3A] text-white">{localT.prioHigh}</option>
                  <option value="urgent" className="bg-[#111F3A] text-white">{localT.prioUrgent}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha Límite */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {localT.dueDateLabel}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 bg-[#F8FAFC] dark:bg-[#0D1B2E] border border-[#E2E8F0] dark:border-[#1E3A5F] focus:border-[#1B4FD8]/40 rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
              />
            </div>

            {/* Hora Límite */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
                {localT.dueTimeLabel}
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-4 py-2 bg-[#F8FAFC] dark:bg-[#0D1B2E] border border-[#E2E8F0] dark:border-[#1E3A5F] focus:border-[#1B4FD8]/40 rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Vinculado a: Selector */}
          <div className="space-y-3 p-4 bg-[#F8FAFC]/5 dark:bg-[#0D1B2E]/40 border border-[#E2E8F0]/30 dark:border-[#1E3A5F]/40 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{localT.relatedLabel}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Relación tipo */}
              <div className="relative">
                <select
                  value={relatedType}
                  onChange={handleTypeChange}
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0D1B2E] border border-[#E2E8F0] dark:border-[#1E3A5F] focus:border-[#1B4FD8]/40 rounded-xl text-sm transition-all outline-none text-slate-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#111F3A] text-white">{localT.noLinkedRecord}</option>
                  <option value="client" className="bg-[#111F3A] text-white">{language === 'en' ? 'Contact / Client' : 'Cliente'}</option>
                  <option value="lead" className="bg-[#111F3A] text-white">Lead</option>
                  <option value="estimate" className="bg-[#111F3A] text-white">{language === 'en' ? 'Estimate' : 'Presupuesto'}</option>
                  <option value="invoice" className="bg-[#111F3A] text-white">{language === 'en' ? 'Invoice' : 'Factura'}</option>
                  <option value="project" className="bg-[#111F3A] text-white">{language === 'en' ? 'Project' : 'Proyecto'}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Búsqueda Autocomplete */}
              {relatedType ? (
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0D1B2E] border border-[#E2E8F0] dark:border-[#1E3A5F] focus:border-[#1B4FD8]/40 rounded-xl text-sm outline-none text-slate-900 dark:text-white"
                    placeholder={localT.searchPlaceholder}
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-t-transparent border-[#1B4FD8] rounded-full animate-spin" />
                  )}
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 max-h-[180px] overflow-y-auto bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-xl shadow-xl z-20 custom-scrollbar">
                      {searchResults.map((item) => {
                        let displayName = '';
                        if (relatedType === 'client' || relatedType === 'project') displayName = item.name;
                        else if (relatedType === 'lead') displayName = item.nombre;
                        else if (relatedType === 'estimate') displayName = `${item.estimate_number} - ${item.customer_name || ''}`;
                        else if (relatedType === 'invoice') displayName = `${item.invoice_number} - ${item.concept || ''}`;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectResult(item)}
                            className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-[#1B4FD8] hover:text-white dark:hover:bg-[#1B4FD8]/20 transition-colors"
                          >
                            {displayName}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 rounded-xl text-sm text-slate-400">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {localT.linkedPlaceholder}
                </div>
              )}
            </div>
          </div>

          {/* Acción Automatizada */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
              {localT.autoActionLabel}
            </label>
            <div className="relative">
              <select
                value={autoAction}
                onChange={(e) => setAutoAction(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0D1B2E] border border-[#E2E8F0] dark:border-[#1E3A5F] focus:border-[#1B4FD8]/40 rounded-xl text-sm transition-all outline-none text-slate-900 dark:text-white appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#111F3A] text-white">{localT.autoNone}</option>
                {/* Solo habilitado si hay vinculación de tipo que soporte seguimiento */}
                {relatedType && ['lead', 'estimate', 'invoice'].includes(relatedType) ? (
                  <>
                    <option value="send_email" className="bg-[#111F3A] text-white">{localT.autoEmail}</option>
                    <option value="send_whatsapp" className="bg-[#111F3A] text-white">{localT.autoWhatsapp}</option>
                  </>
                ) : null}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {(!relatedType || !['lead', 'estimate', 'invoice'].includes(relatedType)) && (
              <p className="text-[10px] text-slate-500 italic mt-1">
                {language === 'en'
                  ? "*Requires linking to a Lead, Estimate, or Invoice first."
                  : "*Requiere vinculación a un Lead, Presupuesto o Factura primero."}
              </p>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">
              {localT.notesLabel}
            </label>
            <div className="relative">
              <Clipboard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#0D1B2E] border border-[#E2E8F0] dark:border-[#1E3A5F] focus:border-[#1B4FD8]/40 rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#1B4FD8]/5 outline-none text-slate-900 dark:text-white min-h-[90px] resize-none"
                placeholder={language === 'en' ? "E.g., client preferred time, custom message details..." : "Ej: horario preferido del cliente, detalles del mensaje personalizado..."}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 md:px-8 py-4 md:py-6 border-t border-[#E2E8F0] dark:border-[#1E3A5F] flex flex-col sm:flex-row items-center justify-end gap-3 bg-white/50 dark:bg-[#111F3A]/50 backdrop-blur-md shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            {localT.cancelBtn}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={cn(
              "w-full sm:w-auto px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg",
              "bg-[#1B4FD8] text-white hover:bg-[#1642B5] shadow-blue-500/25 active:scale-95",
              loading && "opacity-50 cursor-not-allowed scale-95"
            )}
          >
            {loading ? "..." : localT.saveBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
