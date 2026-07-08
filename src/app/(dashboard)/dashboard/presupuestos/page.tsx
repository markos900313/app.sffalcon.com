"use client";

import React, { useState, useEffect } from "react";
import {
  FileText, Plus, Search,
  Eye, Mail, CheckCircle, Pencil, Trash2,
  RefreshCw, Filter, AlertCircle,
  List, BarChart2, TrendingUp, XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardPageContainer } from "@/components/dashboard/DashboardPageContainer";
import { createClient } from '@/lib/supabase/client';
import { useOrganization } from '@/context/OrganizationContext';
import toast from 'react-hot-toast';
import { useLanguage } from '@/lib/LanguageContext';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO, addDays } from "date-fns";

import EstimateModal from "@/components/dashboard/estimates/EstimateModal";

interface Estimate {
  id: string;
  organization_id: string;
  estimate_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  items: any;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  accept_token?: string;
  accepted_at?: string;
  invoice_id?: string;
  valid_until: string;
  created_at: string;
  updated_at: string;
}

export function sanitizeForPDF(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^\x00-\x7F]/g, "") // remove non-ASCII
    .trim();
}

export const generateEstimatePDF = (
  estimate: any, 
  action: 'download' | 'blob' | 'base64' = 'download', 
  orgData?: { name?: string; nif?: string; address?: string; city?: string; email?: string; phone?: string; },
  language: 'es' | 'en' = 'es'
): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();
      
      const isAccepted = estimate.status === 'accepted';
      const isRejected = estimate.status === 'rejected';

      const L = language === 'en' ? {
        title: 'ESTIMATE',
        estimateNum: 'Estimate No.',
        client: 'Estimate for:',
        description: 'Description',
        qty: 'Qty',
        unitPrice: 'Unit Price',
        total: 'Total',
        subtotal: 'Subtotal',
        tax: 'VAT',
        grandTotal: 'ESTIMATE TOTAL:',
        notes: 'Notes / Conditions:',
        validUntil: 'Estimate valid until',
        page: 'Page',
        accepted: 'ACCEPTED',
        rejected: 'REJECTED',
        issueDate: 'Issue Date',
        unknownClient: 'Unknown Customer',
        qtyHeader: 'Quantity',
        unitPriceHeader: 'Unit Price',
        conceptGeneral: 'General Concept'
      } : {
        title: 'PRESUPUESTO',
        estimateNum: 'Presupuesto Nº',
        client: 'Presupuesto para:',
        description: 'Descripción',
        qty: 'Cant.',
        unitPrice: 'Precio Unit.',
        total: 'Total',
        subtotal: 'Subtotal',
        tax: 'IVA',
        grandTotal: 'TOTAL PRESUPUESTO:',
        notes: 'Notas / Condiciones:',
        validUntil: 'Presupuesto válido hasta',
        page: 'Página',
        accepted: 'ACEPTADO',
        rejected: 'RECHAZADO',
        issueDate: 'Fecha Emisión',
        unknownClient: 'Cliente Desconocido',
        qtyHeader: 'Cantidad',
        unitPriceHeader: 'Precio Unitario',
        conceptGeneral: 'Concepto general'
      };

      // Header SF
      let yEmisor = 25;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(27, 79, 216);
      doc.text(sanitizeForPDF(orgData?.name || "Mi Empresa"), 14, yEmisor);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      
      if (orgData?.nif) {
        yEmisor += 6;
        doc.text(`NIF: ${sanitizeForPDF(orgData.nif)}`, 14, yEmisor);
      }

      yEmisor += 7;
      if (orgData?.address) { 
        doc.text(sanitizeForPDF(orgData.address), 14, yEmisor); 
        yEmisor += 5; 
      }
      if (orgData?.city) { 
        doc.text(sanitizeForPDF(orgData.city), 14, yEmisor); 
        yEmisor += 5; 
      }
      if (orgData?.email) { 
        doc.text(sanitizeForPDF(orgData.email), 14, yEmisor); 
        yEmisor += 5; 
      }
      if (orgData?.phone) { 
        doc.text(sanitizeForPDF(orgData.phone), 14, yEmisor); 
      }

      // Status watermark or general header
      doc.setFontSize(26);
      if (isAccepted) {
        doc.setTextColor(34, 197, 94); // Green 500
        doc.text(L.accepted, 140, 25);
      } else if (isRejected) {
        doc.setTextColor(239, 68, 68); // Red 500
        doc.text(L.rejected, 130, 25);
      } else {
        doc.setTextColor(15, 23, 42); // slate 900
        doc.text(L.title, 130, 25);
      }

      // Estimate Info
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const estimateNum = estimate.estimate_number || "PRE-XXXX";
      const issueDate = estimate.created_at ? format(parseISO(estimate.created_at), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      const validUntil = estimate.valid_until || format(new Date(), 'yyyy-MM-dd');

      doc.text(`${L.estimateNum}: ${estimateNum}`, 145, 34);
      doc.text(`${L.issueDate}: ${format(parseISO(issueDate), 'dd/MM/yyyy')}`, 145, 39);
      doc.text(`${L.validUntil}: ${format(parseISO(validUntil), 'dd/MM/yyyy')}`, 145, 44);

      // Separator line
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(14, 52, 196, 52);

      // Client Data
      doc.setFont("helvetica", "bold");
      doc.text(L.client, 14, 62);
      
      doc.setFont("helvetica", "normal");
      doc.text(sanitizeForPDF(estimate.customer_name || L.unknownClient), 14, 68);
      if (estimate.customer_email) {
        doc.text(sanitizeForPDF(estimate.customer_email), 14, 73);
      }
      if (estimate.customer_phone) {
        doc.text(sanitizeForPDF(estimate.customer_phone), 14, 78);
      }
      if (estimate.customer_address) {
        doc.text(sanitizeForPDF(estimate.customer_address), 14, 83);
      }

      // Items Table
      const headers = [[L.description, L.qtyHeader, L.unitPriceHeader, L.total]];
      const tableData = (estimate.items || []).map((item: any) => [
        sanitizeForPDF(item.description || 'Servicio'),
        item.quantity || 1,
        `${Number(item.unit_price || 0).toFixed(2)} EUR`,
        `${Number((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)} EUR`
      ]);

      autoTable(doc, {
        startY: 95,
        head: headers,
        body: tableData.length > 0 ? tableData : [[L.conceptGeneral, '1', `${Number(estimate.subtotal || 0).toFixed(2)} EUR`, `${Number(estimate.subtotal || 0).toFixed(2)} EUR`]],
        theme: 'striped',
        headStyles: { fillColor: [27, 79, 216], textColor: [255, 255, 255] },
        styles: { fontSize: 10, cellPadding: 6 },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right', fontStyle: 'bold' }
        }
      });

      // Totals
      // @ts-ignore
      const finalY = doc.lastAutoTable.finalY || 130;
      doc.setFont("helvetica", "bold");
      
      doc.setFontSize(10);
      doc.text(`${L.subtotal}:`, 120, finalY + 10);
      doc.text(`${Number(estimate.subtotal || 0).toFixed(2)} EUR`, 165, finalY + 10);
      
      doc.text(`${L.tax} (${estimate.tax_rate || 21}%):`, 120, finalY + 17);
      doc.text(`${Number(estimate.tax_amount || 0).toFixed(2)} EUR`, 165, finalY + 17);

      doc.setFontSize(12);
      doc.text(L.grandTotal, 120, finalY + 25);
      doc.text(`${Number(estimate.total || 0).toFixed(2)} EUR`, 165, finalY + 25);

      // Notes
      if (estimate.notes) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(L.notes, 14, finalY + 40);
        doc.setFont("helvetica", "normal");
        const splitNotes = doc.splitTextToSize(sanitizeForPDF(estimate.notes), 180);
        doc.text(splitNotes, 14, finalY + 45);
      }

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text(`${L.validUntil} ${format(parseISO(validUntil), 'dd/MM/yyyy')}`, 105, 280, { align: "center" });

      if (action === 'download') {
        doc.save(`Presupuesto_${estimateNum}.pdf`);
        resolve(true);
      } else if (action === 'blob') {
        const blob = doc.output('blob');
        resolve(blob);
      } else if (action === 'base64') {
        const base64 = doc.output('datauristring');
        resolve(base64);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      reject(error);
    }
  });
};

