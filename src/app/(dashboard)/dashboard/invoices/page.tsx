"use client";

import React, { useState, useEffect } from "react";
import {
  FileText, Plus, Search,
  Eye, Mail, CheckCircle, Pencil, Trash2,
  RefreshCw, Filter, AlertCircle,
  List, BarChart2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardPageContainer } from "@/components/dashboard/DashboardPageContainer";
import { createClient } from '@/lib/supabase/client';
import { useOrganization } from '@/context/OrganizationContext';
import toast from 'react-hot-toast';

import dynamic from 'next/dynamic';

import InvoiceModal from "@/components/dashboard/invoices/InvoiceModal";
const InvoicesAnalytics = dynamic(() => import("@/components/dashboard/invoices/InvoicesAnalytics"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-50 dark:bg-[#111F3A] animate-pulse rounded-[24px]" />
});
import { generateInvoicePDF } from "@/components/dashboard/invoices/InvoicePDF";

interface Invoice {
  id: string;
  invoice_number: string;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft' | 'cancelada' | 'borrador' | 'pagada';
  issue_date: string;
  created_at: string;
  paid_date?: string;
  concept?: string;
  clients?: {
    name: string;
    email: string;
  };
}

export default function InvoicesPage() {
  const supabase = createClient();
  const { organization } = useOrganization();
  const symbol = organization?.currency_symbol || '€';

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [view, setView] = useState<'lista' | 'analytics'>('lista');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [organization]);

  async function fetchInvoices() {
    if (!organization?.id) return;
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            name,
            email
          )
        `)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err: any) {
      toast.error('Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('invoices-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
        fetchInvoices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Derived metrics
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const totalFacturado = invoices.reduce((acc, inv) => {
    if (inv.status !== 'cancelada' && inv.status !== 'borrador') {
      return acc + Number(inv.total || 0);
    }
    return acc;
  }, 0);

  const totalPendiente = invoices.reduce((acc, inv) => {
    if (inv.status === 'pendiente') {
      return acc + Number(inv.total || 0);
    }
    return acc;
  }, 0);

  const pagadoEsteMes = invoices.reduce((acc, inv) => {
    if (inv.status === 'pagada' && inv.paid_date) {
      const d = new Date(inv.paid_date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return acc + Number(inv.total || 0);
      }
    }
    return acc;
  }, 0);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'todos') return matchesSearch;
    return matchesSearch && inv.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pagada': return <span className="px-2.5 py-1 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Pagada</span>;
      case 'pendiente': return <span className="px-2.5 py-1 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Pendiente</span>;
      case 'cancelada': return <span className="px-2.5 py-1 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">Cancelada</span>;
      case 'borrador': return <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 text-xs font-medium rounded-full">Borrador</span>;
      default: return null;
    }
  };

  const handleCreate = () => {
    setEditingInvoice(null);
    setIsModalOpen(true);
  };

  const handleEdit = (inv: any) => {
    setEditingInvoice(inv);
    setIsModalOpen(true);
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      setActionLoading(`paid-${id}`);
      const { error } = await supabase.from('invoices').update({ status: 'pagada', paid_date: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      toast.success("Marcado como pagado");
    } catch (err) {
      toast.error("Error al actualizar");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`¿Seguro que quieres eliminar el registro ${num}?`)) return;
    try {
      setActionLoading(`del-${id}`);
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      toast.success("Eliminado correctamente");
    } catch (err) {
      toast.error("Error al eliminar");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewPDF = async (inv: any) => {
    try {
      setActionLoading(`pdf-${inv.id}`);
      await generateInvoicePDF(inv, 'download', {
        name: organization?.name,
        nif: (organization as any)?.nif,
        address: organization?.address,
        city: organization?.city,
        email: organization?.email,
        phone: organization?.phone
      });
      toast.success("PDF generado");
    } catch (e) {
      toast.error("Error al generar PDF");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmail = async (inv: any) => {
    if (!inv.clients?.email) {
      toast.error("El cliente no tiene un email válido registrado");
      return;
    }

    try {
      setActionLoading(`mail-${inv.id}`);
      const pdfBase64 = await generateInvoicePDF(inv, 'base64', {
        name: organization?.name,
        nif: (organization as any)?.nif,
        address: organization?.address,
        city: organization?.city,
        email: organization?.email,
        phone: organization?.phone
      });

      const res = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: inv.id,
          pdfBase64,
          clientEmail: inv.clients.email,
          clientName: inv.clients.name,
          invoiceNumber: inv.invoice_number
        })
      });

      if (!res.ok) throw new Error();
      toast.success("Factura enviada al cliente");
    } catch (e) {
      toast.error("Error al enviar email");
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
        {/* Ultra-Banner: Billing Control Center */}
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
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1B4FD8]">Gestión de Facturación</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Auditado</span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  Control de <span className="text-[#1B4FD8]">Comprobantes</span>
                </h1>
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="flex items-center justify-center gap-2 bg-[#1B4FD8] hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95 w-full md:w-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              NUEVO COMPROBANTE / FACTURA
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
              VISTA LISTADO
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
              ANÁLISIS
            </button>
          </div>

          {view === 'lista' ? (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              {/* Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-premium card-finanzas p-6 md:p-8 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center rounded-2xl shrink-0">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="kpi-label">TOTAL FACTURADO</p>
                    <p className="kpi-numero">
                      {totalFacturado.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {symbol}
                    </p>
                  </div>
                </div>

                <div className="card-premium card-finanzas p-6 md:p-8 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center rounded-2xl shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="kpi-label">PENDIENTE COBRO</p>
                    <p className="kpi-numero">
                      {totalPendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {symbol}
                    </p>
                  </div>
                </div>

                <div className="card-premium card-finanzas p-6 md:p-8 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center rounded-2xl shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="kpi-label">PAGADO MES</p>
                    <p className="kpi-numero">
                      {pagadoEsteMes.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {symbol}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-premium card-finanzas shadow-sm overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="py-6 px-4 md:px-8 border-b border-[#E2E8F0] dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="Buscar registros..."
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
                        className="bg-transparent text-[13px] font-bold text-slate-500 uppercase tracking-tight outline-none"
                      >
                        <option value="todos">FILTRAR POR ESTADO</option>
                        <option value="borrador">BORRADORES</option>
                        <option value="pendiente">PENDIENTES</option>
                        <option value="pagada">PAGADAS</option>
                        <option value="cancelada">CANCELADAS</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* List */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] dark:bg-[#0A1628]/50 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider border-b border-[#E2E8F0] dark:border-[#1E3A5F]">
                        <th className="px-4 md:px-8 py-4">ID / Ref</th>
                        <th className="px-4 md:px-8 py-4">Contacto</th>
                        <th className="px-6 py-4 hidden lg:table-cell">Concepto</th>
                        <th className="px-4 md:px-8 py-4 text-right">Total</th>
                        <th className="px-4 md:px-8 py-4">Estado</th>
                        <th className="px-6 py-4 hidden md:table-cell">Emisión</th>
                        <th className="px-4 md:px-8 py-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E3A5F]">
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                            No se encontraron registros
                          </td>
                        </tr>
                      ) : (
                        filteredInvoices.map((inv: any) => (
                          <tr key={inv.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#0D1B35]/50 transition-colors group">
                            <td className="px-4 md:px-8 py-4">
                              <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9] text-[13px] md:text-[14px]">{inv.invoice_number}</span>
                            </td>
                            <td className="px-4 md:px-8 py-4">
                              <p className="text-[13px] md:text-[14px] font-medium text-[#0F172A] dark:text-[#F1F5F9] truncate max-w-[100px] md:max-w-none">{inv.clients?.name}</p>
                              {/* inv.projects?.name && (
                              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate max-w-[150px] hidden md:block">{inv.projects.name}</p>
                            ) */}
                            </td>
                            <td className="px-6 py-4 hidden lg:table-cell">
                              <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] truncate max-w-[200px]">{inv.concept}</p>
                            </td>
                            <td className="px-4 md:px-8 py-4 text-right">
                              <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9] text-[13px] md:text-[14px] tabular-nums">
                                {Number(inv.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} {symbol}
                              </span>
                            </td>
                            <td className="px-4 md:px-8 py-4">
                              <div className="scale-90 md:scale-100 origin-left">
                                {getStatusBadge(inv.status)}
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <span className="text-[13px] md:text-[14px] text-[#475569] dark:text-[#CBD5E1]">
                                {new Date(inv.issue_date || inv.created_at).toLocaleDateString('es-ES')}
                              </span>
                            </td>
                            <td className="px-4 md:px-8 py-4 text-center">
                              <div className="flex items-center justify-center gap-1 md:gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleViewPDF(inv)}
                                  disabled={actionLoading === `pdf-${inv.id}`}
                                  title="Descargar PDF"
                                  className="p-1 md:p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-500/20"
                                >
                                  {actionLoading === `pdf-${inv.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleSendEmail(inv)}
                                  disabled={actionLoading === `mail-${inv.id}`}
                                  title="Enviar por Email"
                                  className="p-1 md:p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                >
                                  {actionLoading === `mail-${inv.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleEdit(inv)}
                                  title="Editar"
                                  className="p-1 md:p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>

                                {inv.status !== 'pagada' && (
                                  <button
                                    onClick={() => handleMarkAsPaid(inv.id)}
                                    disabled={actionLoading === `paid-${inv.id}`}
                                    title="Marcar Pagada"
                                    className="p-1 md:p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors border border-transparent hover:border-green-200 dark:hover:border-green-500/20"
                                  >
                                    {actionLoading === `paid-${inv.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDelete(inv.id, inv.invoice_number)}
                                  disabled={actionLoading === `del-${inv.id}`}
                                  title="Eliminar"
                                  className="p-1 md:p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                                >
                                  {actionLoading === `del-${inv.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
            <InvoicesAnalytics invoices={invoices} />
          )}
        </div>
      </DashboardPageContainer>

      {isModalOpen && (
        <InvoiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={fetchInvoices}
          invoiceToEdit={editingInvoice}
        />
      )}
    </>
  );
}
