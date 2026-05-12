"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import "../auth-pages.css";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, rellena todos los campos");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error("Contraseña incorrecta. Inténtalo de nuevo.");
      } else if (error.message.includes('Email not found') || error.message.includes('User not found')) {
        toast.error("No existe ninguna cuenta con ese email.");
      } else if (error.message.includes('Email not confirmed')) {
        toast.error("Confirma tu email antes de entrar. Revisa tu bandeja de entrada.");
      } else {
        toast.error("Error al iniciar sesión. Inténtalo de nuevo.");
      }
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: staffRecord } = await supabase
        .from('staff')
        .select('id')
        .eq('id', user.id)
        .single();

      if (staffRecord) {
        router.replace('/panel-empleado');
        return;
      }
    }

    router.replace("/dashboard");
  };

  return (
    <div className="auth-root wide-left">
      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <Link href="/" className="auth-brand" style={{ gap: '6px' }}>
          <Image src="/icon.svg" alt="SF" width={28} height={28} style={{ borderRadius: 6 }} />
          <span className="auth-brand-name italic" style={{ letterSpacing: '0.05em' }}>SF</span>
          <span className="auth-brand-name" style={{ textTransform: 'none', fontWeight: 500, color: '#A3B3D9', letterSpacing: '0' }}>Gestor Empresarial</span>
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
        </div>
      </div>


      {/* ── RIGHT PANEL ── */}
      <div className="auth-right login-right">



        <div className="auth-card auth-card--compact">
          <h1 className="auth-card-title">Bienvenido de nuevo</h1>
          <p className="auth-card-subtitle">Introduce tus credenciales para acceder a la consola.</p>

          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <label className="auth-label">Correo Electrónico</label>
              <div className="auth-input-wrap">
                <input
                  type="email"
                  placeholder="admin@soportefacil.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="auth-input"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Contraseña</label>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
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

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "ACCEDER AL PANEL"
              )}
            </button>
          </form>

          <Link href="/reset-password" className="auth-forgot">¿He olvidado mi clave?</Link>

          <hr className="auth-divider" />

          <p className="auth-register-line">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/register">Comienza gratis ahora</Link>
          </p>

          <div className="auth-card-footer">
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
