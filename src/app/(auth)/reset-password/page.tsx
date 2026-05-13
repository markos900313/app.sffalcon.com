"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { CheckCircle, ArrowLeft, Loader2, AlertCircle, Home } from "lucide-react";
import { useSearchParams } from "next/navigation";
import "../auth-pages.css";

function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Introduce un correo electrónico válido");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al enviar el enlace");
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success("¡Enlace enviado!");
    } catch (err) {
      toast.error("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div className="auth-success-icon">
          <CheckCircle size={32} color="#4EDEA3" />
        </div>
        <h1 className="auth-card-title" style={{ textAlign: 'center' }}>¡Enviado!</h1>
        <p className="auth-card-subtitle" style={{ textAlign: 'center' }}>
          Instrucciones enviadas a <strong style={{ color: '#7C6FF7' }}>{email}</strong>.
        </p>
        <div style={{ textAlign: 'center' }}>
          <Link href="/login" className="auth-back-link" style={{ justifyContent: 'center' }}>
            <ArrowLeft size={13} />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="auth-card-title">Recupera tu acceso</h1>
      <p className="auth-card-subtitle">Recibirás un enlace de recuperación en tu correo.</p>

      {errorParam && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed flex items-start gap-3 rounded-none">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{errorParam}</span>
        </div>
      )}

      <form onSubmit={handleReset}>
        <div className="auth-field">
          <label className="auth-label">Correo Electrónico</label>
          <input
            type="email"
            placeholder="email@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="auth-input"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            "ENVIAR ENLACE"
          )}
        </button>
      </form>

      <Link href="/login" className="auth-back-link">
        <ArrowLeft size={13} />
        Cerrar y volver
      </Link>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-root wide-left">
      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <Link href="/" className="auth-brand" style={{ gap: '12px' }}>
          <Image src="/icon.svg" alt="SF" width={56} height={56} style={{ borderRadius: 12 }} />
          <span className="auth-brand-name italic" style={{ letterSpacing: '0.05em', fontSize: '1.2rem' }}>SF</span>
          <span className="auth-brand-name" style={{ textTransform: 'none', fontWeight: 500, color: '#A3B3D9', letterSpacing: '0', fontSize: '1.2rem' }}>Gestor Empresarial</span>
        </Link>
        <div className="auth-left-content">
          <h2 className="auth-headline">
            El asistente <span className="auth-headline-accent">de reservas y citas que</span><br />
            nunca pudiste<br />
            <span className="auth-headline-accent">tener</span>
          </h2>

          <div className="auth-benefits">
            {[
              "Mientras tú trabajas, él atiende a tus clientes",
              "Tu cliente escribe — a cualquier hora",
              "Tu asistente responde — con tu tono",
              "Tú lo encuentras todo listo",
            ].map((text) => (
              <div className="auth-benefit-item" key={text}>
                <div className="auth-benefit-check">✓</div>
                <span className="auth-benefit-text">{text}</span>
              </div>
            ))}
          </div>

          <div className="auth-quote">
            <p>&quot;Por fin puedo desconectar sin miedo a perder un cliente.&quot;</p>
          </div>

          <div className="auth-marketing-badges">
            <span className="auth-marketing-badge">Sin tarjeta</span>
            <span className="auth-marketing-badge">Listo en 5 min</span>
            <span className="auth-marketing-badge">Hecho en España</span>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.7 }}>
            <p style={{ color: 'white', fontSize: '0.85rem' }}>
              <span style={{ color: '#818CF8', fontWeight: 600 }}>Email:</span> soporte@sffalcon.com
            </p>
            <p style={{ color: 'white', fontSize: '0.85rem' }}>
              <span style={{ color: '#818CF8', fontWeight: 600 }}>Telf:</span> +34 604 989 742
            </p>
          </div>
        </div>
      </div>


      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <Link href="https://www.sffalcon.com" className="auth-home-link" title="Ir a la web principal">
          <Home size={18} />
        </Link>
        <div className="auth-card auth-card--compact">
          <Suspense fallback={
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>

          <div className="auth-card-footer" style={{ marginTop: '28px' }}>
            © 2026 SF &nbsp;•&nbsp;{" "}
            <Link href="/legal">LEGAL</Link>{" "}
            &nbsp;•&nbsp;{" "}
            <Link href="/privacidad">PRIVACIDAD</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
