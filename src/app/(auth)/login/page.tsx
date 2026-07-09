"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, Home, Languages } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import "../auth-pages.css";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t, language, setLanguage } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t("auth.errorFieldsRequired" as any));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error(t("auth.errorIncorrectPassword" as any));
      } else if (error.message.includes('Email not found') || error.message.includes('User not found')) {
        toast.error(t("auth.errorEmailNotFound" as any));
      } else if (error.message.includes('Email not confirmed')) {
        toast.error(t("auth.errorEmailNotConfirmed" as any));
      } else {
        toast.error(t("auth.errorLoginFailed" as any));
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
        .maybeSingle();

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
      <div className="auth-right login-right">
        <button
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="auth-lang-link"
          title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        >
          <Languages size={18} />
          <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 'bold' }}>
            {language === 'es' ? 'EN' : 'ES'}
          </span>
        </button>
        <Link href="https://www.sffalcon.com" className="auth-home-link" title={t("auth.goToMainWeb" as any)}>
          <Home size={18} />
        </Link>



        <div className="auth-card auth-card--compact">
          <h1 className="auth-card-title">{t("auth.welcomeTitle" as any)}</h1>
          <p className="auth-card-subtitle">{t("auth.welcomeSubtitle" as any)}</p>

          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <label className="auth-label">{t("auth.emailLabel" as any)}</label>
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
              <label className="auth-label">{t("auth.passwordLabel" as any)}</label>
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
                t("auth.loginButton" as any)
              )}
            </button>
          </form>

          <Link href="/reset-password" className="auth-forgot">{t("auth.forgotPassword" as any)}</Link>

          <hr className="auth-divider" />

          <p className="auth-register-line">
            {t("auth.noAccount" as any)}{" "}
            <Link href="/register">{t("auth.registerNow" as any)}</Link>
          </p>

          <div className="auth-card-footer">
            © 2026 SF &nbsp;•&nbsp;{" "}
            <Link href="/legal">{t("auth.legal" as any)}</Link>{" "}
            &nbsp;•&nbsp;{" "}
            <Link href="/privacidad">{t("auth.privacy" as any)}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
