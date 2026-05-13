"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { MailCheck, Check, X, Loader2, Home } from "lucide-react";
import "./register.css";

const COUNTRIES = [
  { code: 'ES', name: 'España', currency: 'EUR', symbol: '€' },
  { code: 'US', name: 'Estados Unidos', currency: 'USD', symbol: '$' },
  { code: 'MX', name: 'México', currency: 'MXN', symbol: '$' },
  { code: 'CO', name: 'Colombia', currency: 'COP', symbol: '$' },
  { code: 'AR', name: 'Argentina', currency: 'ARS', symbol: '$' },
  { code: 'GB', name: 'Reino Unido', currency: 'GBP', symbol: '£' },
  { code: 'FR', name: 'Francia', currency: 'EUR', symbol: '€' },
  { code: 'DE', name: 'Alemania', currency: 'EUR', symbol: '€' },
  { code: 'CL', name: 'Chile', currency: 'CLP', symbol: '$' },
  { code: 'PE', name: 'Perú', currency: 'PEN', symbol: 'S/' },
  { code: 'CU', name: 'Cuba', currency: 'CUP', symbol: '$' },
]

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [country] = useState("ES");
  const [currency] = useState("EUR");
  const [currencySymbol] = useState("€");
  const [planSeleccionado, setPlanSeleccionado] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [nameExistsError, setNameExistsError] = useState("");
  const [businessExistsError, setBusinessExistsError] = useState("");
  const [emailExistsError, setEmailExistsError] = useState("");

  const scrollToForm = () => {
    setTimeout(() => {
      const element = document.getElementById("formulario-registro");
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setNameExistsError("");
    setBusinessExistsError("");
    setEmailExistsError("");

    const finalBusinessName = businessName;

    if (!fullName || !email || !password || !confirmPassword || !finalBusinessName) {
      toast.error("Por favor, rellena todos los campos");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      // 1. Verificar en tabla profiles si ya existe ese nombre (vía RPC para bypass RLS)
      const { data: nameExists, error: nameError } = await supabase.rpc('check_full_name_exists', {
        name_to_check: fullName.trim()
      });

      if (nameError) {
        console.error('Error checking name:', nameError);
      }

      if (nameExists) {
        setNameExistsError("Este nombre de usuario ya existe");
        setLoading(false);
        return;
      }

      // 2. Verificar duplicado de email (vía RPC para bypass RLS)
      const { data: emailExists, error: emailError } = await supabase.rpc('check_email_exists', {
        email_to_check: email.trim()
      });

      if (emailError) {
        console.error('Error checking email:', emailError);
      }

      if (emailExists) {
        setEmailExistsError("Cuenta existente con este correo");
        setLoading(false);
        return;
      }

      // Pre-validación: ¿Ya existe una organización con este nombre? (vía RPC para bypass RLS)
      const { data: businessExists, error: businessError } = await supabase.rpc('check_business_name_exists', {
        business_name_to_check: finalBusinessName.trim()
      });

      if (businessError) {
        console.error('Error checking business name:', businessError);
      }

      if (businessExists) {
        setBusinessExistsError("Ya hay un negocio registrado con este nombre");
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      const apiResponse = await fetch('/api/organization/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          businessName: finalBusinessName,
          sector: 'Ocio y Entretenimiento',
          country,
          currency,
          currencySymbol,
          plan: planSeleccionado,
          phone
        })
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || "Error al configurar los datos del negocio");
      }

      if (authData.session) {
        toast.success("¡Cuenta creada correctamente!");
        router.replace("/dashboard");
      } else {
        toast.success("¡Casi listo! Revisa tu email para activar tu cuenta.");
        setUserEmail(email);
        setRegistered(true);
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error("Error en registro:", error);
      const message = error instanceof Error ? error.message : "Ha ocurrido un error en el registro";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="reg-root">
      <div className="reg-left">
        <Link href="/" className="reg-brand" style={{ gap: '12px' }}>
          <Image src="/icon.svg" alt="SF" width={56} height={56} style={{ borderRadius: 12 }} />
          <span className="reg-brand-name italic" style={{ letterSpacing: '0.05em', fontSize: '1.2rem' }}>SF</span>
          <span className="reg-brand-name" style={{ textTransform: 'none', fontWeight: 500, color: '#A3B3D9', letterSpacing: '0', fontSize: '1.2rem' }}>Gestor Empresarial</span>
        </Link>

        <div className="reg-left-content">
          <h2 className="reg-headline">
            El asistente <span className="reg-headline-accent">de reservas y citas que</span><br />
            nunca pudiste<br />
            <span className="reg-headline-accent">tener</span>
          </h2>

          <div className="reg-benefits">
            {[
              "Mientras tú trabajas, él atiende a tus clientes",
              "Tu cliente escribe — a cualquier hora",
              "Tu asistente responde — con tu tono",
              "Tú lo encuentras todo listo",
            ].map((text) => (
              <div className="reg-benefit-item" key={text}>
                <div className="reg-benefit-check">✓</div>
                <span className="reg-benefit-text">{text}</span>
              </div>
            ))}
          </div>

          <div className="reg-quote">
            <p>&quot;Por fin puedo desconectar sin miedo a perder un cliente.&quot;</p>
          </div>

          <div className="reg-marketing-badges">
            <span className="reg-marketing-badge">Sin tarjeta</span>
            <span className="reg-marketing-badge">Listo en 5 min</span>
            <span className="reg-marketing-badge">Hecho en España</span>
          </div>
        </div>
      </div>

      <div className="reg-right">
        <Link href="https://www.sffalcon.com" className="auth-home-link" title="Ir a la web principal">
          <Home size={18} />
        </Link>
        <div style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }}>
          {registered ? (
            <div className="reg-success">
              <div className="reg-success-icon">
                <MailCheck size={48} color="#818CF8" />
              </div>
              <h2>¡Revisa tu correo!</h2>
              <p>
                Hemos enviado un enlace de activación a:
                <span className="reg-success-email">{userEmail}</span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Link href="/login" className="reg-success-link">
                  IR AL INICIO DE SESIÓN
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="reg-content" style={{ textAlign: 'center' }}>
                <h1 className="reg-title">Crea tu cuenta</h1>
                <p className="reg-subtitle" style={{ marginBottom: '40px' }}>Empieza hoy mismo tu SF inteligente</p>

                {/* Step 1 */}
                <div style={{ marginBottom: '40px' }}>
                  <p className="reg-step-label">1. Elige tu plan</p>
                  <div className="reg-plans-grid" style={{
                    gridTemplateColumns: "1fr",
                    maxWidth: '500px',
                    margin: '0 auto'
                  }}>
                    <PlanCard
                      title="Gestor Empresarial"
                      price="29€/mes"
                      subtitle="90 días GRATIS · Sin tarjeta · Cancela cuando quieras"
                      badge="Todo incluido"
                      features={[
                        { text: "Clientes y agenda ilimitados", included: true },
                        { text: "Comunicaciones WhatsApp + Email", included: true },
                        { text: "IA responde por ti 24/7", included: true },
                        { text: "Finanzas y facturas", included: true },
                        { text: "Productos e inventario", included: true },
                        { text: "Estadísticas y métricas", included: true },
                        { text: "Equipo y fichajes", included: true },
                        { text: "Gestor IA en el panel", included: true },
                      ]}
                      btnText="EMPEZAR GRATIS 90 DÍAS"
                      selected={planSeleccionado === "pro"}
                      onClick={() => {
                        setPlanSeleccionado("pro");
                        scrollToForm();
                      }}
                      isPro={true}
                    />
                  </div>
                  <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                    No se requiere tarjeta de crédito
                  </p>
                </div>

                {/* Formulario de registro (Step 3) */}
                {planSeleccionado && (
                  <div id="formulario-registro" className="reg-form-section visible" style={{ paddingBottom: '200px' }}>
                    <div style={{ padding: '32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0', textAlign: 'left' }}>
                      <p className="reg-step-label">2. Tus datos</p>
                      <form onSubmit={handleRegister}>
                        <div className="reg-form-grid">
                          <div className="reg-field">
                            <label className="reg-label">Nombre Completo</label>
                            <input
                              type="text"
                              value={fullName}
                              onChange={e => {
                                setFullName(e.target.value);
                                if (nameExistsError) setNameExistsError("");
                              }}
                              className="reg-input"
                              placeholder="Tu nombre y apellidos"
                            />
                            {nameExistsError && (
                              <p className="reg-error-msg">
                                <X className="w-3 h-3" /> {nameExistsError}
                              </p>
                            )}
                          </div>
                          <div className="reg-field">
                            <label className="reg-label">Email Personal</label>
                            <input
                              type="email"
                              value={email}
                              onChange={e => {
                                setEmail(e.target.value);
                                if (emailExistsError) setEmailExistsError("");
                              }}
                              className="reg-input"
                              placeholder="tu@email.com"
                            />
                            {emailExistsError && (
                              <p className="reg-error-msg">
                                <X className="w-3 h-3" /> {emailExistsError}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Nombre del Negocio */}
                        <div className="reg-field" style={{ marginBottom: '16px' }}>
                          <label className="reg-label">Nombre del Negocio (Marca)</label>
                          <input
                            type="text"
                            value={businessName}
                            onChange={e => {
                              setBusinessName(e.target.value);
                              if (businessExistsError) setBusinessExistsError("");
                            }}
                            className="reg-input"
                            placeholder="Ej: Parque Infantil El Mundo"
                            required
                          />
                          {businessExistsError && (
                            <p className="reg-error-msg">
                              <X className="w-3 h-3" /> {businessExistsError}
                            </p>
                          )}
                          <p style={{ fontSize: '0.65rem', color: 'rgba(163,179,217,0.4)', marginTop: '4px' }}>Este nombre aparecerá en tus facturas y comunicaciones.</p>
                        </div>

                        <div className="reg-field" style={{ marginBottom: '16px' }}>
                          <label className="reg-label">Teléfono (WhatsApp)</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="reg-input"
                            placeholder="+34 600 000 000"
                          />
                          <p style={{ fontSize: '0.65rem', color: 'rgba(163,179,217,0.4)', marginTop: '4px' }}>Opcional. Tu número de WhatsApp para conectar con clientes.</p>
                        </div>
                        <div className="reg-form-grid">
                          <div className="reg-field">
                            <label className="reg-label">Contraseña</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="reg-input" placeholder="Mínimo 6 caracteres" />
                          </div>
                          <div className="reg-field">
                            <label className="reg-label">Confirma tu contraseña</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="reg-input" placeholder="Repite la contraseña" />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="reg-btn"
                          style={{ height: '52px', fontSize: '0.85rem', marginTop: '32px' }}
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          ) : (
                            <span>FINALIZAR REGISTRO Y EMPEZAR</span>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                <div className="reg-footer-links" style={{ marginTop: '48px', marginBottom: '80px' }}>
                  <p>
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/login" style={{ color: '#818CF8', fontWeight: 700 }}>Inicia sesión ahora</Link>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  title: string;
  price: string;
  subtitle: string;
  features: PlanFeature[];
  selected: boolean;
  onClick: () => void;
  badge?: string;
  btnText: string;
  isPro?: boolean;
}

function PlanCard({ title, price, subtitle, features, selected, onClick, badge, btnText, isPro }: PlanCardProps) {
  return (
    <div onClick={onClick} className={`reg-plan-card ${selected ? "active" : ""} ${isPro ? "pro-highlight" : ""}`}>
      {badge && <span className="reg-plan-badge">{badge}</span>}
      <div>
        <p className="reg-plan-name">{title}</p>
        <p className="reg-plan-price">{price}</p>
        <p className="reg-plan-sub">{subtitle}</p>
      </div>
      <div className="reg-plan-features">
        {features.map((f, i) => (
          <div key={i} className="reg-plan-feature" style={{ opacity: f.included ? 1 : 0.4 }}>
            {f.included ? (
              <Check size={11} style={{ marginTop: 2, flexShrink: 0, color: '#818CF8' }} />
            ) : (
              <X size={11} style={{ marginTop: 2, flexShrink: 0, color: 'rgba(255,255,255,0.2)' }} />
            )}
            <span style={{
              color: f.included ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
              textDecoration: f.included ? 'none' : 'line-through',
              fontSize: '0.75rem'
            }}>
              {f.text}
            </span>
          </div>
        ))}
      </div>
      <div className="reg-plan-select-btn">{btnText}</div>
    </div>
  );
}
