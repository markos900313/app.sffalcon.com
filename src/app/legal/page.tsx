"use client";

import React from "react";
import Link from "next/link";
import "../(auth)/auth-pages.css";

export default function LegalPage() {
  return (
    <div className="auth-root wide-left">
      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <Link href="/" className="auth-brand" style={{ gap: '6px' }}>
          <img src="/icon.svg" alt="SFFALCON" style={{ width: 28, height: 28, borderRadius: 6 }} />
          <span className="auth-brand-name italic" style={{ letterSpacing: '0.05em' }}>SF</span>
          <span className="auth-brand-name" style={{ textTransform: 'none', fontWeight: 500, color: '#A3B3D9', letterSpacing: '0' }}>Gestor Empresarial</span>
        </Link>

        <div className="auth-left-content">
          <h2 className="auth-headline">
            El asistente <span className="auth-headline-accent">de reservas</span> que<br />
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
            <p style={{ fontStyle: 'italic', opacity: 0.5 }}>&ldquo;Por fin puedo desconectar sin miedo a perder un cliente.&rdquo;</p>
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
        <div className="auth-card" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '40px 40px 20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ color: '#818CF8', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '8px' }}>
                  AVISO LEGAL · SFFALCON
                </span>
                <h1 className="auth-card-title" style={{ textAlign: 'left', margin: 0 }}>Términos y Condiciones</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '8px' }}>
                  Última actualización: mayo 2026<br />España · Unión Europea
                </p>
              </div>
              <Link href="/" style={{ color: '#818CF8', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 700 }}>
                ← INICIO
              </Link>
            </div>
          </div>

          <div className="legal-content custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px 40px 40px 40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* 1. TITULAR */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>1. Titular del servicio</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <p>El titular y responsable de la plataforma SF Gestor Empresarial es:</p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px', marginBottom: '8px' }}>
                    <li><strong>Titular:</strong> Marco Antonio Falcón Hernández</li>
                    <li><strong>Marca comercial:</strong> SFFALCON</li>
                    <li><strong>Aplicación:</strong> SF Gestor Empresarial (app.sffalcon.com)</li>
                    <li><strong>Web corporativa:</strong> www.sffalcon.com</li>
                    <li><strong>Correo electrónico:</strong> admin@sffalcon.com</li>
                    <li><strong>Teléfono:</strong> +34 604 989 742</li>
                    <li><strong>País:</strong> España (Unión Europea)</li>
                  </ul>
                  <p>
                    El acceso y uso de la plataforma implica la aceptación plena de estos Términos y Condiciones,
                    así como de nuestra <Link href="/privacidad" style={{ color: '#818CF8' }}>Política de Privacidad</Link>.
                  </p>
                </div>
              </section>

              {/* 2. OBJETO */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>2. Objeto del servicio</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <p>
                    <strong>SF Gestor Empresarial</strong> es un asistente virtual de reservas y citas que permite a negocios y profesionales
                    gestionar citas y comunicaciones con sus clientes a través de múltiples canales, incluida la
                    API de WhatsApp Business de Meta Platforms, Inc. La plataforma actúa como intermediario autorizado
                    entre el negocio (cliente de SFFALCON) y sus usuarios finales, ofreciendo:
                  </p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px', marginBottom: '8px' }}>
                    <li>Asistente de IA que atiende y gestiona reservas 24/7</li>
                    <li>Gestión de clientes y citas ilimitados</li>
                    <li>Integración con WhatsApp Business API</li>
                    <li>Recordatorios automáticos de citas</li>
                    <li>Panel de control con estadísticas y analytics</li>
                    <li>Facturación y finanzas integradas</li>
                    <li>Sincronización con Google Calendar</li>
                    <li>Gestión de usuarios del equipo</li>
                  </ul>
                </div>
              </section>

              {/* 3. CONDICIONES DE CONTRATACIÓN */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>3. Condiciones de contratación</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  La contratación se formaliza mediante el registro en la plataforma y la aceptación de estos términos.
                  SF Gestor Empresarial ofrece un periodo de prueba gratuito de 90 días desde la fecha de activación,
                  sin necesidad de tarjeta de crédito. SFFALCON se reserva el derecho de modificar las condiciones
                  con previo aviso de 30 días al cliente mediante correo electrónico y aviso en la plataforma.
                </p>
              </section>

              {/* 4. PLANES Y PRECIOS */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>4. Planes y precios</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p>SFFALCON ofrece el siguiente plan:</p>
                  <div>
                    <strong style={{ color: '#fff' }}>SF Gestor Empresarial</strong> — 29 €/mes. Incluye 90 días de prueba gratuita
                    sin necesidad de tarjeta de crédito. Cancela cuando quieras sin permanencia. El servicio incluye:
                    IA que responde por ti 24/7, clientes y citas ilimitados, finanzas completas, facturas profesionales
                    en PDF, estadísticas y analytics, WhatsApp integrado, recordatorios automáticos, agentes IA,
                    Google Calendar sync y gestión de usuarios del equipo.
                  </div>
                  <p>
                    Todos los precios se expresan en euros e incluyen los impuestos aplicables según la normativa fiscal
                    española vigente. El pago se realiza de forma recurrente mensual mediante tarjeta de crédito a través
                    de la pasarela de pago segura Stripe. El cliente podrá cancelar su suscripción en cualquier momento
                    desde el panel de control, sin penalización, con efecto al final del periodo facturado en curso.
                  </p>
                </div>
              </section>

              {/* 5. PROPIEDAD INTELECTUAL */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>5. Propiedad intelectual</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  La plataforma SF Gestor Empresarial, su código, diseño, estructura y contenidos son propiedad
                  exclusiva de SFFALCON y están protegidos por la legislación española e internacional de propiedad
                  intelectual. El cliente no adquiere ningún derecho sobre el software de la plataforma, limitándose
                  su derecho al uso del servicio durante la vigencia de su suscripción. Los datos introducidos por
                  el cliente en la plataforma son de su exclusiva propiedad. SFFALCON no cederá ni venderá dichos
                  datos a terceros.
                </p>
              </section>

              {/* 6. USO ACEPTABLE */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>6. Uso aceptable y prohibiciones</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <p>Queda estrictamente prohibido:</p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px', marginBottom: '8px' }}>
                    <li>Utilizar la plataforma para enviar spam o comunicaciones no solicitadas</li>
                    <li>Infringir las Políticas de WhatsApp Business de Meta Platforms, Inc.</li>
                    <li>Acceder o intentar acceder a cuentas o datos de otros clientes</li>
                    <li>Realizar ingeniería inversa del software de la plataforma</li>
                    <li>Utilizar la plataforma para actividades ilegales o contrarias a la buena fe</li>
                    <li>Compartir credenciales de acceso con personas no autorizadas</li>
                  </ul>
                  <p>
                    El incumplimiento de estas condiciones podrá dar lugar a la suspensión inmediata del servicio
                    sin derecho a reembolso.
                  </p>
                </div>
              </section>

              {/* 7. PROTECCIÓN DE DATOS */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>7. Protección de datos</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  El tratamiento de los datos personales de los clientes se realiza conforme al Reglamento General
                  de Protección de Datos (RGPD) y la Ley Orgánica de Protección de Datos y Garantía de Derechos
                  Digitales (LOPDGDD), así como de las políticas de uso de la API de WhatsApp Business de Meta
                  Platforms, Inc. El responsable del tratamiento es Marco Antonio Falcón Hernández (SFFALCON).
                  Puede consultar el detalle completo en nuestra{' '}
                  <Link href="/privacidad" style={{ color: '#818CF8' }}>Política de Privacidad</Link>.
                  Para ejercer sus derechos, contacte en{' '}
                  <a href="mailto:admin@sffalcon.com" style={{ color: '#818CF8' }}>admin@sffalcon.com</a>{' '}
                  o en el teléfono <a href="tel:+34604989742" style={{ color: '#818CF8' }}>+34 604 989 742</a>.
                </p>
              </section>

              {/* 8. LIMITACIÓN DE RESPONSABILIDAD */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>8. Limitación de responsabilidad</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  SFFALCON no se hace responsable de daños indirectos, pérdida de beneficios o perjuicios derivados
                  del uso de la plataforma. SFFALCON garantiza una disponibilidad del servicio del 99% mensual.
                  En caso de interrupciones programadas, se notificará al cliente con antelación suficiente.
                  No se garantizan resultados concretos de negocio derivados del uso de la plataforma, aunque sí
                  se garantiza la calidad técnica del servicio prestado según las condiciones del plan contratado.
                </p>
              </section>

              {/* 9. LEGISLACIÓN */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>9. Legislación aplicable y resolución de conflictos</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  Los presentes Términos y Condiciones se rigen íntegramente por la legislación española. En caso
                  de cualquier controversia, ambas partes se someten a los juzgados y tribunales competentes de
                  Murcia, España, con renuncia expresa a cualquier otro fuero. Para cualquier reclamación, el
                  cliente puede contactar previamente con SFFALCON a través de{' '}
                  <a href="mailto:admin@sffalcon.com" style={{ color: '#818CF8' }}>admin@sffalcon.com</a>{' '}
                  o llamando al <a href="tel:+34604989742" style={{ color: '#818CF8' }}>+34 604 989 742</a>,
                  con el objetivo de resolver el conflicto de forma amistosa antes de acudir a la vía judicial.
                </p>
              </section>

              {/* 10. CONTACTO */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>10. Contacto</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <p>Para cualquier consulta, solicitud o reclamación relacionada con estos Términos:</p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px', marginBottom: '8px' }}>
                    <li>Email: <a href="mailto:admin@sffalcon.com" style={{ color: '#818CF8' }}>admin@sffalcon.com</a></li>
                    <li>Teléfono: <a href="tel:+34604989742" style={{ color: '#818CF8' }}>+34 604 989 742</a></li>
                    <li>Web corporativa: <a href="https://www.sffalcon.com" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>www.sffalcon.com</a></li>
                    <li>Aplicación: <a href="https://app.sffalcon.com" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>app.sffalcon.com</a></li>
                  </ul>
                  <p>Nos comprometemos a responder en un plazo máximo de 72 horas laborables.</p>
                </div>
              </section>

              <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', lineHeight: '1.6' }}>
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
