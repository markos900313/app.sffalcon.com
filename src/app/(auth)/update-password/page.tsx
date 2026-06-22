"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, CheckCircle, ArrowLeft, Loader2, Home } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import "../auth-pages.css";

function UpdatePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { t } = useLanguage();
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
      toast.error(t("auth.errorFieldsRequired" as any));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("auth.errorPasswordMismatch" as any));
      return;
    }
    if (password.length < 6) {
      toast.error(t("auth.errorPasswordMinLength" as any));
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(t("auth.errorPasswordUpdate" as any) + error.message);
        setLoading(false);
        return;
      }

      await supabase.auth.signOut();
      toast.success(t("auth.successPasswordUpdated" as any));
      router.push("/login");
    } catch (err: any) {
      toast.error(t("auth.errorUnexpected" as any) + err.message);
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
            {t("auth.headline.part1" as any)} <span className="auth-headline-accent">{t("auth.headline.accent1" as any)}</span><br />
            {t("auth.headline.part2" as any)}<br />
            <span className="auth-headline-accent">{t("auth.headline.accent2" as any)}</span>
          </h2>

          <div className="auth-benefits">
            {[
              t("auth.benefits.benefit1" as any),
              t("auth.benefits.benefit2" as any),
              t("auth.benefits.benefit3" as any),
              t("auth.benefits.benefit4" as any),
            ].map((text) => (
              <div className="auth-benefit-item" key={text}>
                <div className="auth-benefit-check">✓</div>
                <span className="auth-benefit-text">{text}</span>
              </div>
            ))}
          </div>

          <div className="auth-quote">
            <p>{t("auth.quote" as any)}</p>
          </div>

          <div className="auth-marketing-badges">
            <span className="auth-marketing-badge">{t("auth.badges.noCard" as any)}</span>
            <span className="auth-marketing-badge">{t("auth.badges.readyInFive" as any)}</span>
            <span className="auth-marketing-badge">{t("auth.badges.madeInSpain" as any)}</span>
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
        <Link href="https://www.sffalcon.com" className="auth-home-link" title={t("auth.goToMainWeb" as any)}>
          <Home size={18} />
        </Link>
        <div className="auth-card auth-card--compact">
          {isChecking ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7C6FF7]" />
              <p className="auth-card-subtitle" style={{ marginTop: '16px' }}>{t("auth.verifyingAccess" as any)}</p>
            </div>
          ) : sessionError ? (
            <div style={{ textAlign: 'center' }}>
              <div className="auth-success-icon" style={{ borderColor: '#ef4444' }}>
                <CheckCircle className="w-8 h-8 text-[#ef4444] mx-auto" />
              </div>
              <h1 className="auth-card-title" style={{ textAlign: 'center' }}>{t("auth.invalidSessionTitle" as any)}</h1>
              <p className="auth-card-subtitle" style={{ textAlign: 'center' }}>
                {t("auth.invalidSessionSubtitle" as any)}
              </p>
              <Link href="/reset-password" style={{ display: 'block', backgroundColor: '#7C6FF7', color: 'white', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, marginTop: '20px' }}>
                {t("auth.requestNewLink" as any)}
              </Link>
            </div>
          ) : success ? (
            <div style={{ textAlign: 'center' }}>
              <div className="auth-success-icon">
                <CheckCircle className="w-8 h-8 text-[#4EDEA3] mx-auto" />
              </div>
              <h1 className="auth-card-title" style={{ textAlign: 'center' }}>{t("auth.updatedTitle" as any)}</h1>
              <p className="auth-card-subtitle" style={{ textAlign: 'center' }}>
                {t("auth.redirectingToLogin" as any)}
              </p>
            </div>
          ) : (
            <>
              <h1 className="auth-card-title">{t("auth.newPasswordTitle" as any)}</h1>
              <p className="auth-card-subtitle">{t("auth.newPasswordSubtitle" as any)}</p>

              <form onSubmit={handleUpdate}>
                <div className="auth-field">
                  <label className="auth-label">{t("auth.newPasswordLabel" as any)}</label>
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
                  <label className="auth-label">{t("auth.confirmPasswordLabel" as any)}</label>
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
                    t("auth.saveAndEnterButton" as any)
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
                {t("auth.closeAndBack" as any)}
              </button>

              <div className="auth-card-footer" style={{ marginTop: '28px' }}>
                © 2026 SF &nbsp;•&nbsp;{" "}
                <Link href="/legal">{t("auth.legal" as any)}</Link>{" "}
                &nbsp;•&nbsp;{" "}
                <Link href="/privacidad">{t("auth.privacy" as any)}</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  const { t } = useLanguage();

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
