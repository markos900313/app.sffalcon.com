"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';
import { 
  FileText, CheckCircle2, XCircle, AlertTriangle, 
  Building, User, Phone, Mail, MapPin, Euro, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AcceptEstimatePage({ params }: { params: { token: string } }) {
  const token = params.token;
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [successAction, setSuccessAction] = useState<'accepted' | 'rejected' | null>(null);

  useEffect(() => {
    if (!token) return;
    loadEstimate();
  }, [token]);

  const loadEstimate = async () => {
    try {
      // 1. Fetch estimate by accept_token (public policy allows this)
      const { data: est, error: estErr } = await supabase
        .from('estimates')
        .select('*')
        .eq('accept_token', token)
        .single();

      if (estErr || !est) {
        setErrorState("Presupuesto no encontrado");
        setLoading(false);
        return;
      }

      setEstimate(est);

      // Check status
      if (est.status === 'accepted') {
        setSuccessAction('accepted');
        setLoading(false);
        return;
      }
      if (est.status === 'rejected') {
        setSuccessAction('rejected');
        setLoading(false);
        return;
      }

      // Check expiration
      const isExpired = est.status === 'expired' || (est.valid_until && new Date(est.valid_until) < new Date());
      if (isExpired) {
        setErrorState("Expirado");
        setLoading(false);
        return;
      }

      // 2. Fetch organization info (public query)
      const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .select('name, logo_url, email, whatsapp_number')
        .eq('id', est.organization_id)
        .single();

      if (!orgErr && org) {
        setOrganization(org);
      }

    } catch (err) {
      console.error(err);
      setErrorState("Presupuesto no encontrado");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'accept' | 'reject') => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/estimates/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action })
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Ocurrió un error.");
        return;
      }

      setSuccessAction(action === 'accept' ? 'accepted' : 'rejected');
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1B4FD8] animate-spin" />
          <p className="text-slate-400 text-sm">Cargando presupuesto...</p>
        </div>
      </div>
    );
  }

  // Error States
  if (errorState) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111F3A] border border-[#1E3A5F] rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            {errorState === "Expirado" ? <AlertTriangle className="w-8 h-8 text-amber-500" /> : <XCircle className="w-8 h-8" />}
          </div>
          <h2 className="text-xl font-bold text-white">
            {errorState === "Expirado" ? "Presupuesto Expirado" : "Presupuesto no encontrado"}
          </h2>
          <p className="text-slate-400 text-sm">
            {errorState === "Expirado" 
              ? "Este presupuesto ya no es válido porque ha superado la fecha límite." 
              : "El enlace que has seguido no es válido o el presupuesto ha sido eliminado."}
          </p>
        </div>
      </div>
    );
  }

  // Success States
  if (successAction === 'accepted') {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111F3A] border border-green-500/20 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">¡Presupuesto aceptado!</h2>
          <p className="text-slate-400 text-sm">Nos pondremos en contacto pronto.</p>
        </div>
      </div>
    );
  }

  if (successAction === 'rejected') {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111F3A] border border-red-500/20 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Presupuesto rechazado</h2>
          <p className="text-slate-400 text-sm">Presupuesto rechazado. Gracias.</p>
        </div>
      </div>
    );
  }

  const itemsList = estimate.items || [];

  return (
    <div className="min-h-screen bg-[#0A1628] text-slate-100 flex flex-col items-center py-12 px-4">
      <div className="max-w-3xl w-full bg-[#111F3A] border border-[#1E3A5F] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-300">
        
        {/* Banner de Organización */}
        <div className="p-8 border-b border-[#1E3A5F] bg-[#162544]/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            {organization?.logo_url ? (
              <img src={organization.logo_url} alt="Logo" className="w-12 h-12 object-cover rounded-xl border border-[#1E3A5F]" />
            ) : (
              <div className="w-12 h-12 bg-[#1B4FD8] flex items-center justify-center rounded-xl font-black text-white text-lg shrink-0">
                {organization?.name?.[0]?.toUpperCase() || "SF"}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">{organization?.name || "Mi Empresa"}</h2>
              {organization?.email && (
                <p className="text-xs text-slate-400 mt-1">{organization.email}</p>
              )}
            </div>
          </div>
          <div className="text-left md:text-right">
            <span className="text-[10px] font-black text-[#1B4FD8] uppercase tracking-[0.2em]">Presupuesto</span>
            <h1 className="text-xl font-black text-white mt-0.5">{estimate.estimate_number}</h1>
          </div>
        </div>

        {/* Detalles del Cliente e Información */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-[#1E3A5F]">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#1B4FD8]" /> Datos del Cliente
            </h3>
            <div className="space-y-1.5 text-sm">
              <p className="font-semibold text-white">{estimate.customer_name}</p>
              {estimate.customer_email && (
                <p className="text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {estimate.customer_email}
                </p>
              )}
              {estimate.customer_phone && (
                <p className="text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {estimate.customer_phone}
                </p>
              )}
              {estimate.customer_address && (
                <p className="text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {estimate.customer_address}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3 md:text-right">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center md:justify-end gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#1B4FD8]" /> Fechas
            </h3>
            <div className="space-y-1.5 text-sm text-slate-300">
              <p>Fecha Emisión: <span className="font-semibold text-white">{format(parseISO(estimate.created_at), 'dd/MM/yyyy')}</span></p>
              <p>Válido hasta: <span className="font-semibold text-white">{format(parseISO(estimate.valid_until), 'dd/MM/yyyy')}</span></p>
            </div>
          </div>
        </div>

        {/* Tabla de Artículos */}
        <div className="p-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#1B4FD8]" /> Artículos / Conceptos
          </h3>

          <div className="border border-[#1E3A5F] rounded-2xl overflow-hidden bg-[#0D1B35]/30">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#162544]/60 border-b border-[#1E3A5F] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3 text-right">Cant.</th>
                  <th className="px-4 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E3A5F]/40 text-slate-300">
                {itemsList.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#162544]/20 transition-colors">
                    <td className="px-4 py-3.5 font-medium">{item.description}</td>
                    <td className="px-4 py-3.5 text-right">{item.quantity}</td>
                    <td className="px-4 py-3.5 text-right">{Number(item.unit_price || 0).toFixed(2)} €</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-white">{Number((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="mt-6 flex justify-end">
            <div className="w-full md:w-80 bg-[#162544]/30 border border-[#1E3A5F]/50 rounded-2xl p-5 space-y-3 text-sm">
              <div className="flex justify-between items-center text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-200">{Number(estimate.subtotal || 0).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>IVA ({estimate.tax_rate || 21}%):</span>
                <span className="font-semibold text-slate-200">{Number(estimate.tax_amount || 0).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[#1E3A5F]/60 text-base">
                <span className="font-bold text-white">TOTAL:</span>
                <span className="text-emerald-400 font-black text-lg">{Number(estimate.total || 0).toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {estimate.notes && (
            <div className="mt-8 p-5 bg-[#162544]/20 border border-[#1E3A5F]/40 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notas / Condiciones:</h4>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{estimate.notes}</p>
            </div>
          )}
        </div>

        {/* Acciones del Presupuesto */}
        <div className="p-8 border-t border-[#1E3A5F] bg-[#162544]/50 flex flex-col sm:flex-row items-center gap-4 justify-end">
          <button
            onClick={() => handleAction('reject')}
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            ❌ Rechazar
          </button>
          
          <button
            onClick={() => handleAction('accept')}
            disabled={submitting}
            className="w-full sm:w-auto px-10 py-3 bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 active:scale-[0.98]"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
              </span>
            ) : (
              "✅ Aceptar Presupuesto"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
