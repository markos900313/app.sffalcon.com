"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { CheckCircle, ArrowLeft, Loader2, AlertCircle, Home } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";
import "../auth-pages.css";

function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const { t } = useLanguage();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error(t("auth.errorInvalidEmail" as any));
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
        toast.error(data.error || t("auth.errorSendingResetLink" as any));
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success(t("auth.successResetLinkSent" as any));
    } catch (err) {
      toast.error(t("auth.errorConnectionFailed" as any));
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
        <h1 className="auth-card-title" style={{ textAlign: 'center' }}>{t("auth.sentTitle" as any)}</h1>
        <p className="auth-card-subtitle" style={{ textAlign: 'center' }}>
          {t("auth.instructionsSentTo" as any)} <strong style={{ color: '#7C6FF7' }}>{email}</strong>.
        </p>
        <div style={{ textAlign: 'center' }}>
          <Link href="/login" className="auth-back-link" style={{ justifyContent: 'center' }}>
            <ArrowLeft size={13} />
            {t("auth.backToHome" as any)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="auth-card-title">{t("auth.recoverAccessTitle" as any)}</h1>
      <p className="auth-card-subtitle">{t("auth.recoverAccessSubtitle" as any)}</p>

      {errorParam && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed flex items-start gap-3 rounded-none">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{errorParam}</span>
        </div>
      )}

      <form onSubmit={handleReset}>
        <div className="auth-field">
          <label className="auth-label">{t("auth.emailLabel" as any)}</label>
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
            t("auth.sendLinkButton" as any)
          )}
        </button>
      </form>

      <Link href="/login" className="auth-back-link">
        <ArrowLeft size={13} />
        {t("auth.closeAndBack" as any)}
      </Link>
    </>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();

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
          <Suspense fallback={
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>

          <div className="auth-card-footer" style={{ marginTop: '28px' }}>
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
