"use client";

import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import "../(auth)/auth-pages.css";
import { useLanguage } from "@/lib/LanguageContext";
import { es } from "@/lib/i18n/es";
import { en } from "@/lib/i18n/en";

export default function PrivacidadPage() {
  const { t, language } = useLanguage();
  const privacyDict = language === "en" ? en.privacy : es.privacy;

  const renderPrivacyLinks = (text: string) => {
    const parts = text.split(/({privacyLink}|admin@sffalcon\.com|\+34 604 989 742|aepd\.es|Políticas de WhatsApp Business|WhatsApp Business Policies|Términos de la plataforma de Meta|Meta platform terms|Política de Privacidad|Privacy Policy)/);
    return parts.map((part, index) => {
      if (part === "{privacyLink}") {
        return (
          <Link key={index} href="/privacidad" style={{ color: "#818CF8" }}>
            {t("privacy.title")}
          </Link>
        );
      }
      if (part === "admin@sffalcon.com") {
        return (
          <a key={index} href="mailto:admin@sffalcon.com" style={{ color: "#818CF8" }}>
            admin@sffalcon.com
          </a>
        );
      }
      if (part === "+34 604 989 742") {
        return (
          <a key={index} href="tel:+34604989742" style={{ color: "#818CF8" }}>
            +34 604 989 742
          </a>
        );
      }
      if (part === "aepd.es") {
        return (
          <a key={index} href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{ color: "#818CF8" }}>
            aepd.es
          </a>
        );
      }
      if (part === "Políticas de WhatsApp Business" || part === "WhatsApp Business Policies") {
        return (
          <a key={index} href="https://www.whatsapp.com/legal/business-policy/" target="_blank" rel="noopener noreferrer" style={{ color: "#818CF8" }}>
            {part}
          </a>
        );
      }
      if (part === "Términos de la plataforma de Meta" || part === "Meta platform terms") {
        return (
          <a key={index} href="https://developers.facebook.com/terms/" target="_blank" rel="noopener noreferrer" style={{ color: "#818CF8" }}>
            {part}
          </a>
        );
      }
      if (part === "Política de Privacidad" || part === "Privacy Policy") {
        return (
          <a key={index} href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" style={{ color: "#818CF8" }}>
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const renderBoldListItem = (itemText: string) => {
    const parts = itemText.split(/:(.+)/);
    if (parts.length < 2) return itemText;
    return (
      <>
        <strong>{parts[0]}:</strong> {parts[1].trim()}
      </>
    );
  };

  const renderProviderItem = (itemText: string) => {
    const parts = itemText.split(" — ");
    if (parts.length < 2) return itemText;
    const namePart = parts[0];
    const descPart = parts[1];
    
    const match = namePart.match(/(.+?)(\s*\(.+?\))/);
    if (match) {
      return (
        <>
          <strong>{match[1]}</strong>{match[2]} — {descPart}
        </>
      );
    }
    return (
      <>
        <strong>{namePart}</strong> — {descPart}
      </>
    );
  };

  const renderContactItem = (itemText: string) => {
    const parts = itemText.split(/:(.+)/);
    if (parts.length < 2) return itemText;
    const label = parts[0];
    const value = parts[1].trim();

    let linkElement = <span style={{ color: "#818CF8" }}>{value}</span>;
    if (value.includes("admin@sffalcon.com")) {
      linkElement = <a href={`mailto:${value}`} style={{ color: "#818CF8" }}>{value}</a>;
    } else if (value.includes("+34 604 989 742")) {
      const rawPhone = value.replace(/\s+/g, "");
      linkElement = <a href={`tel:${rawPhone}`} style={{ color: "#818CF8" }}>{value}</a>;
    } else if (value.includes("www.sffalcon.com")) {
      linkElement = <a href="https://www.sffalcon.com" target="_blank" rel="noopener noreferrer" style={{ color: "#818CF8" }}>{value}</a>;
    } else if (value.includes("app.sffalcon.com")) {
      linkElement = <a href="https://app.sffalcon.com" target="_blank" rel="noopener noreferrer" style={{ color: "#818CF8" }}>{value}</a>;
    }

    return (
      <>
        <strong>{label}:</strong> {linkElement}
      </>
    );
  };

  return (
    <div className="auth-root wide-left">
      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <Link href="/" className="auth-brand" style={{ gap: '12px' }}>
          <img src="/icon.svg" alt="SFFALCON" style={{ width: 56, height: 56, borderRadius: 12 }} />
          <span className="auth-brand-name italic" style={{ letterSpacing: '0.05em', fontSize: '1.2rem' }}>SF</span>
          <span className="auth-brand-name" style={{ textTransform: 'none', fontWeight: 500, color: '#A3B3D9', letterSpacing: '0', fontSize: '1.2rem' }}>Gestor Empresarial</span>
        </Link>

        <div className="auth-left-content">
          <h2 className="auth-headline">
            {t("auth.headline.part1")}{" "}
            <span className="auth-headline-accent">{t("auth.headline.accent1")}</span>
            <br />
            {t("auth.headline.part2")}{" "}
            <span className="auth-headline-accent">{t("auth.headline.accent2")}</span>
          </h2>

          <div className="auth-benefits">
            {[
              t("auth.benefits.benefit1"),
              t("auth.benefits.benefit2"),
              t("auth.benefits.benefit3"),
              t("auth.benefits.benefit4")
            ].map((text) => (
              <div className="auth-benefit-item" key={text}>
                <div className="auth-benefit-check">✓</div>
                <span className="auth-benefit-text">{text}</span>
              </div>
            ))}
          </div>

          <div className="auth-quote">
            <p style={{ fontStyle: "italic", opacity: 0.5 }}>{t("auth.quote")}</p>
          </div>

          <div className="auth-marketing-badges">
            <span className="auth-marketing-badge">{t("auth.badges.noCard")}</span>
            <span className="auth-marketing-badge">{t("auth.badges.readyInFive")}</span>
            <span className="auth-marketing-badge">{t("auth.badges.madeInSpain")}</span>
          </div>

          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "8px", opacity: 0.7 }}>
            <p style={{ color: "white", fontSize: "0.85rem" }}>
              <span style={{ color: "#818CF8", fontWeight: 600 }}>Email:</span> soporte@sffalcon.com
            </p>
            <p style={{ color: "white", fontSize: "0.85rem" }}>
              <span style={{ color: "#818CF8", fontWeight: 600 }}>
                {language === "en" ? "Phone:" : "Telf:"}
              </span>{" "}
              +34 604 989 742
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <Link href="https://www.sffalcon.com" className="auth-home-link" title={language === "en" ? "Go to main website" : "Ir a la web principal"}>
          <Home size={18} />
        </Link>
        <div className="auth-card" style={{ maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "40px 40px 20px 40px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ color: "#818CF8", fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: "8px" }}>
                  {t("privacy.meta")}
                </span>
                <h1 className="auth-card-title" style={{ textAlign: "left", margin: 0 }}>{t("privacy.title")}</h1>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: "8px", whiteSpace: "pre-line" }}>
                  {t("privacy.lastUpdated")}
                </p>
              </div>
              <Link href="/" style={{ color: "#818CF8", fontSize: "0.75rem", textDecoration: "none", fontWeight: 700 }}>
                {t("privacy.back")}
              </Link>
            </div>
          </div>

          <div className="legal-content custom-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "20px 40px 40px 40px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

              {/* 1. RESPONSABLE */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s1.title")}
                </h2>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  <p>{t("privacy.sections.s1.p1")}</p>
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "8px", marginBottom: "8px" }}>
                    <li><strong>{t("privacy.sections.s1.owner")}:</strong> Marco Antonio Falcón Hernández</li>
                    <li><strong>{t("privacy.sections.s1.brand")}:</strong> SFFALCON</li>
                    <li><strong>{t("privacy.sections.s1.app")}:</strong> SF Gestor Empresarial (app.sffalcon.com)</li>
                    <li><strong>{t("privacy.sections.s1.web")}:</strong> <a href="https://www.sffalcon.com" target="_blank" rel="noopener noreferrer" style={{ color: "#818CF8" }}>www.sffalcon.com</a></li>
                    <li><strong>{t("privacy.sections.s1.email")}:</strong> <a href="mailto:admin@sffalcon.com" style={{ color: "#818CF8" }}>admin@sffalcon.com</a></li>
                    <li><strong>{t("privacy.sections.s1.phone")}:</strong> <a href="tel:+34604989742" style={{ color: "#818CF8" }}>+34 604 989 742</a></li>
                    <li><strong>{t("privacy.sections.s1.country")}:</strong> {language === "en" ? "Spain (European Union)" : "España (Unión Europea)"}</li>
                  </ul>
                  <p>
                    {t("privacy.sections.s1.p2")}
                  </p>
                </div>
              </section>

              {/* 2. SERVICIO */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s2.title")}
                </h2>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  <p>
                    {t("privacy.sections.s2.p1")}
                  </p>
                </div>
              </section>

              {/* 3. DATOS QUE RECOPILAMOS */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s3.title")}
                </h2>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  <p><strong>{t("privacy.sections.s3.p1")}</strong></p>
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "4px", marginBottom: "12px" }}>
                    {privacyDict.sections.s3.itemsA.map((item: string) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p><strong>{t("privacy.sections.s3.p2")}</strong></p>
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "4px", marginBottom: "12px" }}>
                    {privacyDict.sections.s3.itemsB.map((item: string) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p>
                    {t("privacy.sections.s3.p3")}
                  </p>
                </div>
              </section>

              {/* 4. FINALIDAD */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s4.title")}
                </h2>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  <p>{t("privacy.sections.s4.p1")}</p>
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "8px", marginBottom: "8px" }}>
                    {privacyDict.sections.s4.items.map((item: string) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p>{t("privacy.sections.s4.p2")}</p>
                </div>
              </section>

              {/* 5. BASE LEGAL */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s5.title")}
                </h2>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "4px", marginBottom: "8px" }}>
                    {privacyDict.sections.s5.items.map((item: string) => (
                      <li key={item}>{renderBoldListItem(item)}</li>
                    ))}
                  </ul>
                  <p>{t("privacy.sections.s5.p2")}</p>
                </div>
              </section>

              {/* 6. USO DE WHATSAPP API */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s6.title")}
                </h2>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  <p>
                    {t("privacy.sections.s6.p1")}
                  </p>
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "8px", marginBottom: "8px" }}>
                    {privacyDict.sections.s6.items.map((item: string) => (
                      <li key={item}>{renderPrivacyLinks(item)}</li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* 7. TRANSFERENCIAS INTERNACIONALES */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s7.title")}
                </h2>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  <p>{t("privacy.sections.s7.p1")}</p>
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "8px", marginBottom: "8px" }}>
                    {privacyDict.sections.s7.items.map((item: string) => (
                      <li key={item}>{renderProviderItem(item)}</li>
                    ))}
                  </ul>
                  <p>{t("privacy.sections.s7.p2")}</p>
                </div>
              </section>

              {/* 8. CONSERVACIÓN */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s8.title")}
                </h2>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "4px", marginBottom: "8px" }}>
                    {privacyDict.sections.s8.items.map((item: string) => (
                      <li key={item}>{renderBoldListItem(item)}</li>
                    ))}
                  </ul>
                  <p>{t("privacy.sections.s8.p2")}</p>
                </div>
              </section>

              {/* 9. NO VENTA DE DATOS */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s9.title")}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("privacy.sections.s9.p1")}
                </p>
              </section>

              {/* 10. DERECHOS */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s10.title")}
                </h2>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  <p>{t("privacy.sections.s10.p1")}</p>
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "8px", marginBottom: "8px" }}>
                    {privacyDict.sections.s10.items.map((item: string) => (
                      <li key={item}>{renderBoldListItem(item)}</li>
                    ))}
                  </ul>
                  <p>
                    {renderPrivacyLinks(t("privacy.sections.s10.p2"))}
                  </p>
                </div>
              </section>

              {/* 11. SEGURIDAD */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s11.title")}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("privacy.sections.s11.p1")}
                </p>
              </section>

              {/* 12. COOKIES */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s12.title")}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("privacy.sections.s12.p1")}
                </p>
              </section>

              {/* 13. MENORES */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s13.title")}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("privacy.sections.s13.p1")}
                </p>
              </section>

              {/* 14. CAMBIOS */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s14.title")}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {t("privacy.sections.s14.p1")}
                </p>
              </section>

              {/* 15. CONTACTO */}
              <section>
                <h2 style={{ color: "#818CF8", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                  {t("privacy.sections.s15.title")}
                </h2>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  <p>{t("privacy.sections.s15.p1")}</p>
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "8px", marginBottom: "8px" }}>
                    {privacyDict.sections.s15.items.map((item: string) => (
                      <li key={item}>{renderContactItem(item)}</li>
                    ))}
                  </ul>
                  <p>{t("privacy.sections.s15.p2")}</p>
                </div>
              </section>

              <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", lineHeight: "1.6" }}>
                  © 2026 SFFALCON · Marco Antonio Falcón Hernández · admin@sffalcon.com<br />
                  www.sffalcon.com · app.sffalcon.com · España (UE)
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
