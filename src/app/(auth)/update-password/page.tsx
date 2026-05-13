"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, CheckCircle, ArrowLeft, Loader2, Home } from "lucide-react";
import "../auth-pages.css";

function UpdatePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initCheck() {
      // 1. Extraer parámetros de búsqueda (link de recuperación con token_hash)
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (token_hash && type === 'recovery') {
        try {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'recovery'
          });
          if (verifyError) {
            console.error("Error al verificar OTP:", verifyError);
          }
        } catch (err) {
          console.error("Error crítico verificando OTP:", err);
        }
      }

      // 2. Extraer parámetros del hash (implicit flow access_token)
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          try {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!setSessionError) {
              window.history.replaceState(null, "", window.location.pathname);
            }
          } catch (err) {
            console.error("Error crítico estableciendo sesión:", err);
          }
        }
      }

      // 3. Comprobar la sesión resultante
      const { data: { user } } = await supabase.auth.getUser();

      if (user && mounted) {
        setSessionError(false);
        setIsChecking(false);
        return;
      }

      if (mounted) {
        // Un pequeño retraso para permitir que supabase-js procese el evento de sesión
        setTimeout(async () => {
          const { data: { user: retryUser } } = await supabase.auth.getUser();
          if (retryUser && mounted) {
            setSessionError(false);
          } else if (mounted) {
            setSessionError(true);
          }
          setIsChecking(false);
        }, 1000);
      }
    }

    initCheck();

    return () => {
      mounted = false;
    };
  }, [supabase, searchParams]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Por favor, rellena todos los campos");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error("Error al actualizar la contraseña: " + error.message);
        setLoading(false);
        return;
      }

      await supabase.auth.signOut();
      toast.success("Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.");
      router.push("/login");
    } catch (err: any) {
      toast.error("Error inesperado: " + err.message);
      setLoading(false);
    }
  };

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
            <p>"Por fin puedo desconectar sin miedo a perder un cliente."</p>
          </div>

          <div className="auth-marketing-badges">
            <span className="auth-marketing-badge">Sin tarjeta</span>
            <span className="auth-marketing-badge">Listo en 5 min</span>
            <span className="auth-marketing-badge">Hecho en España</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <Link href="https://www.sffalcon.com" className="auth-home-link" title="Ir a la web principal">
          <Home size={18} />
        </Link>
        <div className="auth-card auth-card--compact">
          {isChecking ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7C6FF7]" />
              <p className="auth-card-subtitle" style={{ marginTop: '16px' }}>Verificando acceso...</p>
            </div>
          ) : sessionError ? (
            <div style={{ textAlign: 'center' }}>
              <div className="auth-success-icon" style={{ borderColor: '#ef4444' }}>
                <CheckCircle className="w-8 h-8 text-[#ef4444] mx-auto" />
              </div>
              <h1 className="auth-card-title" style={{ textAlign: 'center' }}>Sesión Inválida</h1>
              <p className="auth-card-subtitle" style={{ textAlign: 'center' }}>
                Tu enlace de recuperación ha expirado o no es válido para este navegador.
              </p>
              <Link href="/reset-password" style={{ display: 'block', backgroundColor: '#7C6FF7', color: 'white', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, marginTop: '20px' }}>
                PEDIR NUEVO ENLACE
              </Link>
            </div>
          ) : success ? (
            <div style={{ textAlign: 'center' }}>
              <div className="auth-success-icon">
                <CheckCircle className="w-8 h-8 text-[#4EDEA3] mx-auto" />
              </div>
              <h1 className="auth-card-title" style={{ textAlign: 'center' }}>¡Actualizada!</h1>
              <p className="auth-card-subtitle" style={{ textAlign: 'center' }}>
                Redirigiendo a la pantalla de acceso...
              </p>
            </div>
          ) : (
            <>
              <h1 className="auth-card-title">Nueva Contraseña</h1>
              <p className="auth-card-subtitle">Establece tu nueva contraseña de acceso.</p>

              <form onSubmit={handleUpdate}>
                <div className="auth-field">
                  <label className="auth-label">Nueva Contraseña</label>
                  <div className="auth-input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="auth-input"
                      style={{ paddingRight: '28px' }}
                      required
                    />
                    <button type="button" className="auth-input-icon" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Confirmar Contraseña</label>
                  <div className="auth-input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      className="auth-input"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-btn">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "GUARDAR Y ENTRAR"
                  )}
                </button>
              </form>

              <button
                type="button"
                className="auth-back-link"
                disabled={loading}
                style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', padding: 0 }}
                onClick={async () => {
                  setLoading(true);
                  await supabase.auth.signOut();
                  router.replace("/login");
                }}
              >
                <ArrowLeft size={14} />
                Cerrar y volver
              </button>

              <div className="auth-card-footer" style={{ marginTop: '28px' }}>
                © 2026 SF &nbsp;•&nbsp;{" "}
                <Link href="/legal">LEGAL</Link>{" "}
                &nbsp;•&nbsp;{" "}
                <Link href="/privacidad">PRIVACIDAD</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="auth-root wide-left flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C6FF7]" />
      </div>
    }>
      <UpdatePasswordContent />
    </Suspense>
  );
}
