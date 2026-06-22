"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { MailCheck, Check, X, Loader2, Home } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
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
  const { t } = useLanguage();

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
      toast.error(t("auth.errorFieldsRequired" as any));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("auth.errorPasswordMismatch" as any));
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
        setNameExistsError(t("auth.errorNameExists" as any));
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
        setEmailExistsError(t("auth.errorEmailExists" as any));
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
        setBusinessExistsError(t("auth.errorBusinessExists" as any));
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error(t("auth.errorUserCreationFailed" as any));

      const apiResponse = await fetch('/api/organization/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          email, // Añadido
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
        throw new Error(errorData.error || t("auth.errorBusinessConfigFailed" as any));
      }

      if (authData.session) {
        toast.success(t("auth.successAccountCreated" as any));
        router.replace("/dashboard");
      } else {
        toast.success(t("auth.successCheckEmail" as any));
        setUserEmail(email);
        setRegistered(true);
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error("Error en registro:", error);
      const message = error instanceof Error ? error.message : t("auth.errorRegistrationGeneric" as any);
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
            {t("auth.headline.part1" as any)} <span className="reg-headline-accent">{t("auth.headline.accent1" as any)}</span><br />
            {t("auth.headline.part2" as any)}<br />
            <span className="reg-headline-accent">{t("auth.headline.accent2" as any)}</span>
          </h2>

          <div className="reg-benefits">
            {[
              t("auth.benefits.benefit1" as any),
              t("auth.benefits.benefit2" as any),
              t("auth.benefits.benefit3" as any),
              t("auth.benefits.benefit4" as any),
            ].map((text) => (
              <div className="reg-benefit-item" key={text}>
                <div className="reg-benefit-check">✓</div>
                <span className="reg-benefit-text">{text}</span>
              </div>
            ))}
          </div>

          <div className="reg-quote">
            <p>{t("auth.quote" as any)}</p>
          </div>

          <div className="reg-marketing-badges">
            <span className="reg-marketing-badge">{t("auth.badges.noCard" as any)}</span>
            <span className="reg-marketing-badge">{t("auth.badges.readyInFive" as any)}</span>
            <span className="reg-marketing-badge">{t("auth.badges.madeInSpain" as any)}</span>
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

      <div className="reg-right">
        <Link href="https://www.sffalcon.com" className="auth-home-link" title={t("auth.goToMainWeb" as any)}>
          <Home size={18} />
        </Link>
        <div style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }}>
          {registered ? (
            <div className="reg-success">
              <div className="reg-success-icon">
                <MailCheck size={48} color="#818CF8" />
              </div>
              <h2>{t("auth.checkEmailTitle" as any)}</h2>
              <p>
                {t("auth.activationLinkSent" as any)}
                <span className="reg-success-email">{userEmail}</span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Link href="/login" className="reg-success-link">
                  {t("auth.goToLogin" as any)}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="reg-content" style={{ textAlign: 'center' }}>
                <h1 className="reg-title">{t("auth.createAccountTitle" as any)}</h1>
                <p className="reg-subtitle" style={{ marginBottom: '40px' }}>{t("auth.createAccountSubtitle" as any)}</p>

                {/* Step 1 */}
                <div style={{ marginBottom: '40px' }}>
                  <p className="reg-step-label">{t("auth.stepChoosePlan" as any)}</p>
                  <div className="reg-plans-grid" style={{
                    gridTemplateColumns: "1fr",
                    maxWidth: '500px',
                    margin: '0 auto'
                  }}>
                    <PlanCard
                      title={t("common.sections.principal" as any) === "Principal" ? "Gestor Empresarial" : "Enterprise Manager"} // plan name
                      price="29€/mes"
                      subtitle={t("auth.planCardSubtitle" as any)}
                      badge={t("auth.allIncluded" as any)}
                      features={[
                        { text: t("auth.planFeatures.feature1" as any), included: true },
                        { text: t("auth.planFeatures.feature2" as any), included: true },
                        { text: t("auth.planFeatures.feature3" as any), included: true },
                        { text: t("auth.planFeatures.feature4" as any), included: true },
                        { text: t("auth.planFeatures.feature5" as any), included: true },
                        { text: t("auth.planFeatures.feature6" as any), included: true },
                        { text: t("auth.planFeatures.feature7" as any), included: true },
                        { text: t("auth.planFeatures.feature8" as any), included: true },
                      ]}
                      btnText={t("auth.btnStartTrial" as any)}
                      selected={planSeleccionado === "pro"}
                      onClick={() => {
                        setPlanSeleccionado("pro");
                        scrollToForm();
                      }}
                      isPro={true}
                    />
                  </div>
                  <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                    {t("auth.noCardRequired" as any)}
                  </p>
                </div>

                {/* Formulario de registro (Step 3) */}
                {planSeleccionado && (
                  <div id="formulario-registro" className="reg-form-section visible" style={{ paddingBottom: '200px' }}>
                    <div style={{ padding: '32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0', textAlign: 'left' }}>
                      <p className="reg-step-label">{t("auth.stepYourData" as any)}</p>
                      <form onSubmit={handleRegister}>
                        <div className="reg-form-grid">
                          <div className="reg-field">
                            <label className="reg-label">{t("auth.fullNameLabel" as any)}</label>
                            <input
                              type="text"
                              value={fullName}
                              onChange={e => {
                                setFullName(e.target.value);
                                if (nameExistsError) setNameExistsError("");
                              }}
                              className="reg-input"
                              placeholder={t("auth.fullNamePlaceholder" as any)}
                            />
                            {nameExistsError && (
                              <p className="reg-error-msg">
                                <X className="w-3 h-3" /> {nameExistsError}
                              </p>
                            )}
                          </div>
                          <div className="reg-field">
                            <label className="reg-label">{t("auth.personalEmailLabel" as any)}</label>
                            <input
                              type="email"
                              value={email}
                              onChange={e => {
                                setEmail(e.target.value);
                                if (emailExistsError) setEmailExistsError("");
                              }}
                              className="reg-input"
                              placeholder={t("auth.personalEmailPlaceholder" as any)}
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
                           <label className="reg-label">{t("auth.businessNameLabel" as any)}</label>
                          <input
                            type="text"
                            value={businessName}
                            onChange={e => {
                              setBusinessName(e.target.value);
                              if (businessExistsError) setBusinessExistsError("");
                            }}
                            className="reg-input"
                            placeholder={t("auth.businessNamePlaceholder" as any)}
                            required
                          />
                          {businessExistsError && (
                            <p className="reg-error-msg">
                              <X className="w-3 h-3" /> {businessExistsError}
                            </p>
                          )}
                          <p style={{ fontSize: '0.65rem', color: 'rgba(163,179,217,0.4)', marginTop: '4px' }}>{t("auth.businessNameHint" as any)}</p>
                        </div>

                        <div className="reg-field" style={{ marginBottom: '16px' }}>
                          <label className="reg-label">{t("auth.whatsappLabel" as any)}</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="reg-input"
                            placeholder="+34 600 000 000"
                          />
                          <p style={{ fontSize: '0.65rem', color: 'rgba(163,179,217,0.4)', marginTop: '4px' }}>{t("auth.whatsappHint" as any)}</p>
                        </div>
                        <div className="reg-form-grid">
                          <div className="reg-field">
                            <label className="reg-label">{t("auth.passwordLabel" as any)}</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="reg-input" placeholder={t("auth.passwordMinPlaceholder" as any)} />
                          </div>
                          <div className="reg-field">
                            <label className="reg-label">{t("auth.confirmPasswordLabel" as any)}</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="reg-input" placeholder={t("auth.confirmPasswordPlaceholder" as any)} />
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
                            <span>{t("auth.btnFinishRegistration" as any)}</span>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                <div className="reg-footer-links" style={{ marginTop: '48px', marginBottom: '80px' }}>
                  <p>
                    {t("auth.alreadyHaveAccount" as any)}{" "}
                    <Link href="/login" style={{ color: '#818CF8', fontWeight: 700 }}>{t("auth.loginNow" as any)}</Link>
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