export default function EstimatesPage() {
  const supabase = createClient();
  const { organization } = useOrganization();
  const { language } = useLanguage();
  const symbol = organization?.currency_symbol || '€';

  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [view, setView] = useState<'lista' | 'analytics'>('lista');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Local translations
  const pageTranslations = {
    es: {
      title: "Presupuestos",
      subtitle: "Gestión de presupuestos",
      controlOf: "Control de",
      newEstimate: "Nuevo Presupuesto",
      listTab: "Vista Listado",
      analyticsTab: "Análisis",
      kpiTotal: "Total Presupuestado",
      kpiPending: "Pendiente Aprobación",
      kpiAccepted: "Aceptados este mes",
      searchPlaceholder: "Buscar por número o cliente...",
      statusFilterAll: "Filtrar por estado",
      statusDraft: "Borrador",
      statusSent: "Enviado",
      statusAccepted: "Aceptado",
      statusRejected: "Rechazado",
      statusExpired: "Expirado",
      colNumber: "Nº Pres.",
      colClient: "Cliente",
      colTotal: "Total",
      colStatus: "Estado",
      colValidUntil: "Válido hasta",
      colIssueDate: "Emisión",
      colActions: "Acciones",
      noRecords: "No se encontraron presupuestos",
      toastLoadError: "Error al cargar los presupuestos",
      toastDeleteSuccess: "Presupuesto eliminado correctamente",
      toastDeleteError: "Error al eliminar el presupuesto",
      toastPdfSuccess: "PDF generado correctamente",
      toastPdfError: "Error al generar el PDF",
      toastEmailSuccess: "Presupuesto enviado por email correctamente",
      toastEmailError: "Error al enviar el presupuesto",
      toastConvertSuccess: "Factura creada correctamente",
      toastConvertError: "Error al convertir a factura",
      deleteConfirm: "¿Eliminar el presupuesto {num} definitivamente?",
      convertConfirm: "¿Convertir el presupuesto {num} a factura?",
      titlePdf: "Ver PDF / Descargar",
      titleEmail: "Enviar por Email",
      titleConvert: "Convertir a Factura",
      titleEdit: "Editar",
      titleDelete: "Eliminar",
      activeLabel: "ACTIVOS",
    },
    en: {
      title: "Estimates",
      subtitle: "Estimate Management",
      controlOf: "Control of",
      newEstimate: "New Estimate",
      listTab: "List View",
      analyticsTab: "Analytics",
      kpiTotal: "Total Quoted",
      kpiPending: "Pending Approval",
      kpiAccepted: "Accepted this month",
      searchPlaceholder: "Search by number or customer...",
      statusFilterAll: "Filter by status",
      statusDraft: "Draft",
      statusSent: "Sent",
      statusAccepted: "Accepted",
      statusRejected: "Rejected",
      statusExpired: "Expired",
      colNumber: "Est. No.",
      colClient: "Customer",
      colTotal: "Total",
      colStatus: "Status",
      colValidUntil: "Valid until",
      colIssueDate: "Issue Date",
      colActions: "Actions",
      noRecords: "No estimates found",
      toastLoadError: "Error loading estimates",
      toastDeleteSuccess: "Estimate deleted successfully",
      toastDeleteError: "Error deleting estimate",
      toastPdfSuccess: "PDF generated successfully",
      toastPdfError: "Error generating PDF",
      toastEmailSuccess: "Estimate sent by email successfully",
      toastEmailError: "Error sending estimate",
      toastConvertSuccess: "Invoice created successfully",
      toastConvertError: "Error converting to invoice",
      deleteConfirm: "Delete estimate {num} permanently?",
      convertConfirm: "Convert estimate {num} to invoice?",
      titlePdf: "View PDF / Download",
      titleEmail: "Send by Email",
      titleConvert: "Convert to Invoice",
      titleEdit: "Edit",
      titleDelete: "Delete",
      activeLabel: "ACTIVE",
    }
  };

  const currentT = pageTranslations[language === 'es' ? 'es' : 'en'];

  useEffect(() => {
    fetchEstimates();
  }, [organization]);

  async function fetchEstimates() {
    if (!organization?.id) return;
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEstimates(data || []);
    } catch (err: any) {
      toast.error(currentT.toastLoadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!organization?.id) return;
    const channel = supabase
      .channel('estimates-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estimates', filter: `organization_id=eq.${organization.id}` }, () => {
        fetchEstimates();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization?.id, supabase]);

  // KPIs
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const totalPresupuestado = estimates.reduce((acc, est) => {
    if (est.status !== 'draft' && est.status !== 'rejected') {
      return acc + Number(est.total || 0);
    }
    return acc;
  }, 0);

  const totalPendiente = estimates.reduce((acc, est) => {
    if (est.status === 'sent') {
      return acc + Number(est.total || 0);
    }
    return acc;
  }, 0);

  const aceptadosEsteMes = estimates.reduce((acc, est) => {
    if (est.status === 'accepted' && est.accepted_at) {
      const d = new Date(est.accepted_at);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return acc + Number(est.total || 0);
      }
    }
    return acc;
  }, 0);

  const filteredEstimates = estimates.filter(est => {
    const matchesSearch =
      est.estimate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'todos') return matchesSearch;
    return matchesSearch && est.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': 
        return (
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 text-xs font-medium rounded-full flex items-center gap-1.5 w-fit">
            {currentT.statusDraft}
          </span>
        );
      case 'sent': 
        return (
          <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full flex items-center gap-1.5 w-fit">
            <Mail className="w-3.5 h-3.5" /> {currentT.statusSent}
          </span>
        );
      case 'accepted': 
        return (
          <span className="px-2.5 py-1 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1.5 w-fit">
            <CheckCircle className="w-3.5 h-3.5" /> {currentT.statusAccepted}
          </span>
        );
      case 'rejected': 
        return (
          <span className="px-2.5 py-1 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-medium rounded-full flex items-center gap-1.5 w-fit">
            <XCircle className="w-3.5 h-3.5" /> {currentT.statusRejected}
          </span>
        );
      case 'expired': 
        return (
          <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full flex items-center gap-1.5 w-fit">
            {currentT.statusExpired}
          </span>
        );
      default: 
        return null;
    }
  };

  const handleCreate = () => {
    setEditingEstimate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (est: any) => {
    setEditingEstimate(est);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(currentT.deleteConfirm.replace('{num}', num))) return;
    try {
      setActionLoading(`del-${id}`);
      const { error } = await supabase.from('estimates').delete().eq('id', id);
      if (error) throw error;
      toast.success(currentT.toastDeleteSuccess);
    } catch (err) {
      toast.error(currentT.toastDeleteError);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewPDF = async (est: any) => {
    try {
      setActionLoading(`pdf-${est.id}`);
      await generateEstimatePDF(est, 'download', {
        name: organization?.name,
        nif: (organization as any)?.nif,
        address: organization?.address || undefined,
        city: organization?.city || undefined,
        email: organization?.email || undefined,
        phone: organization?.phone || undefined
      }, language);
      toast.success(currentT.toastPdfSuccess);
    } catch (e) {
      toast.error(currentT.toastPdfError);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmail = async (est: any) => {
    if (!est.customer_email) {
      toast.error("El cliente no tiene correo electrónico configurado.");
      return;
    }

    try {
      setActionLoading(`mail-${est.id}`);
      const pdfBase64 = await generateEstimatePDF(est, 'base64', {
        name: organization?.name,
        nif: (organization as any)?.nif,
        address: organization?.address || undefined,
        city: organization?.city || undefined,
        email: organization?.email || undefined,
        phone: organization?.phone || undefined
      }, language);

      const res = await fetch('/api/estimates/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimateId: est.id,
          pdfBase64,
          clientEmail: est.customer_email,
          clientName: est.customer_name,
          estimateNumber: est.estimate_number,
          acceptToken: est.accept_token
        })
      });

      if (!res.ok) throw new Error();
      toast.success(currentT.toastEmailSuccess);
      fetchEstimates();
    } catch (e) {
      toast.error(currentT.toastEmailError);
    } finally {
      setActionLoading(null);
    }
  };

  const getNextInvoiceNumber = async (orgId: string): Promise<string> => {
    const currentYear = new Date().getFullYear();
    const prefix = `FAC-${currentYear}-`;
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('organization_id', orgId)
        .like('invoice_number', `${prefix}%`);
        
      if (error) throw error;
      
      let maxSeq = 0;
      if (data && data.length > 0) {
        data.forEach((inv: any) => {
          const parts = inv.invoice_number.split('-');
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
      console.error("Error generating invoice number:", err);
      return `${prefix}001`;
    }
  };

  const handleConvertToInvoice = async (est: any) => {
    if (!organization?.id) return;
    if (!confirm(currentT.convertConfirm.replace('{num}', est.estimate_number))) return;
    
    try {
      setActionLoading(`convert-${est.id}`);
      
      const { data: { user } } = await supabase.auth.getUser();

      // Calculate next invoice number
      const invoiceNumber = await getNextInvoiceNumber(organization.id);
      const issueDate = format(new Date(), 'yyyy-MM-dd');
      const dueDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
      
      // Insert into invoices table
      const { data: invData, error: invError } = await supabase
        .from('invoices')
        .insert({
          organization_id: organization.id,
          user_id: user?.id || null,
          invoice_number: invoiceNumber,
          concept: `Presupuesto ${est.estimate_number}`,
          amount: est.subtotal,
          tax_rate: est.tax_rate,
          tax_amount: est.tax_amount,
          total: est.total,
          status: 'pendiente', 
          issue_date: issueDate,
          due_date: dueDate,
          notes: est.notes,
          client_id: null,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (invError) throw invError;
      
      // Update estimate status and invoice_id
      const { error: estError } = await supabase
        .from('estimates')
        .update({
          invoice_id: invData.id,
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', est.id);
        
      if (estError) throw estError;
      
      toast.success(currentT.toastConvertSuccess);
      fetchEstimates();
    } catch (err) {
      console.error("Error converting to invoice:", err);
      toast.error(currentT.toastConvertError);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <DashboardPageContainer>
        {/* Banner principal */}
        <div className="card-premium p-0 overflow-hidden shadow-2xl shadow-blue-500/5 relative group bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-indigo-500/5 opacity-50 transition-opacity group-hover:opacity-80" />

          <div className="relative px-4 md:px-8 py-6 flex flex-col xl:flex-row items-center justify-between gap-6 font-geist">
            {/* Left: Branding */}
            <div className="flex items-center gap-6 w-full xl:w-auto">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B4FD8] to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1B4FD8]">{currentT.title.toUpperCase()}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">{currentT.activeLabel}</span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  {currentT.controlOf} <span className="text-[#1B4FD8]">{currentT.title}</span>
                </h1>
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="flex items-center justify-center gap-2 bg-[#1B4FD8] hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95 w-full md:w-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              {currentT.newEstimate}
            </button>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-white/5 p-1 rounded-2xl w-fit border border-slate-200/50 dark:border-white/5">
            <button
              onClick={() => setView('lista')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-bold tracking-widest transition-all uppercase",
                view === 'lista'
                  ? "bg-white dark:bg-[var(--bg-sidebar-active)] text-[#1B4FD8] dark:text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              <List className="w-4 h-4" />
              {currentT.listTab}
            </button>
            <button
              onClick={() => setView('analytics')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-bold tracking-widest transition-all uppercase",
                view === 'analytics'
                  ? "bg-white dark:bg-[var(--bg-sidebar-active)] text-[#1B4FD8] dark:text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              <BarChart2 className="w-4 h-4" />
              {currentT.analyticsTab}
            </button>
          </div>

          {view === 'lista' ? (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-premium card-finanzas bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl p-6 md:p-8 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center rounded-2xl shrink-0">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{currentT.kpiTotal}</p>
                    <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight tabular-nums">
                      {totalPresupuestado.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {symbol}
                    </p>
                  </div>
                </div>

                <div className="card-premium card-finanzas bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl p-6 md:p-8 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center rounded-2xl shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{currentT.kpiPending}</p>
                    <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight tabular-nums">
                      {totalPendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {symbol}
                    </p>
                  </div>
                </div>

                <div className="card-premium card-finanzas bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl p-6 md:p-8 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center rounded-2xl shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{currentT.kpiAccepted}</p>
                    <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight tabular-nums">
                      {aceptadosEsteMes.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {symbol}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabla y Filtros */}
              <div className="card-premium card-finanzas bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="py-6 px-4 md:px-8 border-b border-[#E2E8F0] dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder={currentT.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0A1628] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-lg pl-9 pr-4 py-2 text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-[#475569] outline-none focus:ring-2 focus:ring-[#1B4FD8]/20 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                      <Filter className="w-4 h-4 text-[#64748B]" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-transparent text-[13px] font-bold text-slate-500 uppercase tracking-tight outline-none cursor-pointer"
                      >
                        <option value="todos">{currentT.statusFilterAll}</option>
                        <option value="draft">{currentT.statusDraft}</option>
                        <option value="sent">{currentT.statusSent}</option>
                        <option value="accepted">{currentT.statusAccepted}</option>
                        <option value="rejected">{currentT.statusRejected}</option>
                        <option value="expired">{currentT.statusExpired}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* List Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] dark:bg-[#0A1628]/50 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider border-b border-[#E2E8F0] dark:border-[#1E3A5F]">
                        <th className="px-4 md:px-8 py-4">{currentT.colNumber}</th>
                        <th className="px-4 md:px-8 py-4">{currentT.colClient}</th>
                        <th className="px-4 md:px-8 py-4 text-right">{currentT.colTotal}</th>
                        <th className="px-4 md:px-8 py-4">{currentT.colStatus}</th>
                        <th className="px-6 py-4 hidden md:table-cell">{currentT.colValidUntil}</th>
                        <th className="px-6 py-4 hidden md:table-cell">{currentT.colIssueDate}</th>
                        <th className="px-4 md:px-8 py-4 text-center">{currentT.colActions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E3A5F]">
                      {filteredEstimates.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                            {currentT.noRecords}
                          </td>
                        </tr>
                      ) : (
                        filteredEstimates.map((est) => (
                          <tr key={est.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#0D1B35]/50 transition-colors group">
                            {/* Estimate number */}
                            <td className="px-4 md:px-8 py-4">
                              <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9] text-[13px] md:text-[14px]">{est.estimate_number}</span>
                            </td>
                            {/* Customer name */}
                            <td className="px-4 md:px-8 py-4">
                              <p className="text-[13px] md:text-[14px] font-medium text-[#0F172A] dark:text-[#F1F5F9] truncate max-w-[120px] md:max-w-none">{est.customer_name}</p>
                              {est.customer_email && (
                                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate max-w-[150px] hidden md:block">{est.customer_email}</p>
                              )}
                            </td>
                            {/* Total */}
                            <td className="px-4 md:px-8 py-4 text-right">
                              <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9] text-[13px] md:text-[14px] tabular-nums">
                                {Number(est.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} {symbol}
                              </span>
                            </td>
                            {/* Status */}
                            <td className="px-4 md:px-8 py-4">
                              <div className="scale-90 md:scale-100 origin-left">
                                {getStatusBadge(est.status)}
                              </div>
                            </td>
                            {/* Valid until */}
                            <td className="px-6 py-4 hidden md:table-cell">
                              <span className="text-[13px] md:text-[14px] text-[#475569] dark:text-[#CBD5E1]">
                                {format(parseISO(est.valid_until), 'dd/MM/yyyy')}
                              </span>
                            </td>
                            {/* Created at / Issue date */}
                            <td className="px-6 py-4 hidden md:table-cell">
                              <span className="text-[13px] md:text-[14px] text-[#475569] dark:text-[#CBD5E1]">
                                {format(parseISO(est.created_at), 'dd/MM/yyyy')}
                              </span>
                            </td>
                            {/* Actions */}
                            <td className="px-4 md:px-8 py-4 text-center">
                              <div className="flex items-center justify-center gap-1 md:gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                
                                {/* PDF Button */}
                                <button
                                  onClick={() => handleViewPDF(est)}
                                  disabled={actionLoading === `pdf-${est.id}`}
                                  title={currentT.titlePdf}
                                  className="p-1 md:p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-500/20"
                                >
                                  {actionLoading === `pdf-${est.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                </button>

                                {/* Send Email */}
                                <button
                                  onClick={() => handleSendEmail(est)}
                                  disabled={actionLoading === `mail-${est.id}`}
                                  title={currentT.titleEmail}
                                  className="p-1 md:p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                >
                                  {actionLoading === `mail-${est.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                </button>

                                {/* Convert to Invoice (only accepted and not already converted) */}
                                {est.status === 'accepted' && !est.invoice_id && (
                                  <button
                                    onClick={() => handleConvertToInvoice(est)}
                                    disabled={actionLoading === `convert-${est.id}`}
                                    title={currentT.titleConvert}
                                    className="p-1 md:p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors border border-transparent hover:border-green-200 dark:hover:border-green-500/20"
                                  >
                                    {actionLoading === `convert-${est.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                  </button>
                                )}

                                {/* Edit */}
                                <button
                                  onClick={() => handleEdit(est)}
                                  title={currentT.titleEdit}
                                  className="p-1 md:p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => handleDelete(est.id, est.estimate_number)}
                                  disabled={actionLoading === `del-${est.id}`}
                                  title={currentT.titleDelete}
                                  className="p-1 md:p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                                >
                                  {actionLoading === `del-${est.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <EstimatesAnalytics estimates={estimates} symbol={symbol} language={language} />
          )}
        </div>
      </DashboardPageContainer>

      {isModalOpen && (
        <EstimateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={fetchEstimates}
          estimateToEdit={editingEstimate}
        />
      )}
    </>
  );
}

function EstimatesAnalytics({ estimates, symbol, language }: { estimates: Estimate[], symbol: string, language: string }) {
  const totalDraft = estimates.filter(e => e.status === 'draft').reduce((acc, e) => acc + Number(e.total || 0), 0);
  const totalSent = estimates.filter(e => e.status === 'sent').reduce((acc, e) => acc + Number(e.total || 0), 0);
  const totalAccepted = estimates.filter(e => e.status === 'accepted').reduce((acc, e) => acc + Number(e.total || 0), 0);
  const totalRejected = estimates.filter(e => e.status === 'rejected').reduce((acc, e) => acc + Number(e.total || 0), 0);
  const totalExpired = estimates.filter(e => e.status === 'expired').reduce((acc, e) => acc + Number(e.total || 0), 0);

  const total = totalDraft + totalSent + totalAccepted + totalRejected + totalExpired;
  
  const getPercentage = (value: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const T = language === 'en' ? {
    distByStatus: "Distribution by Status",
    conversionRate: "Conversion Rate",
    acceptedOfTotal: "Accepted Estimates of Total",
    acceptedLabel: "Accepted",
    totalIssuedLabel: "Total Issued",
    draft: "Draft",
    sent: "Sent",
    accepted: "Accepted",
    rejected: "Rejected",
    expired: "Expired",
  } : {
    distByStatus: "Distribución por Estado",
    conversionRate: "Tasa de Conversión",
    acceptedOfTotal: "Presupuestos Aceptados del Total",
    acceptedLabel: "Aceptados",
    totalIssuedLabel: "Total Emitidos",
    draft: "Borrador",
    sent: "Enviado",
    accepted: "Aceptado",
    rejected: "Rechazado",
    expired: "Expirado",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
      <div className="card-premium card-finanzas p-6 md:p-8 bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-3xl space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">{T.distByStatus}</h3>
        
        <div className="space-y-4">
          {/* Aceptado */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-green-600 dark:text-green-400 uppercase">{T.accepted} ({getPercentage(totalAccepted)}%)</span>
              <span className="text-slate-700 dark:text-slate-200">{totalAccepted.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {symbol}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/5 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${getPercentage(totalAccepted)}%` }} />
            </div>
          </div>

          {/* Enviados */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-blue-600 dark:text-blue-400 uppercase">{T.sent} ({getPercentage(totalSent)}%)</span>
              <span className="text-slate-700 dark:text-slate-200">{totalSent.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {symbol}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/5 h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#1B4FD8] h-full rounded-full" style={{ width: `${getPercentage(totalSent)}%` }} />
            </div>
          </div>

          {/* Borradores */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400 uppercase">{T.draft} ({getPercentage(totalDraft)}%)</span>
              <span className="text-slate-700 dark:text-slate-200">{totalDraft.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {symbol}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/5 h-2.5 rounded-full overflow-hidden">
              <div className="bg-slate-400 h-full rounded-full" style={{ width: `${getPercentage(totalDraft)}%` }} />
            </div>
          </div>

          {/* Rechazados */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-red-600 dark:text-red-400 uppercase">{T.rejected} ({getPercentage(totalRejected)}%)</span>
              <span className="text-slate-700 dark:text-slate-200">{totalRejected.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {symbol}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/5 h-2.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full rounded-full" style={{ width: `${getPercentage(totalRejected)}%` }} />
            </div>
          </div>

          {/* Expirados */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-amber-600 dark:text-amber-400 uppercase">{T.expired} ({getPercentage(totalExpired)}%)</span>
              <span className="text-slate-700 dark:text-slate-200">{totalExpired.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {symbol}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/5 h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${getPercentage(totalExpired)}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="card-premium card-finanzas p-6 md:p-8 bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-3xl flex flex-col justify-center space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">{T.conversionRate}</h3>
        
        <div className="text-center py-6">
          <p className="text-5xl font-black text-[#1B4FD8] dark:text-blue-400 tabular-nums">
            {total > 0 ? Math.round((estimates.filter(e => e.status === 'accepted').length / estimates.length) * 100) : 0}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-2">
            {T.acceptedOfTotal}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center border-t border-[#E2E8F0] dark:border-[#1E3A5F] pt-4">
          <div>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{estimates.filter(e => e.status === 'accepted').length}</p>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{T.acceptedLabel}</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{estimates.length}</p>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{T.totalIssuedLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
