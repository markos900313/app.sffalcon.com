"use client";

import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import "../(auth)/auth-pages.css";

export default function PrivacidadPage() {
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
            El asistente <span className="auth-headline-accent">de reservas y citas que </span><br />
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
        <div className="auth-card" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '40px 40px 20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ color: '#818CF8', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '8px' }}>
                  POLÍTICA DE PRIVACIDAD · SFFALCON
                </span>
                <h1 className="auth-card-title" style={{ textAlign: 'left', margin: 0 }}>Política de Privacidad</h1>
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

              {/* 1. RESPONSABLE */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>1. Responsable del tratamiento</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <p>El responsable del tratamiento de sus datos personales es:</p>
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
                    SFFALCON se compromete a tratar sus datos personales con total transparencia, en cumplimiento del
                    Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), así como de las políticas
                    de uso de la API de WhatsApp Business de Meta Platforms, Inc.
                  </p>
                </div>
              </section>

              {/* 2. SERVICIO */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>2. Descripción del servicio</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <p>
                    <strong>SF Gestor Empresarial</strong> es un asistente virtual de reservas y citas que permite a negocios y profesionales
                    gestionar citas y comunicaciones con sus clientes a través de múltiples canales, incluida la
                    API de WhatsApp Business. La aplicación actúa como intermediario autorizado entre el negocio
                    (cliente de SFFALCON) y sus usuarios finales.
                  </p>
                </div>
              </section>

              {/* 3. DATOS QUE RECOPILAMOS */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>3. Datos que recopilamos</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <p><strong>a) Datos de clientes (operadores de la plataforma):</strong></p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '4px', marginBottom: '12px' }}>
                    <li>Nombre y apellidos</li>
                    <li>Dirección de correo electrónico</li>
                    <li>Número de teléfono</li>
                    <li>Información sobre su negocio (nombre, sector, país)</li>
                    <li>Datos de facturación y suscripción</li>
                    <li>Datos de navegación básicos mediante cookies técnicas necesarias</li>
                  </ul>
                  <p><strong>b) Datos de usuarios finales (clientes del negocio, gestionados a través de WhatsApp Business API):</strong></p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '4px', marginBottom: '12px' }}>
                    <li>Número de teléfono de WhatsApp</li>
                    <li>Nombre de perfil de WhatsApp</li>
                    <li>Contenido de los mensajes intercambiados con el asistente</li>
                    <li>Fecha, hora y estado de la reserva o cita</li>
                  </ul>
                  <p>
                    No recopilamos datos sensibles (salud, ideología, religión, etc.) ni datos de menores de 14 años.
                    Si detectamos que un usuario es menor de esa edad, eliminaremos sus datos de inmediato.
                    No realizamos perfilado automatizado ni decisiones automatizadas con efectos legales sobre los usuarios.
                  </p>
                </div>
              </section>

              {/* 4. FINALIDAD */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>4. Finalidad del tratamiento</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <p>Sus datos se utilizan exclusivamente para:</p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px', marginBottom: '8px' }}>
                    <li>Gestionar el registro y acceso a la plataforma SF Gestor Empresarial</li>
                    <li>Prestar los servicios contratados según el plan elegido</li>
                    <li>Operar el asistente virtual de reservas vía WhatsApp Business API</li>
                    <li>Enviar notificaciones y recordatorios de citas a usuarios finales</li>
                    <li>Gestionar la facturación y cobros recurrentes mediante Stripe</li>
                    <li>Enviar comunicaciones relacionadas con el servicio (actualizaciones, incidencias)</li>
                    <li>Cumplir con obligaciones legales y fiscales aplicables en España</li>
                  </ul>
                  <p>No utilizamos sus datos para publicidad de terceros ni para ninguna finalidad distinta a las indicadas sin su consentimiento previo.</p>
                </div>
              </section>

              {/* 5. BASE LEGAL */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>5. Base legal del tratamiento</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '4px', marginBottom: '8px' }}>
                    <li><strong>Ejecución de contrato:</strong> para prestar el servicio SaaS contratado</li>
                    <li><strong>Consentimiento:</strong> cuando el usuario se registra voluntariamente en la plataforma</li>
                    <li><strong>Interés legítimo:</strong> para el funcionamiento del asistente de reservas y citas  en nombre del negocio</li>
                    <li><strong>Obligación legal:</strong> para cumplir con obligaciones fiscales o legales en España</li>
                  </ul>
                  <p>Puede retirar su consentimiento en cualquier momento sin que ello afecte a la licitud del tratamiento previo.</p>
                </div>
              </section>

              {/* 6. USO DE WHATSAPP BUSINESS API (META) */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>6. Uso de la API de WhatsApp Business (Meta)</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <p>
                    SF Gestor Empresarial utiliza la <strong>API de WhatsApp Business de Meta Platforms, Inc.</strong> para
                    enviar y recibir mensajes en nombre de los negocios que usan nuestra plataforma. En relación con
                    este canal:
                  </p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px', marginBottom: '8px' }}>
                    <li>Los mensajes de WhatsApp son gestionados conforme a las <a href="https://www.whatsapp.com/legal/business-policy/" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>Políticas de WhatsApp Business</a> y los <a href="https://developers.facebook.com/terms/" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>Términos de la plataforma de Meta</a>.</li>
                    <li>Los datos de mensajería <strong>no se comparten con terceros no autorizados</strong> ni se utilizan para segmentación publicitaria.</li>
                    <li>Los usuarios finales pueden solicitar en cualquier momento que el negocio deje de contactarles vía WhatsApp respondiendo <strong>STOP</strong> o contactando directamente al negocio.</li>
                    <li>SFFALCON actúa como <strong>proveedor de soluciones tecnológicas (BSP)</strong> y no es el originador de los mensajes comerciales: el responsable final ante el usuario es el negocio que contrata el servicio.</li>
                    <li>Meta puede procesar datos de mensajería conforme a su propia <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>Política de Privacidad</a>.</li>
                  </ul>
                </div>
              </section>

              {/* 7. TRANSFERENCIAS INTERNACIONALES */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>7. Transferencias internacionales de datos</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <p>Algunos de nuestros proveedores de servicio pueden procesar datos fuera de la UE:</p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px', marginBottom: '8px' }}>
                    <li><strong>Meta Platforms, Inc.</strong> (EE. UU.) — API de WhatsApp Business, sujeta al Data Privacy Framework UE-EE. UU.</li>
                    <li><strong>Groq, Inc.</strong> (EE. UU.) — procesamiento de IA (modelos LLaMA). Datos tratados conforme a las políticas de Groq Cloud.</li>
                    <li><strong>Stripe, Inc.</strong> (EE. UU.) — pagos, bajo cláusulas contractuales tipo aprobadas por la Comisión Europea.</li>
                    <li><strong>Supabase, Inc.</strong> — almacenamiento de datos, con opción de servidores en la Unión Europea.</li>
                    <li><strong>Resend, Inc.</strong> (EE. UU.) — envío de correos transaccionales.</li>
                  </ul>
                  <p>En todos los casos exigimos que los proveedores mantengan niveles de protección equivalentes a los exigidos por el RGPD.</p>
                </div>
              </section>

              {/* 8. CONSERVACIÓN */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>8. Conservación de datos</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '4px', marginBottom: '8px' }}>
                    <li><strong>Datos de cuenta:</strong> durante la vigencia de la suscripción y hasta que solicite su supresión</li>
                    <li><strong>Mensajes de WhatsApp:</strong> máximo 12 meses desde la última interacción, salvo obligación legal</li>
                    <li><strong>Datos de facturación:</strong> durante los plazos exigidos por la normativa fiscal española (generalmente 5 años)</li>
                  </ul>
                  <p>Transcurridos dichos plazos, los datos serán eliminados o anonimizados de forma segura.</p>
                </div>
              </section>

              {/* 9. NO VENTA DE DATOS */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>9. No venta ni uso comercial de datos</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  SFFALCON <strong>no vende, alquila ni cede</strong> datos personales de sus usuarios a terceros con fines
                  comerciales o publicitarios. Los datos obtenidos a través de la API de WhatsApp Business se utilizan
                  exclusivamente para prestar el servicio de gestión de reservas y no se emplean para crear perfiles
                  de usuario ni para publicidad dirigida.
                </p>
              </section>

              {/* 10. DERECHOS */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>10. Derechos del usuario</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <p>Conforme al RGPD, usted tiene derecho a:</p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px', marginBottom: '8px' }}>
                    <li><strong>Acceso:</strong> conocer qué datos tratamos sobre usted</li>
                    <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos</li>
                    <li><strong>Supresión ("derecho al olvido"):</strong> solicitar la eliminación de sus datos</li>
                    <li><strong>Oposición:</strong> oponerse al tratamiento en determinadas circunstancias</li>
                    <li><strong>Portabilidad:</strong> recibir sus datos en formato estructurado y de uso común</li>
                    <li><strong>Limitación:</strong> solicitar que suspendamos el tratamiento en ciertos supuestos</li>
                  </ul>
                  <p>
                    Para ejercer cualquiera de estos derechos, envíe un correo a{' '}
                    <a href="mailto:admin@sffalcon.com" style={{ color: '#818CF8' }}>admin@sffalcon.com</a>{' '}
                    o llame al <a href="tel:+34604989742" style={{ color: '#818CF8' }}>+34 604 989 742</a>.
                    Responderemos en el plazo máximo de un mes. Si considera que sus derechos no han sido atendidos,
                    puede presentar una reclamación ante la{' '}
                    <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>
                      Agencia Española de Protección de Datos (aepd.es)
                    </a>.
                  </p>
                </div>
              </section>

              {/* 11. SEGURIDAD */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>11. Seguridad de los datos</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  SFFALCON implementa medidas técnicas y organizativas apropiadas para proteger sus datos personales
                  contra acceso no autorizado, pérdida o destrucción, incluyendo: cifrado de datos en tránsito (TLS)
                  y en reposo, autenticación segura, control de acceso por roles, y revisiones periódicas de seguridad.
                </p>
              </section>

              {/* 12. COOKIES */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>12. Cookies</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  SF Gestor Empresarial utiliza únicamente cookies técnicas estrictamente necesarias para el
                  funcionamiento de la plataforma (sesión de usuario, preferencias de idioma y tema). No utilizamos
                  cookies de publicidad ni de seguimiento de terceros.
                </p>
              </section>

              {/* 13. MENORES */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>13. Menores de edad</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  Nuestros servicios están dirigidos exclusivamente a personas mayores de 14 años (o la edad mínima
                  legal aplicable en su país de residencia). No recopilamos conscientemente datos personales de
                  menores. Si tiene conocimiento de que un menor nos ha proporcionado datos sin consentimiento
                  paterno, contáctenos en admin@sffalcon.com para proceder a su eliminación inmediata.
                </p>
              </section>

              {/* 14. CAMBIOS */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>14. Cambios en esta política</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  SFFALCON se reserva el derecho a actualizar esta Política de Privacidad para adaptarla a cambios
                  legislativos o de servicio. Cualquier modificación relevante será comunicada con al menos 30 días
                  de antelación por correo electrónico y mediante aviso en la plataforma. La fecha de &ldquo;Última
                  actualización&rdquo; al inicio del documento refleja siempre la versión vigente.
                </p>
              </section>

              {/* 15. CONTACTO */}
              <section>
                <h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>15. Contacto</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <p>Para cualquier consulta, solicitud o reclamación relacionada con el tratamiento de sus datos:</p>
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
