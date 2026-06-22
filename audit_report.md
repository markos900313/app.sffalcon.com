# Reporte de Auditoría de Idiomas (i18n)

Este reporte resume el estado de la internacionalización (español/inglés) en el proyecto **SFFALCON**.
Se analizaron todos los componentes y páginas en busca de textos en español hardcodeados y del uso del proveedor de idioma (`useLanguage`).

## Resumen General

| Métrica | Cantidad |
| --- | --- |
| **Total de archivos analizados (TS/TSX)** | 198 |
| **Archivos sin useLanguage con textos hardcodeados** | 123 |
| **Archivos con useLanguage pero con textos hardcodeados** | 31 |
| **Archivos completamente traducidos (useLanguage y 0 hardcodeados)** | 5 |
| **Archivos sin textos y sin useLanguage (Utility/Visuales)** | 39 |

## ⚠️ Detalle de Archivos Críticos (Sin useLanguage)
Estos archivos contienen textos visibles en pantalla en español pero no importan ni consumen el contexto de idioma, por lo que **siempre se mostrarán en español**, incluso si el usuario cambia el idioma a inglés.

### 📄 [`src\app\(auth)\login\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(auth)/login/page.tsx)
- **Cantidad de textos hardcodeados:** 21
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 24 | Toast/Alert (toast.error) | `Por favor, rellena todos los campos` | `toast.error("Por favor, rellena todos los campos");` |
| 31 | Toast/Alert (toast.error) | `Contraseña incorrecta. Inténtalo de nuevo.` | `toast.error("Contraseña incorrecta. Inténtalo de nuevo.");` |
| 33 | Toast/Alert (toast.error) | `No existe ninguna cuenta con ese email.` | `toast.error("No existe ninguna cuenta con ese email.");` |
| 35 | Toast/Alert (toast.error) | `Confirma tu email antes de entrar. Revisa tu bandeja de entrada.` | `toast.error("Confirma tu email antes de entrar. Revisa tu bandeja de entrada.");` |
| 37 | Toast/Alert (toast.error) | `Error al iniciar sesión. Inténtalo de nuevo.` | `toast.error("Error al iniciar sesión. Inténtalo de nuevo.");` |
| 71 | JSX Text | `de reservas y citas que` | `El asistente <span className="auth-headline-accent">de reservas y citas que</span><br />` |
| 78 | String Literal | `Mientras tú trabajas, él atiende a tus clientes` | `"Mientras tú trabajas, él atiende a tus clientes",` |
| 79 | String Literal | `Tu cliente escribe — a cualquier hora` | `"Tu cliente escribe — a cualquier hora",` |
| 80 | String Literal | `Tu asistente responde — con tu tono` | `"Tu asistente responde — con tu tono",` |
| 81 | String Literal | `Tú lo encuentras todo listo` | `"Tú lo encuentras todo listo",` |
| 91 | JSX Text | `&quot;Por fin puedo desconectar sin miedo a perder un cliente.&quot;` | `<p>&quot;Por fin puedo desconectar sin miedo a perder un cliente.&quot;</p>` |
| 95 | JSX Text | `Sin tarjeta` | `<span className="auth-marketing-badge">Sin tarjeta</span>` |
| 96 | JSX Text | `Listo en 5 min` | `<span className="auth-marketing-badge">Listo en 5 min</span>` |
| 97 | JSX Text | `Hecho en España` | `<span className="auth-marketing-badge">Hecho en España</span>` |
| 114 | Prop (title) | `Ir a la web principal` | `<Link href="https://www.sffalcon.com" className="auth-home-link" title="Ir a la web principal">` |
| 121 | JSX Text | `Bienvenido de nuevo` | `<h1 className="auth-card-title">Bienvenido de nuevo</h1>` |
| 122 | JSX Text | `Introduce tus credenciales para acceder a la consola.` | `<p className="auth-card-subtitle">Introduce tus credenciales para acceder a la consola.</p>` |
| 126 | JSX Text | `Correo Electrónico` | `<label className="auth-label">Correo Electrónico</label>` |
| 141 | JSX Text | `Contraseña` | `<label className="auth-label">Contraseña</label>` |
| 163 | String Literal | `ACCEDER AL PANEL` | `"ACCEDER AL PANEL"` |
| 174 | JSX Text | `Comienza gratis ahora` | `<Link href="/register">Comienza gratis ahora</Link>` |

---

### 📄 [`src\app\(auth)\register\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(auth)/register/page.tsx)
- **Cantidad de textos hardcodeados:** 52
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 66 | Toast/Alert (toast.error) | `Por favor, rellena todos los campos` | `toast.error("Por favor, rellena todos los campos");` |
| 70 | Toast/Alert (toast.error) | `Las contraseñas no coinciden` | `toast.error("Las contraseñas no coinciden");` |
| 81 | String Literal | `Error checking name:` | `console.error('Error checking name:', nameError);` |
| 85 | String Literal | `Este nombre de usuario ya existe` | `setNameExistsError("Este nombre de usuario ya existe");` |
| 96 | String Literal | `Error checking email:` | `console.error('Error checking email:', emailError);` |
| 100 | String Literal | `Cuenta existente con este correo` | `setEmailExistsError("Cuenta existente con este correo");` |
| 111 | String Literal | `Error checking business name:` | `console.error('Error checking business name:', businessError);` |
| 115 | String Literal | `Ya hay un negocio registrado con este nombre` | `setBusinessExistsError("Ya hay un negocio registrado con este nombre");` |
| 126 | String Literal | `No se pudo crear el usuario` | `if (!authData.user) throw new Error("No se pudo crear el usuario");` |
| 135 | String Literal | `Ocio y Entretenimiento` | `sector: 'Ocio y Entretenimiento',` |
| 146 | String Literal | `Error al configurar los datos del negocio` | `throw new Error(errorData.error \|\| "Error al configurar los datos del negocio");` |
| 150 | Toast/Alert (toast.success) | `¡Cuenta creada correctamente!` | `toast.success("¡Cuenta creada correctamente!");` |
| 153 | Toast/Alert (toast.success) | `¡Casi listo! Revisa tu email para activar tu cuenta.` | `toast.success("¡Casi listo! Revisa tu email para activar tu cuenta.");` |
| 159 | String Literal | `Error en registro:` | `console.error("Error en registro:", error);` |
| 160 | String Literal | `Ha ocurrido un error en el registro` | `const message = error instanceof Error ? error.message : "Ha ocurrido un error en el registro";` |
| 177 | JSX Text | `de reservas y citas que` | `El asistente <span className="reg-headline-accent">de reservas y citas que</span><br />` |
| 184 | String Literal | `Mientras tú trabajas, él atiende a tus clientes` | `"Mientras tú trabajas, él atiende a tus clientes",` |
| 185 | String Literal | `Tu cliente escribe — a cualquier hora` | `"Tu cliente escribe — a cualquier hora",` |
| 186 | String Literal | `Tu asistente responde — con tu tono` | `"Tu asistente responde — con tu tono",` |
| 187 | String Literal | `Tú lo encuentras todo listo` | `"Tú lo encuentras todo listo",` |
| 197 | JSX Text | `&quot;Por fin puedo desconectar sin miedo a perder un cliente.&quot;` | `<p>&quot;Por fin puedo desconectar sin miedo a perder un cliente.&quot;</p>` |
| 201 | JSX Text | `Sin tarjeta` | `<span className="reg-marketing-badge">Sin tarjeta</span>` |
| 202 | JSX Text | `Listo en 5 min` | `<span className="reg-marketing-badge">Listo en 5 min</span>` |
| 203 | JSX Text | `Hecho en España` | `<span className="reg-marketing-badge">Hecho en España</span>` |
| 218 | Prop (title) | `Ir a la web principal` | `<Link href="https://www.sffalcon.com" className="auth-home-link" title="Ir a la web principal">` |
| 227 | JSX Text | `¡Revisa tu correo!` | `<h2>¡Revisa tu correo!</h2>` |
| 241 | JSX Text | `Crea tu cuenta` | `<h1 className="reg-title">Crea tu cuenta</h1>` |
| 242 | JSX Text | `Empieza hoy mismo tu SF inteligente` | `<p className="reg-subtitle" style={{ marginBottom: '40px' }}>Empieza hoy mismo tu SF inteligente</p>` |
| 255 | String Literal | `90 días GRATIS · Sin tarjeta · Cancela cuando quieras` | `subtitle="90 días GRATIS · Sin tarjeta · Cancela cuando quieras"` |
| 258 | String Literal | `Clientes y agenda ilimitados` | `{ text: "Clientes y agenda ilimitados", included: true },` |
| 261 | String Literal | `Finanzas y facturas` | `{ text: "Finanzas y facturas", included: true },` |
| 262 | String Literal | `Productos e inventario` | `{ text: "Productos e inventario", included: true },` |
| 263 | String Literal | `Estadísticas y métricas` | `{ text: "Estadísticas y métricas", included: true },` |
| 264 | String Literal | `Equipo y fichajes` | `{ text: "Equipo y fichajes", included: true },` |
| 265 | String Literal | `Gestor IA en el panel` | `{ text: "Gestor IA en el panel", included: true },` |
| 267 | String Literal | `EMPEZAR GRATIS 90 DÍAS` | `btnText="EMPEZAR GRATIS 90 DÍAS"` |
| 289 | JSX Text | `Nombre Completo` | `<label className="reg-label">Nombre Completo</label>` |
| 298 | Prop (placeholder) | `Tu nombre y apellidos` | `placeholder="Tu nombre y apellidos"` |
| 301 | String Literal | `reg-error-msg` | `<p className="reg-error-msg">` |
| 319 | String Literal | `reg-error-msg` | `<p className="reg-error-msg">` |
| 328 | JSX Text | `Nombre del Negocio (Marca)` | `<label className="reg-label">Nombre del Negocio (Marca)</label>` |
| 337 | Prop (placeholder) | `Ej: Parque Infantil El Mundo` | `placeholder="Ej: Parque Infantil El Mundo"` |
| 341 | String Literal | `reg-error-msg` | `<p className="reg-error-msg">` |
| 345 | JSX Text | `Este nombre aparecerá en tus facturas y comunicaciones.` | `<p style={{ fontSize: '0.65rem', color: 'rgba(163,179,217,0.4)', marginTop: '4px' }}>Este nombre aparecerá en tus facturas y comunicaciones.</p>` |
| 349 | JSX Text | `Teléfono (WhatsApp)` | `<label className="reg-label">Teléfono (WhatsApp)</label>` |
| 357 | JSX Text | `Opcional. Tu número de WhatsApp para conectar con clientes.` | `<p style={{ fontSize: '0.65rem', color: 'rgba(163,179,217,0.4)', marginTop: '4px' }}>Opcional. Tu número de WhatsApp para conectar con clientes.</p>` |
| 361 | JSX Text | `Contraseña` | `<label className="reg-label">Contraseña</label>` |
| 362 | Prop (placeholder) | `Mínimo 6 caracteres` | `<input type="password" value={password} onChange={e => setPassword(e.target.value)} className="reg-input" placeholder="Mínimo 6 caracteres" />` |
| 365 | JSX Text | `Confirma tu contraseña` | `<label className="reg-label">Confirma tu contraseña</label>` |
| 366 | Prop (placeholder) | `Repite la contraseña` | `<input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="reg-input" placeholder="Repite la contraseña" />` |
| 379 | JSX Text | `FINALIZAR REGISTRO Y EMPEZAR` | `<span>FINALIZAR REGISTRO Y EMPEZAR</span>` |
| 390 | JSX Text | `Inicia sesión ahora` | `<Link href="/login" style={{ color: '#818CF8', fontWeight: 700 }}>Inicia sesión ahora</Link>` |

---

### 📄 [`src\app\(auth)\reset-password\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(auth)/reset-password/page.tsx)
- **Cantidad de textos hardcodeados:** 17
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 16 | String Literal | `error` | `const errorParam = searchParams.get('error');` |
| 21 | Toast/Alert (toast.error) | `Introduce un correo electrónico válido` | `toast.error("Introduce un correo electrónico válido");` |
| 36 | String Literal | `Error al enviar el enlace` | `toast.error(data.error \|\| "Error al enviar el enlace");` |
| 44 | Toast/Alert (toast.error) | `Error de conexión. Inténtalo de nuevo.` | `toast.error("Error de conexión. Inténtalo de nuevo.");` |
| 73 | JSX Text | `Recibirás un enlace de recuperación en tu correo.` | `<p className="auth-card-subtitle">Recibirás un enlace de recuperación en tu correo.</p>` |
| 84 | JSX Text | `Correo Electrónico` | `<label className="auth-label">Correo Electrónico</label>` |
| 100 | String Literal | `ENVIAR ENLACE` | `"ENVIAR ENLACE"` |
| 125 | JSX Text | `de reservas y citas que` | `El asistente <span className="auth-headline-accent">de reservas y citas que</span><br />` |
| 132 | String Literal | `Mientras tú trabajas, él atiende a tus clientes` | `"Mientras tú trabajas, él atiende a tus clientes",` |
| 133 | String Literal | `Tu cliente escribe — a cualquier hora` | `"Tu cliente escribe — a cualquier hora",` |
| 134 | String Literal | `Tu asistente responde — con tu tono` | `"Tu asistente responde — con tu tono",` |
| 135 | String Literal | `Tú lo encuentras todo listo` | `"Tú lo encuentras todo listo",` |
| 145 | JSX Text | `&quot;Por fin puedo desconectar sin miedo a perder un cliente.&quot;` | `<p>&quot;Por fin puedo desconectar sin miedo a perder un cliente.&quot;</p>` |
| 149 | JSX Text | `Sin tarjeta` | `<span className="auth-marketing-badge">Sin tarjeta</span>` |
| 150 | JSX Text | `Listo en 5 min` | `<span className="auth-marketing-badge">Listo en 5 min</span>` |
| 151 | JSX Text | `Hecho en España` | `<span className="auth-marketing-badge">Hecho en España</span>` |
| 168 | Prop (title) | `Ir a la web principal` | `<Link href="https://www.sffalcon.com" className="auth-home-link" title="Ir a la web principal">` |

---

### 📄 [`src\app\(auth)\update-password\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(auth)/update-password/page.tsx)
- **Cantidad de textos hardcodeados:** 25
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 39 | String Literal | `Error al verificar OTP:` | `console.error("Error al verificar OTP:", verifyError);` |
| 42 | String Literal | `Error crítico verificando OTP:` | `console.error("Error crítico verificando OTP:", err);` |
| 63 | String Literal | `Error crítico estableciendo sesión:` | `console.error("Error crítico estableciendo sesión:", err);` |
| 101 | Toast/Alert (toast.error) | `Por favor, rellena todos los campos` | `toast.error("Por favor, rellena todos los campos");` |
| 105 | Toast/Alert (toast.error) | `Las contraseñas no coinciden` | `toast.error("Las contraseñas no coinciden");` |
| 109 | Toast/Alert (toast.error) | `La contraseña debe tener al menos 6 caracteres` | `toast.error("La contraseña debe tener al menos 6 caracteres");` |
| 118 | Toast/Alert (toast.error) | `Error al actualizar la contraseña: ` | `toast.error("Error al actualizar la contraseña: " + error.message);` |
| 124 | Toast/Alert (toast.success) | `Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.` | `toast.success("Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.");` |
| 127 | Toast/Alert (toast.error) | `Error inesperado: ` | `toast.error("Error inesperado: " + err.message);` |
| 143 | JSX Text | `de reservas y citas que` | `El asistente <span className="auth-headline-accent">de reservas y citas que</span><br />` |
| 150 | String Literal | `Mientras tú trabajas, él atiende a tus clientes` | `"Mientras tú trabajas, él atiende a tus clientes",` |
| 151 | String Literal | `Tu cliente escribe — a cualquier hora` | `"Tu cliente escribe — a cualquier hora",` |
| 152 | String Literal | `Tu asistente responde — con tu tono` | `"Tu asistente responde — con tu tono",` |
| 153 | String Literal | `Tú lo encuentras todo listo` | `"Tú lo encuentras todo listo",` |
| 163 | JSX Text | `"Por fin puedo desconectar sin miedo a perder un cliente."` | `<p>"Por fin puedo desconectar sin miedo a perder un cliente."</p>` |
| 167 | JSX Text | `Sin tarjeta` | `<span className="auth-marketing-badge">Sin tarjeta</span>` |
| 168 | JSX Text | `Listo en 5 min` | `<span className="auth-marketing-badge">Listo en 5 min</span>` |
| 169 | JSX Text | `Hecho en España` | `<span className="auth-marketing-badge">Hecho en España</span>` |
| 185 | Prop (title) | `Ir a la web principal` | `<Link href="https://www.sffalcon.com" className="auth-home-link" title="Ir a la web principal">` |
| 199 | JSX Text | `Sesión Inválida` | `<h1 className="auth-card-title" style={{ textAlign: 'center' }}>Sesión Inválida</h1>` |
| 219 | JSX Text | `Nueva Contraseña` | `<h1 className="auth-card-title">Nueva Contraseña</h1>` |
| 220 | JSX Text | `Establece tu nueva contraseña de acceso.` | `<p className="auth-card-subtitle">Establece tu nueva contraseña de acceso.</p>` |
| 224 | JSX Text | `Nueva Contraseña` | `<label className="auth-label">Nueva Contraseña</label>` |
| 243 | JSX Text | `Confirmar Contraseña` | `<label className="auth-label">Confirmar Contraseña</label>` |
| 261 | String Literal | `GUARDAR Y ENTRAR` | `"GUARDAR Y ENTRAR"` |

---

### 📄 [`src\app\(dashboard)\dashboard\agent-accounting\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/agent-accounting/page.tsx)
- **Cantidad de textos hardcodeados:** 36
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 96 | String Literal | `total` | `.select('total')` |
| 112 | String Literal | `Error fetching accounting data:` | `console.error("Error fetching accounting data:", err);` |
| 127 | Toast/Alert (confirm) | `¿Estás seguro de que deseas eliminar este registro?` | `if (!confirm("¿Estás seguro de que deseas eliminar este registro?")) return;` |
| 140 | Toast/Alert (toast.error) | `Error al eliminar el registro` | `toast.error("Error al eliminar el registro");` |
| 146 | Toast/Alert (toast.error) | `Por favor, selecciona una factura primero` | `toast.error("Por favor, selecciona una factura primero");` |
| 194 | String Literal | `Respuesta vacía del servidor de IA` | `throw new Error(result.error \|\| "Respuesta vacía del servidor de IA");` |
| 197 | Toast/Alert (toast.error) | `Error: ${err instanceof Error ? err.message : 'Error desconocido'}` | `toast.error(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);` |
| 208 | String Literal | `Usuario no autenticado` | `if (!user) throw new Error("Usuario no autenticado");` |
| 229 | Toast/Alert (toast.success) | `Gasto registrado en contabilidad` | `toast.success("Gasto registrado en contabilidad");` |
| 235 | Toast/Alert (toast.error) | `Error al guardar el gasto` | `toast.error("Error al guardar el gasto");` |
| 270 | JSX Text | `Auditoría Contable IA` | `<span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1B4FD8]">Auditoría Contable IA</span>` |
| 294 | JSX Text | `Estado:` | `<span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estado:</span>` |
| 305 | String Literal | `space-y-6 mt-6` | `<div className="space-y-6 mt-6">` |
| 309 | Prop (title) | `GASTOS OPERATIVOS` | `<AIPerfCard title="GASTOS OPERATIVOS" value={stats.totalExpenses} trend="up" icon={<Euro className="text-rose-500" />} />` |
| 315 | String Literal | `lg:col-span-8 space-y-6` | `<div className="lg:col-span-8 space-y-6">` |
| 349 | String Literal | `divide-y divide-slate-50 dark:divide-[#1E3A5F]` | `<tbody className="divide-y divide-slate-50 dark:divide-[#1E3A5F]">` |
| 383 | JSX Text | `Sin registros fiscales en el radar` | `<p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sin registros fiscales en el radar</p>` |
| 394 | String Literal | `lg:col-span-4 space-y-6` | `<div className="lg:col-span-4 space-y-6">` |
| 400 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 439 | JSX Text | `+4.2% proyectado para este mes` | `<span>+4.2% proyectado para este mes</span>` |
| 471 | JSX Text | `Visión Artificial` | `<h2 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">Visión Artificial</h2>` |
| 472 | JSX Text | `Sincronización via OCR` | `<p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Sincronización via OCR</p>` |
| 479 | String Literal | `p-5 md:p-8 space-y-8 max-h-[70vh] md:max-h-[75vh] overflow-y-auto` | `<div className="p-5 md:p-8 space-y-8 max-h-[70vh] md:max-h-[75vh] overflow-y-auto">` |
| 491 | JSX Text | `PDF, JPG o Captura directa` | `<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PDF, JPG o Captura directa</p>` |
| 508 | JSX Text | `Diagnóstico IA Finalizado` | `<h4 className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Diagnóstico IA Finalizado</h4>` |
| 512 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 516 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 520 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 521 | JSX Text | `Optimización detectada en cadena de suministros.` | `<p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Optimización detectada en cadena de suministros.</p>` |
| 524 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 525 | JSX Text | `Fecha Emitida` | `<p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fecha Emitida</p>` |
| 651 | JSX Text | `Diagnóstico Predictivo` | `<h2 className="text-3xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter mb-4">Diagnóstico Predictivo</h2>` |
| 656 | String Literal | `mt-10 space-y-6` | `<div className="mt-10 space-y-6">` |
| 663 | JSX Text | `Insumos y Logística` | `<h5 className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-1 font-bold">Insumos y Logística</h5>` |
| 675 | JSX Text | `Energía` | `<h5 className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-1 font-bold">Energía</h5>` |
| 677 | JSX Text | `140€/mes` | `Potencial de ahorro: <span className="text-blue-500 font-black">140€/mes</span>.` |

---

### 📄 [`src\app\(dashboard)\dashboard\agent-followup\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/agent-followup/page.tsx)
- **Cantidad de textos hardcodeados:** 23
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 95 | String Literal | `Error fetching followup data:` | `console.error("Error fetching followup data:", err);` |
| 123 | Toast/Alert (toast.error) | `Error al guardar preferencia` | `toast.error("Error al guardar preferencia");` |
| 147 | JSX Text | `Inteligencia de Retención` | `<span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500">Inteligencia de Retención</span>` |
| 148 | JSX Text | `Autónomo` | `<span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Autónomo</span>` |
| 160 | JSX Text | `IA Autónoma Activa` | `<span className="text-[10px] font-black text-slate-600 dark:text-emerald-400 uppercase tracking-widest italic leading-none pt-0.5">IA Autónoma Activa</span>` |
| 175 | JSX Text | `Reseñas` | `<span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Reseñas</span>` |
| 207 | String Literal | `lg:col-span-2 space-y-6` | `<div className="lg:col-span-2 space-y-6">` |
| 216 | String Literal | `space-y-5` | `<div className="space-y-5">` |
| 219 | Prop (title) | `Solicitud de Reseñas` | `title="Solicitud de Reseñas"` |
| 220 | Prop (description) | `Envío inteligente de feedback tras experiencias positivas.` | `description="Envío inteligente de feedback tras experiencias positivas."` |
| 226 | Prop (title) | `Regalo de Cumpleaños` | `title="Regalo de Cumpleaños"` |
| 227 | Prop (description) | `Automatización de cortesías 5 días antes de la fecha.` | `description="Automatización de cortesías 5 días antes de la fecha."` |
| 234 | Prop (description) | `Protocolo de rescate para contactos inactivos > 45 días.` | `description="Protocolo de rescate para contactos inactivos > 45 días."` |
| 245 | JSX Text | `Optimización de Retención Lista` | `<p className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none mb-1.5">Optimización de Retención Lista</p>` |
| 246 | JSX Text | `IA funcionando al 100% de eficiencia operativa` | `<p className="text-xs text-slate-500 font-medium">IA funcionando al 100% de eficiencia operativa</p>` |
| 271 | String Literal | `Anónimo` | `<p className="text-xs font-bold">{it.details?.client \|\| "Anónimo"}</p>` |
| 283 | JSX Text | `Sin Actividad Hoy` | `<p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">Sin Actividad Hoy</p>` |
| 284 | JSX Text | `Esperando primeras interacciones del día` | `<p className="text-xs mt-2 text-slate-500">Esperando primeras interacciones del día</p>` |
| 290 | String Literal | `lg:col-span-1 space-y-6` | `<div className="lg:col-span-1 space-y-6">` |
| 316 | JSX Text | `Canales de Fidelización` | `<h3 className="font-black text-[var(--text-primary)] mb-6 uppercase tracking-[0.2em] text-[10px]">Canales de Fidelización</h3>` |
| 317 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 331 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 343 | JSX Text | `Recuperación` | `<span>Recuperación</span>` |

---

### 📄 [`src\app\(dashboard)\dashboard\agent-marketing\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/agent-marketing/page.tsx)
- **Cantidad de textos hardcodeados:** 24
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 62 | String Literal | `Todos los contactos` | `target_audience: "Todos los contactos",` |
| 115 | String Literal | `Error fetching data:` | `console.error("Error fetching data:", err);` |
| 144 | Toast/Alert (toast.success) | `Campaña programada por la IA` | `toast.success("Campaña programada por la IA");` |
| 146 | Toast/Alert (toast.error) | `Error al crear campaña` | `toast.error("Error al crear campaña");` |
| 157 | String Literal | `Redacción` | `if (tool === "Redacción") {` |
| 166 | String Literal | `No te quedes sin probar nuestro ${lowStockName}` | ``No te quedes sin probar nuestro ${lowStockName}`` |
| 177 | String Literal | `30d sin visita` | `{ name: "Inactivos", count: 45, label: "30d sin visita", color: "text-red-500" },` |
| 178 | String Literal | `Total` | `{ name: "Total", count: 156, label: "Contactos", color: "text-blue-500" }` |
| 199 | Toast/Alert (toast.success) | `Blast ejecutado con éxito.` | `toast.success("Blast ejecutado con éxito.", { id: tId });` |
| 255 | Prop (title) | `CONVERSIÓN` | `<AIPerfCard title="CONVERSIÓN" value={stats.conversion} icon={<Target className="text-emerald-500" size={18} />} />` |
| 263 | JSX Text | `Campañas` | `<h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Campañas</h3>` |
| 264 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 272 | String Literal | `lg:col-span-4 space-y-6` | `<div className="lg:col-span-4 space-y-6">` |
| 278 | Prop (label) | `Redacción` | `<CreativeTool icon={<PenTool />} label="Redacción" count="Pro" onClick={() => selectTool("Redacción")} />` |
| 280 | Prop (label) | `Chat` | `<CreativeTool icon={<MessageSquare />} label="Chat" count="Bot" onClick={() => selectTool("WhatsApp")} />` |
| 290 | JSX Text | `Lanzar un Smart-Blast ahora a 124 VIPs.` | `<p className="text-xs font-bold opacity-80 mb-6">Lanzar un Smart-Blast ahora a 124 VIPs.</p>` |
| 301 | String Literal | `bg-white dark:bg-[#111F3A] w-full max-w-2xl rounded-[32px] p-5 md:p-8 max-h-[90vh] overflow-y-auto` | `<motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-[#111F3A] w-full max-w-2xl rounded-[32px] p-5 md:p-8 max-h-[90vh] overflow-y-auto">` |
| 307 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 324 | String Literal | `bg-white dark:bg-[#111F3A] w-full max-w-lg rounded-[24px] p-5 md:p-8 max-h-[90vh] overflow-y-auto` | `<motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-[#111F3A] w-full max-w-lg rounded-[24px] p-5 md:p-8 max-h-[90vh] overflow-y-auto">` |
| 326 | JSX Text | `Nueva Campaña IA` | `<h3 className="text-xl font-bold">Nueva Campaña IA</h3>` |
| 329 | String Literal | `space-y-4` | `<form onSubmit={handleCreateCampaign} className="space-y-4">` |
| 330 | Prop (placeholder) | `Nombre` | `<input className="w-full p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold dark:text-white" placeholder="Nombre" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} />` |
| 334 | JSX Text | `Lanzar Campaña IA` | `<button className="w-full py-4 bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 transition-all">Lanzar Campaña IA</button>` |
| 377 | String Literal | `space-y-1` | `<div className="space-y-1">` |

---

### 📄 [`src\app\(dashboard)\dashboard\agent-reservations\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/agent-reservations/page.tsx)
- **Cantidad de textos hardcodeados:** 26
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 120 | String Literal | `Error fetching agent data:` | `console.error("Error fetching agent data:", err);` |
| 143 | Toast/Alert (toast.error) | `Error al actualizar estado` | `toast.error("Error al actualizar estado");` |
| 165 | Toast/Alert (toast.success) | `Configuración guardada correctamente` | `toast.success("Configuración guardada correctamente");` |
| 167 | String Literal | `Error saving config:` | `console.error("Error saving config:", err);` |
| 168 | Toast/Alert (toast.error) | `Error al guardar` | `toast.error("Error al guardar");` |
| 195 | JSX Text | `Gestor de Agenda IA` | `<span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1B4FD8]">Gestor de Agenda IA</span>` |
| 219 | String Literal | `Activar Gestor de Agenda` | `{isActive ? "Pausar Operaciones" : "Activar Gestor de Agenda"}` |
| 226 | JSX Text | `Estado:` | `<span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estado:</span>` |
| 231 | String Literal | `En Pausa` | `{isActive ? "Disponible" : "En Pausa"}` |
| 235 | String Literal | `En funcionamiento` | `{isActive ? "En funcionamiento" : "Sistema Inactivo"}` |
| 235 | String Literal | `Sistema Inactivo` | `{isActive ? "En funcionamiento" : "Sistema Inactivo"}` |
| 242 | String Literal | `lg:col-span-8 space-y-5` | `<div className="lg:col-span-8 space-y-5">` |
| 244 | Prop (title) | `AGENDA HOY` | `<AIPerfCard title="AGENDA HOY" value={todayReservations} icon={<Zap className="text-amber-500" size={18} />} />` |
| 245 | Prop (title) | `NIVEL DE SERVICIO` | `<AIPerfCard title="NIVEL DE SERVICIO" value={serviceLevel} icon={<ShieldCheck className="text-emerald-500" size={18} />} />` |
| 252 | JSX Text | `Registro de Operaciones` | `<h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">Registro de Operaciones</h3>` |
| 253 | JSX Text | `Actividad en tiempo real sincronizada con Supabase` | `<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actividad en tiempo real sincronizada con Supabase</p>` |
| 260 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 275 | String Literal | `Operación automatizada` | `<p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">{log.details?.message \|\| "Operación automatizada"}</p>` |
| 291 | JSX Text | `Sin actividad reciente` | `<p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sin actividad reciente</p>` |
| 304 | JSX Text | `Entrenamiento y Comportamiento` | `<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entrenamiento y Comportamiento</p>` |
| 307 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 308 | String Literal | `group space-y-3` | `<div className="group space-y-3">` |
| 320 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 323 | Prop (label) | `Auto-confirmación` | `label="Auto-confirmación"` |
| 329 | Prop (label) | `Detección de Conflictos` | `label="Detección de Conflictos"` |
| 337 | JSX Text | `Perfil IA` | `<span className="text-xs font-black text-slate-400 uppercase tracking-wider">Perfil IA</span>` |

---

### 📄 [`src\app\(dashboard)\dashboard\agents\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/agents/page.tsx)
- **Cantidad de textos hardcodeados:** 5
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 41 | String Literal | `Error cargando logs` | `console.error('Error cargando logs');` |
| 124 | JSX Text | `Historial de Ejecución` | `<h3 className="text-[12px] md:text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Historial de Ejecución</h3>` |
| 141 | JSX Text | `Hora` | `<th className="px-4 md:px-8 py-4">Hora</th>` |
| 143 | JSX Text | `Acción` | `<th className="px-8 py-4 hidden md:table-cell">Acción</th>` |
| 161 | String Literal | `Captación` | `log.agent === 'Captación' ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10" :` |

---

### 📄 [`src\app\(dashboard)\dashboard\api-settings\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/api-settings/page.tsx)
- **Cantidad de textos hardcodeados:** 27
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 64 | String Literal | `Error fetching API config:` | `console.error("Error fetching API config:", err);` |
| 74 | Toast/Alert (toast.success) | `Nueva API Key generada localmente. Haz clic en Guardar.` | `toast.success("Nueva API Key generada localmente. Haz clic en Guardar.");` |
| 90 | String Literal | `Usuario no autenticado` | `if (!user) throw new Error("Usuario no autenticado");` |
| 114 | Toast/Alert (toast.success) | `Configuración guardada correctamente` | `toast.success("Configuración guardada correctamente");` |
| 116 | String Literal | `Error saving API config:` | `console.error("Error saving API config:", err);` |
| 117 | Toast/Alert (toast.error) | `Error al guardar la configuración` | `toast.error("Error al guardar la configuración");` |
| 127 | Toast/Alert (toast.success) | `API Key copiada al portapapeles` | `toast.success("API Key copiada al portapapeles");` |
| 148 | JSX Text | `API Pública & Integraciones` | `<h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">API Pública & Integraciones</h1>` |
| 150 | JSX Text | `Conecta SF con tus propias herramientas, TPV o sitio web.` | `<p className="text-[var(--text-secondary)] text-sm">Conecta SF con tus propias herramientas, TPV o sitio web.</p>` |
| 159 | String Literal | `Guardar Cambios` | `{saving ? 'Guardando...' : 'Guardar Cambios'}` |
| 163 | JSX Text | `Plan Ultra Activo` | `<span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Plan Ultra Activo</span>` |
| 175 | String Literal | `lg:col-span-8 space-y-6` | `<div className="lg:col-span-8 space-y-6">` |
| 211 | JSX Text | `Seguridad Crítica:` | `<strong>Seguridad Crítica:</strong> Nunca expongas esta API Key en el lado del cliente (frontend).` |
| 225 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 227 | JSX Text | `Endpoint de Destino (URL)` | `<label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">Endpoint de Destino (URL)</label>` |
| 243 | Prop (description) | `Entrada de registro IA.` | `<WebhookItem event="activity.created" description="Entrada de registro IA." active />` |
| 244 | Prop (description) | `Tras campaña de comunicación.` | `<WebhookItem event="contact.notified" description="Tras campaña de comunicación." />` |
| 267 | String Literal | `lg:col-span-4 space-y-6` | `<div className="lg:col-span-4 space-y-6">` |
| 269 | JSX Text | `Integración Global` | `<h3 className="font-bold text-[var(--text-primary)] mb-2 relative z-10">Integración Global</h3>` |
| 324 | String Literal | `p-5 md:p-6 space-y-5 max-h-[60vh] md:max-h-[65vh] overflow-y-auto scrollbar-hide` | `<div className="p-5 md:p-6 space-y-5 max-h-[60vh] md:max-h-[65vh] overflow-y-auto scrollbar-hide">` |
| 326 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 327 | JSX Text | `Autenticación *` | `<label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Autenticación *</label>` |
| 334 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 342 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 344 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 351 | JSX Text | `Listado de registros` | `<p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Listado de registros</p>` |
| 360 | JSX Text | `Creación de perfiles` | `<p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Creación de perfiles</p>` |

---

### 📄 [`src\app\(dashboard)\dashboard\clients\[id]\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/clients/[id]/page.tsx)
- **Cantidad de textos hardcodeados:** 53
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 69 | Toast/Alert (toast.error) | `Error al cargar el cliente` | `toast.error('Error al cargar el cliente');` |
| 90 | Toast/Alert (toast.success) | `Estado actualizado` | `toast.success('Estado actualizado');` |
| 92 | Toast/Alert (toast.error) | `Error al actualizar estado` | `toast.error('Error al actualizar estado');` |
| 117 | Toast/Alert (toast.error) | `Error al registrar contacto` | `toast.error('Error al registrar contacto');` |
| 142 | String Literal | `Error al actualizar` | `if (!res.ok) throw new Error('Error al actualizar');` |
| 147 | Toast/Alert (toast.error) | `Error al actualizar` | `toast.error('Error al actualizar');` |
| 166 | String Literal | `Error al guardar` | `if (!res.ok) throw new Error('Error al guardar');` |
| 171 | Toast/Alert (toast.error) | `Error al guardar notas` | `toast.error('Error al guardar notas');` |
| 178 | Toast/Alert (confirm) | `¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.` | `if (!confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) return;` |
| 185 | Toast/Alert (toast.error) | `Error al eliminar` | `toast.error('Error al eliminar');` |
| 198 | JSX Text | `Cliente no encontrado` | `<h2 className="text-xl font-black text-slate-400 uppercase tracking-widest">Cliente no encontrado</h2>` |
| 209 | String Literal | `space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20` | `<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">` |
| 212 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 258 | String Literal | `flex-1 space-y-8 min-w-0` | `<div className="flex-1 space-y-8 min-w-0">` |
| 267 | Prop (label) | `Correo Electrónico` | `<ProfileItem icon={<Mail size={18} />} label="Correo Electrónico" value={client.email \|\| 'No proporcionado'} color="indigo" />` |
| 267 | String Literal | `No proporcionado` | `<ProfileItem icon={<Mail size={18} />} label="Correo Electrónico" value={client.email \|\| 'No proporcionado'} color="indigo" />` |
| 268 | Prop (label) | `Teléfono móvil` | `<ProfileItem icon={<Phone size={18} />} label="Teléfono móvil" value={client.phone \|\| 'No proporcionado'} color="emerald" />` |
| 268 | String Literal | `No proporcionado` | `<ProfileItem icon={<Phone size={18} />} label="Teléfono móvil" value={client.phone \|\| 'No proporcionado'} color="emerald" />` |
| 269 | Prop (label) | `Categoría` | `<ProfileItem icon={<Tag size={18} />} label="Categoría" value={client.category \|\| 'Otros'} color="amber" />` |
| 270 | Prop (label) | `Canal de Entrada` | `<ProfileItem icon={<Globe size={18} />} label="Canal de Entrada" value={`Vía ${client.source}`} color="purple" />` |
| 271 | Prop (label) | `Ubicación` | `<ProfileItem icon={<MapPin size={18} />} label="Ubicación" value={client.city \|\| 'Desconocida'} color="rose" />` |
| 288 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 309 | String Literal | `Guardar` | `{isSavingNotes ? 'Guardando...' : 'Guardar'}` |
| 340 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 364 | JSX Text | `Sin actividad registrada` | `<p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sin actividad registrada</p>` |
| 372 | String Literal | `w-full lg:w-[380px] space-y-6 lg:sticky lg:top-24` | `<div className="w-full lg:w-[380px] space-y-6 lg:sticky lg:top-24">` |
| 376 | Prop (label) | `Relación` | `<StatSmall label="Relación" value={`${daysSinceCreated} días`} icon={<Calendar size={16} />} color="blue" />` |
| 376 | String Literal | `${daysSinceCreated} días` | `<StatSmall label="Relación" value={`${daysSinceCreated} días`} icon={<Calendar size={16} />} color="blue" />` |
| 382 | JSX Text | `Gestión de Estado` | `<h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Gestión de Estado</h4>` |
| 383 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 391 | JSX Text | `LEAD (CAPTACIÓN)` | `<option value="lead" className="bg-slate-900">LEAD (CAPTACIÓN)</option>` |
| 392 | JSX Text | `POTENCIAL (NEGOCIACIÓN)` | `<option value="potencial" className="bg-slate-900">POTENCIAL (NEGOCIACIÓN)</option>` |
| 393 | JSX Text | `ACTIVO (CLIENTE)` | `<option value="activo" className="bg-slate-900">ACTIVO (CLIENTE)</option>` |
| 393 | String Literal | `activo` | `<option value="activo" className="bg-slate-900">ACTIVO (CLIENTE)</option>` |
| 394 | JSX Text | `INACTIVO (CERRADO)` | `<option value="inactivo" className="bg-slate-900">INACTIVO (CERRADO)</option>` |
| 394 | String Literal | `inactivo` | `<option value="inactivo" className="bg-slate-900">INACTIVO (CERRADO)</option>` |
| 410 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 412 | Prop (placeholder) | `Escribe un resumen de la llamada o reunión...` | `placeholder="Escribe un resumen de la llamada o reunión..."` |
| 422 | String Literal | `Guardar en Bitácora` | `{isRegistering ? 'Sincronizando...' : 'Guardar en Bitácora'}` |
| 434 | JSX Text | `Metadata de Registro` | `<span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Metadata de Registro</span>` |
| 436 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 438 | JSX Text | `Último Contacto` | `<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Último Contacto</span>` |
| 442 | JSX Text | `ID Único` | `<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID Único</span>` |
| 451 | String Literal | `No proporcionado` | `Email: ${client.email \|\| 'No proporcionado'}` |
| 452 | String Literal | `No proporcionado` | `Teléfono: ${client.phone \|\| 'No proporcionado'}` |
| 457 | String Literal | `Sin notas` | `Notas: ${client.notes \|\| 'Sin notas'}` |
| 485 | JSX Text | `Editar Contacto` | `<h3 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">Editar Contacto</h3>` |
| 488 | String Literal | `p-8 space-y-4 overflow-y-auto max-h-[60vh]` | `<div className="p-8 space-y-4 overflow-y-auto max-h-[60vh]">` |
| 490 | String Literal | `Nombre` | `{ label: 'Nombre', field: 'name' },` |
| 492 | String Literal | `Teléfono` | `{ label: 'Teléfono', field: 'phone' },` |
| 495 | String Literal | `space-y-1` | `<div key={field} className="space-y-1">` |
| 519 | String Literal | `Guardar Cambios` | `{isSavingProfile ? 'Sincronizando...' : 'Guardar Cambios'}` |
| 540 | String Literal | `space-y-2 group` | `<div className="space-y-2 group">` |

---

### 📄 [`src\app\(dashboard)\dashboard\communications\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/communications/page.tsx)
- **Cantidad de textos hardcodeados:** 10
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 53 | String Literal | `todos` | `const [filter, setFilter] = useState("todos");` |
| 94 | String Literal | `Load Conversations Error:` | `console.error("Load Conversations Error:", error);` |
| 95 | Toast/Alert (toast.error) | `Error de base de datos: ${error.message || 'Desconocido'}` | `toast.error(`Error de base de datos: ${error.message \|\| 'Desconocido'}`);` |
| 107 | String Literal | `Sin mensajes` | `last_message: sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1].content : 'Sin mensajes'` |
| 162 | String Literal | `Critical Init Error:` | `console.error("Critical Init Error:", err);` |
| 163 | Toast/Alert (toast.error) | `Error crítico al inicializar la página` | `if (mounted) toast.error("Error crítico al inicializar la página");` |
| 202 | Toast/Alert (toast) | `📱 Nuevo mensaje de ${displayName}` | `toast(`📱 Nuevo mensaje de ${displayName}`, { duration: 4000 });` |
| 249 | Toast/Alert (toast.error) | `Error al cambiar estado de IA` | `toast.error('Error al cambiar estado de IA')` |
| 268 | Toast/Alert (toast.error) | `Error al cambiar estado de IA Email` | `toast.error('Error al cambiar estado de IA Email')` |
| 351 | JSX Text | `Información` | `<h3 className="font-bold text-white uppercase text-[12px] tracking-wider">Información</h3>` |

---

### 📄 [`src\app\(dashboard)\dashboard\leads\ConvertModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/leads/ConvertModal.tsx)
- **Cantidad de textos hardcodeados:** 18
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 20 | String Literal | `cliente_y_deal` | `const handleConvert = async (type: 'cliente' \| 'deal' \| 'cliente_y_deal') => {` |
| 27 | String Literal | `cliente_y_deal` | `if (type === 'cliente' \|\| type === 'cliente_y_deal') {` |
| 48 | String Literal | `cliente_y_deal` | `if (type === 'deal' \|\| type === 'cliente_y_deal') {` |
| 58 | String Literal | `nuevo_lead` | `etapa: 'nuevo_lead',` |
| 87 | String Literal | `Contacto convertido en Cliente` | `type === 'cliente' ? 'Contacto convertido en Cliente' :` |
| 88 | String Literal | `Contacto convertido en Oportunidad` | `type === 'deal' ? 'Contacto convertido en Oportunidad' :` |
| 89 | String Literal | `Contacto convertido en Cliente y Oportunidad` | `'Contacto convertido en Cliente y Oportunidad'` |
| 95 | String Literal | `Conversion error:` | `console.error('Conversion error:', error);` |
| 96 | Toast/Alert (toast.error) | `Error al convertir contacto: ` | `toast.error('Error al convertir contacto: ' + (error.message \|\| 'Error desconocido'));` |
| 96 | String Literal | `Error desconocido` | `toast.error('Error al convertir contacto: ' + (error.message \|\| 'Error desconocido'));` |
| 125 | String Literal | `flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar` | `<div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">` |
| 139 | JSX Text | `Nuevo Cliente` | `<p className="text-sm font-black text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Nuevo Cliente</p>` |
| 140 | JSX Text | `Añade este contacto a tu Cartera de Clientes` | `<p className="text-[10px] text-slate-500 dark:text-slate-500">Añade este contacto a tu Cartera de Clientes</p>` |
| 153 | JSX Text | `Nuevo Negocio (Pipeline)` | `<p className="text-sm font-black text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Nuevo Negocio (Pipeline)</p>` |
| 154 | JSX Text | `Crea una oportunidad en el embudo de ventas` | `<p className="text-[10px] text-slate-500 dark:text-slate-500">Crea una oportunidad en el embudo de ventas</p>` |
| 159 | String Literal | `cliente_y_deal` | `onClick={() => handleConvert('cliente_y_deal')}` |
| 167 | JSX Text | `Cliente + Negocio` | `<p className="text-sm font-black text-white">Cliente + Negocio</p>` |
| 168 | JSX Text | `Crea ambos registros vinculados automáticamente` | `<p className="text-[10px] text-blue-100">Crea ambos registros vinculados automáticamente</p>` |

---

### 📄 [`src\app\(dashboard)\dashboard\leads\DiscardModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/leads/DiscardModal.tsx)
- **Cantidad de textos hardcodeados:** 8
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 17 | String Literal | `No interesado` | `'No interesado',` |
| 18 | String Literal | `Sin presupuesto` | `'Sin presupuesto',` |
| 20 | String Literal | `No responde` | `'No responde',` |
| 47 | Toast/Alert (toast.success) | `Contacto descartado con éxito` | `toast.success('Contacto descartado con éxito');` |
| 51 | String Literal | `Discard error:` | `console.error('Discard error:', error);` |
| 52 | Toast/Alert (toast.error) | `Error al descartar contacto` | `toast.error('Error al descartar contacto');` |
| 81 | String Literal | `flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar` | `<div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">` |
| 113 | Prop (placeholder) | `Especifica el motivo...` | `placeholder="Especifica el motivo..."` |

---

### 📄 [`src\app\(dashboard)\dashboard\leads\LeadModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/leads/LeadModal.tsx)
- **Cantidad de textos hardcodeados:** 35
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 30 | String Literal | `nuevo` | `estado: 'nuevo',` |
| 49 | String Literal | `nuevo` | `estado: 'nuevo',` |
| 63 | String Literal | `No auth user` | `if (!user) throw new Error('No auth user');` |
| 78 | Toast/Alert (toast.success) | `Contacto actualizado con éxito` | `toast.success('Contacto actualizado con éxito');` |
| 84 | Toast/Alert (toast.success) | `Contacto guardado con éxito` | `toast.success('Contacto guardado con éxito');` |
| 90 | String Literal | `Error saving lead:` | `console.error('Error saving lead:', error);` |
| 91 | String Literal | `Error al guardar el contacto` | `toast.error(error.message \|\| 'Error al guardar el contacto');` |
| 111 | String Literal | `Editar Contacto Comercial` | `{lead ? 'Editar Contacto Comercial' : 'Nuevo Contacto Comercial'}` |
| 111 | String Literal | `Nuevo Contacto Comercial` | `{lead ? 'Editar Contacto Comercial' : 'Nuevo Contacto Comercial'}` |
| 113 | JSX Text | `INFORMACIÓN DEL CONTACTO` | `<p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">INFORMACIÓN DEL CONTACTO</p>` |
| 122 | String Literal | `flex-1 overflow-y-auto p-5 md:p-8 space-y-4 sm:space-y-6 custom-scrollbar` | `<form onSubmit={handleSubmit} id="lead-form" className="flex-1 overflow-y-auto p-5 md:p-8 space-y-4 sm:space-y-6 custom-scrollbar">` |
| 126 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 127 | JSX Text | `Nombre Completo *` | `<label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Nombre Completo *</label>` |
| 132 | Prop (placeholder) | `Ej: Juan Pérez` | `placeholder="Ej: Juan Pérez"` |
| 139 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 144 | Prop (placeholder) | `Nombre de la empresa` | `placeholder="Nombre de la empresa"` |
| 151 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 163 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 164 | JSX Text | `Teléfono Directo` | `<label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Teléfono Directo</label>` |
| 175 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 180 | Prop (placeholder) | `Ej: director de marketing` | `placeholder="Ej: director de marketing"` |
| 187 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 201 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 208 | JSX Text | `Frío (Explorando)` | `<option value="frio" className="bg-[#111F3A] text-white">Frío (Explorando)</option>` |
| 215 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 216 | JSX Text | `Origen del Contacto` | `<label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Origen del Contacto</label>` |
| 232 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 233 | JSX Text | `Próximo Seguimiento` | `<label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Próximo Seguimiento</label>` |
| 243 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 244 | JSX Text | `Estado Actual` | `<label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Estado Actual</label>` |
| 250 | JSX Text | `Nuevo` | `<option value="nuevo" className="bg-[#111F3A] text-white">Nuevo</option>` |
| 250 | String Literal | `nuevo` | `<option value="nuevo" className="bg-[#111F3A] text-white">Nuevo</option>` |
| 259 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 264 | Prop (placeholder) | `Notas clave sobre el contacto...` | `placeholder="Notas clave sobre el contacto..."` |
| 286 | String Literal | `Guardar Contacto` | `{lead ? 'Actualizar Contacto' : 'Guardar Contacto'}` |

---

### 📄 [`src\app\(dashboard)\dashboard\pipeline\DealModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/pipeline/DealModal.tsx)
- **Cantidad de textos hardcodeados:** 26
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 30 | String Literal | `nuevo_lead` | `etapa: "nuevo_lead" as PipelineEtapa,` |
| 47 | String Literal | `nuevo_lead` | `etapa: deal.etapa \|\| "nuevo_lead",` |
| 62 | String Literal | `nuevo_lead` | `etapa: "nuevo_lead",` |
| 83 | Toast/Alert (toast.error) | `El nombre es obligatorio` | `toast.error("El nombre es obligatorio");` |
| 90 | String Literal | `No user found` | `if (!user) throw new Error("No user found");` |
| 107 | Toast/Alert (toast.success) | `Oportunidad actualizada con éxito` | `toast.success("Oportunidad actualizada con éxito");` |
| 113 | Toast/Alert (toast.success) | `Oportunidad creada con éxito` | `toast.success("Oportunidad creada con éxito");` |
| 119 | String Literal | `Error al guardar el deal` | `toast.error(err.message \|\| "Error al guardar el deal");` |
| 135 | String Literal | `Editar Operación` | `{deal ? 'Editar Operación' : 'Nueva Operación'}` |
| 135 | String Literal | `Nueva Operación` | `{deal ? 'Editar Operación' : 'Nueva Operación'}` |
| 137 | JSX Text | `Gestión de Pipeline` | `<p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Gestión de Pipeline</p>` |
| 145 | String Literal | `flex-1 overflow-y-auto p-5 md:p-8 space-y-4 sm:space-y-6 custom-scrollbar` | `<form onSubmit={handleSubmit} id="deal-form" className="flex-1 overflow-y-auto p-5 md:p-8 space-y-4 sm:space-y-6 custom-scrollbar">` |
| 147 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 157 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 166 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 175 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 176 | JSX Text | `Teléfono` | `<label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Teléfono</label>` |
| 184 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 196 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 203 | String Literal | `nuevo_lead` | `<option value="nuevo_lead" className="bg-[#111F3A] text-white">Prospecto</option>` |
| 206 | JSX Text | `Negociación` | `<option value="negociacion" className="bg-[#111F3A] text-white">Negociación</option>` |
| 211 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 224 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 239 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 240 | JSX Text | `Notas rápidas` | `<label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Notas rápidas</label>` |
| 265 | String Literal | `Guardar` | `{deal ? 'Actualizar' : 'Guardar'}` |

---

### 📄 [`src\app\(dashboard)\dashboard\projects\[id]\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/projects/[id]/page.tsx)
- **Cantidad de textos hardcodeados:** 4
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 42 | Toast/Alert (toast.error) | `Error al cargar detalle del proyecto` | `toast.error('Error al cargar detalle del proyecto');` |
| 54 | Toast/Alert (confirm) | `¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.` | `if (!confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) return;` |
| 62 | Toast/Alert (toast.error) | `Error al eliminar` | `toast.error('Error al eliminar');` |
| 75 | String Literal | `space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20` | `<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">` |

---

### 📄 [`src\app\api\admin\delete-employee\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/admin/delete-employee/route.ts)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 13 | String Literal | `userId requerido` | `if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 });` |

---

### 📄 [`src\app\api\ai\chat\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/ai/chat/route.ts)
- **Cantidad de textos hardcodeados:** 40
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 96 | String Literal | `[AI] Error con proveedor:` | `console.warn(`[AI] Error con proveedor:`,` |
| 111 | String Literal | `Faltan parámetros` | `{ error: 'Faltan parámetros' },` |
| 181 | String Literal | `nombre, descripcion, precio, activo` | `.select('nombre, descripcion, precio, activo')` |
| 183 | String Literal | `activo` | `.eq('activo', true)` |
| 191 | String Literal | `nombre, temperatura, estado, email, telefono, notas` | `.select('nombre, temperatura, estado, email, telefono, notas')` |
| 196 | String Literal | `nombre, valor_estimado, etapa, prioridad` | `.select('nombre, valor_estimado, etapa, prioridad')` |
| 201 | String Literal | `nombre, stock, stock_minimo, unidad, precio` | `.select('nombre, stock, stock_minimo, unidad, precio')` |
| 205 | String Literal | `staff_id, fecha_inicio, fecha_fin, dias, estado, motivo` | `.select('staff_id, fecha_inicio, fecha_fin, dias, estado, motivo')` |
| 207 | String Literal | `fecha_inicio` | `.order('fecha_inicio', { ascending: true })` |
| 210 | String Literal | `staff_id, tipo, timestamp, canal` | `.select('staff_id, tipo, timestamp, canal')` |
| 217 | String Literal | `staff_id, fecha, hora_inicio, hora_fin, tipo_turno` | `.select('staff_id, fecha, hora_inicio, hora_fin, tipo_turno')` |
| 219 | String Literal | `fecha` | `.gte('fecha', new Date().toISOString().split('T')[0])` |
| 220 | String Literal | `fecha` | `.order('fecha', { ascending: true })` |
| 269 | String Literal | `pendiente` | `.filter((i: any) => i.status === 'pendiente')` |
| 273 | String Literal | `activo` | `.filter((p: any) => p.status === 'activo')` |
| 290 | String Literal | `pendiente` | `.filter((i: any) => i.status === 'pendiente' && i.due_date)` |
| 313 | String Literal | `PÉRDIDAS` | `? 'PÉRDIDAS'` |
| 357 | String Literal | `pendiente` | `(i: any) => i.status === 'pendiente' && i.due_date &&` |
| 386 | String Literal | `activo` | `(c: any) => c.status === 'activo')` |
| 397 | String Literal | `BUENO_PENDIENTE_ALTO` | `? 'BUENO_PENDIENTE_ALTO'` |
| 400 | String Literal | `ATENCIÓN` | `: 'ATENCIÓN'` |
| 402 | String Literal | `tu negocio` | `const orgName = org?.name \|\| 'tu negocio'` |
| 404 | String Literal | `AI Chat - Datos cargados:` | `console.log('AI Chat - Datos cargados:', {` |
| 446 | String Literal | `[RAG] Fallback a datos completos:` | `console.warn('[RAG] Fallback a datos completos:', ragErr)` |
| 451 | String Literal | `la más cara` | `REGLAS: máx 1-2 líneas CORTAS\|solo el dato exacto\|sin explicaciones extra\|Este chat es SOLO lectura — NO puede modificar, crear ni borrar datos.\|Si piden MODIFICAR datos (marcar pagada, borrar, crear, actualizar, cambiar estado) → responde: "Para eso ve al módulo de [facturas/clientes/etc] en el panel."\|Si piden CONSULTAR datos (de quién es, cuánto es, cuándo vence) → responde DIRECTAMENTE con el dato exacto.\|NUNCA confundas una consulta con una acción.\|sin listas salvo que se pidan explícitamente\|hilo conversación\|en preguntas cortas como "la más cara" o "cuándo vence" → responde SIEMPRE sobre el último tema mencionado (facturas si se habló de facturas, citas si se habló de citas, etc.)\|"la más cara" o "el mayor importe" después de hablar de facturas → ordenar FACTURAS_PENDIENTES por total descendente y devolver la primera con su cliente. La factura más cara es siempre la de mayor número en el campo total.\|cuando pregunten "sus emails" o "dime más" después de hablar de clientes ACTIVOS → responder SOLO con los emails de clientes con status=activo, no leads\|"la más cara" después de hablar de facturas → responder con la factura de mayor total de FACTURAS_PENDIENTES, NUNCA del CATALOGO.\|usa SIEMPRE los valores de ANÁLISIS_NEGOCIO para responder preguntas de prioridad, urgencia y razonamiento\|beneficio = valor exacto de FINANZAS.beneficio\|total pendiente = valor exacto de TOTAL_PENDIENTE_COBRO.\|ANTI-BUCLE: NUNCA repitas la misma respuesta ni entres en bucle. Si ya respondiste sobre un dato, da la respuesta directa sin dudar. Si el dato es SFF-2026-003 por 6050€, responde exactamente eso sin añadir "no" ni correcciones.\|cuando dudes entre dos datos elige siempre el de mayor valor numérico y responde sin vacilar.` |
| 451 | String Literal | `cuándo vence` | `REGLAS: máx 1-2 líneas CORTAS\|solo el dato exacto\|sin explicaciones extra\|Este chat es SOLO lectura — NO puede modificar, crear ni borrar datos.\|Si piden MODIFICAR datos (marcar pagada, borrar, crear, actualizar, cambiar estado) → responde: "Para eso ve al módulo de [facturas/clientes/etc] en el panel."\|Si piden CONSULTAR datos (de quién es, cuánto es, cuándo vence) → responde DIRECTAMENTE con el dato exacto.\|NUNCA confundas una consulta con una acción.\|sin listas salvo que se pidan explícitamente\|hilo conversación\|en preguntas cortas como "la más cara" o "cuándo vence" → responde SIEMPRE sobre el último tema mencionado (facturas si se habló de facturas, citas si se habló de citas, etc.)\|"la más cara" o "el mayor importe" después de hablar de facturas → ordenar FACTURAS_PENDIENTES por total descendente y devolver la primera con su cliente. La factura más cara es siempre la de mayor número en el campo total.\|cuando pregunten "sus emails" o "dime más" después de hablar de clientes ACTIVOS → responder SOLO con los emails de clientes con status=activo, no leads\|"la más cara" después de hablar de facturas → responder con la factura de mayor total de FACTURAS_PENDIENTES, NUNCA del CATALOGO.\|usa SIEMPRE los valores de ANÁLISIS_NEGOCIO para responder preguntas de prioridad, urgencia y razonamiento\|beneficio = valor exacto de FINANZAS.beneficio\|total pendiente = valor exacto de TOTAL_PENDIENTE_COBRO.\|ANTI-BUCLE: NUNCA repitas la misma respuesta ni entres en bucle. Si ya respondiste sobre un dato, da la respuesta directa sin dudar. Si el dato es SFF-2026-003 por 6050€, responde exactamente eso sin añadir "no" ni correcciones.\|cuando dudes entre dos datos elige siempre el de mayor valor numérico y responde sin vacilar.` |
| 451 | String Literal | `el mayor importe` | `REGLAS: máx 1-2 líneas CORTAS\|solo el dato exacto\|sin explicaciones extra\|Este chat es SOLO lectura — NO puede modificar, crear ni borrar datos.\|Si piden MODIFICAR datos (marcar pagada, borrar, crear, actualizar, cambiar estado) → responde: "Para eso ve al módulo de [facturas/clientes/etc] en el panel."\|Si piden CONSULTAR datos (de quién es, cuánto es, cuándo vence) → responde DIRECTAMENTE con el dato exacto.\|NUNCA confundas una consulta con una acción.\|sin listas salvo que se pidan explícitamente\|hilo conversación\|en preguntas cortas como "la más cara" o "cuándo vence" → responde SIEMPRE sobre el último tema mencionado (facturas si se habló de facturas, citas si se habló de citas, etc.)\|"la más cara" o "el mayor importe" después de hablar de facturas → ordenar FACTURAS_PENDIENTES por total descendente y devolver la primera con su cliente. La factura más cara es siempre la de mayor número en el campo total.\|cuando pregunten "sus emails" o "dime más" después de hablar de clientes ACTIVOS → responder SOLO con los emails de clientes con status=activo, no leads\|"la más cara" después de hablar de facturas → responder con la factura de mayor total de FACTURAS_PENDIENTES, NUNCA del CATALOGO.\|usa SIEMPRE los valores de ANÁLISIS_NEGOCIO para responder preguntas de prioridad, urgencia y razonamiento\|beneficio = valor exacto de FINANZAS.beneficio\|total pendiente = valor exacto de TOTAL_PENDIENTE_COBRO.\|ANTI-BUCLE: NUNCA repitas la misma respuesta ni entres en bucle. Si ya respondiste sobre un dato, da la respuesta directa sin dudar. Si el dato es SFF-2026-003 por 6050€, responde exactamente eso sin añadir "no" ni correcciones.\|cuando dudes entre dos datos elige siempre el de mayor valor numérico y responde sin vacilar.` |
| 451 | String Literal | `sus emails` | `REGLAS: máx 1-2 líneas CORTAS\|solo el dato exacto\|sin explicaciones extra\|Este chat es SOLO lectura — NO puede modificar, crear ni borrar datos.\|Si piden MODIFICAR datos (marcar pagada, borrar, crear, actualizar, cambiar estado) → responde: "Para eso ve al módulo de [facturas/clientes/etc] en el panel."\|Si piden CONSULTAR datos (de quién es, cuánto es, cuándo vence) → responde DIRECTAMENTE con el dato exacto.\|NUNCA confundas una consulta con una acción.\|sin listas salvo que se pidan explícitamente\|hilo conversación\|en preguntas cortas como "la más cara" o "cuándo vence" → responde SIEMPRE sobre el último tema mencionado (facturas si se habló de facturas, citas si se habló de citas, etc.)\|"la más cara" o "el mayor importe" después de hablar de facturas → ordenar FACTURAS_PENDIENTES por total descendente y devolver la primera con su cliente. La factura más cara es siempre la de mayor número en el campo total.\|cuando pregunten "sus emails" o "dime más" después de hablar de clientes ACTIVOS → responder SOLO con los emails de clientes con status=activo, no leads\|"la más cara" después de hablar de facturas → responder con la factura de mayor total de FACTURAS_PENDIENTES, NUNCA del CATALOGO.\|usa SIEMPRE los valores de ANÁLISIS_NEGOCIO para responder preguntas de prioridad, urgencia y razonamiento\|beneficio = valor exacto de FINANZAS.beneficio\|total pendiente = valor exacto de TOTAL_PENDIENTE_COBRO.\|ANTI-BUCLE: NUNCA repitas la misma respuesta ni entres en bucle. Si ya respondiste sobre un dato, da la respuesta directa sin dudar. Si el dato es SFF-2026-003 por 6050€, responde exactamente eso sin añadir "no" ni correcciones.\|cuando dudes entre dos datos elige siempre el de mayor valor numérico y responde sin vacilar.` |
| 451 | String Literal | `dime más` | `REGLAS: máx 1-2 líneas CORTAS\|solo el dato exacto\|sin explicaciones extra\|Este chat es SOLO lectura — NO puede modificar, crear ni borrar datos.\|Si piden MODIFICAR datos (marcar pagada, borrar, crear, actualizar, cambiar estado) → responde: "Para eso ve al módulo de [facturas/clientes/etc] en el panel."\|Si piden CONSULTAR datos (de quién es, cuánto es, cuándo vence) → responde DIRECTAMENTE con el dato exacto.\|NUNCA confundas una consulta con una acción.\|sin listas salvo que se pidan explícitamente\|hilo conversación\|en preguntas cortas como "la más cara" o "cuándo vence" → responde SIEMPRE sobre el último tema mencionado (facturas si se habló de facturas, citas si se habló de citas, etc.)\|"la más cara" o "el mayor importe" después de hablar de facturas → ordenar FACTURAS_PENDIENTES por total descendente y devolver la primera con su cliente. La factura más cara es siempre la de mayor número en el campo total.\|cuando pregunten "sus emails" o "dime más" después de hablar de clientes ACTIVOS → responder SOLO con los emails de clientes con status=activo, no leads\|"la más cara" después de hablar de facturas → responder con la factura de mayor total de FACTURAS_PENDIENTES, NUNCA del CATALOGO.\|usa SIEMPRE los valores de ANÁLISIS_NEGOCIO para responder preguntas de prioridad, urgencia y razonamiento\|beneficio = valor exacto de FINANZAS.beneficio\|total pendiente = valor exacto de TOTAL_PENDIENTE_COBRO.\|ANTI-BUCLE: NUNCA repitas la misma respuesta ni entres en bucle. Si ya respondiste sobre un dato, da la respuesta directa sin dudar. Si el dato es SFF-2026-003 por 6050€, responde exactamente eso sin añadir "no" ni correcciones.\|cuando dudes entre dos datos elige siempre el de mayor valor numérico y responde sin vacilar.` |
| 465 | String Literal | `pendiente` | `FACTURAS_PENDIENTES(${invoices.filter((i: any) => i.status === 'pendiente').length}):${invoices.filter((i: any) => i.status === 'pendiente').map((i: any) => `${i.invoice_number}\|cliente:${(i.clients as any)?.name \|\| 'sin asignar'}\|${i.concept}\|${i.total}€\|vence:${i.due_date \|\| 'sin fecha'}`).join(';')}` |
| 465 | String Literal | `sin asignar` | `FACTURAS_PENDIENTES(${invoices.filter((i: any) => i.status === 'pendiente').length}):${invoices.filter((i: any) => i.status === 'pendiente').map((i: any) => `${i.invoice_number}\|cliente:${(i.clients as any)?.name \|\| 'sin asignar'}\|${i.concept}\|${i.total}€\|vence:${i.due_date \|\| 'sin fecha'}`).join(';')}` |
| 465 | String Literal | `sin fecha` | `FACTURAS_PENDIENTES(${invoices.filter((i: any) => i.status === 'pendiente').length}):${invoices.filter((i: any) => i.status === 'pendiente').map((i: any) => `${i.invoice_number}\|cliente:${(i.clients as any)?.name \|\| 'sin asignar'}\|${i.concept}\|${i.total}€\|vence:${i.due_date \|\| 'sin fecha'}`).join(';')}` |
| 473 | String Literal | `sin email` | `LEADS(${leads.length}):${leads.map((l: any) => `NOMBRE:${l.nombre}\|temp:${l.temperatura}\|estado:${l.estado}\|email:${l.email \|\| 'sin email'}\|tel:${l.telefono \|\| ''}`).join(';')}` |
| 478 | String Literal | `BUENO_PENDIENTE_ALTO` | `estado=${estadoGeneral === 'BUENO_PENDIENTE_ALTO' ? 'Negocio rentable con cobros pendientes altos' : estadoGeneral === 'BUENO' ? 'Negocio en buena salud' : 'Requiere atención'}` |
| 478 | String Literal | `Negocio rentable con cobros pendientes altos` | `estado=${estadoGeneral === 'BUENO_PENDIENTE_ALTO' ? 'Negocio rentable con cobros pendientes altos' : estadoGeneral === 'BUENO' ? 'Negocio en buena salud' : 'Requiere atención'}` |
| 478 | String Literal | `Negocio en buena salud` | `estado=${estadoGeneral === 'BUENO_PENDIENTE_ALTO' ? 'Negocio rentable con cobros pendientes altos' : estadoGeneral === 'BUENO' ? 'Negocio en buena salud' : 'Requiere atención'}` |
| 478 | String Literal | `Requiere atención` | `estado=${estadoGeneral === 'BUENO_PENDIENTE_ALTO' ? 'Negocio rentable con cobros pendientes altos' : estadoGeneral === 'BUENO' ? 'Negocio en buena salud' : 'Requiere atención'}` |
| 480 | String Literal | ` días` | `factura_urgente=${facturasMasUrgentes[0]?.invoice_number \|\| 'ninguna'}\|vence_en=${diasHastaVencimiento !== null ? diasHastaVencimiento + ' días' : 'N/A'}` |
| 503 | String Literal | `Error construyendo prompt:` | `console.error('Error construyendo prompt:', promptError)` |
| 518 | String Literal | `AI Chat error:` | `console.error('AI Chat error:', error?.message)` |

---

### 📄 [`src\app\api\ai\embeddings\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/ai/embeddings/route.ts)
- **Cantidad de textos hardcodeados:** 6
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 41 | String Literal | `id, invoice_number, concept, total, status, due_date` | `.select('id, invoice_number, concept, total, status, due_date')` |
| 51 | String Literal | `id, nombre, temperatura, estado, email, notas` | `.select('id, nombre, temperatura, estado, email, notas')` |
| 54 | String Literal | `id, nombre, valor_estimado, etapa, prioridad` | `.select('id, nombre, valor_estimado, etapa, prioridad')` |
| 61 | String Literal | `id, nombre, descripcion, precio` | `.select('id, nombre, descripcion, precio')` |
| 63 | String Literal | `activo` | `.eq('activo', true)` |
| 79 | String Literal | `sin fecha` | `content: `Factura ${i.invoice_number}: ${i.concept}. Total: ${i.total}€. Estado: ${i.status}. Vence: ${i.due_date\|\|'sin fecha'}`,` |

---

### 📄 [`src\app\api\ai\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/ai/route.ts)
- **Cantidad de textos hardcodeados:** 40
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 99 | String Literal | `[AI] Error con proveedor:` | `console.warn(`[AI] Error con proveedor:`,` |
| 112 | String Literal | `eres un robot?` | `- Si alguien pregunta "eres un robot?" responde con` |
| 117 | String Literal | `Por supuesto, con gusto te ayudo` | `o "Por supuesto, con gusto te ayudo".` |
| 119 | String Literal | `El equipo de ${orgName}` | `- Firma siempre como "El equipo de ${orgName}".` |
| 144 | String Literal | `dashboard` | `if (context === 'dashboard') {` |
| 227 | String Literal | `nuestro negocio` | `const orgName = body.conversation?.orgName \|\| body.orgName \|\| 'nuestro negocio'` |
| 228 | String Literal | `negocio local` | `const orgSector = body.conversation?.sector \|\| body.sector \|\| 'negocio local'` |
| 230 | String Literal | `Sin servicios configurados aún` | `let catalogText = 'Sin servicios configurados aún'` |
| 231 | String Literal | `profesional y cercano` | `let orgPersonality = 'profesional y cercano'` |
| 241 | String Literal | `nombre, descripcion, precio, activo` | `supabaseAdmin.from('catalogo_items').select('nombre, descripcion, precio, activo').eq('organization_id', orgId).eq('activo', true),` |
| 241 | String Literal | `activo` | `supabaseAdmin.from('catalogo_items').select('nombre, descripcion, precio, activo').eq('organization_id', orgId).eq('activo', true),` |
| 254 | String Literal | `profesional y cercano` | `orgPersonality = body.conversation?.personality \|\| body.orgPersonality \|\| orgData?.ai_personality \|\| 'profesional y cercano'` |
| 262 | String Literal | `El equipo de ${orgName}` | `- Firma siempre como "El equipo de ${orgName}"` |
| 275 | String Literal | `contáctanos para más información` | `di "contáctanos para más información"` |
| 278 | String Literal | `No configurados` | `${paymentText \|\| 'No configurados'}` |
| 302 | String Literal | `nuestro negocio` | `const orgName = body.orgName \|\| 'nuestro negocio';` |
| 305 | String Literal | `¿Qué responderías?` | `userMessage = body.message \|\| "¿Qué responderías?";` |
| 324 | String Literal | `nuestro negocio` | `const orgName = body.orgName \|\| 'nuestro negocio'` |
| 329 | String Literal | `descripción breve (ej: Llamada seguimiento presupuesto)` | `"title": "descripción breve (ej: Llamada seguimiento presupuesto)",` |
| 330 | String Literal | `YYYY-MM-DD o null si no se detecta` | `"date": "YYYY-MM-DD o null si no se detecta",` |
| 331 | String Literal | `HH:MM o null si no se detecta` | `"time": "HH:MM o null si no se detecta",` |
| 333 | String Literal | `contexto relevante extraído` | `"notes": "contexto relevante extraído"` |
| 343 | String Literal | `Extrae la cita de esta conversación` | `: (body.message \|\| 'Extrae la cita de esta conversación')` |
| 350 | String Literal | `nuestro negocio` | `const orgName = body.orgName \|\| 'nuestro negocio'` |
| 372 | String Literal | `nuestro negocio` | `const orgName = body.orgName \|\| 'nuestro negocio'` |
| 378 | String Literal | `razón en máximo 8 palabras` | `"motivo": "razón en máximo 8 palabras",` |
| 394 | String Literal | `nuestro negocio` | `const orgName = body.orgName \|\| 'nuestro negocio'` |
| 395 | String Literal | `su empresa` | `systemPrompt = `Genera un mensaje de seguimiento profesional en español para ${c?.name} de ${c?.company \|\| 'su empresa'}.` |
| 399 | String Literal | `Genera el mensaje` | `userMessage = 'Genera el mensaje'` |
| 415 | String Literal | `Genera el resumen contable mensual` | `userMessage = body.message \|\| 'Genera el resumen contable mensual'` |
| 426 | String Literal | `API Key de Google no configurada` | `error: "API Key de Google no configurada",` |
| 435 | String Literal | `No se proporcionó archivo para escaneo` | `return NextResponse.json({ error: "No se proporcionó archivo para escaneo" }, { status: 400 });` |
| 445 | String Literal | `Nombre del establecimiento o proveedor` | `"concept": "Nombre del establecimiento o proveedor",` |
| 446 | String Literal | `Total final con IVA (solo número)` | `"amount": "Total final con IVA (solo número)",` |
| 447 | String Literal | `Fecha en formato YYYY-MM-DD` | `"date": "Fecha en formato YYYY-MM-DD",` |
| 448 | String Literal | `NIF o CIF del emisor (si aparece)` | `"nif": "NIF o CIF del emisor (si aparece)",` |
| 466 | String Literal | `AI Route Expense OCR Error:` | `console.error("AI Route Expense OCR Error:", err);` |
| 468 | String Literal | `Error interno en el procesamiento de IA` | `error: "Error interno en el procesamiento de IA",` |
| 486 | String Literal | `¿En qué puedo ayudarte?` | `return NextResponse.json({ response: '¿En qué puedo ayudarte?', success: true })` |
| 507 | String Literal | `AI error:` | `console.error('AI error:', error?.message)` |

---

### 📄 [`src\app\api\ai-groq\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/ai-groq/route.ts)
- **Cantidad de textos hardcodeados:** 15
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 98 | String Literal | `[AI] Error con proveedor:` | `console.warn(`[AI] Error con proveedor:`,` |
| 158 | String Literal | `eres un robot?` | `- Si alguien pregunta "eres un robot?" responde con` |
| 163 | String Literal | `Por supuesto, con gusto te ayudo` | `o "Por supuesto, con gusto te ayudo".` |
| 165 | String Literal | `El equipo de ${orgName}` | `- Firma siempre como "El equipo de ${orgName}".` |
| 214 | String Literal | `¿Qué responderías?` | `userMessage = body.message \|\| body.conversation?.lastMessage \|\| '¿Qué responderías?'` |
| 217 | String Literal | `Las respuestas automáticas requieren systemPrompt` | `error: 'Las respuestas automáticas requieren systemPrompt'` |
| 232 | String Literal | `descripción breve` | `"title": "descripción breve",` |
| 233 | String Literal | `YYYY-MM-DD o null si no se detecta` | `"date": "YYYY-MM-DD o null si no se detecta",` |
| 234 | String Literal | `HH:MM o null si no se detecta` | `"time": "HH:MM o null si no se detecta",` |
| 236 | String Literal | `contexto relevante extraído` | `"notes": "contexto relevante extraído"` |
| 277 | String Literal | `razón en máximo 8 palabras` | `"motivo": "razón en máximo 8 palabras",` |
| 294 | String Literal | `Genera el mensaje` | `userMessage = 'Genera el mensaje'` |
| 300 | String Literal | `dashboard` | `if (context === 'dashboard' \|\| context === 'communications') {` |
| 312 | String Literal | `¿En qué puedo ayudarte?` | `return NextResponse.json({ response: '¿En qué puedo ayudarte?' })` |
| 319 | String Literal | `Groq AI error:` | `console.error('Groq AI error:', error?.message)` |

---

### 📄 [`src\app\api\appointments\google-sync\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/appointments/google-sync/route.ts)
- **Cantidad de textos hardcodeados:** 4
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 30 | String Literal | `Cita creada desde SF` | `description: appointment.notes \|\| 'Cita creada desde SF',` |
| 88 | String Literal | `Google Sync Error:` | `console.error('Google Sync Error:', errorData)` |
| 94 | String Literal | `Server Sync Error:` | `console.error('Server Sync Error:', error)` |
| 95 | String Literal | `Error interno del servidor` | `return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })` |

---

### 📄 [`src\app\api\appointments\reminder\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/appointments/reminder/route.ts)
- **Cantidad de textos hardcodeados:** 5
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 21 | String Literal | `pendiente` | `.in('status', ['confirmed', 'pending', 'pendiente', 'confirmada']);` |
| 25 | String Literal | `No hay citas para mañana` | `return NextResponse.json({ sent: 0, message: "No hay citas para mañana" });` |
| 32 | String Literal | `Recordatorio: Cita mañana a las ${timeStr}` | `const subject = `Recordatorio: Cita mañana a las ${timeStr}`;` |
| 52 | String Literal | `Error in reminder route:` | `console.error("Error in reminder route:", error);` |
| 53 | String Literal | `Error desconocido` | `const message = error instanceof Error ? error.message : "Error desconocido";` |

---

### 📄 [`src\app\api\appointments\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/appointments/route.ts)
- **Cantidad de textos hardcodeados:** 10
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 27 | String Literal | `No autorizado` | `return NextResponse.json({ error: 'No autorizado' }, { status: 401 });` |
| 41 | String Literal | `Organización no encontrada` | `return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 });` |
| 88 | String Literal | `No autorizado` | `return NextResponse.json({ error: 'No autorizado' }, { status: 401 });` |
| 102 | String Literal | `Organización no encontrada` | `return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 });` |
| 115 | String Literal | `pendiente` | `status: body.status \|\| 'pendiente',` |
| 153 | String Literal | `No autorizado` | `return NextResponse.json({ error: 'No autorizado' }, { status: 401 });` |
| 167 | String Literal | `Organización no encontrada` | `return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 });` |
| 218 | String Literal | `No autorizado` | `return NextResponse.json({ error: 'No autorizado' }, { status: 401 });` |
| 232 | String Literal | `Organización no encontrada` | `return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 });` |
| 238 | String Literal | `ID requerido` | `if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });` |

---

### 📄 [`src\app\api\auth\callback\google\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/auth/callback/google/route.ts)
- **Cantidad de textos hardcodeados:** 7
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 10 | String Literal | `error` | `const googleError = searchParams.get('error')` |
| 12 | String Literal | `Google Auth Error:` | `console.error('Google Auth Error:', googleError)` |
| 63 | String Literal | `Google Token Exchange Error:` | `console.error('Google Token Exchange Error:', data)` |
| 73 | String Literal | `Supabase Session Error:` | `console.error('Supabase Session Error:', userError)` |
| 91 | String Literal | `Database Update Error:` | `console.error('Database Update Error:', updateError)` |
| 99 | String Literal | `Callback Fatal Error:` | `console.error('Callback Fatal Error:', error)` |
| 101 | String Literal | `Unknown error` | `new URL(`/dashboard/appointments?error=server_error&details=${encodeURIComponent(error.message \|\| 'Unknown error')}`, req.url)` |

---

### 📄 [`src\app\api\auth\reset-password\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/auth/reset-password/route.ts)
- **Cantidad de textos hardcodeados:** 8
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 36 | String Literal | `CRITICAL ERROR: Missing environment variables:` | `console.error('CRITICAL ERROR: Missing environment variables:', missing.join(', '))` |
| 47 | String Literal | `Error parsing request JSON:` | `console.error('Error parsing request JSON:', e)` |
| 71 | String Literal | `Supabase generateLink error:` | `console.error('Supabase generateLink error:', {` |
| 85 | String Literal | `Supabase did not return a valid recovery link` | `{ error: 'Supabase did not return a valid recovery link' },` |
| 98 | String Literal | `🔑 Restablece tu contraseña - SF` | `subject: '🔑 Restablece tu contraseña - SF',` |
| 103 | JSX Text | `Hemos recibido una solicitud para restablecer tu contraseña en SF.` | `<p style="font-size: 16px; color: #666;">Hemos recibido una solicitud para restablecer tu contraseña en SF.</p>` |
| 107 | JSX Text | `Pulsa el botón de abajo para establecer una nueva contraseña. Este enlace funcionará en cualquier dispositivo y navegador.` | `<p style="font-size: 15px; margin-bottom: 25px;">Pulsa el botón de abajo para establecer una nueva contraseña. Este enlace funcionará en cualquier dispositivo y navegador.</p>` |
| 127 | String Literal | `Resend API Error:` | `console.error('Resend API Error:', sendError)` |

---

### 📄 [`src\app\api\communications\send\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/communications/send/route.ts)
- **Cantidad de textos hardcodeados:** 5
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 10 | String Literal | `Nueva consulta` | `let { type, to, subject = 'Nueva consulta', message, attachments = [], organizationId } = body` |
| 15 | String Literal | `ID de organización requerido para el envío multi-tenant` | `error: 'ID de organización requerido para el envío multi-tenant'` |
| 22 | String Literal | `Faltan parámetros requeridos: ${!type ? 'type' : !to ? 'to' : 'message'}` | `error: `Faltan parámetros requeridos: ${!type ? 'type' : !to ? 'to' : 'message'}`` |
| 48 | String Literal | `[API Send] Fatal Error:` | `console.error('[API Send] Fatal Error:', error.message)` |
| 51 | String Literal | `Error interno del servidor` | `error: error.message \|\| 'Error interno del servidor'` |

---

### 📄 [`src\app\api\cron\reindex-embeddings\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/cron/reindex-embeddings/route.ts)
- **Cantidad de textos hardcodeados:** 9
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 11 | String Literal | `No autorizado` | `{ error: 'No autorizado' }, { status: 401 })` |
| 29 | String Literal | `Sin organizaciones` | `message: 'Sin organizaciones' })` |
| 50 | String Literal | `id, invoice_number, concept, total, status, due_date` | `.select('id, invoice_number, concept, total, status, due_date')` |
| 59 | String Literal | `id, nombre, temperatura, estado, email` | `.select('id, nombre, temperatura, estado, email')` |
| 62 | String Literal | `id, nombre, valor_estimado, etapa` | `.select('id, nombre, valor_estimado, etapa')` |
| 68 | String Literal | `id, nombre, descripcion, precio` | `.select('id, nombre, descripcion, precio')` |
| 70 | String Literal | `activo` | `.eq('activo', true)` |
| 85 | String Literal | `sin fecha` | `content: `Factura ${i.invoice_number}: ${i.concept}. Total: ${i.total}€. Estado: ${i.status}. Vence: ${i.due_date\|\|'sin fecha'}`,` |
| 154 | String Literal | `[RAG Cron] Error:` | `console.error('[RAG Cron] Error:', error)` |

---

### 📄 [`src\app\api\cron\weekly-summary\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/cron/weekly-summary/route.ts)
- **Cantidad de textos hardcodeados:** 2
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 10 | String Literal | `No autorizado` | `return NextResponse.json({ error: 'No autorizado' }, { status: 401 })` |
| 84 | String Literal | `Cron weekly summary error:` | `console.error('Cron weekly summary error:', error)` |

---

### 📄 [`src\app\api\integrations\whatsapp\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/integrations/whatsapp/route.ts)
- **Cantidad de textos hardcodeados:** 7
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 13 | String Literal | `No autorizado` | `if (!user) return NextResponse.json({ connected: false, error: 'No autorizado' })` |
| 16 | String Literal | `No se encontró tu organización` | `if (!orgId) return NextResponse.json({ connected: false, error: 'No se encontró tu organización' })` |
| 58 | String Literal | `Servidor Baileys no disponible` | `return NextResponse.json({ connected: false, error: 'Servidor Baileys no disponible' })` |
| 102 | String Literal | `No autorizado` | `if (!user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })` |
| 105 | String Literal | `No se encontró tu organización` | `if (!orgId) return NextResponse.json({ success: false, error: 'No se encontró tu organización' })` |
| 113 | String Literal | `Error al desconectar del servidor físico` | `return NextResponse.json({ success: false, error: 'Error al desconectar del servidor físico' }, { status: 500 })` |
| 116 | String Literal | `Sesión desconectada y borrada` | `return NextResponse.json({ success: true, message: 'Sesión desconectada y borrada' })` |

---

### 📄 [`src\app\api\invoices\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/invoices/route.ts)
- **Cantidad de textos hardcodeados:** 20
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 9 | String Literal | `No autorizado` | `if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })` |
| 21 | String Literal | `No autorizado` | `if (!member) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })` |
| 33 | String Literal | `todos` | `if (status && status !== 'todos') {` |
| 43 | String Literal | `Error fetching invoices:` | `console.error('Error fetching invoices:', error)` |
| 44 | String Literal | `Error al obtener facturas` | `return NextResponse.json({ error: 'Error al obtener facturas' }, { status: 500 })` |
| 52 | String Literal | `No autorizado` | `if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })` |
| 63 | String Literal | `No autorizado` | `if (!member) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })` |
| 118 | String Literal | `pendiente` | `status: 'pendiente', // default status` |
| 137 | String Literal | `[RAG] Error auto-indexando factura:` | `).catch(err => console.error('[RAG] Error auto-indexando factura:', err))` |
| 141 | String Literal | `Error creating invoice:` | `console.error('Error creating invoice:', error)` |
| 142 | String Literal | `Error al crear factura` | `return NextResponse.json({ error: 'Error al crear factura' }, { status: 500 })` |
| 150 | String Literal | `No autorizado` | `if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })` |
| 164 | String Literal | `No autorizado` | `if (!member) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })` |
| 202 | String Literal | `Supabase update error:` | `console.error('Supabase update error:', error)` |
| 213 | String Literal | `[RAG] Error auto-indexando factura:` | `).catch(err => console.error('[RAG] Error auto-indexando factura:', err))` |
| 217 | String Literal | `Error updating invoice:` | `console.error('Error updating invoice:', error)` |
| 218 | String Literal | `Error al actualizar factura` | `return NextResponse.json({ error: 'Error al actualizar factura' }, { status: 500 })` |
| 226 | String Literal | `No autorizado` | `if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })` |
| 243 | String Literal | `Error deleting invoice:` | `console.error('Error deleting invoice:', error)` |
| 244 | String Literal | `Error al eliminar factura` | `return NextResponse.json({ error: 'Error al eliminar factura' }, { status: 500 })` |

---

### 📄 [`src\app\api\invoices\send\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/invoices/send/route.ts)
- **Cantidad de textos hardcodeados:** 9
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 13 | String Literal | `No autorizado` | `if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });` |
| 46 | String Literal | `Factura de ${orgName}` | `subject: `Factura de ${orgName}`,` |
| 49 | JSX Text | `Adjuntamos tu nueva factura.` | `<p>Adjuntamos tu nueva factura.</p>` |
| 50 | JSX Text | `Para cualquier consulta, no dudes en contactarnos:` | `<p>Para cualquier consulta, no dudes en contactarnos: <a href="mailto:${orgEmail}">${orgEmail}</a></p>` |
| 52 | JSX Text | `Un cordial saludo,` | `<p>Un cordial saludo,</p>` |
| 64 | String Literal | `Resend error:` | `console.error('Resend error:', error);` |
| 79 | String Literal | `pendiente` | `.update({ status: 'pendiente' })` |
| 86 | String Literal | `Error sending invoice:` | `console.error('Error sending invoice:', error);` |
| 87 | String Literal | `Error al enviar la factura` | `const msg = error instanceof Error ? error.message : 'Error al enviar la factura';` |

---

### 📄 [`src\app\api\onboarding\complete\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/onboarding/complete/route.ts)
- **Cantidad de textos hardcodeados:** 2
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 15 | String Literal | `ID de organización requerido` | `return NextResponse.json({ error: 'ID de organización requerido' }, { status: 400 })` |
| 46 | String Literal | `Onboarding Error:` | `console.error('Onboarding Error:', error)` |

---

### 📄 [`src\app\api\organization\create\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/organization/create/route.ts)
- **Cantidad de textos hardcodeados:** 7
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 31 | String Literal | `Usuario no encontrado en Auth` | `return NextResponse.json({ error: 'Usuario no encontrado en Auth' }, { status: 400 })` |
| 45 | String Literal | `Profile error:` | `console.error('Profile error:', profileError)` |
| 65 | String Literal | `Ya hay un usuario registrado con este nombre` | `{ error: 'Ya hay un usuario registrado con este nombre' },` |
| 102 | String Literal | `Error org:` | `console.error("Error org:", orgError);` |
| 114 | String Literal | `Error member:` | `console.error("Error member:", memberError);` |
| 122 | String Literal | `Error en API create-org:` | `console.error("Error en API create-org:", error);` |
| 123 | String Literal | `Error creando organización` | `return NextResponse.json({ error: error.message \|\| 'Error creando organización' }, { status: 500 })` |

---

### 📄 [`src\app\api\organization\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/organization/route.ts)
- **Cantidad de textos hardcodeados:** 5
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 17 | String Literal | `No autorizado` | `if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })` |
| 26 | String Literal | `Error` | `return NextResponse.json({ error: 'Error' }, { status: 500 })` |
| 34 | String Literal | `No autorizado` | `if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })` |
| 43 | String Literal | `No autorizado` | `if (!organization) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })` |
| 53 | String Literal | `Error` | `return NextResponse.json({ error: 'Error' }, { status: 500 })` |

---

### 📄 [`src\app\api\send-email\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/send-email/route.ts)
- **Cantidad de textos hardcodeados:** 4
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 12 | String Literal | `Faltan parámetros` | `return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })` |
| 44 | String Literal | `Resend error:` | `console.error('Resend error:', error)` |
| 45 | String Literal | `Error Resend` | `return NextResponse.json({ error: 'Error Resend' }, { status: 500 })` |
| 50 | String Literal | `send-email error:` | `console.error('send-email error:', e)` |

---

### 📄 [`src\app\api\send-whatsapp\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/send-whatsapp/route.ts)
- **Cantidad de textos hardcodeados:** 5
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 9 | String Literal | `Faltan parámetros` | `return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })` |
| 37 | String Literal | `Sin config WhatsApp` | `return NextResponse.json({ error: 'Sin config WhatsApp' }, { status: 404 })` |
| 61 | String Literal | `Meta API error:` | `console.error('Meta API error:', err)` |
| 62 | String Literal | `Error Meta API` | `return NextResponse.json({ error: 'Error Meta API' }, { status: 500 })` |
| 67 | String Literal | `send-whatsapp error:` | `console.error('send-whatsapp error:', e)` |

---

### 📄 [`src\app\api\settings\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/settings/route.ts)
- **Cantidad de textos hardcodeados:** 7
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 11 | String Literal | `No autorizado` | `return NextResponse.json({ error: 'No autorizado' }, { status: 401 });` |
| 18 | String Literal | `organization_id es requerido` | `return NextResponse.json({ error: 'organization_id es requerido' }, { status: 400 });` |
| 30 | String Literal | `No tienes permiso para modificar esta organización` | `return NextResponse.json({ error: 'No tienes permiso para modificar esta organización' }, { status: 403 });` |
| 44 | String Literal | `Error checking existing settings:` | `console.error('Error checking existing settings:', selectError);` |
| 80 | String Literal | `Error saving settings:` | `console.error('Error saving settings:', result.error);` |
| 86 | String Literal | `Unexpected error in settings API:` | `console.error('Unexpected error in settings API:', error);` |
| 87 | String Literal | `Error interno del servidor` | `return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });` |

---

### 📄 [`src\app\api\stripe\cancel\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/stripe/cancel/route.ts)
- **Cantidad de textos hardcodeados:** 5
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 55 | String Literal | `No hay suscripciones de Stripe activas por cancelar` | `return NextResponse.json({ error: 'No hay suscripciones de Stripe activas por cancelar' }, { status: 404 })` |
| 63 | String Literal | `Cancelación programada para org: ${organizationId}` | `console.log(`Cancelación programada para org: ${organizationId}`)` |
| 70 | String Literal | `Stripe cancel error:` | `console.error('Stripe cancel error:', error)` |
| 71 | String Literal | `Error desconocido` | `const errorMessage = error instanceof Error ? error.message : 'Error desconocido'` |
| 72 | String Literal | `Error al procesar la cancelación: ` | `return NextResponse.json({ error: 'Error al procesar la cancelación: ' + errorMessage }, { status: 500 })` |

---

### 📄 [`src\app\api\stripe\checkout\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/stripe/checkout/route.ts)
- **Cantidad de textos hardcodeados:** 4
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 15 | String Literal | `Faltan parámetros: organizationId o priceId` | `return NextResponse.json({ error: 'Faltan parámetros: organizationId o priceId' }, { status: 400 })` |
| 20 | String Literal | `Configuración del servidor incompleta (URL)` | `return NextResponse.json({ error: 'Configuración del servidor incompleta (URL)' }, { status: 500 })` |
| 59 | String Literal | `Checkout error:` | `console.error('Checkout error:', error)` |
| 61 | String Literal | `Error creando checkout` | `error: 'Error creando checkout',` |

---

### 📄 [`src\app\api\stripe\webhook\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/stripe/webhook/route.ts)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 22 | String Literal | `Webhook error` | `return NextResponse.json({ error: 'Webhook error' }, { status: 400 })` |

---

### 📄 [`src\app\api\trial\activate\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/trial/activate/route.ts)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 20 | String Literal | `Organización no encontrada` | `if (!org) return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 })` |

---

### 📄 [`src\app\api\trial\check\route.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/api/trial/check/route.ts)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 19 | String Literal | `No encontrada` | `if (!org) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })` |

---

### 📄 [`src\app\fichar\[codigo]\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/fichar/[codigo]/page.tsx)
- **Cantidad de textos hardcodeados:** 9
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 32 | String Literal | `Código no válido` | `setError("Código no válido");` |
| 40 | String Literal | `fichar_code` | `.eq('fichar_code', codigo)` |
| 44 | String Literal | `Código no válido` | `setError("Código no válido");` |
| 84 | Toast/Alert (alert) | `Error al registrar el fichaje. Inténtelo de nuevo.` | `alert("Error al registrar el fichaje. Inténtelo de nuevo.");` |
| 89 | JSX Text | `Cargando...` | `if (loading) return <div className="flex h-screen items-center justify-center p-4 bg-[var(--background)]"><div className="text-xl font-bold animate-pulse text-[var(--foreground)]">Cargando...</div></div>;` |
| 97 | String Literal | `text-center space-y-2` | `<div className="text-center space-y-2">` |
| 99 | JSX Text | `Portal del Empleado` | `<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal del Empleado</p>` |
| 110 | String Literal | `EEEE, d 'de' MMMM` | `{format(time, "EEEE, d 'de' MMMM", { locale: es })}` |
| 130 | String Literal | `w-full space-y-4` | `<div className="w-full space-y-4">` |

---

### 📄 [`src\app\legal\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/legal/page.tsx)
- **Cantidad de textos hardcodeados:** 47
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 21 | JSX Text | `de reservas y citas  que` | `El asistente <span className="auth-headline-accent">de reservas y citas  que</span><br />` |
| 28 | String Literal | `Mientras tú trabajas, él atiende a tus clientes` | `"Mientras tú trabajas, él atiende a tus clientes",` |
| 29 | String Literal | `Tu cliente escribe — a cualquier hora` | `"Tu cliente escribe — a cualquier hora",` |
| 30 | String Literal | `Tu asistente responde — con tu tono` | `"Tu asistente responde — con tu tono",` |
| 31 | String Literal | `Tú lo encuentras todo listo` | `"Tú lo encuentras todo listo",` |
| 41 | JSX Text | `&ldquo;Por fin puedo desconectar sin miedo a perder un cliente.&rdquo;` | `<p style={{ fontStyle: 'italic', opacity: 0.5 }}>&ldquo;Por fin puedo desconectar sin miedo a perder un cliente.&rdquo;</p>` |
| 45 | JSX Text | `Sin tarjeta` | `<span className="auth-marketing-badge">Sin tarjeta</span>` |
| 46 | JSX Text | `Listo en 5 min` | `<span className="auth-marketing-badge">Listo en 5 min</span>` |
| 47 | JSX Text | `Hecho en España` | `<span className="auth-marketing-badge">Hecho en España</span>` |
| 63 | Prop (title) | `Ir a la web principal` | `<Link href="https://www.sffalcon.com" className="auth-home-link" title="Ir a la web principal">` |
| 73 | JSX Text | `Términos y Condiciones` | `<h1 className="auth-card-title" style={{ textAlign: 'left', margin: 0 }}>Términos y Condiciones</h1>` |
| 89 | JSX Text | `1. Titular del servicio` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>1. Titular del servicio</h2>` |
| 91 | JSX Text | `El titular y responsable de la plataforma SF Gestor Empresarial es:` | `<p>El titular y responsable de la plataforma SF Gestor Empresarial es:</p>` |
| 93 | JSX Text | `Marco Antonio Falcón Hernández` | `<li><strong>Titular:</strong> Marco Antonio Falcón Hernández</li>` |
| 95 | JSX Text | `Aplicación:` | `<li><strong>Aplicación:</strong> SF Gestor Empresarial (app.sffalcon.com)</li>` |
| 97 | JSX Text | `Correo electrónico:` | `<li><strong>Correo electrónico:</strong> admin@sffalcon.com</li>` |
| 98 | JSX Text | `Teléfono:` | `<li><strong>Teléfono:</strong> +34 604 989 742</li>` |
| 99 | JSX Text | `País:` | `<li><strong>País:</strong> España (Unión Europea)</li>` |
| 99 | JSX Text | `España (Unión Europea)` | `<li><strong>País:</strong> España (Unión Europea)</li>` |
| 103 | JSX Text | `Política de Privacidad` | `así como de nuestra <Link href="/privacidad" style={{ color: '#818CF8' }}>Política de Privacidad</Link>.` |
| 110 | JSX Text | `2. Objeto del servicio` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>2. Objeto del servicio</h2>` |
| 119 | JSX Text | `Asistente de IA que atiende y gestiona reservas 24/7` | `<li>Asistente de IA que atiende y gestiona reservas 24/7</li>` |
| 120 | JSX Text | `Gestión de clientes y citas ilimitados` | `<li>Gestión de clientes y citas ilimitados</li>` |
| 121 | JSX Text | `Integración con WhatsApp Business API` | `<li>Integración con WhatsApp Business API</li>` |
| 122 | JSX Text | `Recordatorios automáticos de citas` | `<li>Recordatorios automáticos de citas</li>` |
| 123 | JSX Text | `Panel de control con estadísticas y analytics` | `<li>Panel de control con estadísticas y analytics</li>` |
| 124 | JSX Text | `Facturación y finanzas integradas` | `<li>Facturación y finanzas integradas</li>` |
| 125 | JSX Text | `Sincronización con Google Calendar` | `<li>Sincronización con Google Calendar</li>` |
| 126 | JSX Text | `Gestión de usuarios del equipo` | `<li>Gestión de usuarios del equipo</li>` |
| 133 | JSX Text | `3. Condiciones de contratación` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>3. Condiciones de contratación</h2>` |
| 144 | JSX Text | `4. Planes y precios` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>4. Planes y precios</h2>` |
| 146 | JSX Text | `SFFALCON ofrece el siguiente plan:` | `<p>SFFALCON ofrece el siguiente plan:</p>` |
| 178 | JSX Text | `6. Uso aceptable y prohibiciones` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>6. Uso aceptable y prohibiciones</h2>` |
| 182 | JSX Text | `Utilizar la plataforma para enviar spam o comunicaciones no solicitadas` | `<li>Utilizar la plataforma para enviar spam o comunicaciones no solicitadas</li>` |
| 183 | JSX Text | `Infringir las Políticas de WhatsApp Business de Meta Platforms, Inc.` | `<li>Infringir las Políticas de WhatsApp Business de Meta Platforms, Inc.</li>` |
| 184 | JSX Text | `Acceder o intentar acceder a cuentas o datos de otros clientes` | `<li>Acceder o intentar acceder a cuentas o datos de otros clientes</li>` |
| 185 | JSX Text | `Realizar ingeniería inversa del software de la plataforma` | `<li>Realizar ingeniería inversa del software de la plataforma</li>` |
| 186 | JSX Text | `Utilizar la plataforma para actividades ilegales o contrarias a la buena fe` | `<li>Utilizar la plataforma para actividades ilegales o contrarias a la buena fe</li>` |
| 187 | JSX Text | `Compartir credenciales de acceso con personas no autorizadas` | `<li>Compartir credenciales de acceso con personas no autorizadas</li>` |
| 198 | JSX Text | `7. Protección de datos` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>7. Protección de datos</h2>` |
| 205 | JSX Text | `Política de Privacidad` | `<Link href="/privacidad" style={{ color: '#818CF8' }}>Política de Privacidad</Link>.` |
| 214 | JSX Text | `8. Limitación de responsabilidad` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>8. Limitación de responsabilidad</h2>` |
| 226 | JSX Text | `9. Legislación aplicable y resolución de conflictos` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>9. Legislación aplicable y resolución de conflictos</h2>` |
| 242 | JSX Text | `Para cualquier consulta, solicitud o reclamación relacionada con estos Términos:` | `<p>Para cualquier consulta, solicitud o reclamación relacionada con estos Términos:</p>` |
| 245 | JSX Text | `Teléfono:` | `<li>Teléfono: <a href="tel:+34604989742" style={{ color: '#818CF8' }}>+34 604 989 742</a></li>` |
| 247 | JSX Text | `Aplicación:` | `<li>Aplicación: <a href="https://app.sffalcon.com" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>app.sffalcon.com</a></li>` |
| 249 | JSX Text | `Nos comprometemos a responder en un plazo máximo de 72 horas laborables.` | `<p>Nos comprometemos a responder en un plazo máximo de 72 horas laborables.</p>` |

---

### 📄 [`src\app\panel-empleado\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/panel-empleado/page.tsx)
- **Cantidad de textos hardcodeados:** 4
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 17 | String Literal | `inicio` | `const [activeSection, setActiveSection] = useState("inicio");` |
| 54 | JSX Text | `Cargando Panel...` | `<p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cargando Panel...</p>` |
| 62 | String Literal | `inicio` | `case "inicio":` |
| 64 | String Literal | `fichaje` | `case "fichaje":` |

---

### 📄 [`src\app\privacidad\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/privacidad/page.tsx)
- **Cantidad de textos hardcodeados:** 105
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 21 | JSX Text | `de reservas y citas que` | `El asistente <span className="auth-headline-accent">de reservas y citas que </span><br />` |
| 28 | String Literal | `Mientras tú trabajas, él atiende a tus clientes` | `"Mientras tú trabajas, él atiende a tus clientes",` |
| 29 | String Literal | `Tu cliente escribe — a cualquier hora` | `"Tu cliente escribe — a cualquier hora",` |
| 30 | String Literal | `Tu asistente responde — con tu tono` | `"Tu asistente responde — con tu tono",` |
| 31 | String Literal | `Tú lo encuentras todo listo` | `"Tú lo encuentras todo listo",` |
| 41 | JSX Text | `&ldquo;Por fin puedo desconectar sin miedo a perder un cliente.&rdquo;` | `<p style={{ fontStyle: 'italic', opacity: 0.5 }}>&ldquo;Por fin puedo desconectar sin miedo a perder un cliente.&rdquo;</p>` |
| 45 | JSX Text | `Sin tarjeta` | `<span className="auth-marketing-badge">Sin tarjeta</span>` |
| 46 | JSX Text | `Listo en 5 min` | `<span className="auth-marketing-badge">Listo en 5 min</span>` |
| 47 | JSX Text | `Hecho en España` | `<span className="auth-marketing-badge">Hecho en España</span>` |
| 63 | Prop (title) | `Ir a la web principal` | `<Link href="https://www.sffalcon.com" className="auth-home-link" title="Ir a la web principal">` |
| 73 | JSX Text | `Política de Privacidad` | `<h1 className="auth-card-title" style={{ textAlign: 'left', margin: 0 }}>Política de Privacidad</h1>` |
| 89 | JSX Text | `1. Responsable del tratamiento` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>1. Responsable del tratamiento</h2>` |
| 91 | JSX Text | `El responsable del tratamiento de sus datos personales es:` | `<p>El responsable del tratamiento de sus datos personales es:</p>` |
| 93 | JSX Text | `Marco Antonio Falcón Hernández` | `<li><strong>Titular:</strong> Marco Antonio Falcón Hernández</li>` |
| 95 | JSX Text | `Aplicación:` | `<li><strong>Aplicación:</strong> SF Gestor Empresarial (app.sffalcon.com)</li>` |
| 97 | JSX Text | `Correo electrónico:` | `<li><strong>Correo electrónico:</strong> admin@sffalcon.com</li>` |
| 98 | JSX Text | `Teléfono:` | `<li><strong>Teléfono:</strong> +34 604 989 742</li>` |
| 99 | JSX Text | `País:` | `<li><strong>País:</strong> España (Unión Europea)</li>` |
| 99 | JSX Text | `España (Unión Europea)` | `<li><strong>País:</strong> España (Unión Europea)</li>` |
| 111 | JSX Text | `2. Descripción del servicio` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>2. Descripción del servicio</h2>` |
| 126 | JSX Text | `a) Datos de clientes (operadores de la plataforma):` | `<p><strong>a) Datos de clientes (operadores de la plataforma):</strong></p>` |
| 128 | JSX Text | `Nombre y apellidos` | `<li>Nombre y apellidos</li>` |
| 129 | JSX Text | `Dirección de correo electrónico` | `<li>Dirección de correo electrónico</li>` |
| 130 | JSX Text | `Número de teléfono` | `<li>Número de teléfono</li>` |
| 131 | JSX Text | `Información sobre su negocio (nombre, sector, país)` | `<li>Información sobre su negocio (nombre, sector, país)</li>` |
| 132 | JSX Text | `Datos de facturación y suscripción` | `<li>Datos de facturación y suscripción</li>` |
| 133 | JSX Text | `Datos de navegación básicos mediante cookies técnicas necesarias` | `<li>Datos de navegación básicos mediante cookies técnicas necesarias</li>` |
| 135 | JSX Text | `b) Datos de usuarios finales (clientes del negocio, gestionados a través de WhatsApp Business API):` | `<p><strong>b) Datos de usuarios finales (clientes del negocio, gestionados a través de WhatsApp Business API):</strong></p>` |
| 137 | JSX Text | `Número de teléfono de WhatsApp` | `<li>Número de teléfono de WhatsApp</li>` |
| 138 | JSX Text | `Nombre de perfil de WhatsApp` | `<li>Nombre de perfil de WhatsApp</li>` |
| 139 | JSX Text | `Contenido de los mensajes intercambiados con el asistente` | `<li>Contenido de los mensajes intercambiados con el asistente</li>` |
| 140 | JSX Text | `Fecha, hora y estado de la reserva o cita` | `<li>Fecha, hora y estado de la reserva o cita</li>` |
| 152 | JSX Text | `4. Finalidad del tratamiento` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>4. Finalidad del tratamiento</h2>` |
| 154 | JSX Text | `Sus datos se utilizan exclusivamente para:` | `<p>Sus datos se utilizan exclusivamente para:</p>` |
| 156 | JSX Text | `Gestionar el registro y acceso a la plataforma SF Gestor Empresarial` | `<li>Gestionar el registro y acceso a la plataforma SF Gestor Empresarial</li>` |
| 157 | JSX Text | `Prestar los servicios contratados según el plan elegido` | `<li>Prestar los servicios contratados según el plan elegido</li>` |
| 158 | JSX Text | `Operar el asistente virtual de reservas vía WhatsApp Business API` | `<li>Operar el asistente virtual de reservas vía WhatsApp Business API</li>` |
| 159 | JSX Text | `Enviar notificaciones y recordatorios de citas a usuarios finales` | `<li>Enviar notificaciones y recordatorios de citas a usuarios finales</li>` |
| 160 | JSX Text | `Gestionar la facturación y cobros recurrentes mediante Stripe` | `<li>Gestionar la facturación y cobros recurrentes mediante Stripe</li>` |
| 161 | JSX Text | `Enviar comunicaciones relacionadas con el servicio (actualizaciones, incidencias)` | `<li>Enviar comunicaciones relacionadas con el servicio (actualizaciones, incidencias)</li>` |
| 162 | JSX Text | `Cumplir con obligaciones legales y fiscales aplicables en España` | `<li>Cumplir con obligaciones legales y fiscales aplicables en España</li>` |
| 164 | JSX Text | `No utilizamos sus datos para publicidad de terceros ni para ninguna finalidad distinta a las indicadas sin su consentimiento previo.` | `<p>No utilizamos sus datos para publicidad de terceros ni para ninguna finalidad distinta a las indicadas sin su consentimiento previo.</p>` |
| 170 | JSX Text | `5. Base legal del tratamiento` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>5. Base legal del tratamiento</h2>` |
| 173 | JSX Text | `Ejecución de contrato:` | `<li><strong>Ejecución de contrato:</strong> para prestar el servicio SaaS contratado</li>` |
| 173 | JSX Text | `para prestar el servicio SaaS contratado` | `<li><strong>Ejecución de contrato:</strong> para prestar el servicio SaaS contratado</li>` |
| 174 | JSX Text | `cuando el usuario se registra voluntariamente en la plataforma` | `<li><strong>Consentimiento:</strong> cuando el usuario se registra voluntariamente en la plataforma</li>` |
| 175 | JSX Text | `Interés legítimo:` | `<li><strong>Interés legítimo:</strong> para el funcionamiento del asistente de reservas y citas  en nombre del negocio</li>` |
| 175 | JSX Text | `para el funcionamiento del asistente de reservas y citas  en nombre del negocio` | `<li><strong>Interés legítimo:</strong> para el funcionamiento del asistente de reservas y citas  en nombre del negocio</li>` |
| 176 | JSX Text | `Obligación legal:` | `<li><strong>Obligación legal:</strong> para cumplir con obligaciones fiscales o legales en España</li>` |
| 176 | JSX Text | `para cumplir con obligaciones fiscales o legales en España` | `<li><strong>Obligación legal:</strong> para cumplir con obligaciones fiscales o legales en España</li>` |
| 178 | JSX Text | `Puede retirar su consentimiento en cualquier momento sin que ello afecte a la licitud del tratamiento previo.` | `<p>Puede retirar su consentimiento en cualquier momento sin que ello afecte a la licitud del tratamiento previo.</p>` |
| 184 | JSX Text | `6. Uso de la API de WhatsApp Business (Meta)` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>6. Uso de la API de WhatsApp Business (Meta)</h2>` |
| 187 | JSX Text | `API de WhatsApp Business de Meta Platforms, Inc.` | `SF Gestor Empresarial utiliza la <strong>API de WhatsApp Business de Meta Platforms, Inc.</strong> para` |
| 192 | JSX Text | `Los mensajes de WhatsApp son gestionados conforme a las` | `<li>Los mensajes de WhatsApp son gestionados conforme a las <a href="https://www.whatsapp.com/legal/business-policy/" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>Políticas de WhatsApp Business</a> y los <a href="https://developers.facebook.com/terms/" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>Términos de la plataforma de Meta</a>.</li>` |
| 192 | JSX Text | `Políticas de WhatsApp Business` | `<li>Los mensajes de WhatsApp son gestionados conforme a las <a href="https://www.whatsapp.com/legal/business-policy/" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>Políticas de WhatsApp Business</a> y los <a href="https://developers.facebook.com/terms/" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>Términos de la plataforma de Meta</a>.</li>` |
| 192 | JSX Text | `y los` | `<li>Los mensajes de WhatsApp son gestionados conforme a las <a href="https://www.whatsapp.com/legal/business-policy/" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>Políticas de WhatsApp Business</a> y los <a href="https://developers.facebook.com/terms/" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>Términos de la plataforma de Meta</a>.</li>` |
| 192 | JSX Text | `Términos de la plataforma de Meta` | `<li>Los mensajes de WhatsApp son gestionados conforme a las <a href="https://www.whatsapp.com/legal/business-policy/" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>Políticas de WhatsApp Business</a> y los <a href="https://developers.facebook.com/terms/" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>Términos de la plataforma de Meta</a>.</li>` |
| 193 | JSX Text | `Los datos de mensajería` | `<li>Los datos de mensajería <strong>no se comparten con terceros no autorizados</strong> ni se utilizan para segmentación publicitaria.</li>` |
| 193 | JSX Text | `no se comparten con terceros no autorizados` | `<li>Los datos de mensajería <strong>no se comparten con terceros no autorizados</strong> ni se utilizan para segmentación publicitaria.</li>` |
| 193 | JSX Text | `ni se utilizan para segmentación publicitaria.` | `<li>Los datos de mensajería <strong>no se comparten con terceros no autorizados</strong> ni se utilizan para segmentación publicitaria.</li>` |
| 194 | JSX Text | `Los usuarios finales pueden solicitar en cualquier momento que el negocio deje de contactarles vía WhatsApp respondiendo` | `<li>Los usuarios finales pueden solicitar en cualquier momento que el negocio deje de contactarles vía WhatsApp respondiendo <strong>STOP</strong> o contactando directamente al negocio.</li>` |
| 194 | JSX Text | `o contactando directamente al negocio.` | `<li>Los usuarios finales pueden solicitar en cualquier momento que el negocio deje de contactarles vía WhatsApp respondiendo <strong>STOP</strong> o contactando directamente al negocio.</li>` |
| 195 | JSX Text | `SFFALCON actúa como` | `<li>SFFALCON actúa como <strong>proveedor de soluciones tecnológicas (BSP)</strong> y no es el originador de los mensajes comerciales: el responsable final ante el usuario es el negocio que contrata el servicio.</li>` |
| 195 | JSX Text | `proveedor de soluciones tecnológicas (BSP)` | `<li>SFFALCON actúa como <strong>proveedor de soluciones tecnológicas (BSP)</strong> y no es el originador de los mensajes comerciales: el responsable final ante el usuario es el negocio que contrata el servicio.</li>` |
| 195 | JSX Text | `y no es el originador de los mensajes comerciales: el responsable final ante el usuario es el negocio que contrata el servicio.` | `<li>SFFALCON actúa como <strong>proveedor de soluciones tecnológicas (BSP)</strong> y no es el originador de los mensajes comerciales: el responsable final ante el usuario es el negocio que contrata el servicio.</li>` |
| 196 | JSX Text | `Meta puede procesar datos de mensajería conforme a su propia` | `<li>Meta puede procesar datos de mensajería conforme a su propia <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>Política de Privacidad</a>.</li>` |
| 196 | JSX Text | `Política de Privacidad` | `<li>Meta puede procesar datos de mensajería conforme a su propia <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>Política de Privacidad</a>.</li>` |
| 203 | JSX Text | `7. Transferencias internacionales de datos` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>7. Transferencias internacionales de datos</h2>` |
| 205 | JSX Text | `Algunos de nuestros proveedores de servicio pueden procesar datos fuera de la UE:` | `<p>Algunos de nuestros proveedores de servicio pueden procesar datos fuera de la UE:</p>` |
| 207 | JSX Text | `(EE. UU.) — API de WhatsApp Business, sujeta al Data Privacy Framework UE-EE. UU.` | `<li><strong>Meta Platforms, Inc.</strong> (EE. UU.) — API de WhatsApp Business, sujeta al Data Privacy Framework UE-EE. UU.</li>` |
| 208 | JSX Text | `(EE. UU.) — procesamiento de IA (modelos LLaMA). Datos tratados conforme a las políticas de Groq Cloud.` | `<li><strong>Groq, Inc.</strong> (EE. UU.) — procesamiento de IA (modelos LLaMA). Datos tratados conforme a las políticas de Groq Cloud.</li>` |
| 209 | JSX Text | `(EE. UU.) — pagos, bajo cláusulas contractuales tipo aprobadas por la Comisión Europea.` | `<li><strong>Stripe, Inc.</strong> (EE. UU.) — pagos, bajo cláusulas contractuales tipo aprobadas por la Comisión Europea.</li>` |
| 210 | JSX Text | `— almacenamiento de datos, con opción de servidores en la Unión Europea.` | `<li><strong>Supabase, Inc.</strong> — almacenamiento de datos, con opción de servidores en la Unión Europea.</li>` |
| 211 | JSX Text | `(EE. UU.) — envío de correos transaccionales.` | `<li><strong>Resend, Inc.</strong> (EE. UU.) — envío de correos transaccionales.</li>` |
| 213 | JSX Text | `En todos los casos exigimos que los proveedores mantengan niveles de protección equivalentes a los exigidos por el RGPD.` | `<p>En todos los casos exigimos que los proveedores mantengan niveles de protección equivalentes a los exigidos por el RGPD.</p>` |
| 219 | JSX Text | `8. Conservación de datos` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>8. Conservación de datos</h2>` |
| 222 | JSX Text | `Datos de cuenta:` | `<li><strong>Datos de cuenta:</strong> durante la vigencia de la suscripción y hasta que solicite su supresión</li>` |
| 222 | JSX Text | `durante la vigencia de la suscripción y hasta que solicite su supresión` | `<li><strong>Datos de cuenta:</strong> durante la vigencia de la suscripción y hasta que solicite su supresión</li>` |
| 223 | JSX Text | `Mensajes de WhatsApp:` | `<li><strong>Mensajes de WhatsApp:</strong> máximo 12 meses desde la última interacción, salvo obligación legal</li>` |
| 223 | JSX Text | `máximo 12 meses desde la última interacción, salvo obligación legal` | `<li><strong>Mensajes de WhatsApp:</strong> máximo 12 meses desde la última interacción, salvo obligación legal</li>` |
| 224 | JSX Text | `Datos de facturación:` | `<li><strong>Datos de facturación:</strong> durante los plazos exigidos por la normativa fiscal española (generalmente 5 años)</li>` |
| 224 | JSX Text | `durante los plazos exigidos por la normativa fiscal española (generalmente 5 años)` | `<li><strong>Datos de facturación:</strong> durante los plazos exigidos por la normativa fiscal española (generalmente 5 años)</li>` |
| 226 | JSX Text | `Transcurridos dichos plazos, los datos serán eliminados o anonimizados de forma segura.` | `<p>Transcurridos dichos plazos, los datos serán eliminados o anonimizados de forma segura.</p>` |
| 232 | JSX Text | `9. No venta ni uso comercial de datos` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>9. No venta ni uso comercial de datos</h2>` |
| 234 | JSX Text | `no vende, alquila ni cede` | `SFFALCON <strong>no vende, alquila ni cede</strong> datos personales de sus usuarios a terceros con fines` |
| 243 | JSX Text | `10. Derechos del usuario` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>10. Derechos del usuario</h2>` |
| 245 | JSX Text | `Conforme al RGPD, usted tiene derecho a:` | `<p>Conforme al RGPD, usted tiene derecho a:</p>` |
| 247 | JSX Text | `conocer qué datos tratamos sobre usted` | `<li><strong>Acceso:</strong> conocer qué datos tratamos sobre usted</li>` |
| 248 | JSX Text | `Rectificación:` | `<li><strong>Rectificación:</strong> corregir datos inexactos o incompletos</li>` |
| 248 | JSX Text | `corregir datos inexactos o incompletos` | `<li><strong>Rectificación:</strong> corregir datos inexactos o incompletos</li>` |
| 249 | JSX Text | `Supresión ("derecho al olvido"):` | `<li><strong>Supresión ("derecho al olvido"):</strong> solicitar la eliminación de sus datos</li>` |
| 249 | JSX Text | `solicitar la eliminación de sus datos` | `<li><strong>Supresión ("derecho al olvido"):</strong> solicitar la eliminación de sus datos</li>` |
| 249 | String Literal | `derecho al olvido` | `<li><strong>Supresión ("derecho al olvido"):</strong> solicitar la eliminación de sus datos</li>` |
| 250 | JSX Text | `Oposición:` | `<li><strong>Oposición:</strong> oponerse al tratamiento en determinadas circunstancias</li>` |
| 250 | JSX Text | `oponerse al tratamiento en determinadas circunstancias` | `<li><strong>Oposición:</strong> oponerse al tratamiento en determinadas circunstancias</li>` |
| 251 | JSX Text | `recibir sus datos en formato estructurado y de uso común` | `<li><strong>Portabilidad:</strong> recibir sus datos en formato estructurado y de uso común</li>` |
| 252 | JSX Text | `Limitación:` | `<li><strong>Limitación:</strong> solicitar que suspendamos el tratamiento en ciertos supuestos</li>` |
| 252 | JSX Text | `solicitar que suspendamos el tratamiento en ciertos supuestos` | `<li><strong>Limitación:</strong> solicitar que suspendamos el tratamiento en ciertos supuestos</li>` |
| 269 | JSX Text | `11. Seguridad de los datos` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>11. Seguridad de los datos</h2>` |
| 289 | JSX Text | `13. Menores de edad` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>13. Menores de edad</h2>` |
| 300 | JSX Text | `14. Cambios en esta política` | `<h2 style={{ color: '#818CF8', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>14. Cambios en esta política</h2>` |
| 313 | JSX Text | `Para cualquier consulta, solicitud o reclamación relacionada con el tratamiento de sus datos:` | `<p>Para cualquier consulta, solicitud o reclamación relacionada con el tratamiento de sus datos:</p>` |
| 316 | JSX Text | `Teléfono:` | `<li>Teléfono: <a href="tel:+34604989742" style={{ color: '#818CF8' }}>+34 604 989 742</a></li>` |
| 318 | JSX Text | `Aplicación:` | `<li>Aplicación: <a href="https://app.sffalcon.com" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>app.sffalcon.com</a></li>` |
| 320 | JSX Text | `Nos comprometemos a responder en un plazo máximo de 72 horas laborables.` | `<p>Nos comprometemos a responder en un plazo máximo de 72 horas laborables.</p>` |

---

### 📄 [`src\app\unauthorized\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/unauthorized/page.tsx)
- **Cantidad de textos hardcodeados:** 2
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 19 | String Literal | `max-w-md w-full text-center space-y-8` | `<div className="max-w-md w-full text-center space-y-8">` |
| 29 | String Literal | `space-y-3` | `<div className="space-y-3">` |

---

### 📄 [`src\components\auth\LoginForm.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/auth/LoginForm.tsx)
- **Cantidad de textos hardcodeados:** 16
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 20 | String Literal | `error` | `const [status, setStatus] = useState<"idle" \| "loading" \| "error" \| "success">("idle");` |
| 32 | String Literal | `El correo electrónico no es válido` | `setEmailError("El correo electrónico no es válido");` |
| 37 | String Literal | `Introduce tu contraseña` | `setPasswordError("Introduce tu contraseña");` |
| 40 | String Literal | `La contraseña debe tener mínimo 6 caracteres` | `setPasswordError("La contraseña debe tener mínimo 6 caracteres");` |
| 52 | String Literal | `El correo electrónico no es válido` | `setEmailError('El correo electrónico no es válido');` |
| 57 | String Literal | `La contraseña debe tener mínimo 6 caracteres` | `setPasswordError('La contraseña debe tener mínimo 6 caracteres');` |
| 74 | String Literal | `error` | `setStatus("error");` |
| 104 | String Literal | `space-y-6` | `<form onSubmit={handleLogin} className="space-y-6">` |
| 106 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 107 | JSX Text | `Correo electrónico` | `<label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1 opacity-70">Correo electrónico</label>` |
| 116 | String Literal | `error` | `className={`w-full bg-white/60 border ${emailError \|\| status === 'error' ? 'border-red-500/50' : 'border-slate-200/60'} focus:border-blue-500 focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm`}` |
| 119 | String Literal | `error` | `{(emailError \|\| (status === 'error' && !passwordError)) && (` |
| 128 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 129 | JSX Text | `Contraseña` | `<label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1 opacity-70">Contraseña</label>` |
| 138 | String Literal | `error` | `className={`w-full bg-white/60 border ${passwordError \|\| status === 'error' ? 'border-red-500/50' : 'border-slate-200/60'} focus:border-blue-500 focus:bg-white rounded-2xl py-3.5 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm`}` |
| 194 | String Literal | `Iniciar Sesión` | `"Iniciar Sesión"` |

---

### 📄 [`src\components\dashboard\agents\AgentCard.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/agents/AgentCard.tsx)
- **Cantidad de textos hardcodeados:** 2
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 67 | String Literal | `mt-8 space-y-4 pt-6 border-t border-slate-50 dark:border-[#1E3A5F]` | `<div className="mt-8 space-y-4 pt-6 border-t border-slate-50 dark:border-[#1E3A5F]">` |
| 69 | JSX Text | `Última ejecución` | `<span>Última ejecución</span>` |

---

### 📄 [`src\components\dashboard\agents\CaptacionAgent.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/agents/CaptacionAgent.tsx)
- **Cantidad de textos hardcodeados:** 19
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 25 | String Literal | `Captación` | `onAddLog({ agent: 'Captación', action: 'Inicio', result: 'Analizando comunicaciones...' });` |
| 25 | String Literal | `Inicio` | `onAddLog({ agent: 'Captación', action: 'Inicio', result: 'Analizando comunicaciones...' });` |
| 37 | String Literal | `Captación` | `onAddLog({ agent: 'Captación', action: 'Finalizado', result: 'Sin mensajes pendientes.' });` |
| 38 | Toast/Alert (toast.success) | `No hay mensajes pendientes para analizar.` | `toast.success('No hay mensajes pendientes para analizar.');` |
| 42 | String Literal | `Captación` | `onAddLog({ agent: 'Captación', action: 'Procesando', result: `Detectadas ${comms.length} conversaciones.` });` |
| 64 | String Literal | `Captación` | `agent: 'Captación',` |
| 65 | String Literal | `Cualificación de Contacto` | `action: 'Cualificación de Contacto',` |
| 71 | String Literal | `Captación` | `agent: 'Captación',` |
| 82 | String Literal | `Captación` | `onAddLog({ agent: 'Captación', action: 'Error', result: `Fallo al parsear respuesta para ${conv.contact_name}` });` |
| 82 | String Literal | `Error` | `onAddLog({ agent: 'Captación', action: 'Error', result: `Fallo al parsear respuesta para ${conv.contact_name}` });` |
| 88 | String Literal | `Captación` | `onAddLog({ agent: 'Captación', action: 'Completado', result: 'Análisis de captación finalizado con éxito.' });` |
| 88 | String Literal | `Completado` | `onAddLog({ agent: 'Captación', action: 'Completado', result: 'Análisis de captación finalizado con éxito.' });` |
| 89 | Toast/Alert (toast.success) | `Agente de Captación finalizado.` | `toast.success('Agente de Captación finalizado.');` |
| 93 | String Literal | `Captación` | `onAddLog({ agent: 'Captación', action: 'Error Crítico', result: 'Fallo en la ejecución del agente.' });` |
| 93 | String Literal | `Error Crítico` | `onAddLog({ agent: 'Captación', action: 'Error Crítico', result: 'Fallo en la ejecución del agente.' });` |
| 94 | Toast/Alert (toast.error) | `Error al ejecutar Agente de Captación` | `toast.error('Error al ejecutar Agente de Captación');` |
| 104 | Prop (title) | `Dinamizador de eventos` | `title="Dinamizador de eventos"` |
| 105 | Prop (description) | `Atrae y fideliza a tu público objetivo a través de campañas inteligentes y segmentación avanzada.` | `description="Atrae y fideliza a tu público objetivo a través de campañas inteligentes y segmentación avanzada."` |
| 110 | Toast/Alert (toast.success) | `Configuración de Captación abierta` | `onConfigure={() => toast.success('Configuración de Captación abierta')}` |

---

### 📄 [`src\components\dashboard\agents\ContableAgent.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/agents/ContableAgent.tsx)
- **Cantidad de textos hardcodeados:** 8
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 27 | String Literal | `Inicio` | `onAddLog({ agent: 'Contable', action: 'Inicio', result: 'Analizando datos financieros y normativa fiscal...' });` |
| 48 | String Literal | `Error` | `onAddLog({ agent: 'Contable', action: 'Error', result: 'Fallo al generar informe contable.' });` |
| 55 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 59 | Prop (title) | `Agente de Fidelización` | `title="Agente de Fidelización"` |
| 60 | Prop (description) | `Analiza la recurrencia de tus clientes y sugiere campañas de fidelización, bonos y promociones para aumentar el valor de vida del cliente.` | `description="Analiza la recurrencia de tus clientes y sugiere campañas de fidelización, bonos y promociones para aumentar el valor de vida del cliente."` |
| 65 | Toast/Alert (toast.success) | `Configuración de Contable abierta` | `onConfigure={() => toast.success('Configuración de Contable abierta')}` |
| 72 | JSX Text | `Informe Mensual de Gestoría` | `<h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Informe Mensual de Gestoría</h4>` |
| 85 | Toast/Alert (toast.success) | `Descarga de PDF iniciada (Demo)` | `onClick={() => toast.success('Descarga de PDF iniciada (Demo)')}` |

---

### 📄 [`src\components\dashboard\agents\SeguimientoAgent.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/agents/SeguimientoAgent.tsx)
- **Cantidad de textos hardcodeados:** 11
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 27 | String Literal | `Inicio` | `onAddLog({ agent: 'Seguimiento', action: 'Inicio', result: 'Buscando clientes inactivos...' });` |
| 42 | Toast/Alert (toast.success) | `No hay clientes inactivos para seguimiento.` | `toast.success('No hay clientes inactivos para seguimiento.');` |
| 78 | Toast/Alert (toast.success) | `Agente de Seguimiento finalizado.` | `toast.success('Agente de Seguimiento finalizado.');` |
| 82 | String Literal | `Error` | `onAddLog({ agent: 'Seguimiento', action: 'Error', result: 'Fallo en la ejecución del agente.' });` |
| 97 | Toast/Alert (toast.success) | `Cliente marcado como contactado` | `toast.success('Cliente marcado como contactado');` |
| 99 | Toast/Alert (toast.error) | `Error al actualizar cliente` | `toast.error('Error al actualizar cliente');` |
| 104 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 109 | Prop (description) | `Automatiza el seguimiento de preventa y posventa, asegurando que cada cliente reciba la atención que merece.` | `description="Automatiza el seguimiento de preventa y posventa, asegurando que cada cliente reciba la atención que merece."` |
| 114 | Toast/Alert (toast.success) | `Configuración de Seguimiento abierta` | `onConfigure={() => toast.success('Configuración de Seguimiento abierta')}` |
| 120 | JSX Text | `Sugerencias del Agente` | `<h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Sugerencias del Agente</h4>` |
| 143 | Prop (title) | `Marcar como contactado` | `title="Marcar como contactado"` |

---

### 📄 [`src\components\dashboard\agents\SyncAgent.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/agents/SyncAgent.tsx)
- **Cantidad de textos hardcodeados:** 9
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 31 | String Literal | `Conexión` | `onAddLog({ agent: 'Sync', action: 'Conexión', result: 'Iniciando sincronización multicanal...' });` |
| 43 | String Literal | `Completado` | `onAddLog({ agent: 'Sync', action: 'Completado', result: 'Todos los canales sincronizados correctamente.' });` |
| 44 | Toast/Alert (toast.success) | `Sincronización finalizada con éxito` | `toast.success('Sincronización finalizada con éxito');` |
| 48 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 53 | Prop (description) | `Gestiona tus canales de entrada (WhatsApp, Instagram, Email) para que nunca pierdas una consulta o reserva.` | `description="Gestiona tus canales de entrada (WhatsApp, Instagram, Email) para que nunca pierdas una consulta o reserva."` |
| 58 | Toast/Alert (toast.success) | `Configuración de Sync abierta` | `onConfigure={() => toast.success('Configuración de Sync abierta')}` |
| 71 | JSX Text | `Estado de Sincronización` | `<h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Estado de Sincronización</h4>` |
| 74 | JSX Text | `En curso` | `<span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">En curso</span>` |
| 101 | String Literal | `Pendiente` | `{isCurrent ? 'Actualizando...' : isPast ? 'Sincronizado' : 'Pendiente'}` |

---

### 📄 [`src\components\dashboard\agents\VoiceAgent.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/agents/VoiceAgent.tsx)
- **Cantidad de textos hardcodeados:** 6
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 20 | Prop (title) | `Agente de Voz` | `title="Agente de Voz"` |
| 21 | Prop (description) | `Atiende llamadas de clientes automáticamente, responde dudas y gestiona reservas mediante voz con inteligencia artificial humana.` | `description="Atiende llamadas de clientes automáticamente, responde dudas y gestiona reservas mediante voz con inteligencia artificial humana."` |
| 24 | String Literal | `Disponible próximamente` | `badge="Disponible próximamente"` |
| 25 | Toast/Alert (toast.error) | `Módulo en desarrollo` | `onToggle={() => toast.error('Módulo en desarrollo')}` |
| 26 | Toast/Alert (toast.error) | `Módulo en desarrollo` | `onConfigure={() => toast.error('Módulo en desarrollo')}` |
| 27 | Toast/Alert (toast.error) | `Módulo en desarrollo` | `onRun={() => toast.error('Módulo en desarrollo')}` |

---

### 📄 [`src\components\dashboard\AIAssistant.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/AIAssistant.tsx)
- **Cantidad de textos hardcodeados:** 4
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 20 | String Literal | `¿En qué puedo ayudarte con tu negocio?` | `content: '¿En qué puedo ayudarte con tu negocio?'` |
| 79 | String Literal | `¿En qué puedo ayudarte con tu negocio?` | `setMessages([{ role: 'assistant', content: '¿En qué puedo ayudarte con tu negocio?' }]);` |
| 131 | String Literal | `¿En qué te puedo ayudar?` | `setMessages([{ role: 'assistant', content: '¿En qué te puedo ayudar?' }]);` |
| 143 | String Literal | `overflow-y-auto p-4 space-y-3` | `<div className="overflow-y-auto p-4 space-y-3" style={{ minHeight: '280px', maxHeight: '320px' }}>` |

---

### 📄 [`src\components\dashboard\appointments\AIAppointmentButton.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/appointments/AIAppointmentButton.tsx)
- **Cantidad de textos hardcodeados:** 6
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 25 | Toast/Alert (toast.error) | `No hay mensajes en la conversación` | `toast.error("No hay mensajes en la conversación");` |
| 46 | String Literal | `Error al consultar la IA` | `if (!res.ok) throw new Error("Error al consultar la IA");` |
| 56 | Toast/Alert (toast.error) | `No se detectó una fecha u hora clara en la conversación` | `toast.error("No se detectó una fecha u hora clara en la conversación");` |
| 66 | String Literal | `Error parseando respuesta IA:` | `console.error("Error parseando respuesta IA:", aiResponse);` |
| 67 | Toast/Alert (toast.error) | `La IA no devolvió un formato válido` | `toast.error("La IA no devolvió un formato válido");` |
| 91 | JSX Text | `Crear cita con IA` | `<span>Crear cita con IA</span>` |

---

### 📄 [`src\components\dashboard\appointments\AppointmentsAnalytics.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/appointments/AppointmentsAnalytics.tsx)
- **Cantidad de textos hardcodeados:** 8
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 97 | String Literal | `space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700` | `<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">` |
| 108 | JSX Text | `Total Este Mes` | `<p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Este Mes</p>` |
| 124 | JSX Text | `Ratio de Asistencia / Cumplimiento` | `<p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Ratio de Asistencia / Cumplimiento</p>` |
| 157 | JSX Text | `Estado Global` | `<h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Estado Global</h3>` |
| 158 | JSX Text | `DISTRIBUCIÓN POR ESTADO` | `<p className="text-[10px] font-bold text-slate-400 mt-1">DISTRIBUCIÓN POR ESTADO</p>` |
| 225 | JSX Text | `Picos de Actividad` | `<h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Picos de Actividad</h3>` |
| 226 | JSX Text | `VOLUMEN POR HORA DEL DÍA` | `<p className="text-[10px] font-bold text-slate-400 mt-1">VOLUMEN POR HORA DEL DÍA</p>` |
| 244 | String Literal | `hora` | `dataKey="hora"` |

---

### 📄 [`src\components\dashboard\Card.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/Card.tsx)
- **Cantidad de textos hardcodeados:** 4
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 9 | String Literal | `clientes` | `category?: 'clientes' \| 'agenda' \| 'mensajes' \| 'finanzas' \| 'facturas' \| 'trabajos' \| 'proyectos' \| 'ia' \| 'asistente' \| 'resumen' \| 'stats';` |
| 9 | String Literal | `mensajes` | `category?: 'clientes' \| 'agenda' \| 'mensajes' \| 'finanzas' \| 'facturas' \| 'trabajos' \| 'proyectos' \| 'ia' \| 'asistente' \| 'resumen' \| 'stats';` |
| 9 | String Literal | `facturas` | `category?: 'clientes' \| 'agenda' \| 'mensajes' \| 'finanzas' \| 'facturas' \| 'trabajos' \| 'proyectos' \| 'ia' \| 'asistente' \| 'resumen' \| 'stats';` |
| 9 | String Literal | `proyectos` | `category?: 'clientes' \| 'agenda' \| 'mensajes' \| 'finanzas' \| 'facturas' \| 'trabajos' \| 'proyectos' \| 'ia' \| 'asistente' \| 'resumen' \| 'stats';` |

---

### 📄 [`src\components\dashboard\clients\ClientModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/clients/ClientModal.tsx)
- **Cantidad de textos hardcodeados:** 30
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 15 | String Literal | `Cliente nuevo` | `'Cliente nuevo',` |
| 23 | String Literal | `Paciente crónico` | `'Paciente crónico',` |
| 26 | String Literal | `Revisión` | `'Revisión',` |
| 30 | String Literal | `Cliente nuevo` | `'Cliente nuevo',` |
| 54 | String Literal | `nuevo` | `status: 'nuevo',` |
| 70 | String Literal | `nuevo` | `status: 'nuevo',` |
| 81 | Toast/Alert (toast.error) | `El nombre es obligatorio` | `if (!formData.name) return toast.error('El nombre es obligatorio');` |
| 86 | String Literal | `No se encontró el usuario` | `if (!user) throw new Error('No se encontró el usuario');` |
| 116 | Toast/Alert (toast.success) | `Contacto añadido` | `toast.success('Contacto añadido');` |
| 122 | String Literal | `Error al guardar` | `const msg = error instanceof Error ? error.message : 'Error al guardar';` |
| 139 | String Literal | `Editar Contacto` | `{editClient ? 'Editar Contacto' : 'Nuevo Contacto'}` |
| 139 | String Literal | `Nuevo Contacto` | `{editClient ? 'Editar Contacto' : 'Nuevo Contacto'}` |
| 151 | String Literal | `flex-1 overflow-y-auto p-5 md:p-8 space-y-6` | `<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">` |
| 154 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 155 | JSX Text | `NOMBRE COMPLETO*` | `<label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">NOMBRE COMPLETO*</label>` |
| 164 | Prop (placeholder) | `Ej. Juan Pérez` | `placeholder="Ej. Juan Pérez"` |
| 170 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 185 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 186 | JSX Text | `TELÉFONO` | `<label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">TELÉFONO</label>` |
| 200 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 201 | JSX Text | `ESTADO` | `<label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">ESTADO</label>` |
| 204 | String Literal | `nuevo` | `value={formData.status \|\| 'nuevo'}` |
| 208 | JSX Text | `Nuevo` | `<option value="nuevo" className="bg-[#111F3A] text-white">Nuevo</option>` |
| 208 | String Literal | `nuevo` | `<option value="nuevo" className="bg-[#111F3A] text-white">Nuevo</option>` |
| 211 | JSX Text | `Inactivo` | `<option value="inactivo" className="bg-[#111F3A] text-white">Inactivo</option>` |
| 211 | String Literal | `inactivo` | `<option value="inactivo" className="bg-[#111F3A] text-white">Inactivo</option>` |
| 219 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 220 | JSX Text | `NOTAS Y OBSERVACIONES` | `<label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">NOTAS Y OBSERVACIONES</label>` |
| 227 | Prop (placeholder) | `Detalles relevantes del contacto...` | `placeholder="Detalles relevantes del contacto..."` |
| 250 | String Literal | `Guardar Contacto` | `{loading ? 'Guardando...' : (editClient ? 'Actualizar Contacto' : 'Guardar Contacto')}` |

---

### 📄 [`src\components\dashboard\clients\ClientsAnalytics.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/clients/ClientsAnalytics.tsx)
- **Cantidad de textos hardcodeados:** 7
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 49 | String Literal | `nuevo` | `const s = curr.status \|\| 'nuevo';` |
| 81 | String Literal | `space-y-8 animate-in fade-in duration-500` | `<div className="space-y-8 animate-in fade-in duration-500">` |
| 89 | JSX Text | `Volumen Total` | `<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Volumen Total</p>` |
| 130 | JSX Text | `Curva de Adquisición` | `<h3 className="text-base font-bold text-slate-900 dark:text-white">Curva de Adquisición</h3>` |
| 133 | JSX Text | `ÚLTIMOS 6 MESES` | `<option>ÚLTIMOS 6 MESES</option>` |
| 134 | JSX Text | `ESTE AÑO` | `<option>ESTE AÑO</option>` |
| 186 | JSX Text | `Salud del Pipeline` | `<h3 className="text-base font-bold text-slate-900 dark:text-white">Salud del Pipeline</h3>` |

---

### 📄 [`src\components\dashboard\clients\ClientsList.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/clients/ClientsList.tsx)
- **Cantidad de textos hardcodeados:** 23
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 19 | String Literal | `Todos` | `const [statusFilter, setStatusFilter] = useState('Todos');` |
| 28 | String Literal | `Todos` | `const matchesStatus = statusFilter === 'Todos' \|\| statusVal === statusFilter.toLowerCase();` |
| 36 | String Literal | `activo` | `case 'activo': return "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";` |
| 38 | String Literal | `inactivo` | `case 'inactivo': return "bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-400/10 dark:text-slate-400 dark:border-slate-500/20";` |
| 50 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 57 | Prop (placeholder) | `Buscar por nombre, email o empresa...` | `placeholder="Buscar por nombre, email o empresa..."` |
| 64 | String Literal | `Todos` | `{(grupo === 2 ? ['Todos', 'Nuevo', 'En tratamiento', 'Alta'] : (grupo === 1 ? ['Todos', 'Activo', 'Inactivo'] : ['Todos', 'Contacto', 'Potencial', 'Activo', 'Inactivo'])).map((st) => (` |
| 64 | String Literal | `Nuevo` | `{(grupo === 2 ? ['Todos', 'Nuevo', 'En tratamiento', 'Alta'] : (grupo === 1 ? ['Todos', 'Activo', 'Inactivo'] : ['Todos', 'Contacto', 'Potencial', 'Activo', 'Inactivo'])).map((st) => (` |
| 64 | String Literal | `En tratamiento` | `{(grupo === 2 ? ['Todos', 'Nuevo', 'En tratamiento', 'Alta'] : (grupo === 1 ? ['Todos', 'Activo', 'Inactivo'] : ['Todos', 'Contacto', 'Potencial', 'Activo', 'Inactivo'])).map((st) => (` |
| 64 | String Literal | `Activo` | `{(grupo === 2 ? ['Todos', 'Nuevo', 'En tratamiento', 'Alta'] : (grupo === 1 ? ['Todos', 'Activo', 'Inactivo'] : ['Todos', 'Contacto', 'Potencial', 'Activo', 'Inactivo'])).map((st) => (` |
| 64 | String Literal | `Inactivo` | `{(grupo === 2 ? ['Todos', 'Nuevo', 'En tratamiento', 'Alta'] : (grupo === 1 ? ['Todos', 'Activo', 'Inactivo'] : ['Todos', 'Contacto', 'Potencial', 'Activo', 'Inactivo'])).map((st) => (` |
| 90 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 103 | String Literal | `NUEVO` | `{(client.status \|\| 'NUEVO').toUpperCase()}` |
| 108 | String Literal | `NUEVO` | `{(client.status \|\| 'NUEVO').toUpperCase()}` |
| 123 | String Literal | `NUEVO` | `{client.status === 'lead' ? 'CONTACTO' : (client.status \|\| 'NUEVO')}` |
| 130 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 137 | String Literal | `space-y-1 text-right` | `<div className="space-y-1 text-right">` |
| 150 | String Literal | `Pendiente` | `{client.last_contact ? new Date(client.last_contact).toLocaleDateString() : 'Pendiente'}` |
| 163 | Prop (title) | `Editar` | `title="Editar"` |
| 170 | Prop (title) | `Eliminar` | `title="Eliminar"` |
| 184 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 185 | JSX Text | `Empieza tu catálogo` | `<h3 className="text-xl font-bold text-slate-900 dark:text-white">Empieza tu catálogo</h3>` |
| 186 | JSX Text | `No hay clientes que coincidan con tu búsqueda. Añade uno nuevo para empezar a gestionar.` | `<p className="text-slate-500 dark:text-slate-400 max-w-sm">No hay clientes que coincidan con tu búsqueda. Añade uno nuevo para empezar a gestionar.</p>` |

---

### 📄 [`src\components\dashboard\clients\ClientsPipeline.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/clients/ClientsPipeline.tsx)
- **Cantidad de textos hardcodeados:** 13
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 31 | String Literal | `EN NEGOCIACIÓN` | `{ id: 'potencial', title: 'EN NEGOCIACIÓN', color: '#F59E0B' },` |
| 32 | String Literal | `activo` | `{ id: 'activo', title: 'CLIENTES ACTIVOS', color: '#10B981' },` |
| 32 | String Literal | `CLIENTES ACTIVOS` | `{ id: 'activo', title: 'CLIENTES ACTIVOS', color: '#10B981' },` |
| 33 | String Literal | `inactivo` | `{ id: 'inactivo', title: 'CERRADOS / PAUSA', color: '#64748B' },` |
| 95 | Toast/Alert (toast.success) | `Movido a ${newStatus.toUpperCase()}` | `toast.success(`Movido a ${newStatus.toUpperCase()}`);` |
| 98 | Toast/Alert (toast.error) | `Error al mover cliente` | `toast.error('Error al mover cliente');` |
| 108 | String Literal | `Pendiente` | `if (!dateStr) return 'Pendiente';` |
| 112 | String Literal | `Próximamente` | `if (diff < 0) return 'Próximamente';` |
| 120 | String Literal | `space-y-8 animate-in fade-in duration-500` | `<div className="space-y-8 animate-in fade-in duration-500">` |
| 128 | JSX Text | `Valor en Pipeline` | `<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor en Pipeline</p>` |
| 137 | JSX Text | `Clientes Activos` | `<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Clientes Activos</p>` |
| 146 | JSX Text | `Tasa Conversión` | `<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tasa Conversión</p>` |
| 201 | String Literal | `space-y-4` | `<div className="space-y-4">` |

---

### 📄 [`src\components\dashboard\clients\ClientsSidebar.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/clients/ClientsSidebar.tsx)
- **Cantidad de textos hardcodeados:** 8
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 30 | String Literal | `ACTIVO` | `activo: 'ACTIVO',` |
| 31 | String Literal | `INACTIVO` | `inactivo: 'INACTIVO'` |
| 48 | String Literal | `space-y-6 lg:sticky lg:top-24` | `<div className="space-y-6 lg:sticky lg:top-24">` |
| 66 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 69 | Prop (label) | `Proyección Pipeline` | `label="Proyección Pipeline"` |
| 91 | String Literal | `space-y-5` | `<div className="space-y-5">` |
| 122 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 152 | JSX Text | `Sin registros recientes` | `<p className="text-[10px] font-bold text-slate-400 uppercase">Sin registros recientes</p>` |

---

### 📄 [`src\components\dashboard\communications\QuickReplies.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/communications/QuickReplies.tsx)
- **Cantidad de textos hardcodeados:** 7
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 30 | String Literal | `Título de la respuesta rápida:` | `const title = window.prompt("Título de la respuesta rápida:");` |
| 31 | String Literal | `Contenido de la respuesta:` | `const content = window.prompt("Contenido de la respuesta:");` |
| 48 | Toast/Alert (toast.error) | `Error al añadir respuesta` | `toast.error("Error al añadir respuesta");` |
| 50 | Toast/Alert (toast.success) | `Respuesta añadida` | `toast.success("Respuesta añadida");` |
| 56 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 68 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 74 | JSX Text | `No hay respuestas guardadas` | `<p className="text-[10px] text-center text-[#94A3B8] py-4 italic">No hay respuestas guardadas</p>` |

---

### 📄 [`src\components\dashboard\finances\categories.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/finances/categories.ts)
- **Cantidad de textos hardcodeados:** 5
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 2 | String Literal | `Ventas` | `"Ventas",` |
| 4 | String Literal | `Proyectos` | `"Proyectos",` |
| 7 | String Literal | `Consultoría` | `"Consultoría",` |
| 9 | String Literal | `Otros ingresos` | `"Otros ingresos"` |
| 22 | String Literal | `Otros gastos` | `"Otros gastos"` |

---

### 📄 [`src\components\dashboard\finances-business\BusinessDonutChart.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/finances-business/BusinessDonutChart.tsx)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 86 | String Literal | `w-full max-w-[320px] space-y-4` | `<div className="w-full max-w-[320px] space-y-4">` |

---

### 📄 [`src\components\dashboard\finances-business\BusinessSummaryCards.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/finances-business/BusinessSummaryCards.tsx)
- **Cantidad de textos hardcodeados:** 4
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 26 | String Literal | `INGRESOS CLIENTES` | `label: "INGRESOS CLIENTES",` |
| 28 | String Literal | `Facturado este mes` | `subtext: "Facturado este mes",` |
| 35 | String Literal | `GASTOS OPERATIVOS` | `label: "GASTOS OPERATIVOS",` |
| 37 | String Literal | `Costes del negocio` | `subtext: "Costes del negocio",` |

---

### 📄 [`src\components\dashboard\finances-business\BusinessTable.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/finances-business/BusinessTable.tsx)
- **Cantidad de textos hardcodeados:** 14
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 107 | Toast/Alert (toast.error) | `Introduce un concepto` | `if (!concept) { toast.error("Introduce un concepto"); return; }` |
| 108 | Toast/Alert (toast.error) | `Importe inválido` | `if (!Number.isFinite(amountNumber) \|\| amountNumber <= 0) { toast.error("Importe inválido"); return; }` |
| 127 | Toast/Alert (toast.error) | `Error al añadir entrada` | `if (error \|\| !data) { toast.error("Error al añadir entrada"); setSavingNew(false); return; }` |
| 143 | Toast/Alert (toast.success) | `Entrada añadida` | `toast.success("Entrada añadida");` |
| 151 | Toast/Alert (toast.error) | `Importe inválido` | `if (!Number.isFinite(next)) { toast.error("Importe inválido"); return; }` |
| 162 | Toast/Alert (toast.error) | `Error al actualizar` | `toast.error("Error al actualizar");` |
| 168 | Toast/Alert (confirm) | `¿Eliminar ${entry.concept}?` | `if (!window.confirm(`¿Eliminar ${entry.concept}?`)) return;` |
| 172 | Toast/Alert (toast.error) | `Error al eliminar` | `if (error) { onEntriesChange(prev); toast.error("Error al eliminar"); return; }` |
| 189 | String Literal | `TIPO` | `{["CONCEPTO", "TIPO", "CLIENTE", "IMPORTE", "ACCIONES"].map(h => (` |
| 196 | String Literal | `divide-y divide-slate-50 dark:divide-[#1E3A5F]` | `<tbody className="divide-y divide-slate-50 dark:divide-[#1E3A5F]">` |
| 205 | JSX Text | `Sin entradas para este mes` | `<p className="text-slate-500 text-sm">Sin entradas para este mes</p>` |
| 206 | JSX Text | `Pulsa + Añadir entrada para comenzar` | `<p className="text-slate-400 text-xs mt-1">Pulsa + Añadir entrada para comenzar</p>` |
| 296 | String Literal | `lg:hidden space-y-3` | `<div className="lg:hidden space-y-3">` |
| 314 | String Literal | `Confirmar` | `{savingNew ? "Guardando..." : "Confirmar"}` |

---

### 📄 [`src\components\dashboard\home\AsistenteAIAssistant.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/home/AsistenteAIAssistant.tsx)
- **Cantidad de textos hardcodeados:** 6
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 53 | String Literal | `¿En qué te puedo ayudar?` | `setMessages([{ role: 'assistant', content: '¿En qué te puedo ayudar?' }])` |
| 56 | String Literal | `¿En qué te puedo ayudar?` | `setMessages([{ role: 'assistant', content: '¿En qué te puedo ayudar?' }])` |
| 81 | String Literal | `¿En qué te puedo ayudar?` | `setMessages([{ role: 'assistant', content: '¿En qué te puedo ayudar?' }])` |
| 116 | String Literal | `Error en la respuesta` | `if (!response.ok) throw new Error('Error en la respuesta')` |
| 127 | String Literal | `AI Error:` | `console.error('AI Error:', error)` |
| 174 | Prop (placeholder) | `Pregunta lo que sea...` | `placeholder="Pregunta lo que sea..."` |

---

### 📄 [`src\components\dashboard\home\EvolutionChart.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/home/EvolutionChart.tsx)
- **Cantidad de textos hardcodeados:** 4
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 45 | Prop (label) | `Ingresos` | `<LegendItem color="#1B4FD8" label="Ingresos" />` |
| 46 | Prop (label) | `Gastos` | `<LegendItem color="#EF4444" label="Gastos" isDashed />` |
| 81 | String Literal | `ingresos` | `dataKey="ingresos"` |
| 89 | String Literal | `gastos` | `dataKey="gastos"` |

---

### 📄 [`src\components\dashboard\home\FalconAIAssistant.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/home/FalconAIAssistant.tsx)
- **Cantidad de textos hardcodeados:** 9
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 44 | String Literal | `Usuario` | `const name = userProfile.full_name \|\| authUser.user_metadata?.full_name \|\| authUser.email \|\| "Usuario"` |
| 45 | String Literal | `¿En qué te puedo ayudar?` | `setMessages([{ role: 'assistant', content: '¿En qué te puedo ayudar?' }])` |
| 48 | String Literal | `¿En qué te puedo ayudar?` | `setMessages([{ role: 'assistant', content: '¿En qué te puedo ayudar?' }])` |
| 96 | String Literal | `¿En qué te puedo ayudar?` | `setMessages([{ role: 'assistant', content: '¿En qué te puedo ayudar?' }])` |
| 125 | String Literal | `dashboard` | `context: 'dashboard',` |
| 137 | String Literal | `Error en la respuesta` | `if (!response.ok) throw new Error('Error en la respuesta')` |
| 138 | String Literal | `Cuerpo de respuesta vacío` | `if (!response.body) throw new Error('Cuerpo de respuesta vacío')` |
| 161 | String Literal | `AI Error:` | `console.error('AI Error:', error)` |
| 208 | Prop (placeholder) | `Pregunta lo que sea...` | `placeholder="Pregunta lo que sea..."` |

---

### 📄 [`src\components\dashboard\home\FinancialSummary.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/home/FinancialSummary.tsx)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 52 | String Literal | `divide-y divide-slate-50 dark:divide-[#1E3A5F]` | `<tbody className="divide-y divide-slate-50 dark:divide-[#1E3A5F]">` |

---

### 📄 [`src\components\dashboard\home\MetricCards.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/home/MetricCards.tsx)
- **Cantidad de textos hardcodeados:** 7
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 31 | String Literal | `BALANCE TOTAL` | `title: balanceLabel ?? "BALANCE TOTAL",` |
| 40 | String Literal | `INGRESOS ${currentMonthLabel}` | `title: `INGRESOS ${currentMonthLabel}`,` |
| 44 | String Literal | `Total ingresos` | `subtext: "Total ingresos",` |
| 49 | String Literal | `GASTOS ${currentMonthLabel}` | `title: `GASTOS ${currentMonthLabel}`,` |
| 53 | String Literal | `Total gastos` | `subtext: "Total gastos",` |
| 58 | String Literal | `NEGOCIO (NETO)` | `title: "NEGOCIO (NETO)",` |
| 62 | String Literal | `Resultado Negocio` | `subtext: "Resultado Negocio",` |

---

### 📄 [`src\components\dashboard\home\RecentComms.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/home/RecentComms.tsx)
- **Cantidad de textos hardcodeados:** 3
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 55 | String Literal | `space-y-3 md:space-y-5` | `<div className="space-y-3 md:space-y-5">` |
| 97 | String Literal | `Pendiente` | `? "Pendiente"` |
| 102 | String Literal | `Estado` | `: "Estado"}` |

---

### 📄 [`src\components\dashboard\invoices\InvoiceModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/invoices/InvoiceModal.tsx)
- **Cantidad de textos hardcodeados:** 25
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 64 | String Literal | `Error fetching dependencies:` | `console.error("Error fetching dependencies:", error);` |
| 106 | Toast/Alert (toast.error) | `Por favor completa los campos obligatorios` | `toast.error("Por favor completa los campos obligatorios");` |
| 141 | Toast/Alert (toast.error) | `Error al guardar la factura` | `toast.error("Error al guardar la factura");` |
| 155 | String Literal | `Nueva Factura` | `{invoiceToEdit ? `Editar Factura ${invoiceToEdit.invoice_number \|\| ''}` : "Nueva Factura"}` |
| 157 | JSX Text | `Configura los detalles de facturación para tu contacto.` | `<p className="hidden sm:block text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Configura los detalles de facturación para tu contacto.</p>` |
| 168 | String Literal | `flex-1 overflow-y-auto p-5 md:p-8` | `<div className="flex-1 overflow-y-auto p-5 md:p-8">` |
| 169 | String Literal | `space-y-6` | `<form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">` |
| 173 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 183 | JSX Text | `Selecciona un contacto...` | `<option value="" className="bg-[#111F3A] text-white">Selecciona un contacto...</option>` |
| 194 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 204 | JSX Text | `Ningún proyecto asignado` | `<option value="" className="bg-[#111F3A] text-white">Ningún proyecto asignado</option>` |
| 215 | String Literal | `space-y-2 md:col-span-2` | `<div className="space-y-2 md:col-span-2">` |
| 216 | JSX Text | `CONCEPTO DE FACTURACIÓN*` | `<label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">CONCEPTO DE FACTURACIÓN*</label>` |
| 227 | String Literal | `Ej: Diseño de página web corporativa` | `: (!hasProjects ? "Ej. Servicio realizado, Consulta, Tratamiento..." : "Ej: Diseño de página web corporativa")` |
| 235 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 254 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 269 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 270 | JSX Text | `TOTAL ESTIMADO (€)` | `<label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">TOTAL ESTIMADO (€)</label>` |
| 284 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 285 | JSX Text | `FECHA EMISIÓN*` | `<label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em] ml-1">FECHA EMISIÓN*</label>` |
| 299 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 314 | String Literal | `space-y-2 md:col-span-2` | `<div className="space-y-2 md:col-span-2">` |
| 322 | Prop (placeholder) | `Información de pago, comentarios internos...` | `placeholder="Información de pago, comentarios internos..."` |
| 357 | String Literal | `GUARDAR CAMBIOS` | `invoiceToEdit ? 'GUARDAR CAMBIOS' : 'CREAR FACTURA'` |
| 357 | String Literal | `CREAR FACTURA` | `invoiceToEdit ? 'GUARDAR CAMBIOS' : 'CREAR FACTURA'` |

---

### 📄 [`src\components\dashboard\invoices\InvoicePDF.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/invoices/InvoicePDF.ts)
- **Cantidad de textos hardcodeados:** 5
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 66 | String Literal | `Número: ${invoiceNum}` | `doc.text(`Número: ${invoiceNum}`, 145, 34);` |
| 76 | String Literal | `Facturar a:` | `doc.text("Facturar a:", 14, 62);` |
| 88 | String Literal | `Total` | `head: [['Concepto', 'Base Imponible', 'IVA (%)', 'Importe IVA', 'Total']],` |
| 113 | String Literal | `TOTAL FACTURA:` | `doc.text("TOTAL FACTURA:", 120, finalY + 15);` |
| 143 | String Literal | `Error generating PDF:` | `console.error("Error generating PDF:", error);` |

---

### 📄 [`src\components\dashboard\invoices\InvoicesAnalytics.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/invoices/InvoicesAnalytics.tsx)
- **Cantidad de textos hardcodeados:** 9
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 29 | String Literal | `pendiente` | `if (inv.status === 'pendiente') {` |
| 59 | String Literal | `pendiente` | `if (inv.status === 'pagada' \|\| inv.status === 'pendiente') {` |
| 64 | String Literal | `pendiente` | `if (inv.status === 'pendiente') target.Pendientes += Number(inv.total \|\| inv.total_amount \|\| 0);` |
| 73 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 81 | JSX Text | `Facturado este Año` | `<p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Facturado este Año</p>` |
| 93 | JSX Text | `Pendiente de Cobro` | `<p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Pendiente de Cobro</p>` |
| 105 | JSX Text | `Tiempo Medio de Pago` | `<p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Tiempo Medio de Pago</p>` |
| 107 | JSX Text | `días` | `{stats.avgPaymentDays} <span className="text-sm font-medium text-[#64748B]">días</span>` |
| 116 | JSX Text | `Facturación Mensual (Pagadas vs Pendientes)` | `<h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight mb-6">Facturación Mensual (Pagadas vs Pendientes)</h3>` |

---

### 📄 [`src\components\dashboard\modals\AddBusinessExpenseModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/modals/AddBusinessExpenseModal.tsx)
- **Cantidad de textos hardcodeados:** 23
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 16 | String Literal | `Enero` | `const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];` |
| 16 | String Literal | `Febrero` | `const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];` |
| 16 | String Literal | `Marzo` | `const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];` |
| 16 | String Literal | `Abril` | `const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];` |
| 16 | String Literal | `Mayo` | `const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];` |
| 16 | String Literal | `Junio` | `const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];` |
| 16 | String Literal | `Julio` | `const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];` |
| 16 | String Literal | `Agosto` | `const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];` |
| 16 | String Literal | `Septiembre` | `const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];` |
| 16 | String Literal | `Octubre` | `const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];` |
| 16 | String Literal | `Noviembre` | `const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];` |
| 16 | String Literal | `Diciembre` | `const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];` |
| 44 | String Literal | `El concepto no puede estar vacío` | `if (!concept.trim()) e.concept = 'El concepto no puede estar vacío';` |
| 46 | String Literal | `El importe debe ser mayor que 0` | `if (!amount.trim() \|\| isNaN(n) \|\| n <= 0) e.amount = 'El importe debe ser mayor que 0';` |
| 58 | Toast/Alert (toast.error) | `No autenticado` | `if (!user) { toast.error('No autenticado'); return; }` |
| 70 | Toast/Alert (toast.success) | `Gasto añadido correctamente` | `toast.success('Gasto añadido correctamente');` |
| 74 | Toast/Alert (toast.error) | `Error al añadir gasto` | `} catch { toast.error('Error al añadir gasto'); }` |
| 85 | JSX Text | `Nuevo Gasto` | `<h2 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Nuevo Gasto</h2>` |
| 86 | JSX Text | `Gasto del negocio` | `<p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 uppercase tracking-wide">Gasto del negocio</p>` |
| 92 | String Literal | `space-y-3` | `<form onSubmit={handleSubmit} className="space-y-3">` |
| 100 | JSX Text | `Tipo de gasto` | `<label className="block text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-1.5">Tipo de gasto</label>` |
| 112 | JSX Text | `Mes` | `<label className="block text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-1.5">Mes</label>` |
| 128 | String Literal | `Nuevo Gasto` | `{isLoading ? 'Guardando...' : 'Nuevo Gasto'}` |

---

### 📄 [`src\components\dashboard\modals\AddBusinessIncomeModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/modals/AddBusinessIncomeModal.tsx)
- **Cantidad de textos hardcodeados:** 26
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 16 | String Literal | `Enero` | `const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];` |
| 16 | String Literal | `Febrero` | `const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];` |
| 16 | String Literal | `Marzo` | `const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];` |
| 16 | String Literal | `Abril` | `const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];` |
| 16 | String Literal | `Mayo` | `const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];` |
| 16 | String Literal | `Junio` | `const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];` |
| 16 | String Literal | `Julio` | `const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];` |
| 16 | String Literal | `Agosto` | `const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];` |
| 16 | String Literal | `Septiembre` | `const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];` |
| 16 | String Literal | `Octubre` | `const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];` |
| 16 | String Literal | `Noviembre` | `const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];` |
| 16 | String Literal | `Diciembre` | `const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];` |
| 21 | String Literal | `Consultoría` | `"Consultoría",` |
| 22 | String Literal | `Suscripción` | `"Suscripción",` |
| 48 | String Literal | `El concepto no puede estar vacío` | `if (!concept.trim()) e.concept = 'El concepto no puede estar vacío';` |
| 50 | String Literal | `El importe debe ser mayor que 0` | `if (!amount.trim() \|\| isNaN(n) \|\| n <= 0) e.amount = 'El importe debe ser mayor que 0';` |
| 62 | Toast/Alert (toast.error) | `No autenticado` | `if (!user) { toast.error('No autenticado'); return; }` |
| 76 | Toast/Alert (toast.success) | `Ingreso añadido correctamente` | `toast.success('Ingreso añadido correctamente');` |
| 80 | Toast/Alert (toast.error) | `Error al añadir ingreso` | `} catch { toast.error('Error al añadir ingreso'); }` |
| 91 | JSX Text | `Nuevo Ingreso` | `<h2 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Nuevo Ingreso</h2>` |
| 92 | JSX Text | `Cobro o Factura` | `<p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 uppercase tracking-wide">Cobro o Factura</p>` |
| 98 | String Literal | `space-y-3` | `<form onSubmit={handleSubmit} className="space-y-3">` |
| 123 | Prop (placeholder) | `Nombre contacto` | `<input type="text" value={client} onChange={e => setClient(e.target.value)} placeholder="Nombre contacto" className={inputCls} />` |
| 127 | Prop (placeholder) | `Nombre proyecto` | `<input type="text" value={project} onChange={e => setProject(e.target.value)} placeholder="Nombre proyecto" className={inputCls} />` |
| 131 | JSX Text | `Mes` | `<label className="block text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-1.5">Mes</label>` |
| 147 | String Literal | `Nuevo Ingreso` | `{isLoading ? 'Guardando...' : 'Nuevo Ingreso'}` |

---

### 📄 [`src\components\dashboard\modals\AddExpenseModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/modals/AddExpenseModal.tsx)
- **Cantidad de textos hardcodeados:** 24
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 34 | String Literal | `TELEFONO` | `'TELEFONO',` |
| 45 | String Literal | `TELEFONO` | `'TELEFONO': 'gasto_fijo',` |
| 84 | String Literal | `Suscripción` | `{ value: 'suscripcion', label: 'Suscripción' },` |
| 139 | String Literal | `El concepto no puede estar vacío` | `newErrors.concept = 'El concepto no puede estar vacío';` |
| 144 | String Literal | `El importe debe ser mayor que 0` | `newErrors.amount = 'El importe debe ser mayor que 0';` |
| 148 | String Literal | `Selecciona un mes` | `newErrors.month = 'Selecciona un mes';` |
| 199 | Toast/Alert (toast.error) | `Usuario no autenticado` | `toast.error('Usuario no autenticado');` |
| 220 | Toast/Alert (toast.success) | `Gasto añadido` | `toast.success('Gasto añadido');` |
| 230 | String Literal | `Error:` | `console.error('Error:', error);` |
| 231 | Toast/Alert (toast.error) | `Error al añadir gasto` | `toast.error('Error al añadir gasto');` |
| 360 | JSX Text | `Enero` | `<option value={1} className="bg-[#111F3A] text-white">Enero</option>` |
| 361 | JSX Text | `Febrero` | `<option value={2} className="bg-[#111F3A] text-white">Febrero</option>` |
| 362 | JSX Text | `Marzo` | `<option value={3} className="bg-[#111F3A] text-white">Marzo</option>` |
| 363 | JSX Text | `Abril` | `<option value={4} className="bg-[#111F3A] text-white">Abril</option>` |
| 364 | JSX Text | `Mayo` | `<option value={5} className="bg-[#111F3A] text-white">Mayo</option>` |
| 365 | JSX Text | `Junio` | `<option value={6} className="bg-[#111F3A] text-white">Junio</option>` |
| 366 | JSX Text | `Julio` | `<option value={7} className="bg-[#111F3A] text-white">Julio</option>` |
| 367 | JSX Text | `Agosto` | `<option value={8} className="bg-[#111F3A] text-white">Agosto</option>` |
| 368 | JSX Text | `Septiembre` | `<option value={9} className="bg-[#111F3A] text-white">Septiembre</option>` |
| 369 | JSX Text | `Octubre` | `<option value={10} className="bg-[#111F3A] text-white">Octubre</option>` |
| 370 | JSX Text | `Noviembre` | `<option value={11} className="bg-[#111F3A] text-white">Noviembre</option>` |
| 371 | JSX Text | `Diciembre` | `<option value={12} className="bg-[#111F3A] text-white">Diciembre</option>` |
| 383 | Prop (placeholder) | `Añade una nota opcional...` | `placeholder="Añade una nota opcional..."` |
| 402 | String Literal | `Nuevo Gasto` | `{isLoading ? 'Guardando...' : 'Nuevo Gasto'}` |

---

### 📄 [`src\components\dashboard\modals\AddIncomeModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/modals/AddIncomeModal.tsx)
- **Cantidad de textos hardcodeados:** 25
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 18 | String Literal | `Ventas directas` | `'Ventas directas',` |
| 20 | String Literal | `Consultoría` | `'Consultoría',` |
| 21 | String Literal | `Formación` | `'Formación',` |
| 22 | String Literal | `Otros ingresos` | `'Otros ingresos'` |
| 103 | String Literal | `El concepto no puede estar vacío` | `newErrors.concept = 'El concepto no puede estar vacío';` |
| 108 | String Literal | `El importe debe ser mayor que 0` | `newErrors.amount = 'El importe debe ser mayor que 0';` |
| 112 | String Literal | `Selecciona un mes` | `newErrors.month = 'Selecciona un mes';` |
| 159 | Toast/Alert (toast.error) | `Usuario no autenticado` | `toast.error('Usuario no autenticado');` |
| 180 | Toast/Alert (toast.success) | `Ingreso añadido` | `toast.success('Ingreso añadido');` |
| 189 | String Literal | `Error:` | `console.error('Error:', error);` |
| 190 | Toast/Alert (toast.error) | `Error al añadir ingreso` | `toast.error('Error al añadir ingreso');` |
| 304 | JSX Text | `Enero` | `<option value={1} className="bg-[#111F3A] text-white">Enero</option>` |
| 305 | JSX Text | `Febrero` | `<option value={2} className="bg-[#111F3A] text-white">Febrero</option>` |
| 306 | JSX Text | `Marzo` | `<option value={3} className="bg-[#111F3A] text-white">Marzo</option>` |
| 307 | JSX Text | `Abril` | `<option value={4} className="bg-[#111F3A] text-white">Abril</option>` |
| 308 | JSX Text | `Mayo` | `<option value={5} className="bg-[#111F3A] text-white">Mayo</option>` |
| 309 | JSX Text | `Junio` | `<option value={6} className="bg-[#111F3A] text-white">Junio</option>` |
| 310 | JSX Text | `Julio` | `<option value={7} className="bg-[#111F3A] text-white">Julio</option>` |
| 311 | JSX Text | `Agosto` | `<option value={8} className="bg-[#111F3A] text-white">Agosto</option>` |
| 312 | JSX Text | `Septiembre` | `<option value={9} className="bg-[#111F3A] text-white">Septiembre</option>` |
| 313 | JSX Text | `Octubre` | `<option value={10} className="bg-[#111F3A] text-white">Octubre</option>` |
| 314 | JSX Text | `Noviembre` | `<option value={11} className="bg-[#111F3A] text-white">Noviembre</option>` |
| 315 | JSX Text | `Diciembre` | `<option value={12} className="bg-[#111F3A] text-white">Diciembre</option>` |
| 327 | Prop (placeholder) | `Añade una nota opcional...` | `placeholder="Añade una nota opcional..."` |
| 346 | String Literal | `Nuevo Ingreso` | `{isLoading ? 'Guardando...' : 'Nuevo Ingreso'}` |

---

### 📄 [`src\components\dashboard\onboarding\OnboardingModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/onboarding/OnboardingModal.tsx)
- **Cantidad de textos hardcodeados:** 99
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 78 | String Literal | `Clientes y agenda ilimitados` | `'Clientes y agenda ilimitados',` |
| 81 | String Literal | `Finanzas y facturas` | `'Finanzas y facturas',` |
| 82 | String Literal | `Productos e inventario` | `'Productos e inventario',` |
| 83 | String Literal | `Estadísticas y métricas` | `'Estadísticas y métricas',` |
| 84 | String Literal | `Equipo y fichajes` | `'Equipo y fichajes',` |
| 85 | String Literal | `SF IA en el panel` | `'SF IA en el panel'` |
| 89 | String Literal | `90 días GRATIS · Sin tarjeta` | `subtitle: '90 días GRATIS · Sin tarjeta'` |
| 169 | Toast/Alert (toast.error) | `El archivo es demasiado grande (máx 2MB)` | `toast.error('El archivo es demasiado grande (máx 2MB)')` |
| 180 | Toast/Alert (toast.error) | `Error: organización no encontrada` | `toast.error('Error: organización no encontrada')` |
| 189 | String Literal | `No se encontró el usuario activo` | `if (!user) throw new Error('No se encontró el usuario activo')` |
| 273 | String Literal | `Error al sincronizar settings:` | `console.warn('Error al sincronizar settings:', settingsError)` |
| 292 | String Literal | `Onboarding completado exitosamente` | `console.log('Onboarding completado exitosamente')` |
| 293 | Toast/Alert (toast.success) | `¡Configuración completada! Redirigiendo...` | `toast.success('¡Configuración completada! Redirigiendo...')` |
| 303 | String Literal | `Error crítico en onboarding:` | `console.error('Error crítico en onboarding:', error)` |
| 304 | Toast/Alert (toast.error) | `Error al completar la configuración: ` | `toast.error('Error al completar la configuración: ' + (error.message \|\| 'Error desconocido'))` |
| 304 | String Literal | `Error desconocido` | `toast.error('Error al completar la configuración: ' + (error.message \|\| 'Error desconocido'))` |
| 332 | Prop (title) | `Cerrar` | `title="Cerrar"` |
| 359 | String Literal | `flex-1 overflow-y-auto px-10 pb-8 custom-scrollbar` | `<div className="flex-1 overflow-y-auto px-10 pb-8 custom-scrollbar">` |
| 369 | String Literal | `space-y-6 text-center py-12` | `<div className="space-y-6 text-center py-12">` |
| 378 | JSX Text | `¡Bienvenido a SF Gestor Empresarial!` | `<h2 className="text-4xl font-bold text-white mb-4">¡Bienvenido a SF Gestor Empresarial!</h2>` |
| 379 | JSX Text | `Configura tu asistente empresarial con IA para que empiece a trabajar por ti hoy mismo.` | `<p className="text-xl text-white/40 max-w-md mx-auto">Configura tu asistente empresarial con IA para que empiece a trabajar por ti hoy mismo.</p>` |
| 385 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 387 | JSX Text | `Cuéntanos sobre ti` | `<h2 className="text-3xl font-bold text-white mb-2">Cuéntanos sobre ti</h2>` |
| 388 | JSX Text | `Queremos saber con quién estamos trabajando` | `<p className="text-white/40">Queremos saber con quién estamos trabajando</p>` |
| 413 | JSX Text | `Foto de perfil` | `<span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Foto de perfil</span>` |
| 416 | String Literal | `flex-1 space-y-4` | `<div className="flex-1 space-y-4">` |
| 417 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 418 | JSX Text | `Nombre Completo` | `<label className="block text-xs font-bold text-white/30 uppercase tracking-widest">Nombre Completo</label>` |
| 423 | Prop (placeholder) | `Juan Pérez` | `placeholder="Juan Pérez"` |
| 427 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 433 | Prop (placeholder) | `Director, Dueño...` | `placeholder="Director, Dueño..."` |
| 436 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 437 | JSX Text | `Teléfono Personal` | `<label className="block text-xs font-bold text-white/30 uppercase tracking-widest">Teléfono Personal</label>` |
| 452 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 454 | JSX Text | `Tu Negocio` | `<h2 className="text-3xl font-bold text-white mb-2">Tu Negocio</h2>` |
| 455 | JSX Text | `Configura la identidad corporativa de tu empresa` | `<p className="text-white/40">Configura la identidad corporativa de tu empresa</p>` |
| 459 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 460 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 461 | JSX Text | `Nombre del Negocio` | `<label className="block text-xs font-bold text-white/30 uppercase tracking-widest">Nombre del Negocio</label>` |
| 466 | Prop (placeholder) | `Nombre de tu empresa` | `placeholder="Nombre de tu empresa"` |
| 482 | JSX Text | `Soy autónomo (usar mi nombre)` | `<span className="text-xs text-white/40">Soy autónomo (usar mi nombre)</span>` |
| 487 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 488 | JSX Text | `País` | `<label className="block text-xs font-bold text-white/30 uppercase tracking-widest">País</label>` |
| 497 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 505 | JSX Text | `Dólar ($)` | `<option value="USD">Dólar ($)</option>` |
| 512 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 513 | JSX Text | `Actividad / Giro del Negocio` | `<label className="block text-xs font-bold text-white/30 uppercase tracking-widest">Actividad / Giro del Negocio</label>` |
| 518 | Prop (placeholder) | `Ej: Clínica Dental, Centro de Estética...` | `placeholder="Ej: Clínica Dental, Centro de Estética..."` |
| 523 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 525 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 526 | JSX Text | `Teléfono del Negocio` | `<label className="block text-xs font-bold text-white/30 uppercase tracking-widest">Teléfono del Negocio</label>` |
| 534 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 562 | JSX Text | `Logo del Negocio` | `<p className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Logo del Negocio</p>` |
| 563 | JSX Text | `PNG, JPG o SVG (máx 2MB)` | `<p className="text-[10px] text-white/30">PNG, JPG o SVG (máx 2MB)</p>` |
| 572 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 574 | JSX Text | `¿Cuándo atiendes?` | `<h2 className="text-3xl font-bold text-white mb-2">¿Cuándo atiendes?</h2>` |
| 575 | JSX Text | `La IA responderá automáticamente fuera de este horario` | `<p className="text-white/40">La IA responderá automáticamente fuera de este horario</p>` |
| 578 | String Literal | `space-y-8 py-4` | `<div className="space-y-8 py-4">` |
| 579 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 580 | JSX Text | `Días laborables` | `<label className="block text-xs font-bold text-white/30 uppercase tracking-widest">Días laborables</label>` |
| 606 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 607 | JSX Text | `Hora Inicio` | `<label className="block text-xs font-bold text-white/30 uppercase tracking-widest">Hora Inicio</label>` |
| 616 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 617 | JSX Text | `Hora Fin` | `<label className="block text-xs font-bold text-white/30 uppercase tracking-widest">Hora Fin</label>` |
| 639 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 641 | JSX Text | `Personalidad de la IA` | `<h2 className="text-3xl font-bold text-white mb-2">Personalidad de la IA</h2>` |
| 642 | JSX Text | `Define cómo se comunicará SF con tu audiencia` | `<p className="text-white/40">Define cómo se comunicará SF con tu audiencia</p>` |
| 645 | String Literal | `space-y-8 py-4` | `<div className="space-y-8 py-4">` |
| 648 | String Literal | `Cercana y amigable` | `{ id: 'amigable', title: 'Cercana y amigable', icon: Phone, example: '¡Hola! Gracias por escribirnos...' },` |
| 649 | String Literal | `Formal y profesional` | `{ id: 'profesional', title: 'Formal y profesional', icon: Briefcase, example: 'Buenos días. En respuesta a su consulta...' }` |
| 669 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 670 | JSX Text | `Describe tu negocio en 2-3 líneas` | `<label className="block text-xs font-bold text-white/30 uppercase tracking-widest">Describe tu negocio en 2-3 líneas</label>` |
| 675 | Prop (placeholder) | `Ej: Somos una clínica dental en Madrid especializada en ortodoncia...` | `placeholder="Ej: Somos una clínica dental en Madrid especializada en ortodoncia..."` |
| 686 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 688 | JSX Text | `Canales e Integraciones` | `<h2 className="text-3xl font-bold text-white mb-2">Canales e Integraciones</h2>` |
| 689 | JSX Text | `Conecta tus canales para que la IA pueda responder` | `<p className="text-white/40">Conecta tus canales para que la IA pueda responder</p>` |
| 692 | String Literal | `space-y-6 py-4` | `<div className="space-y-6 py-4">` |
| 701 | JSX Text | `3 formas de conectar` | `<p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">3 formas de conectar</p>` |
| 710 | JSX Text | `Opción A — Mensaje de ausencia` | `<h4 className="text-xs font-bold text-white">Opción A — Mensaje de ausencia</h4>` |
| 737 | JSX Text | `Opción B — Tu número en Meta` | `<h4 className="text-xs font-bold text-white">Opción B — Tu número en Meta</h4>` |
| 746 | JSX Text | `Opción C — Número dedicado (recomendado)` | `<h4 className="text-xs font-bold text-white">Opción C — Número dedicado (recomendado)</h4>` |
| 771 | JSX Text | `📧 Tu Email en SF` | `<h3 className="text-sm font-bold text-white">📧 Tu Email en SF</h3>` |
| 772 | JSX Text | `Correo Personalizado` | `<p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Correo Personalizado</p>` |
| 782 | JSX Text | `Guía rápida: Reenvío Gmail` | `<span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Guía rápida: Reenvío Gmail</span>` |
| 786 | JSX Text | `Configuración &gt; Reenvío y correo POP/IMAP` | `1. En Gmail ve a <span className="text-white/70">Configuración &gt; Reenvío y correo POP/IMAP</span>. <br />` |
| 787 | JSX Text | `"Añadir una dirección de reenvío"` | `2. Haz clic en <span className="text-white/70">"Añadir una dirección de reenvío"</span> y pega tu nueva dirección de sffalcon.com. <br />` |
| 787 | JSX Text | `y pega tu nueva dirección de sffalcon.com.` | `2. Haz clic en <span className="text-white/70">"Añadir una dirección de reenvío"</span> y pega tu nueva dirección de sffalcon.com. <br />` |
| 787 | String Literal | `Añadir una dirección de reenvío` | `2. Haz clic en <span className="text-white/70">"Añadir una dirección de reenvío"</span> y pega tu nueva dirección de sffalcon.com. <br />` |
| 792 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 793 | JSX Text | `Tu nombre de usuario` | `<label className="block text-xs font-bold text-white/30 uppercase tracking-widest">Tu nombre de usuario</label>` |
| 817 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 819 | JSX Text | `Consentimiento y Acceso` | `<h2 className="text-3xl font-bold text-white mb-2">Consentimiento y Acceso</h2>` |
| 820 | JSX Text | `Último paso antes de activar tu SF` | `<p className="text-white/40">Último paso antes de activar tu SF</p>` |
| 823 | String Literal | `py-6 space-y-8` | `<div className="py-6 space-y-8">` |
| 853 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 879 | JSX Text | `/mes` | `<span className="text-xs font-normal text-white/40 ml-1">/mes</span>` |
| 883 | String Literal | `space-y-3 mb-6 w-full` | `<ul className="space-y-3 mb-6 w-full">` |
| 895 | String Literal | `Plan Activo` | `{formData.selectedPlan === p.id ? 'Plan Activo' : 'Elegir Plan'}` |
| 946 | JSX Text | `COMPLETAR CONFIGURACIÓN` | `<span className="hidden md:inline">COMPLETAR CONFIGURACIÓN</span>` |

---

### 📄 [`src\components\dashboard\projects\ProjectDetail.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/projects/ProjectDetail.tsx)
- **Cantidad de textos hardcodeados:** 37
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 65 | Toast/Alert (toast.success) | `Estado actualizado a ${status.toUpperCase()}` | `toast.success(`Estado actualizado a ${status.toUpperCase()}`);` |
| 69 | Toast/Alert (toast.error) | `Error al actualizar estado` | `toast.error('Error al actualizar estado');` |
| 84 | Toast/Alert (toast.success) | `Progreso actualizado al ${newProgress}%` | `toast.success(`Progreso actualizado al ${newProgress}%`);` |
| 88 | Toast/Alert (toast.error) | `Error al actualizar progreso` | `toast.error('Error al actualizar progreso');` |
| 97 | Toast/Alert (toast.error) | `Cantidad no válida` | `toast.error('Cantidad no válida');` |
| 110 | Toast/Alert (toast.success) | `Pago de ${amount}€ registrado` | `toast.success(`Pago de ${amount}€ registrado`);` |
| 115 | Toast/Alert (toast.error) | `Error al registrar pago` | `toast.error('Error al registrar pago');` |
| 130 | String Literal | `lg:col-span-2 space-y-8` | `<div className="lg:col-span-2 space-y-8">` |
| 134 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 141 | String Literal | `activo` | `project.status === 'activo' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :` |
| 159 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 161 | JSX Text | `Descripción` | `<h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Descripción</h3>` |
| 195 | JSX Text | `Progreso en Ejecución` | `<h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Progreso en Ejecución</h3>` |
| 200 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 229 | JSX Text | `Análisis de Facturación` | `<h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Análisis de Facturación</h3>` |
| 233 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 237 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 241 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 242 | JSX Text | `Pendiente` | `<p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Pendiente</p>` |
| 249 | JSX Text | `Nivel de Cobro` | `<span>Nivel de Cobro</span>` |
| 260 | String Literal | `space-y-8` | `<div className="space-y-8">` |
| 264 | JSX Text | `Actualizar Estado` | `<h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-6">Actualizar Estado</h3>` |
| 274 | String Literal | `activo` | `active={project.status === 'activo'}` |
| 275 | Prop (label) | `En Marcha` | `label="En Marcha"` |
| 278 | String Literal | `activo` | `onClick={() => handleUpdateStatus('activo')}` |
| 288 | String Literal | `completado` | `active={project.status === 'completado'}` |
| 289 | Prop (label) | `Completado` | `label="Completado"` |
| 292 | String Literal | `completado` | `onClick={() => handleUpdateStatus('completado')}` |
| 295 | String Literal | `cancelado` | `active={project.status === 'cancelado'}` |
| 296 | Prop (label) | `Cancelado` | `label="Cancelado"` |
| 299 | String Literal | `cancelado` | `onClick={() => handleUpdateStatus('cancelado')}` |
| 307 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 311 | Prop (placeholder) | `Importe del pago...` | `placeholder="Importe del pago..."` |
| 338 | String Literal | `Sin empresa` | `<p className="text-xs text-slate-500 truncate">{project.clients.company \|\| 'Sin empresa'}</p>` |
| 342 | String Literal | `space-y-4 mb-6 pt-4 border-t border-slate-50 dark:border-[#1E3A5F]` | `<div className="space-y-4 mb-6 pt-4 border-t border-slate-50 dark:border-[#1E3A5F]">` |
| 345 | String Literal | `Sin email` | `<span className="truncate">{project.clients.email \|\| 'Sin email'}</span>` |
| 349 | String Literal | `Sin teléfono` | `<span className="truncate">{(project.clients as any).phone \|\| 'Sin teléfono'}</span>` |

---

### 📄 [`src\components\dashboard\projects\ProjectModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/projects/ProjectModal.tsx)
- **Cantidad de textos hardcodeados:** 25
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 40 | String Literal | `activo` | `const STATUSES = ['propuesta', 'activo', 'completado', 'cancelado'];` |
| 40 | String Literal | `completado` | `const STATUSES = ['propuesta', 'activo', 'completado', 'cancelado'];` |
| 40 | String Literal | `cancelado` | `const STATUSES = ['propuesta', 'activo', 'completado', 'cancelado'];` |
| 104 | String Literal | `No user found` | `if (!user) throw new Error('No user found');` |
| 140 | Toast/Alert (toast.error) | `Error al guardar el proyecto` | `toast.error('Error al guardar el proyecto');` |
| 166 | String Literal | `EDITAR PROYECTO` | `{editProject ? 'EDITAR PROYECTO' : 'NUEVO PROYECTO'}` |
| 166 | String Literal | `NUEVO PROYECTO` | `{editProject ? 'EDITAR PROYECTO' : 'NUEVO PROYECTO'}` |
| 168 | JSX Text | `Define los parámetros del nuevo encargo.` | `<p className="hidden sm:block text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">Define los parámetros del nuevo encargo.</p>` |
| 180 | String Literal | `p-5 md:p-8 overflow-y-auto flex-1 custom-scrollbar` | `<form onSubmit={handleSubmit} className="p-5 md:p-8 overflow-y-auto flex-1 custom-scrollbar">` |
| 184 | String Literal | `md:col-span-2 space-y-2` | `<div className="md:col-span-2 space-y-2">` |
| 193 | Prop (placeholder) | `Ej. Diseño Web Corp` | `placeholder="Ej. Diseño Web Corp"` |
| 199 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 208 | JSX Text | `Sin Contacto / Particular` | `<option value="" className="bg-[#111F3A] text-white">Sin Contacto / Particular</option>` |
| 218 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 233 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 248 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 264 | String Literal | `md:col-span-2 space-y-4 py-2` | `<div className="md:col-span-2 space-y-4 py-2">` |
| 281 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 293 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 307 | String Literal | `md:col-span-2 space-y-2` | `<div className="md:col-span-2 space-y-2">` |
| 315 | Prop (placeholder) | `Breve resumen del alcance...` | `placeholder="Breve resumen del alcance..."` |
| 321 | String Literal | `md:col-span-2 space-y-2` | `<div className="md:col-span-2 space-y-2">` |
| 329 | Prop (placeholder) | `Notas privadas sobre el cliente o el pago...` | `placeholder="Notas privadas sobre el cliente o el pago..."` |
| 352 | String Literal | `GUARDAR CAMBIOS` | `{editProject ? 'GUARDAR CAMBIOS' : 'CREAR PROYECTO'}` |
| 352 | String Literal | `CREAR PROYECTO` | `{editProject ? 'GUARDAR CAMBIOS' : 'CREAR PROYECTO'}` |

---

### 📄 [`src\components\dashboard\projects\ProjectsList.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/projects/ProjectsList.tsx)
- **Cantidad de textos hardcodeados:** 18
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 17 | String Literal | `activo` | `status: 'propuesta' \| 'activo' \| 'completado' \| 'cancelado';` |
| 17 | String Literal | `completado` | `status: 'propuesta' \| 'activo' \| 'completado' \| 'cancelado';` |
| 17 | String Literal | `cancelado` | `status: 'propuesta' \| 'activo' \| 'completado' \| 'cancelado';` |
| 38 | String Literal | `Todos` | `const [filterStatus, setFilterStatus] = useState('Todos');` |
| 43 | String Literal | `Todos` | `const matchesStatus = filterStatus === 'Todos' \|\| p.status === filterStatus.toLowerCase();` |
| 50 | String Literal | `activo` | `case 'activo': return 'bg-[#D1FAE5] text-[#059669] border-[#059669]/10';` |
| 51 | String Literal | `completado` | `case 'completado': return 'bg-[#F1F5F9] text-[#64748B] border-[#64748B]/10';` |
| 52 | String Literal | `cancelado` | `case 'cancelado': return 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/10';` |
| 59 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 66 | Prop (placeholder) | `Buscar proyecto o cliente...` | `placeholder="Buscar proyecto o cliente..."` |
| 77 | JSX Text | `Todos` | `<option>Todos</option>` |
| 79 | JSX Text | `Activo` | `<option>Activo</option>` |
| 80 | JSX Text | `Completado` | `<option>Completado</option>` |
| 81 | JSX Text | `Cancelado` | `<option>Cancelado</option>` |
| 93 | JSX Text | `ESTADO` | `<th className="px-4 md:px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">ESTADO</th>` |
| 99 | String Literal | `divide-y divide-[#F1F5F9] dark:divide-[#1E3A5F]` | `<tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E3A5F]">` |
| 125 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 174 | JSX Text | `No se encontraron proyectos` | `<p className="text-slate-400 font-semibold uppercase tracking-widest text-sm">No se encontraron proyectos</p>` |

---

### 📄 [`src\components\dashboard\settings\AppearanceSection.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/settings/AppearanceSection.tsx)
- **Cantidad de textos hardcodeados:** 7
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 14 | String Literal | `ámbar` | `{ hex: "#F59E0B", name: "ámbar" },` |
| 35 | String Literal | `Error saving theme:` | `console.error("Error saving theme:", error);` |
| 44 | Toast/Alert (toast.success) | `Color de acento actualizado` | `toast.success("Color de acento actualizado");` |
| 46 | Toast/Alert (toast.error) | `Error al guardar color de acento` | `toast.error("Error al guardar color de acento");` |
| 63 | String Literal | `space-y-10` | `<div className="space-y-10">` |
| 65 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 107 | String Literal | `w-full h-full rounded-lg border shadow-sm p-3 space-y-2` | `<div className={cn("w-full h-full rounded-lg border shadow-sm p-3 space-y-2", previewClass)}>` |

---

### 📄 [`src\components\dashboard\settings\AutoReplySection.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/settings/AutoReplySection.tsx)
- **Cantidad de textos hardcodeados:** 13
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 58 | String Literal | `Respuesta automática activada` | `toast.success(enabled ? "Respuesta automática activada" : "Desactivada");` |
| 60 | Toast/Alert (toast.error) | `Error al actualizar` | `toast.error("Error al actualizar");` |
| 81 | Toast/Alert (toast.success) | `✅ Horario guardado correctamente` | `toast.success("✅ Horario guardado correctamente");` |
| 83 | String Literal | `Error saving schedule:` | `console.error("Error saving schedule:", error);` |
| 84 | Toast/Alert (toast.error) | `Error al guardar horario` | `toast.error("Error al guardar horario");` |
| 123 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 126 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 152 | String Literal | `p-5 border border-slate-100 dark:border-[#1E3A5F] rounded-2xl bg-white dark:bg-[#111F3A] space-y-6` | `<div className="p-5 border border-slate-100 dark:border-[#1E3A5F] rounded-2xl bg-white dark:bg-[#111F3A] space-y-6">` |
| 162 | JSX Text | `De` | `<span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">De</span>` |
| 172 | JSX Text | `a` | `<span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">a</span>` |
| 182 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 185 | JSX Text | `Días laborales` | `<span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">Días laborales</span>` |
| 230 | String Literal | `GUARDAR HORARIO` | `{saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "GUARDAR HORARIO"}` |

---

### 📄 [`src\components\dashboard\settings\IntegrationsSection.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/settings/IntegrationsSection.tsx)
- **Cantidad de textos hardcodeados:** 54
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 60 | String Literal | `Error loading email settings:` | `console.error("Error loading email settings:", err);` |
| 108 | String Literal | `ACTIVO` | `label: "ACTIVO",` |
| 110 | String Literal | `AJUSTES` | `action: "AJUSTES"` |
| 118 | String Literal | `ACTIVO` | `label: "ACTIVO",` |
| 120 | String Literal | `AJUSTES` | `action: "AJUSTES"` |
| 124 | String Literal | `PENDIENTE DE ACTIVACIÓN` | `label: "PENDIENTE DE ACTIVACIÓN",` |
| 126 | String Literal | `AJUSTES` | `action: "AJUSTES"` |
| 144 | String Literal | `AJUSTES` | `action: integration.service === 'whatsapp' ? "DESCONECTAR" : "AJUSTES"` |
| 146 | String Literal | `error` | `case 'error':` |
| 147 | String Literal | `Error de conexión` | `return { label: "Error de conexión", color: "text-red-600 bg-red-50", action: "REINTENTAR" };` |
| 158 | Toast/Alert (toast.success) | `Google Gemini ya está activo con tu API Key` | `toast.success('Google Gemini ya está activo con tu API Key');` |
| 163 | Toast/Alert (toast.error) | `Introduce un email válido` | `toast.error("Introduce un email válido");` |
| 168 | Toast/Alert (toast.error) | `No se encontró la organización` | `toast.error("No se encontró la organización");` |
| 201 | Toast/Alert (toast.success) | `Email guardado. Se activará en 24h.` | `toast.success("Email guardado. Se activará en 24h.");` |
| 204 | String Literal | `Error saving email settings:` | `console.error("Error saving email settings:", error);` |
| 205 | Toast/Alert (toast.error) | `Error al guardar email` | `toast.error("Error al guardar email");` |
| 237 | Toast/Alert (toast.success) | `✅ ¡WhatsApp vinculado correctamente! Ya puedes recibir mensajes.` | `toast.success('✅ ¡WhatsApp vinculado correctamente! Ya puedes recibir mensajes.', { duration: 5000 });` |
| 255 | String Literal | `Error al refrescar estado de WhatsApp` | `console.error("Error al refrescar estado de WhatsApp", error);` |
| 264 | Toast/Alert (toast.error) | `Ingresa el número de teléfono (ej: 34600112233)` | `toast.error("Ingresa el número de teléfono (ej: 34600112233)");` |
| 269 | Toast/Alert (toast.error) | `Número inválido. Incluye el código de país (ej: 34600112233)` | `toast.error("Número inválido. Incluye el código de país (ej: 34600112233)");` |
| 286 | Toast/Alert (toast.success) | `✅ Código generado. Introdúcelo en WhatsApp > Dispositivos vinculados > Vincular con número de teléfono` | `toast.success('✅ Código generado. Introdúcelo en WhatsApp > Dispositivos vinculados > Vincular con número de teléfono', { duration: 8000 });` |
| 288 | String Literal | `Error al generar código` | `const msg = data.error \|\| 'Error al generar código';` |
| 296 | Toast/Alert (toast.error) | `Error de conexión con el servidor` | `toast.error("Error de conexión con el servidor");` |
| 303 | Toast/Alert (confirm) | `¿Estás seguro de que quieres desconectar WhatsApp? Esto cerrará la sesión actual.` | `if (!confirm("¿Estás seguro de que quieres desconectar WhatsApp? Esto cerrará la sesión actual.")) return;` |
| 315 | String Literal | `Error al desconectar` | `toast.error(data.error \|\| "Error al desconectar");` |
| 318 | Toast/Alert (toast.error) | `Error de comunicación` | `toast.error("Error de comunicación");` |
| 330 | Toast/Alert (toast.error) | `Error al configurar webhook` | `else toast.error("Error al configurar webhook");` |
| 332 | Toast/Alert (toast.error) | `Error de comunicación` | `toast.error("Error de comunicación");` |
| 367 | String Literal | `ACTIVO` | `? { label: "Proyecto: soportefacil-prod", color: "text-emerald-600 bg-emerald-50", action: "ACTIVO" }` |
| 382 | JSX Text | `API oficial de Meta` | `<p className="text-[10px] text-emerald-600 font-medium -mt-0.5">API oficial de Meta</p>` |
| 387 | String Literal | `ACTIVO` | `statusInfo.label === "ACTIVO" \|\| statusInfo.label === "Conectado" \|\| statusInfo.label.startsWith("Proyecto:") \|\| item.service === 'whatsapp'` |
| 389 | String Literal | `PENDIENTE DE ACTIVACIÓN` | `: statusInfo.label === "PENDIENTE DE ACTIVACIÓN"` |
| 393 | String Literal | `ACTIVO` | `{item.service === 'whatsapp' ? "ACTIVO" : statusInfo.label}` |
| 403 | Toast/Alert (toast.error) | `Función en desarrollo` | `else toast.error("Función en desarrollo");` |
| 405 | String Literal | `ACTIVO` | `disabled={loading === item.service \|\| statusInfo.action === 'ACTIVO'}` |
| 408 | String Literal | `ACTIVO` | `statusInfo.action === 'ACTIVO' ? "text-[#64748B] cursor-default bg-slate-50 dark:bg-white/5" :` |
| 420 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 421 | JSX Text | `Email de atención al cliente` | `<label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Email de atención al cliente</label>` |
| 439 | String Literal | `Guardar email` | `{loading === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar email"}` |
| 469 | JSX Text | `Configuración Business` | `<p className="text-[10px] text-[#64748B] uppercase tracking-widest font-bold">Configuración Business</p>` |
| 481 | String Literal | `flex-1 overflow-y-auto p-5 md:p-8 space-y-6 custom-scrollbar` | `<div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 custom-scrollbar">` |
| 483 | String Literal | `text-center py-6 md:py-8 space-y-4 md:space-y-6` | `<div className="text-center py-6 md:py-8 space-y-4 md:space-y-6">` |
| 490 | JSX Text | `Sesión Activa` | `<h5 className="text-xl font-bold text-[#0F172A] dark:text-white tracking-tight">Sesión Activa</h5>` |
| 491 | JSX Text | `Sincronización Correcta` | `<p className="text-xs md:text-sm text-emerald-600 font-bold uppercase tracking-widest mt-1">Sincronización Correcta</p>` |
| 499 | JSX Text | `Desconectar Teléfono` | `{loading === 'whatsapp_disconnect' ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogOut className="w-4 h-4" /> Desconectar Teléfono</>}` |
| 504 | String Literal | `space-y-6 md:space-y-8` | `<div className="space-y-6 md:space-y-8">` |
| 527 | String Literal | `space-y-6 text-center` | `<div className="space-y-6 text-center">` |
| 534 | JSX Text | `Generando Sesión` | `<p className="text-[9px] font-black uppercase tracking-[0.3em] animate-pulse">Generando Sesión</p>` |
| 551 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 552 | String Literal | `space-y-3 text-center` | `<div className="space-y-3 text-center">` |
| 553 | JSX Text | `Número de Teléfono` | `<label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Número de Teléfono</label>` |
| 561 | JSX Text | `Incluye código de país (ej: 34)` | `<p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Incluye código de país (ej: 34)</p>` |
| 566 | JSX Text | `Código de Vinculación` | `<p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-4">Código de Vinculación</p>` |
| 581 | String Literal | `Generar Código de 8 Dígitos` | `{loading === 'whatsapp_pair' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generar Código de 8 Dígitos"}` |

---

### 📄 [`src\components\dashboard\settings\NotificationsSection.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/settings/NotificationsSection.tsx)
- **Cantidad de textos hardcodeados:** 9
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 24 | Toast/Alert (toast.error) | `Error al guardar preferencia` | `toast.error("Error al guardar preferencia");` |
| 39 | String Literal | `space-y-6 divide-y divide-gray-50 dark:divide-[#1E3A5F]` | `<div className="space-y-6 divide-y divide-gray-50 dark:divide-[#1E3A5F]">` |
| 41 | Prop (title) | `Alertas de sistema` | `title="Alertas de sistema"` |
| 42 | Prop (description) | `Notificaciones críticas sobre el estado del servidor.` | `description="Notificaciones críticas sobre el estado del servidor."` |
| 48 | Prop (description) | `Aviso inmediato cuando entra un nuevo contacto.` | `description="Aviso inmediato cuando entra un nuevo contacto."` |
| 54 | Prop (description) | `Reporte de actividad enviado por email los lunes.` | `description="Reporte de actividad enviado por email los lunes."` |
| 59 | Prop (title) | `Mensajes nuevos` | `title="Mensajes nuevos"` |
| 60 | Prop (description) | `Notificaciones push al recibir comunicaciones.` | `description="Notificaciones push al recibir comunicaciones."` |
| 72 | String Literal | `space-y-1` | `<div className="space-y-1">` |

---

### 📄 [`src\components\dashboard\settings\ProfileSection.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/settings/ProfileSection.tsx)
- **Cantidad de textos hardcodeados:** 6
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 54 | Toast/Alert (toast.success) | `Perfil actualizado` | `toast.success("Perfil actualizado");` |
| 57 | Toast/Alert (toast.error) | `Error al guardar perfil` | `toast.error("Error al guardar perfil");` |
| 89 | String Literal | `flex-1 space-y-6` | `<div className="flex-1 space-y-6">` |
| 92 | Prop (label) | `Nombre completo` | `label="Nombre completo"` |
| 118 | Prop (label) | `Teléfono` | `label="Teléfono"` |
| 135 | JSX Text | `(GMT-05:00) Nueva York` | `<option>(GMT-05:00) Nueva York</option>` |

---

### 📄 [`src\components\dashboard\settings\SecuritySection.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/settings/SecuritySection.tsx)
- **Cantidad de textos hardcodeados:** 12
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 30 | Toast/Alert (toast.error) | `Introduce tu contraseña actual` | `if (!passwords.current) return toast.error("Introduce tu contraseña actual");` |
| 31 | Toast/Alert (toast.error) | `La nueva contraseña debe tener al menos 8 caracteres` | `if (passwords.new.length < 8) return toast.error("La nueva contraseña debe tener al menos 8 caracteres");` |
| 32 | Toast/Alert (toast.error) | `Las contraseñas no coinciden` | `if (passwords.new !== passwords.confirm) return toast.error("Las contraseñas no coinciden");` |
| 42 | Toast/Alert (toast.success) | `Contraseña actualizada` | `toast.success("Contraseña actualizada");` |
| 50 | Toast/Alert (confirm) | `¿Estás seguro de que quieres cerrar sesión en todos los dispositivos?` | `if (confirm("¿Estás seguro de que quieres cerrar sesión en todos los dispositivos?")) {` |
| 65 | String Literal | `space-y-10` | `<div className="space-y-10">` |
| 67 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 81 | String Literal | `Cancelar` | `{showForm ? "Cancelar" : "Cambiar ahora"}` |
| 81 | String Literal | `Cambiar ahora` | `{showForm ? "Cancelar" : "Cambiar ahora"}` |
| 97 | JSX Text | `Nueva` | `<label className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider ml-1">Nueva</label>` |
| 107 | JSX Text | `Confirmar` | `<label className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider ml-1">Confirmar</label>` |
| 129 | String Literal | `space-y-4` | `<div className="space-y-4">` |

---

### 📄 [`src\components\dashboard\settings\SubscriptionModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/settings/SubscriptionModal.tsx)
- **Cantidad de textos hardcodeados:** 14
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 14 | String Literal | `Gestión ilimitada de contactos` | `'Gestión ilimitada de contactos',` |
| 15 | String Literal | `Reservas y citas sin límites` | `'Reservas y citas sin límites',` |
| 18 | String Literal | `Estadísticas y métricas pro` | `'Estadísticas y métricas pro'` |
| 39 | String Literal | `Error al procesar el pago` | `toast.error(data.error \|\| 'Error al procesar el pago')` |
| 43 | Toast/Alert (toast.error) | `Error de conexión` | `toast.error('Error de conexión')` |
| 72 | JSX Text | `Nueva Suscripción` | `<h2 className="text-[17px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">Nueva Suscripción</h2>` |
| 79 | String Literal | `p-6 space-y-6` | `<div className="p-6 space-y-6">` |
| 80 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 83 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 85 | JSX Text | `Gestión completa e IA avanzada` | `<p className="text-[12px] text-slate-500 dark:text-slate-400">Gestión completa e IA avanzada</p>` |
| 89 | JSX Text | `/ Mes` | `<p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">/ Mes</p>` |
| 94 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 96 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 126 | String Literal | `Confirmar Suscripción` | `'Confirmar Suscripción'` |

---

### 📄 [`src\components\dashboard\settings\SystemSection.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/settings/SystemSection.tsx)
- **Cantidad de textos hardcodeados:** 13
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 10 | String Literal | `Producción` | `const environment = process.env.NODE_ENV === 'production' ? 'Producción' : 'Desarrollo';` |
| 17 | String Literal | `¿Estás seguro? Esto borrará:\n\n` | `'¿Estás seguro? Esto borrará:\n\n' +` |
| 18 | String Literal | `• Configuración local del navegador\n` | `'• Configuración local del navegador\n' +` |
| 19 | String Literal | `• Historial de conversaciones con la IA\n` | `'• Historial de conversaciones con la IA\n' +` |
| 20 | String Literal | `• Todos los contactos y mensajes ` | `'• Todos los contactos y mensajes ' +` |
| 21 | String Literal | `de Comunicaciones\n\n` | `'de Comunicaciones\n\n' +` |
| 40 | String Literal | `Error borrando IA:` | `console.error('Error borrando IA:', aiError)` |
| 65 | String Literal | `Error borrando comms:` | `console.error('Error borrando comms:', commsError)` |
| 73 | Toast/Alert (toast.success) | `Todos los datos han sido eliminados` | `toast.success('Todos los datos han sido eliminados')` |
| 80 | String Literal | `Error al borrar datos:` | `console.error('Error al borrar datos:', error)` |
| 81 | Toast/Alert (toast.error) | `Error al borrar los datos` | `toast.error('Error al borrar los datos')` |
| 97 | Prop (label) | `Versión` | `<SystemInfo label="Versión" value="v1.0.0 Beta" />` |
| 98 | Prop (label) | `ID Organización` | `<SystemInfo label="ID Organización" value={orgId} />` |

---

### 📄 [`src\components\dashboard\Topbar.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/Topbar.tsx)
- **Cantidad de textos hardcodeados:** 10
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 152 | String Literal | `max-h-[400px] overflow-y-auto custom-scrollbar` | `<div className="max-h-[400px] overflow-y-auto custom-scrollbar">` |
| 156 | JSX Text | `Sin notificaciones` | `<span className="text-white text-xs">Sin notificaciones</span>` |
| 167 | String Literal | `error` | `<div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.type === 'error' ? 'bg-red-500' :` |
| 206 | Prop (title) | `Ayuda` | `title="Ayuda"` |
| 215 | JSX Text | `¿Necesitas ayuda?` | `<span className="text-white text-sm font-bold block">¿Necesitas ayuda?</span>` |
| 216 | JSX Text | `Contacta con soporte directamente:` | `<p className="text-slate-400 text-xs mt-1">Contacta con soporte directamente:</p>` |
| 228 | JSX Text | `WhatsApp Soporte` | `<p className="text-green-500/60 text-[10px]">WhatsApp Soporte</p>` |
| 238 | JSX Text | `Correo Electrónico` | `<p className="text-blue-500/60 text-[10px]">Correo Electrónico</p>` |
| 249 | Prop (title) | `Ajustes` | `title="Ajustes"` |
| 259 | Prop (title) | `Cerrar Sesión` | `title="Cerrar Sesión"` |

---

### 📄 [`src\components\dashboard\trial\TrialBanner.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/trial/TrialBanner.tsx)
- **Cantidad de textos hardcodeados:** 6
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 31 | String Literal | `Error checking trial status:` | `.catch(err => console.error('Error checking trial status:', err))` |
| 56 | JSX Text | `Tu periodo de prueba ha expirado. Activa tu plan para recuperar el acceso.` | `<span className="hidden md:inline">Tu periodo de prueba ha expirado. Activa tu plan para recuperar el acceso.</span>` |
| 76 | JSX Text | `Tu periodo de prueba finaliza en` | `<span className="hidden md:inline">Tu periodo de prueba finaliza en <span className="text-orange-300 underline decoration-orange-500/50 underline-offset-2">{daysLeft} días</span>. ¡Activa tu cuenta ahora!</span>` |
| 76 | JSX Text | `. ¡Activa tu cuenta ahora!` | `<span className="hidden md:inline">Tu periodo de prueba finaliza en <span className="text-orange-300 underline decoration-orange-500/50 underline-offset-2">{daysLeft} días</span>. ¡Activa tu cuenta ahora!</span>` |
| 94 | JSX Text | `Plan PRO Activo · Te quedan` | `<span className="hidden md:inline">Plan PRO Activo · Te quedan <span className="text-blue-300 underline decoration-blue-500/50 underline-offset-2">{daysLeft} días</span> de tu periodo actual.</span>` |
| 94 | JSX Text | `de tu periodo actual.` | `<span className="hidden md:inline">Plan PRO Activo · Te quedan <span className="text-blue-300 underline decoration-blue-500/50 underline-offset-2">{daysLeft} días</span> de tu periodo actual.</span>` |

---

### 📄 [`src\components\MapPicker.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/MapPicker.tsx)
- **Cantidad de textos hardcodeados:** 3
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 32 | JSX Text | `Coordenadas no disponibles` | `tracking-widest">Coordenadas no disponibles</p>` |
| 66 | String Literal | `Ubicación seleccionada` | `onLocationSelect(newLat, newLng, data.display_name \|\| "Ubicación seleccionada");` |
| 68 | String Literal | `Ubicación seleccionada` | `onLocationSelect(newLat, newLng, "Ubicación seleccionada");` |

---

### 📄 [`src\components\panel-empleado\Dashboard.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/panel-empleado/Dashboard.tsx)
- **Cantidad de textos hardcodeados:** 23
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 55 | String Literal | `Sin turno activo` | `setWorkedToday("Sin turno activo");` |
| 94 | String Literal | `fecha` | `.gte('fecha', format(new Date(), 'yyyy-MM-dd'))` |
| 95 | String Literal | `fecha` | `.order('fecha', { ascending: true })` |
| 102 | String Literal | `Error loading dashboard data` | `console.error("Error loading dashboard data", error);` |
| 110 | String Literal | `Buenos días` | `if (hour < 12) return "Buenos días";` |
| 116 | String Literal | `space-y-8 animate-in fade-in duration-500 overflow-x-hidden w-full` | `<div className="space-y-8 animate-in fade-in duration-500 overflow-x-hidden w-full">` |
| 123 | JSX Text | `Panel de Control` | `<span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1B4FD8]">Panel de Control</span>` |
| 126 | String Literal | `EEEE, d 'de' MMMM` | `{format(currentTime, "EEEE, d 'de' MMMM", { locale: es })}` |
| 148 | String Literal | `En Turno` | `{lastEntrada ? "En Turno" : "Fuera de Servicio"}` |
| 148 | String Literal | `Fuera de Servicio` | `{lastEntrada ? "En Turno" : "Fuera de Servicio"}` |
| 163 | JSX Text | `Tiempo Hoy` | `<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo Hoy</span>` |
| 168 | JSX Text | `Actualizado en tiempo real` | `<span>Actualizado en tiempo real</span>` |
| 188 | JSX Text | `Próximo Turno` | `)}>Próximo Turno</span>` |
| 192 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 200 | String Literal | `Mañana` | `{nextShift.tipo === 'morning' ? 'Mañana' : nextShift.tipo === 'afternoon' ? 'Tarde' : 'Partido'}` |
| 205 | JSX Text | `Sin turnos` | `<p className="text-2xl font-black opacity-30 italic">Sin turnos</p>` |
| 211 | JSX Text | `Es hoy` | `<span>Es hoy</span>` |
| 223 | JSX Text | `Activo` | `<p className="text-2xl font-black text-slate-900 dark:text-white">Activo</p>` |
| 237 | JSX Text | `Historial de Actividad` | `<h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Historial de Actividad</h3>` |
| 248 | JSX Text | `Fecha` | `<th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>` |
| 250 | JSX Text | `Hora` | `<th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Hora</th>` |
| 279 | String Literal | `Web Panel` | `{item.canal \|\| 'Web Panel'}` |
| 289 | JSX Text | `No hay registros recientes` | `<p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No hay registros recientes</p>` |

---

### 📄 [`src\components\panel-empleado\Fichaje.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/panel-empleado/Fichaje.tsx)
- **Cantidad de textos hardcodeados:** 44
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 28 | String Literal | `CORRECTO` | `if (distance <= geoRadius) return 'CORRECTO';` |
| 29 | String Literal | `INCORRECTO` | `return 'INCORRECTO';` |
| 44 | String Literal | `SEMANA` | `const [viewTab, setViewTab] = useState<'HOY' \| 'SEMANA' \| 'MES'>('HOY');` |
| 100 | String Literal | `SEMANA` | `async function fetchPeriodHistory(period: 'SEMANA' \| 'MES') {` |
| 104 | String Literal | `SEMANA` | `if (period === 'SEMANA') {` |
| 155 | String Literal | `INCORRECTO` | `const geoStatus = !hasGeo ? '-' : (allCorrect ? 'CORRECTO' : 'INCORRECTO');` |
| 223 | String Literal | `En turno` | `totalStr: inProgress ? 'En turno' : `${h}h ${m}m`,` |
| 235 | String Literal | `Fecha,Entrada,Salida,Horas Trabajadas\n` | `const headers = "Fecha,Entrada,Salida,Horas Trabajadas\n";` |
| 264 | String Literal | `MI INFORME DE FICHAJES` | `doc.text("MI INFORME DE FICHAJES", 14, 18);` |
| 269 | String Literal | `Periodo: Últimos 14 días` | `doc.text(`Periodo: Últimos 14 días`, 14, 32);` |
| 272 | String Literal | `Fecha exportación: ${nowStr}` | `doc.text(`Fecha exportación: ${nowStr}`, pageWidth - 14, 15, { align: 'right' });` |
| 282 | String Literal | `FECHA` | `head: [['FECHA', 'ENTRADA', 'SALIDA', 'TOTAL HORAS']],` |
| 282 | String Literal | `TOTAL HORAS` | `head: [['FECHA', 'ENTRADA', 'SALIDA', 'TOTAL HORAS']],` |
| 314 | String Literal | `FECHA` | `head: [['FECHA', 'HORA', 'ACCIÓN', 'CANAL', 'UBICACIÓN', 'ESTADO']],` |
| 314 | String Literal | `HORA` | `head: [['FECHA', 'HORA', 'ACCIÓN', 'CANAL', 'UBICACIÓN', 'ESTADO']],` |
| 314 | String Literal | `ACCIÓN` | `head: [['FECHA', 'HORA', 'ACCIÓN', 'CANAL', 'UBICACIÓN', 'ESTADO']],` |
| 314 | String Literal | `UBICACIÓN` | `head: [['FECHA', 'HORA', 'ACCIÓN', 'CANAL', 'UBICACIÓN', 'ESTADO']],` |
| 314 | String Literal | `ESTADO` | `head: [['FECHA', 'HORA', 'ACCIÓN', 'CANAL', 'UBICACIÓN', 'ESTADO']],` |
| 329 | String Literal | `CORRECTO` | `if (val === 'CORRECTO') data.cell.styles.textColor = [34, 197, 94];` |
| 330 | String Literal | `INCORRECTO` | `else if (val === 'INCORRECTO') data.cell.styles.textColor = [239, 68, 68];` |
| 345 | String Literal | `Página ${i} de ${pageCount}` | `doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10);` |
| 359 | Toast/Alert (toast.error) | `Tu navegador no soporta geolocalización.` | `return toast.error("Tu navegador no soporta geolocalización.");` |
| 387 | String Literal | `ORG COORDS NULL - no se puede calcular distancia` | `console.warn('ORG COORDS NULL - no se puede calcular distancia');` |
| 408 | String Literal | `Nominatim error:` | `console.error('Nominatim error:', e);` |
| 417 | String Literal | `web-panel` | `canal: 'web-panel',` |
| 434 | Toast/Alert (toast.error) | `Error: ` | `toast.error("Error: " + err.message);` |
| 441 | Toast/Alert (toast.error) | `Error al obtener ubicación: ` | `toast.error("Error al obtener ubicación: " + err.message);` |
| 455 | String Literal | `flex-1 space-y-8` | `<div className="flex-1 space-y-8">` |
| 459 | JSX Text | `Registro de Jornada` | `<span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1B4FD8] mb-4">Registro de Jornada</span>` |
| 466 | String Literal | `EEEE, d 'de' MMMM` | `{format(currentTime, "EEEE, d 'de' MMMM", { locale: es })}` |
| 501 | String Literal | `SEMANA` | `{['HOY', 'SEMANA', 'MES'].map((tab) => (` |
| 534 | String Literal | `CORRECTO` | `getEstadoGeo(event.distance_meters, orgConfig?.geo_radius \|\| 200) === 'CORRECTO'` |
| 536 | String Literal | `INCORRECTO` | `: getEstadoGeo(event.distance_meters, orgConfig?.geo_radius \|\| 200) === 'INCORRECTO'` |
| 562 | JSX Text | `Fecha` | `<th className="px-6 py-4">Fecha</th>` |
| 583 | String Literal | `CORRECTO` | `day.geoStatus === 'CORRECTO' ? "bg-emerald-500/10 text-emerald-500" :` |
| 584 | String Literal | `INCORRECTO` | `day.geoStatus === 'INCORRECTO' ? "bg-rose-500/10 text-rose-500" :` |
| 595 | JSX Text | `Total Periodo` | `<span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total Periodo</span>` |
| 603 | JSX Text | `Sin actividad hoy` | `<div className="p-10 text-center text-slate-300 text-[10px] uppercase font-black tracking-widest">Sin actividad hoy</div>` |
| 608 | String Literal | `w-full xl:w-96 space-y-6` | `<div className="w-full xl:w-96 space-y-6">` |
| 612 | JSX Text | `Últimos 14 días` | `<p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Últimos 14 días</p>` |
| 614 | String Literal | `flex-1 overflow-y-auto max-h-[500px]` | `<div className="flex-1 overflow-y-auto max-h-[500px]">` |
| 618 | JSX Text | `Fecha` | `<th className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>` |
| 619 | JSX Text | `E/S` | `<th className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">E/S</th>` |
| 620 | JSX Text | `Total` | `<th className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>` |

---

### 📄 [`src\components\panel-empleado\Sidebar.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/panel-empleado/Sidebar.tsx)
- **Cantidad de textos hardcodeados:** 12
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 30 | String Literal | `fichaje` | `{ id: "fichaje", label: "Mi Fichaje", icon: Clock, section: "PANEL" },` |
| 30 | String Literal | `Mi Fichaje` | `{ id: "fichaje", label: "Mi Fichaje", icon: Clock, section: "PANEL" },` |
| 30 | String Literal | `PANEL` | `{ id: "fichaje", label: "Mi Fichaje", icon: Clock, section: "PANEL" },` |
| 31 | String Literal | `inicio` | `{ id: "inicio", label: "Inicio", icon: Home, section: "PANEL" },` |
| 31 | String Literal | `Inicio` | `{ id: "inicio", label: "Inicio", icon: Home, section: "PANEL" },` |
| 31 | String Literal | `PANEL` | `{ id: "inicio", label: "Inicio", icon: Home, section: "PANEL" },` |
| 32 | String Literal | `PANEL` | `{ id: "turnos", label: "Mis Turnos", icon: CalendarDays, section: "PANEL" },` |
| 33 | String Literal | `PANEL` | `{ id: "vacaciones", label: "Mis Vacaciones", icon: Palmtree, section: "PANEL" },` |
| 36 | String Literal | `PANEL` | `const sections = ["PANEL"];` |
| 40 | String Literal | `inicio` | `if (activeSection === "inicio") {` |
| 41 | String Literal | `fichaje` | `setActiveSection("fichaje");` |
| 77 | String Literal | `flex-1 min-h-0 px-2 lg:px-4 flex flex-col gap-6 py-6 overflow-y-auto scrollbar-hide` | `<nav className="flex-1 min-h-0 px-2 lg:px-4 flex flex-col gap-6 py-6 overflow-y-auto scrollbar-hide">` |

---

### 📄 [`src\components\panel-empleado\Topbar.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/panel-empleado/Topbar.tsx)
- **Cantidad de textos hardcodeados:** 6
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 161 | String Literal | `max-h-80 overflow-y-auto custom-scrollbar` | `<div className="max-h-80 overflow-y-auto custom-scrollbar">` |
| 165 | JSX Text | `Sin avisos` | `<p className="text-[10px] text-white uppercase font-black">Sin avisos</p>` |
| 177 | String Literal | `error` | `n.type === 'error' ? 'bg-red-500' :` |
| 210 | String Literal | `inicio` | `onClick={() => setActiveSection?.("inicio")}` |
| 212 | Prop (title) | `Inicio` | `title="Inicio"` |
| 223 | Prop (title) | `Cerrar Sesión` | `title="Cerrar Sesión"` |

---

### 📄 [`src\components\panel-empleado\Turnos.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/panel-empleado/Turnos.tsx)
- **Cantidad de textos hardcodeados:** 13
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 36 | String Literal | `Mañana` | `morning: { label: 'Mañana', color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },` |
| 88 | String Literal | `fecha` | `.gte('fecha', qStart)` |
| 89 | String Literal | `fecha` | `.lte('fecha', qEnd);` |
| 96 | String Literal | `Error fetching shifts:` | `console.error("Error fetching shifts:", error);` |
| 107 | String Literal | `space-y-8 animate-in fade-in duration-500` | `<div className="space-y-8 animate-in fade-in duration-500">` |
| 129 | JSX Text | `Semana` | `>Semana</button>` |
| 136 | JSX Text | `Mes` | `>Mes</button>` |
| 188 | String Literal | `mt-auto space-y-3` | `<div className="mt-auto space-y-3">` |
| 192 | String Literal | `p-4 rounded-2xl border space-y-2` | `<div key={shift.id} className={cn("p-4 rounded-2xl border space-y-2", shiftType.bg, shiftType.border)}>` |
| 197 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 219 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 259 | String Literal | `md:hidden space-y-2` | `<div className="md:hidden space-y-2">` |
| 312 | JSX Text | `Aviso de Gestión` | `<h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Aviso de Gestión</h4>` |

---

### 📄 [`src\components\panel-empleado\Vacaciones.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/panel-empleado/Vacaciones.tsx)
- **Cantidad de textos hardcodeados:** 24
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 31 | String Literal | `pendiente` | `estado TEXT DEFAULT 'pendiente', -- pendiente \| aprobada \| rechazada` |
| 61 | String Literal | `id, fecha_inicio, fecha_fin, dias, motivo, estado, created_at` | `.select('id, fecha_inicio, fecha_fin, dias, motivo, estado, created_at')` |
| 67 | String Literal | `Error fetching vacaciones` | `console.error("Error fetching vacaciones", error);` |
| 82 | Toast/Alert (toast.error) | `Error al cancelar` | `toast.error('Error al cancelar');` |
| 89 | Toast/Alert (toast.error) | `Error al cancelar` | `toast.error('Error al cancelar');` |
| 115 | String Literal | `pendiente` | `estado: 'pendiente',` |
| 122 | String Literal | `Un empleado` | `const nombreEmpleado = staff.full_name \|\| 'Un empleado';` |
| 132 | String Literal | `🌴 Solicitud de vacaciones` | `title: '🌴 Solicitud de vacaciones',` |
| 133 | String Literal | `Sin especificar` | `message: `${nombreEmpleado} ha solicitado vacaciones del ${fechaInicio} al ${fechaFin}. Motivo: ${motivo \|\| 'Sin especificar'}.`,` |
| 140 | String Literal | `Error notificación vacaciones:` | `console.error('Error notificación vacaciones:', notifError);` |
| 145 | String Literal | `, fecha_fin: ` | `setFormData({ fecha_inicio: "", fecha_fin: "", motivo: "" });` |
| 148 | Toast/Alert (toast.error) | `Error al enviar solicitud: ` | `toast.error("Error al enviar solicitud: " + err.message);` |
| 184 | String Literal | `space-y-8 animate-in fade-in duration-500` | `<div className="space-y-8 animate-in fade-in duration-500">` |
| 214 | JSX Text | `Días` | `<th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Días</th>` |
| 242 | String Literal | `Sin motivo especificado` | `&quot;{req.motivo \|\| 'Sin motivo especificado'}&quot;` |
| 247 | String Literal | `pendiente` | `{req.estado === 'pendiente' && (` |
| 266 | JSX Text | `Sin solicitudes` | `<h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Sin solicitudes</h4>` |
| 299 | String Literal | `p-8 space-y-6` | `<form onSubmit={handleSubmit} className="p-8 space-y-6">` |
| 301 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 302 | JSX Text | `Inicio` | `<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inicio</label>` |
| 311 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 312 | JSX Text | `Fin` | `<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fin</label>` |
| 323 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 338 | String Literal | `Enviar Solicitud` | `{saving ? 'Enviando...' : 'Enviar Solicitud'}` |

---

### 📄 [`src\components\PlanGate.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/PlanGate.tsx)
- **Cantidad de textos hardcodeados:** 3
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 15 | String Literal | `Proyectos` | `projects: 'Proyectos',` |
| 17 | String Literal | `Facturación` | `invoices: 'Facturación',` |
| 55 | String Literal | `Funcionalidad no disponible en tu plan` | `{isTrialExpired ? 'Prueba gratuita finalizada' : 'Funcionalidad no disponible en tu plan'}` |

---

### 📄 [`src\context\OrganizationContext.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/context/OrganizationContext.tsx)
- **Cantidad de textos hardcodeados:** 6
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 67 | String Literal | `Mensajes` | `communications: { enabled: true, label: 'Mensajes' },` |
| 70 | String Literal | `Clientes` | `label: 'Clientes',` |
| 72 | String Literal | `nombre` | `campos: ['nombre', 'telefono', 'email', 'notas']` |
| 72 | String Literal | `telefono` | `campos: ['nombre', 'telefono', 'email', 'notas']` |
| 76 | String Literal | `Citas` | `label: 'Citas',` |
| 88 | String Literal | `Error fetching organization:` | `console.error('Error fetching organization:', e)` |

---

### 📄 [`src\hooks\usePlan.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/hooks/usePlan.ts)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 68 | String Literal | `dashboard` | `'dashboard', 'communications', 'clients',` |

---

### 📄 [`src\lib\autoReply.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/autoReply.ts)
- **Cantidad de textos hardcodeados:** 9
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 16 | String Literal | `domingo` | `const currentDay = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][now.getDay()]` |
| 16 | String Literal | `lunes` | `const currentDay = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][now.getDay()]` |
| 16 | String Literal | `martes` | `const currentDay = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][now.getDay()]` |
| 16 | String Literal | `miercoles` | `const currentDay = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][now.getDay()]` |
| 16 | String Literal | `jueves` | `const currentDay = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][now.getDay()]` |
| 16 | String Literal | `viernes` | `const currentDay = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][now.getDay()]` |
| 16 | String Literal | `sabado` | `const currentDay = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][now.getDay()]` |
| 57 | String Literal | `Error Groq:` | `console.error('Error Groq:', err)` |
| 96 | String Literal | `Error enviando auto-respuesta:` | `console.error('Error enviando auto-respuesta:', err)` |

---

### 📄 [`src\lib\clientsContext.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/clientsContext.ts)
- **Cantidad de textos hardcodeados:** 3
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 14 | String Literal | `activo` | `const activosCount = clients.filter(c => c.status === 'activo').length;` |
| 23 | String Literal | `activo` | `.filter(c => c.status === 'activo')` |
| 27 | String Literal | `sin valor` | ``${c.name}${c.company ? ` (${c.company})` : ''}: ${c.status} \| ${c.category \|\| 'sin categoría'} \| ${c.value ? Number(c.value).toLocaleString('es-ES') + '€' : 'sin valor'}`` |

---

### 📄 [`src\lib\financeCategories.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/financeCategories.ts)
- **Cantidad de textos hardcodeados:** 3
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 11 | String Literal | `Venta de Productos` | `{ id: 'general_sales', name: 'Venta de Productos', type: 'income' },` |
| 13 | String Literal | `Otros Ingresos` | `{ id: 'other_income', name: 'Otros Ingresos', type: 'income' }` |
| 24 | String Literal | `Otros Gastos` | `{ id: 'other_expense', name: 'Otros Gastos', type: 'expense' }` |

---

### 📄 [`src\lib\financeContext.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/financeContext.ts)
- **Cantidad de textos hardcodeados:** 25
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 7 | String Literal | `Enero` | `'Enero','Febrero','Marzo','Abril',` |
| 7 | String Literal | `Febrero` | `'Enero','Febrero','Marzo','Abril',` |
| 7 | String Literal | `Marzo` | `'Enero','Febrero','Marzo','Abril',` |
| 7 | String Literal | `Abril` | `'Enero','Febrero','Marzo','Abril',` |
| 8 | String Literal | `Mayo` | `'Mayo','Junio','Julio','Agosto',` |
| 8 | String Literal | `Junio` | `'Mayo','Junio','Julio','Agosto',` |
| 8 | String Literal | `Julio` | `'Mayo','Junio','Julio','Agosto',` |
| 8 | String Literal | `Agosto` | `'Mayo','Junio','Julio','Agosto',` |
| 9 | String Literal | `Septiembre` | `'Septiembre','Octubre','Noviembre',` |
| 9 | String Literal | `Octubre` | `'Septiembre','Octubre','Noviembre',` |
| 9 | String Literal | `Noviembre` | `'Septiembre','Octubre','Noviembre',` |
| 10 | String Literal | `Diciembre` | `'Diciembre'` |
| 43 | String Literal | `${mes}: Sin datos de transacciones` | `return `${mes}: Sin datos de transacciones`` |
| 158 | String Literal | `Enero` | `'Enero','Febrero','Marzo','Abril',` |
| 158 | String Literal | `Febrero` | `'Enero','Febrero','Marzo','Abril',` |
| 158 | String Literal | `Marzo` | `'Enero','Febrero','Marzo','Abril',` |
| 158 | String Literal | `Abril` | `'Enero','Febrero','Marzo','Abril',` |
| 159 | String Literal | `Mayo` | `'Mayo','Junio','Julio','Agosto',` |
| 159 | String Literal | `Junio` | `'Mayo','Junio','Julio','Agosto',` |
| 159 | String Literal | `Julio` | `'Mayo','Junio','Julio','Agosto',` |
| 159 | String Literal | `Agosto` | `'Mayo','Junio','Julio','Agosto',` |
| 160 | String Literal | `Septiembre` | `'Septiembre','Octubre','Noviembre',` |
| 160 | String Literal | `Octubre` | `'Septiembre','Octubre','Noviembre',` |
| 160 | String Literal | `Noviembre` | `'Septiembre','Octubre','Noviembre',` |
| 161 | String Literal | `Diciembre` | `'Diciembre'` |

---

### 📄 [`src\lib\financeData.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/financeData.ts)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 17 | String Literal | `Error fetching finance entries:` | `console.error('Error fetching finance entries:', error);` |

---

### 📄 [`src\lib\generatePDF.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/generatePDF.ts)
- **Cantidad de textos hardcodeados:** 29
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 17 | String Literal | `generateFinanceReport iniciado con` | `console.log('generateFinanceReport iniciado con', entries.length, 'entradas')` |
| 39 | String Literal | `Sin datos financieros` | `if (!financeData) throw new Error('Sin datos financieros')` |
| 46 | String Literal | `Error en jsPDF:` | `console.error('Error en jsPDF:', e)` |
| 82 | String Literal | `Sección 1: Resumen Ejecutivo OK` | `console.log('Sección 1: Resumen Ejecutivo OK')` |
| 91 | String Literal | `Antes de autoTable Sección 1` | `console.log('Antes de autoTable Sección 1')` |
| 94 | String Literal | `Estado` | `head: [['Concepto', 'Importe', 'Estado']],` |
| 96 | String Literal | `Ingresos totales` | `['Ingresos totales', `${Number(financeData.ingresosMes).toLocaleString('es-ES', { minimumFractionDigits: 2 })}EUR`, 'INGRESOS'],` |
| 96 | String Literal | `INGRESOS` | `['Ingresos totales', `${Number(financeData.ingresosMes).toLocaleString('es-ES', { minimumFractionDigits: 2 })}EUR`, 'INGRESOS'],` |
| 97 | String Literal | `Gastos totales` | `['Gastos totales', `${Number(financeData.gastosMes).toLocaleString('es-ES', { minimumFractionDigits: 2 })}EUR`, 'GASTOS'],` |
| 97 | String Literal | `GASTOS` | `['Gastos totales', `${Number(financeData.gastosMes).toLocaleString('es-ES', { minimumFractionDigits: 2 })}EUR`, 'GASTOS'],` |
| 110 | String Literal | `Sección 2: Desglose de Transacciones OK` | `console.log('Sección 2: Desglose de Transacciones OK')` |
| 125 | String Literal | `Sin datos` | `if (!g \|\| typeof g !== 'string') return ['Sin datos', '-']` |
| 130 | String Literal | `Sin concepto` | `return [concepto \|\| 'Sin concepto', importe \|\| '-']` |
| 133 | String Literal | `Antes de autoTable Sección 2` | `console.log('Antes de autoTable Sección 2')` |
| 137 | String Literal | `Sin transacciones registradas` | `body: rows.length > 0 ? rows : [['Sin transacciones registradas', '-']],` |
| 145 | String Literal | `Sección 3: Comparativa OK` | `console.log('Sección 3: Comparativa OK')` |
| 161 | String Literal | `Sin cambio` | `if (prev === 0 && curr === 0) return 'Sin cambio'` |
| 162 | String Literal | `+${fmtEur(curr)} (nuevo)` | `if (prev === 0) return `+${fmtEur(curr)} (nuevo)`` |
| 168 | String Literal | `Antes de autoTable Sección 3` | `console.log('Antes de autoTable Sección 3')` |
| 171 | String Literal | `Mes Anterior` | `head: [['Concepto', 'Mes Anterior', 'Mes Actual', 'Variacion']],` |
| 171 | String Literal | `Mes Actual` | `head: [['Concepto', 'Mes Anterior', 'Mes Actual', 'Variacion']],` |
| 173 | String Literal | `Ingresos` | `['Ingresos', fmtEur(ingAnterior), fmtEur(ingActual), varPct(ingActual, ingAnterior)],` |
| 174 | String Literal | `Gastos` | `['Gastos', fmtEur(gasAnterior), fmtEur(gasActual), varPct(gasActual, gasAnterior)],` |
| 184 | String Literal | `Sección 4: Análisis IA OK` | `console.log('Sección 4: Análisis IA OK')` |
| 208 | String Literal | `Observación X:` | `NO uses "Observación X:". Solo texto natural profesional.` |
| 215 | String Literal | `Reply extraído:` | `console.log('Reply extraído:', reply ? 'OK' : 'null')` |
| 223 | String Literal | `Error en análisis IA (silencioso)` | `console.error('Error en análisis IA (silencioso)')` |
| 243 | String Literal | `Información generada por ${orgName || 'SF'} | Generado el ${today} | Pagina ${i} de ${pageCount}` | ``Información generada por ${orgName \|\| 'SF'} \| Generado el ${today} \| Pagina ${i} de ${pageCount}`,` |
| 250 | String Literal | `PDF guardado exitosamente` | `console.log('PDF guardado exitosamente')` |

---

### 📄 [`src\lib\i18n\en.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/i18n/en.ts)
- **Cantidad de textos hardcodeados:** 100
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 66 | String Literal | `Total database` | `contactsLabel: "Total database",` |
| 81 | String Literal | `No name` | `noName: "No name",` |
| 95 | String Literal | `Error loading agenda` | `loadError: "Error loading agenda",` |
| 98 | String Literal | `Error deleting appointment` | `deleteError: "Error deleting appointment",` |
| 113 | String Literal | `Total Events` | `totalAgenda: "Total Events",` |
| 131 | String Literal | `No name` | `noName: "No name",` |
| 164 | String Literal | `Error saving the booking` | `saveError: "Error saving the booking",` |
| 173 | String Literal | `Error loading data` | `loadError: "Error loading data",` |
| 176 | String Literal | `Error deleting client` | `deleteError: "Error deleting client",` |
| 192 | String Literal | `Total Records` | `totalRecords: "Total Records",` |
| 204 | String Literal | `Error loading leads` | `loadError: "Error loading leads",` |
| 206 | String Literal | `Error reactivating lead` | `reactivateError: "Error reactivating lead",` |
| 208 | String Literal | `Error deleting lead` | `deleteError: "Error deleting lead",` |
| 251 | String Literal | `No date` | `noDate: "No date",` |
| 276 | String Literal | `Error moving deal` | `moveError: "Error moving deal",` |
| 322 | String Literal | `Error saving item` | `saveError: "Error saving item",` |
| 324 | String Literal | `Error deleting item` | `deleteError: "Error deleting item",` |
| 333 | String Literal | `Total Items` | `totalItems: "Total Items",` |
| 354 | String Literal | `No description` | `noDesc: "No description",` |
| 371 | String Literal | `Error adding item` | `addError: "Error adding item",` |
| 373 | String Literal | `Error updating item` | `updateError: "Error updating item",` |
| 384 | String Literal | `Total Products` | `totalProducts: "Total Products",` |
| 425 | String Literal | `Error loading projects` | `loadError: "Error loading projects",` |
| 438 | String Literal | `TOTAL BILLING` | `totalBilling: "TOTAL BILLING",` |
| 439 | String Literal | `Total Budget` | `totalBudget: "Total Budget",` |
| 466 | String Literal | `Error processing request` | `processRequestError: "Error processing request",` |
| 468 | String Literal | `Error creating employee` | `createEmployeeError: "Error creating employee",` |
| 470 | String Literal | `Error saving` | `saveError: "Error saving",` |
| 472 | String Literal | `Error deleting` | `deleteError: "Error deleting",` |
| 475 | String Literal | `Error updating password` | `passwordUpdateError: "Error updating password",` |
| 552 | String Literal | `Error saving shift` | `saveError: "Error saving shift",` |
| 554 | String Literal | `Error deleting` | `deleteError: "Error deleting",` |
| 578 | String Literal | `No shifts assigned for this day` | `noShifts: "No shifts assigned for this day",` |
| 602 | String Literal | `Error exporting` | `exportError: "Error exporting",` |
| 603 | String Literal | `No data for the report` | `noDataReport: "No data for the report",` |
| 605 | String Literal | `Error generating PDF` | `pdfError: "Error generating PDF",` |
| 606 | String Literal | `Error refreshing data` | `refreshError: "Error refreshing data",` |
| 620 | String Literal | `Error initializing the auditor` | `initError: "Error initializing the auditor",` |
| 621 | String Literal | `Error sending message` | `sendError: "Error sending message",` |
| 640 | String Literal | `Select a month` | `selectMonth: "Select a month",` |
| 646 | String Literal | `Error adding income` | `error: "Error adding income",` |
| 660 | String Literal | `Select or write a category` | `categoryEmpty: "Select or write a category",` |
| 662 | String Literal | `Select a month` | `selectMonth: "Select a month",` |
| 668 | String Literal | `Error adding expense` | `error: "Error adding expense",` |
| 691 | String Literal | `Error adding income` | `error: "Error adding income",` |
| 712 | String Literal | `Error adding expense` | `error: "Error adding expense",` |
| 738 | String Literal | `Error loading business data` | `loadError: "Error loading business data",` |
| 761 | String Literal | `TOTAL BALANCE` | `balanceTotal: "TOTAL BALANCE",` |
| 775 | String Literal | `Enter a concept` | `conceptEmpty: "Enter a concept",` |
| 779 | String Literal | `Error adding concept` | `addError: "Error adding concept",` |
| 781 | String Literal | `Error updating` | `updateError: "Error updating",` |
| 782 | String Literal | `Error deleting concept` | `deleteError: "Error deleting concept",` |
| 794 | String Literal | `No entries for this month` | `noEntries: "No entries for this month",` |
| 809 | String Literal | `No expense data for {month}` | `noData: "No expense data for {month}"` |
| 815 | String Literal | `No registered income` | `title: "No registered income",` |
| 869 | String Literal | `Error loading invoices` | `loadError: "Error loading invoices",` |
| 871 | String Literal | `Error updating` | `updateError: "Error updating",` |
| 873 | String Literal | `Error deleting` | `deleteError: "Error deleting",` |
| 875 | String Literal | `Error generating PDF` | `pdfError: "Error generating PDF",` |
| 876 | String Literal | `Client does not have a valid email registered` | `noEmail: "Client does not have a valid email registered",` |
| 878 | String Literal | `Error sending email` | `sendError: "Error sending email",` |
| 899 | String Literal | `TOTAL BILLED` | `totalBilled: "TOTAL BILLED",` |
| 915 | String Literal | `Total` | `total: "Total",` |
| 919 | String Literal | `No records found` | `noRecords: "No records found",` |
| 934 | String Literal | `TOTAL ACTIVITY` | `totalActivity: "TOTAL ACTIVITY",` |
| 941 | String Literal | `TOTAL INCOME` | `totalRevenue: "TOTAL INCOME",` |
| 960 | String Literal | `Error loading operational data` | `loadError: "Error loading operational data",` |
| 962 | String Literal | `Error generating PDF` | `pdfError: "Error generating PDF",` |
| 972 | String Literal | `Total Invoices` | `totalInvoices: "Total Invoices",` |
| 981 | String Literal | `No registered data` | `noData: "No registered data",` |
| 990 | String Literal | `No votes` | `noVotes: "No votes",` |
| 1000 | String Literal | `Total Revenue` | `totalRevenue: "Total Revenue",` |
| 1002 | String Literal | `Total Records` | `totalRecords: "Total Records",` |
| 1012 | String Literal | `Error uploading image` | `photoError: "Error uploading image",` |
| 1018 | String Literal | `Error saving profile` | `saveError: "Error saving profile",` |
| 1038 | String Literal | `Error saving organization` | `saveError: "Error saving organization",` |
| 1047 | String Literal | `Error saving hours` | `saveError: "Error saving hours",` |
| 1059 | String Literal | `Error saving configuration` | `saveError: "Error saving configuration",` |
| 1075 | String Literal | `Error cancelling` | `cancelError: "Error cancelling",` |
| 1076 | String Literal | `Connection error` | `connectionError: "Connection error",` |
| 1092 | String Literal | `SF AI in the panel` | `aiPanel: "SF AI in the panel",` |
| 1097 | String Literal | `Error: Organization ID not found` | `orgIdError: "Error: Organization ID not found",` |
| 1098 | String Literal | `Error processing payment` | `checkoutError: "Error processing payment",` |
| 1115 | String Literal | `Enter a valid email for alerts` | `alertEmailInvalid: "Enter a valid email for alerts",` |
| 1117 | String Literal | `Error saving configuration` | `saveError: "Error saving configuration",` |
| 1121 | String Literal | `Option A — Absence message` | `optionA: "Option A — Absence message",` |
| 1159 | String Literal | `No conversations` | `noConversations: "No conversations",` |
| 1163 | String Literal | `Error deleting` | `deleteError: "Error deleting",` |
| 1165 | String Literal | `Error sending` | `sendError: "Error sending",` |
| 1168 | String Literal | `Error uploading file` | `uploadError: "Error uploading file",` |
| 1170 | String Literal | `Error updating` | `updateError: "Error updating",` |
| 1189 | String Literal | `No phone registered` | `noPhone: "No phone registered",` |
| 1214 | String Literal | `Control Panel` | `controlPanel: "Control Panel",` |
| 1220 | String Literal | `TOTAL HOURS` | `totalHours: "TOTAL HOURS",` |
| 1222 | String Literal | `Page {page} of {total}` | `pageOf: "Page {page} of {total}",` |
| 1227 | String Literal | `Error searching address` | `searchError: "Error searching address",` |
| 1231 | String Literal | `Error saving location` | `saveError: "Error saving location",` |
| 1234 | String Literal | `Time Clock Dashboard` | `title: "Time Clock Dashboard",` |
| 1255 | String Literal | `Total Hours` | `totalHours: "Total Hours",` |
| 1291 | String Literal | `Error saving` | `saveError: "Error saving",` |

---

### 📄 [`src\lib\i18n\es.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/i18n/es.ts)
- **Cantidad de textos hardcodeados:** 528
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 3 | String Literal | `Guardar` | `save: "Guardar",` |
| 4 | String Literal | `Cancelar` | `cancel: "Cancelar",` |
| 5 | String Literal | `Eliminar` | `delete: "Eliminar",` |
| 6 | String Literal | `Editar` | `edit: "Editar",` |
| 9 | String Literal | `Buscar` | `search: "Buscar",` |
| 11 | String Literal | `Enero` | `january: "Enero",` |
| 12 | String Literal | `Febrero` | `february: "Febrero",` |
| 13 | String Literal | `Marzo` | `march: "Marzo",` |
| 14 | String Literal | `Abril` | `april: "Abril",` |
| 15 | String Literal | `Mayo` | `may: "Mayo",` |
| 16 | String Literal | `Junio` | `june: "Junio",` |
| 17 | String Literal | `Julio` | `july: "Julio",` |
| 18 | String Literal | `Agosto` | `august: "Agosto",` |
| 19 | String Literal | `Septiembre` | `september: "Septiembre",` |
| 20 | String Literal | `Octubre` | `october: "Octubre",` |
| 21 | String Literal | `Noviembre` | `november: "Noviembre",` |
| 22 | String Literal | `Diciembre` | `december: "Diciembre",` |
| 26 | String Literal | `Inicio` | `home: "Inicio",` |
| 28 | String Literal | `Clientes` | `clients: "Clientes",` |
| 29 | String Literal | `Facturas` | `invoices: "Facturas",` |
| 31 | String Literal | `Ajustes` | `settings: "Ajustes",` |
| 32 | String Literal | `Mensajes` | `communications: "Mensajes",` |
| 34 | String Literal | `Captación` | `leads: "Captación",` |
| 36 | String Literal | `Catálogo` | `inventory: "Catálogo",` |
| 37 | String Literal | `Inventario` | `products: "Inventario",` |
| 38 | String Literal | `Proyectos` | `projects: "Proyectos",` |
| 39 | String Literal | `Fichaje` | `fichaje: "Fichaje",` |
| 42 | String Literal | `Estadísticas` | `analytics: "Estadísticas",` |
| 48 | String Literal | `Negocio` | `negocio: "Negocio",` |
| 50 | String Literal | `Economía` | `economia: "Economía",` |
| 51 | String Literal | `Análisis` | `analisis: "Análisis",` |
| 54 | String Literal | `Buenos días` | `goodMorning: "Buenos días",` |
| 57 | String Literal | `Usuario` | `user: "Usuario",` |
| 61 | String Literal | `Contactar con soporte` | `contactSupport: "Contactar con soporte",` |
| 63 | String Literal | `CITAS ESTE MES` | `appointments: "CITAS ESTE MES",` |
| 66 | String Literal | `Total base de datos` | `contactsLabel: "Total base de datos",` |
| 67 | String Literal | `MENSAJES` | `messages: "MENSAJES",` |
| 68 | String Literal | `Sin leer` | `messagesLabel: "Sin leer",` |
| 69 | String Literal | `FACTURACIÓN` | `billing: "FACTURACIÓN",` |
| 70 | String Literal | `Este mes` | `billingLabel: "Este mes",` |
| 72 | String Literal | `Evolución Financiera` | `financeEvolution: "Evolución Financiera",` |
| 73 | String Literal | `Ingresos` | `income: "Ingresos",` |
| 74 | String Literal | `Gastos` | `expenses: "Gastos",` |
| 75 | String Literal | `Últimos Mensajes` | `latestMessages: "Últimos Mensajes",` |
| 79 | String Literal | `Próxima Actividad` | `nextActivity: "Próxima Actividad",` |
| 81 | String Literal | `Sin nombre` | `noName: "Sin nombre",` |
| 82 | String Literal | `Resumen del Mes` | `monthSummary: "Resumen del Mes",` |
| 85 | String Literal | `Mensajes recibidos` | `receivedMessages: "Mensajes recibidos",` |
| 87 | String Literal | `Acciones Rápidas Ultra` | `quickActions: "Acciones Rápidas Ultra",` |
| 88 | String Literal | `NUEVA FACTURA` | `newInvoice: "NUEVA FACTURA",` |
| 90 | String Literal | `GESTIONAR CATÁLOGO` | `manageCatalog: "GESTIONAR CATÁLOGO",` |
| 91 | String Literal | `+ NUEVO CONTACTO` | `addNewContact: "+ NUEVO CONTACTO",` |
| 95 | String Literal | `Error al cargar la agenda` | `loadError: "Error al cargar la agenda",` |
| 96 | String Literal | `¿Eliminar esta cita definitivamente?` | `deleteConfirm: "¿Eliminar esta cita definitivamente?",` |
| 98 | String Literal | `Error al eliminar` | `deleteError: "Error al eliminar",` |
| 103 | String Literal | `Semana` | `week: "Semana",` |
| 105 | String Literal | `Análisis` | `analytics: "Análisis",` |
| 110 | String Literal | `+{count} más` | `moreAppts: "+{count} más",` |
| 112 | String Literal | `Resumen de Agenda` | `summaryTitle: "Resumen de Agenda",` |
| 113 | String Literal | `Total Agenda` | `totalAgenda: "Total Agenda",` |
| 115 | String Literal | `Análisis de Agenda` | `aiAnalysis: "Análisis de Agenda",` |
| 120 | String Literal | `Detalle de Cita` | `title: "Detalle de Cita",` |
| 122 | String Literal | `Teléfono` | `phone: "Teléfono",` |
| 124 | String Literal | `Fecha` | `date: "Fecha",` |
| 125 | String Literal | `Hora` | `time: "Hora",` |
| 128 | String Literal | `Duración Estimada` | `duration: "Duración Estimada",` |
| 129 | String Literal | `Estado` | `status: "Estado",` |
| 131 | String Literal | `Sin nombre` | `noName: "Sin nombre",` |
| 132 | String Literal | `No especificado` | `unspecified: "No especificado",` |
| 133 | String Literal | `No especificada` | `unspecifiedF: "No especificada",` |
| 134 | String Literal | `1 hora` | `defaultDuration: "1 hora",` |
| 135 | String Literal | `Cerrar` | `close: "Cerrar",` |
| 138 | String Literal | `Editar Evento` | `editTitle: "Editar Evento",` |
| 139 | String Literal | `Nuevo Evento` | `newTitle: "Nuevo Evento",` |
| 140 | String Literal | `Nombre del Contacto *` | `contactNameLabel: "Nombre del Contacto *",` |
| 141 | String Literal | `Nombre del contacto` | `contactNamePlaceholder: "Nombre del contacto",` |
| 142 | String Literal | `Teléfono` | `phoneLabel: "Teléfono",` |
| 146 | String Literal | `Fecha` | `dateLabel: "Fecha",` |
| 147 | String Literal | `Hora` | `timeLabel: "Hora",` |
| 154 | String Literal | `Cita telefónica` | `telefonica: "Cita telefónica",` |
| 160 | String Literal | `Cancelar` | `cancelButton: "Cancelar",` |
| 161 | String Literal | `Confirmar` | `confirmButton: "Confirmar",` |
| 163 | String Literal | `Por favor completa los campos obligatorios (Nombre, Fecha y Hora)` | `requiredFields: "Por favor completa los campos obligatorios (Nombre, Fecha y Hora)",` |
| 164 | String Literal | `Error al guardar la reserva` | `saveError: "Error al guardar la reserva",` |
| 168 | String Literal | `Actividad confirmada con éxito` | `success: "Actividad confirmada con éxito",` |
| 173 | String Literal | `Error al cargar datos` | `loadError: "Error al cargar datos",` |
| 174 | String Literal | `¿Estás seguro de eliminar este cliente?` | `deleteConfirm: "¿Estás seguro de eliminar este cliente?",` |
| 176 | String Literal | `Error al eliminar` | `deleteError: "Error al eliminar",` |
| 179 | String Literal | `Todos los Contactos` | `allContacts: "Todos los Contactos",` |
| 181 | String Literal | `Métricas` | `metrics: "Métricas",` |
| 184 | String Literal | `Base de Datos` | `dbLabel: "Base de Datos",` |
| 187 | String Literal | `Gestiona la base de datos de tus contactos` | `desc: "Gestiona la base de datos de tus contactos",` |
| 189 | String Literal | `NUEVO CONTACTO` | `newContact: "NUEVO CONTACTO",` |
| 192 | String Literal | `Total Registros` | `totalRecords: "Total Registros",` |
| 193 | String Literal | `Nuevos este mes` | `newThisMonth: "Nuevos este mes",` |
| 194 | String Literal | `Eventos en Agenda este mes` | `appointmentsThisMonth: "Eventos en Agenda este mes",` |
| 199 | String Literal | `Módulo de Captación - Solo Empresa` | `title: "Módulo de Captación - Solo Empresa",` |
| 204 | String Literal | `Error al cargar contactos` | `loadError: "Error al cargar contactos",` |
| 206 | String Literal | `Error al reactivar contacto comercial` | `reactivateError: "Error al reactivar contacto comercial",` |
| 208 | String Literal | `Error al eliminar contacto comercial` | `deleteError: "Error al eliminar contacto comercial",` |
| 210 | String Literal | `¿Seguro que quieres eliminar este contacto comercial permanentemente?` | `deleteConfirm: "¿Seguro que quieres eliminar este contacto comercial permanentemente?",` |
| 212 | String Literal | `Gestión de Captación` | `title: "Gestión de Captación",` |
| 214 | String Literal | `Nuevo Contacto` | `newContact: "Nuevo Contacto",` |
| 217 | String Literal | `Captación Activa` | `active: "Captación Activa",` |
| 219 | String Literal | `Tasa Conversión` | `conversionRate: "Tasa Conversión",` |
| 220 | String Literal | `Seguimientos Hoy` | `followupsToday: "Seguimientos Hoy",` |
| 224 | String Literal | `Estados: Todos` | `allStates: "Estados: Todos",` |
| 226 | String Literal | `Origen: Todos` | `allOrigins: "Origen: Todos",` |
| 229 | String Literal | `Nuevo` | `nuevo: "Nuevo",` |
| 236 | String Literal | `Frío` | `frio: "Frío",` |
| 250 | String Literal | `Próximo` | `next: "Próximo",` |
| 251 | String Literal | `Sin fecha` | `noDate: "Sin fecha",` |
| 259 | String Literal | `Editar Contacto` | `edit: "Editar Contacto",` |
| 262 | String Literal | `Anterior` | `prev: "Anterior",` |
| 263 | String Literal | `Siguiente` | `nextPage: "Siguiente",` |
| 267 | String Literal | `Nueva Captación` | `nuevo_lead: "Nueva Captación",` |
| 270 | String Literal | `Negociación` | `negociacion: "Negociación",` |
| 275 | String Literal | `Oportunidad movida a` | `movedSuccess: "Oportunidad movida a",` |
| 276 | String Literal | `Error al mover el deal` | `moveError: "Error al mover el deal",` |
| 279 | String Literal | `¿Seguro que deseas eliminar esta oportunidad?` | `deleteConfirm: "¿Seguro que deseas eliminar esta oportunidad?",` |
| 282 | String Literal | `Gestión de Oportunidades y Captación` | `desc: "Gestión de Oportunidades y Captación",` |
| 283 | String Literal | `Nueva Oportunidad` | `newOpportunity: "Nueva Oportunidad",` |
| 286 | String Literal | `CAPTACIÓN ACTIVA` | `activeLeads: "CAPTACIÓN ACTIVA",` |
| 288 | String Literal | `TASA DE CIERRE` | `closureRate: "TASA DE CIERRE",` |
| 289 | String Literal | `GANADO ESTE MES` | `wonThisMonth: "GANADO ESTE MES",` |
| 293 | String Literal | `Todas las etapas` | `allStages: "Todas las etapas",` |
| 295 | String Literal | `Este mes` | `thisMonth: "Este mes",` |
| 302 | String Literal | `Arrastra aquí o crea uno nuevo` | `emptyStateText: "Arrastra aquí o crea uno nuevo",` |
| 311 | String Literal | `Feedback de Calidad` | `subtitle: "Feedback de Calidad",` |
| 313 | String Literal | `Motivo de la pérdida` | `reasonLabel: "Motivo de la pérdida",` |
| 315 | String Literal | `Guardar y Cerrar` | `saveAndClose: "Guardar y Cerrar",` |
| 322 | String Literal | `Error al guardar` | `saveError: "Error al guardar",` |
| 324 | String Literal | `Error al eliminar` | `deleteError: "Error al eliminar",` |
| 326 | String Literal | `¿Seguro que quieres eliminar este item?` | `deleteConfirm: "¿Seguro que quieres eliminar este item?",` |
| 328 | String Literal | `Catálogo` | `title: "Catálogo",` |
| 330 | String Literal | `+ NUEVO ITEM` | `newItem: "+ NUEVO ITEM",` |
| 333 | String Literal | `Total Items` | `totalItems: "Total Items",` |
| 340 | String Literal | `Categoría` | `category: "Categoría",` |
| 341 | String Literal | `Precio` | `price: "Precio",` |
| 342 | String Literal | `Estado` | `status: "Estado",` |
| 346 | String Literal | `Activo` | `active: "Activo",` |
| 351 | String Literal | `Detalle del Item` | `title: "Detalle del Item",` |
| 352 | String Literal | `Nombre` | `nameLabel: "Nombre",` |
| 353 | String Literal | `Descripción` | `descLabel: "Descripción",` |
| 354 | String Literal | `Sin descripción` | `noDesc: "Sin descripción",` |
| 355 | String Literal | `Cerrar` | `close: "Cerrar",` |
| 358 | String Literal | `Editar Item` | `editTitle: "Editar Item",` |
| 359 | String Literal | `Nuevo Item` | `newTitle: "Nuevo Item",` |
| 360 | String Literal | `Nombre del Item*` | `nameLabel: "Nombre del Item*",` |
| 363 | String Literal | `Precio (€)` | `priceLabel: "Precio (€)",` |
| 365 | String Literal | `Guardar Item` | `save: "Guardar Item",` |
| 370 | String Literal | `Item añadido correctamente` | `added: "Item añadido correctamente",` |
| 371 | String Literal | `Error al añadir el item` | `addError: "Error al añadir el item",` |
| 373 | String Literal | `Error al actualizar` | `updateError: "Error al actualizar",` |
| 375 | String Literal | `No se pudo eliminar el item` | `deleteError: "No se pudo eliminar el item",` |
| 377 | String Literal | `¿Eliminar este item permanentemente?` | `deleteConfirm: "¿Eliminar este item permanentemente?",` |
| 379 | String Literal | `Inventario de Productos` | `title: "Inventario de Productos",` |
| 380 | String Literal | `Control de stock y valoración de activos comerciales` | `desc: "Control de stock y valoración de activos comerciales",` |
| 381 | String Literal | `Añadir Producto` | `addProduct: "Añadir Producto",` |
| 384 | String Literal | `Total Productos` | `totalProducts: "Total Productos",` |
| 385 | String Literal | `Stock Crítico` | `criticalStock: "Stock Crítico",` |
| 386 | String Literal | `Valorización` | `valuation: "Valorización",` |
| 391 | String Literal | `Categoría` | `category: "Categoría",` |
| 392 | String Literal | `Precio` | `price: "Precio",` |
| 395 | String Literal | `Bajo Mínimo` | `lowStock: "Bajo Mínimo",` |
| 399 | String Literal | `Detalle del Producto` | `title: "Detalle del Producto",` |
| 400 | String Literal | `Nombre` | `nameLabel: "Nombre",` |
| 401 | String Literal | `Categoría` | `categoryLabel: "Categoría",` |
| 402 | String Literal | `Precio` | `priceLabel: "Precio",` |
| 405 | String Literal | `Stock Mínimo` | `minStockLabel: "Stock Mínimo",` |
| 406 | String Literal | `Cerrar Vista` | `close: "Cerrar Vista",` |
| 409 | String Literal | `Nuevo Producto` | `title: "Nuevo Producto",` |
| 410 | String Literal | `Nombre del Producto` | `nameLabel: "Nombre del Producto",` |
| 411 | String Literal | `Ej: Cable de Cobre 2mm` | `namePlaceholder: "Ej: Cable de Cobre 2mm",` |
| 413 | String Literal | `Precio (€)` | `priceLabel: "Precio (€)",` |
| 414 | String Literal | `Mínimo` | `minStockLabel: "Mínimo",` |
| 415 | String Literal | `Guardar Producto` | `save: "Guardar Producto",` |
| 418 | String Literal | `Editar Producto` | `title: "Editar Producto",` |
| 425 | String Literal | `Error al cargar proyectos` | `loadError: "Error al cargar proyectos",` |
| 429 | String Literal | `NUEVO REGISTRO` | `newRecord: "NUEVO REGISTRO",` |
| 433 | String Literal | `ANÁLISIS` | `analytics: "ANÁLISIS",` |
| 438 | String Literal | `FACTURACIÓN TOTAL` | `totalBilling: "FACTURACIÓN TOTAL",` |
| 439 | String Literal | `Total Presupuesto` | `totalBudget: "Total Presupuesto",` |
| 440 | String Literal | `PENDIENTE COBRO` | `pendingPayment: "PENDIENTE COBRO",` |
| 441 | String Literal | `Por Cobrar` | `toCollect: "Por Cobrar",` |
| 444 | String Literal | `Estado General` | `generalStatus: "Estado General",` |
| 448 | String Literal | `Valor Medio por Registro` | `averageValuePerRecord: "Valor Medio por Registro",` |
| 450 | String Literal | `Valor por proyecto` | `valuePerProject: "Valor por proyecto",` |
| 451 | String Literal | `Estado` | `statusLabel: "Estado",` |
| 454 | String Literal | `Conversión` | `conversion: "Conversión",` |
| 455 | String Literal | `De éxito` | `successText: "De éxito",` |
| 456 | String Literal | `Ingresos por Proyecto (Completados)` | `revenuePerProject: "Ingresos por Proyecto (Completados)",` |
| 457 | String Literal | `Ingresos` | `revenue: "Ingresos",` |
| 458 | String Literal | `Evolución Ingresos por Mes` | `monthlyRevenueEvolution: "Evolución Ingresos por Mes",` |
| 466 | String Literal | `Error al procesar solicitud` | `processRequestError: "Error al procesar solicitud",` |
| 467 | String Literal | `Información actualizada` | `infoUpdated: "Información actualizada",` |
| 468 | String Literal | `Error al crear empleado` | `createEmployeeError: "Error al crear empleado",` |
| 470 | String Literal | `Error al guardar` | `saveError: "Error al guardar",` |
| 472 | String Literal | `Error al eliminar` | `deleteError: "Error al eliminar",` |
| 473 | String Literal | `La contraseña debe tener al menos 6 caracteres` | `passwordMinLength: "La contraseña debe tener al menos 6 caracteres",` |
| 474 | String Literal | `Contraseña actualizada` | `passwordUpdated: "Contraseña actualizada",` |
| 475 | String Literal | `Error al actualizar la contraseña` | `passwordUpdateError: "Error al actualizar la contraseña",` |
| 477 | String Literal | `¿Seguro que quieres eliminar a este colaborador?` | `deleteConfirm: "¿Seguro que quieres eliminar a este colaborador?",` |
| 479 | String Literal | `Gestión de Personal` | `management: "Gestión de Personal",` |
| 483 | String Literal | `Añadir Personal` | `addStaff: "Añadir Personal",` |
| 492 | String Literal | `Días` | `dias: "Días",` |
| 498 | String Literal | `Cancelar` | `cancel: "Cancelar",` |
| 507 | String Literal | `Pendiente` | `pendiente: "Pendiente",` |
| 517 | String Literal | `Editar Colaborador` | `editTitle: "Editar Colaborador",` |
| 518 | String Literal | `Nuevo Colaborador` | `newTitle: "Nuevo Colaborador",` |
| 519 | String Literal | `Nombre completo` | `fullName: "Nombre completo",` |
| 521 | String Literal | `Contraseña temporal` | `tempPassword: "Contraseña temporal",` |
| 523 | String Literal | `Nivel de Acceso` | `accessLevel: "Nivel de Acceso",` |
| 524 | String Literal | `Usuario` | `roleUser: "Usuario",` |
| 529 | String Literal | `Crear Colaborador` | `createButton: "Crear Colaborador",` |
| 533 | String Literal | `Actualizar Contraseña` | `subtitle: "Actualizar Contraseña",` |
| 534 | String Literal | `Nueva contraseña` | `newPasswordLabel: "Nueva contraseña",` |
| 535 | String Literal | `Mínimo 6 caracteres` | `placeholder: "Mínimo 6 caracteres",` |
| 542 | String Literal | `Mañana` | `morning: "Mañana",` |
| 545 | String Literal | `Fin de semana` | `finde: "Fin de semana",` |
| 548 | String Literal | `Selecciona un empleado` | `selectEmployee: "Selecciona un empleado",` |
| 552 | String Literal | `Error al guardar turno` | `saveError: "Error al guardar turno",` |
| 554 | String Literal | `Error al eliminar` | `deleteError: "Error al eliminar",` |
| 556 | String Literal | `¿Seguro que quieres eliminar este turno?` | `deleteConfirm: "¿Seguro que quieres eliminar este turno?",` |
| 566 | String Literal | `Gestión de Horarios` | `management: "Gestión de Horarios",` |
| 567 | String Literal | `Activo` | `activeStatus: "Activo",` |
| 568 | String Literal | `Planificación` | `title: "Planificación",` |
| 569 | String Literal | `Añadir` | `add: "Añadir",` |
| 570 | String Literal | `Añadir Turno` | `addShift: "Añadir Turno",` |
| 576 | String Literal | `Turnos para hoy` | `title: "Turnos para hoy",` |
| 578 | String Literal | `No hay turnos asignados para este día` | `noShifts: "No hay turnos asignados para este día",` |
| 581 | String Literal | `Editar Turno` | `editTitle: "Editar Turno",` |
| 586 | String Literal | `FECHA DEL REGISTRO` | `dateLabel: "FECHA DEL REGISTRO",` |
| 587 | String Literal | `HASTA (opcional)` | `endDateLabel: "HASTA (opcional)",` |
| 589 | String Literal | `HORA ENTRADA` | `startTimeLabel: "HORA ENTRADA",` |
| 590 | String Literal | `HORA SALIDA` | `endTimeLabel: "HORA SALIDA",` |
| 592 | String Literal | `HORA ENTRADA 2` | `startTime2Label: "HORA ENTRADA 2",` |
| 593 | String Literal | `HORA SALIDA 2` | `endTime2Label: "HORA SALIDA 2",` |
| 602 | String Literal | `Error al exportar` | `exportError: "Error al exportar",` |
| 603 | String Literal | `Sin datos para el informe` | `noDataReport: "Sin datos para el informe",` |
| 605 | String Literal | `Error al generar el PDF` | `pdfError: "Error al generar el PDF",` |
| 606 | String Literal | `Error al refrescar datos` | `refreshError: "Error al refrescar datos",` |
| 607 | String Literal | `Sesión expirada` | `sessionExpired: "Sesión expirada",` |
| 610 | String Literal | `Gestión` | `management: "Gestión",` |
| 613 | String Literal | `Año anterior` | `prevYear: "Año anterior",` |
| 614 | String Literal | `Siguiente año` | `nextYear: "Siguiente año",` |
| 620 | String Literal | `Error al inicializar el auditor` | `initError: "Error al inicializar el auditor",` |
| 621 | String Literal | `Error al enviar mensaje` | `sendError: "Error al enviar mensaje",` |
| 622 | String Literal | `Iniciar Consultoría` | `startButton: "Iniciar Consultoría",` |
| 625 | String Literal | `Enviar` | `sendButton: "Enviar",` |
| 630 | String Literal | `Nuevo Ingreso` | `title: "Nuevo Ingreso",` |
| 632 | String Literal | `Ej: Fiesta cumpleaños` | `conceptPlaceholder: "Ej: Fiesta cumpleaños",` |
| 636 | String Literal | `Nuevo Ingreso` | `submitButton: "Nuevo Ingreso",` |
| 638 | String Literal | `El concepto no puede estar vacío` | `conceptEmpty: "El concepto no puede estar vacío",` |
| 639 | String Literal | `El importe debe ser mayor que 0` | `amountInvalid: "El importe debe ser mayor que 0",` |
| 640 | String Literal | `Selecciona un mes` | `selectMonth: "Selecciona un mes",` |
| 641 | String Literal | `Usuario no autenticado` | `noUser: "Usuario no autenticado",` |
| 642 | String Literal | `Organización no encontrada` | `noOrg: "Organización no encontrada",` |
| 645 | String Literal | `Ingreso añadido` | `success: "Ingreso añadido",` |
| 646 | String Literal | `Error al añadir ingreso` | `error: "Error al añadir ingreso",` |
| 650 | String Literal | `Nuevo Gasto` | `title: "Nuevo Gasto",` |
| 653 | String Literal | `Tipo de Gasto (Rápido)` | `quickTypeLabel: "Tipo de Gasto (Rápido)",` |
| 658 | String Literal | `Nuevo Gasto` | `submitButton: "Nuevo Gasto",` |
| 660 | String Literal | `Selecciona o escribe una categoría` | `categoryEmpty: "Selecciona o escribe una categoría",` |
| 661 | String Literal | `El importe debe ser mayor que 0` | `amountInvalid: "El importe debe ser mayor que 0",` |
| 662 | String Literal | `Selecciona un mes` | `selectMonth: "Selecciona un mes",` |
| 663 | String Literal | `Usuario no autenticado` | `noUser: "Usuario no autenticado",` |
| 664 | String Literal | `Organización no encontrada` | `noOrg: "Organización no encontrada",` |
| 667 | String Literal | `Gasto añadido` | `success: "Gasto añadido",` |
| 668 | String Literal | `Error al añadir gasto` | `error: "Error al añadir gasto",` |
| 672 | String Literal | `Nuevo Ingreso` | `title: "Nuevo Ingreso",` |
| 677 | String Literal | `Nombre cliente` | `clientPlaceholder: "Nombre cliente",` |
| 679 | String Literal | `Nombre proyecto` | `projectPlaceholder: "Nombre proyecto",` |
| 682 | String Literal | `Nuevo Ingreso` | `submitButton: "Nuevo Ingreso",` |
| 684 | String Literal | `El concepto no puede estar vacío` | `conceptEmpty: "El concepto no puede estar vacío",` |
| 685 | String Literal | `El importe debe ser mayor que 0` | `amountInvalid: "El importe debe ser mayor que 0",` |
| 688 | String Literal | `No autenticado` | `noUser: "No autenticado",` |
| 689 | String Literal | `Organización no encontrada` | `noOrg: "Organización no encontrada",` |
| 690 | String Literal | `Ingreso añadido correctamente` | `success: "Ingreso añadido correctamente",` |
| 691 | String Literal | `Error al añadir ingreso` | `error: "Error al añadir ingreso",` |
| 695 | String Literal | `Nuevo Gasto` | `title: "Nuevo Gasto",` |
| 696 | String Literal | `Gasto del negocio` | `subtitle: "Gasto del negocio",` |
| 699 | String Literal | `Tipo de gasto` | `typeLabel: "Tipo de gasto",` |
| 703 | String Literal | `Nuevo Gasto` | `submitButton: "Nuevo Gasto",` |
| 705 | String Literal | `El concepto no puede estar vacío` | `conceptEmpty: "El concepto no puede estar vacío",` |
| 706 | String Literal | `El importe debe ser mayor que 0` | `amountInvalid: "El importe debe ser mayor que 0",` |
| 709 | String Literal | `No autenticado` | `noUser: "No autenticado",` |
| 710 | String Literal | `Organización no encontrada` | `noOrg: "Organización no encontrada",` |
| 711 | String Literal | `Gasto añadido correctamente` | `success: "Gasto añadido correctamente",` |
| 712 | String Literal | `Error al añadir gasto` | `error: "Error al añadir gasto",` |
| 716 | String Literal | `Ventas` | `ventas: "Ventas",` |
| 718 | String Literal | `Proyectos` | `proyectos: "Proyectos",` |
| 721 | String Literal | `Consultoría` | `consultoria: "Consultoría",` |
| 723 | String Literal | `Otros ingresos` | `otros_ingresos: "Otros ingresos",` |
| 733 | String Literal | `Otros gastos` | `otros_gastos: "Otros gastos",` |
| 738 | String Literal | `Error al cargar datos del negocio` | `loadError: "Error al cargar datos del negocio",` |
| 742 | String Literal | `Gestión financiera · Datos en tiempo real` | `subtitle: "Gestión financiera · Datos en tiempo real",` |
| 759 | String Literal | `INGRESOS` | `ingresos: "INGRESOS",` |
| 760 | String Literal | `GASTOS` | `gastos: "GASTOS",` |
| 761 | String Literal | `BALANCE TOTAL` | `balanceTotal: "BALANCE TOTAL",` |
| 762 | String Literal | `Este mes` | `esteMes: "Este mes",` |
| 763 | String Literal | `Cálculo tiempo real` | `calculoTiempoReal: "Cálculo tiempo real"` |
| 772 | String Literal | `Suscripción` | `suscripcion: "Suscripción",` |
| 775 | String Literal | `Introduce un concepto` | `conceptEmpty: "Introduce un concepto",` |
| 776 | String Literal | `Importe inválido` | `amountInvalid: "Importe inválido",` |
| 779 | String Literal | `Error al añadir concepto` | `addError: "Error al añadir concepto",` |
| 780 | String Literal | `Concepto añadido correctamente` | `addSuccess: "Concepto añadido correctamente",` |
| 781 | String Literal | `Error al actualizar` | `updateError: "Error al actualizar",` |
| 782 | String Literal | `Error al eliminar concepto` | `deleteError: "Error al eliminar concepto",` |
| 785 | String Literal | `¿Eliminar {concept}?` | `confirmDelete: "¿Eliminar {concept}?",` |
| 787 | String Literal | `Ver histórico` | `viewHistory: "Ver histórico",` |
| 790 | String Literal | `TIPO` | `type: "TIPO",` |
| 794 | String Literal | `No hay entradas para este mes` | `noEntries: "No hay entradas para este mes",` |
| 795 | String Literal | `Pulsa + Añadir concepto para comenzar` | `addConceptPrompt: "Pulsa + Añadir concepto para comenzar",` |
| 796 | String Literal | `Editar importe` | `editAmountTooltip: "Editar importe",` |
| 800 | String Literal | `AÑADIR CONCEPTO` | `addConceptButton: "AÑADIR CONCEPTO",` |
| 801 | String Literal | `Confirmar` | `confirmButton: "Confirmar",` |
| 803 | String Literal | `INGRESOS` | `income: "INGRESOS",` |
| 804 | String Literal | `GASTOS` | `expenses: "GASTOS",` |
| 808 | String Literal | `Distribución de Gastos (Detallada)` | `title: "Distribución de Gastos (Detallada)",` |
| 809 | String Literal | `Sin datos de gastos para {month}` | `noData: "Sin datos de gastos para {month}"` |
| 813 | String Literal | `este mes` | `thisMonth: "este mes",` |
| 815 | String Literal | `Sin ingresos registrados` | `title: "Sin ingresos registrados",` |
| 828 | String Literal | `Gastos elevados` | `title: "Gastos elevados",` |
| 832 | String Literal | `Negocio equilibrado` | `businessTitle: "Negocio equilibrado",` |
| 839 | String Literal | `Ingresos vs Gastos` | `incomeVsExpenses: "Ingresos vs Gastos",` |
| 840 | String Literal | `Ingresos` | `income: "Ingresos",` |
| 841 | String Literal | `Gastos` | `expenses: "Gastos"` |
| 845 | String Literal | `No autenticado` | `noUser: "No autenticado"` |
| 849 | String Literal | `Ingresos` | `income: "Ingresos",` |
| 850 | String Literal | `Gastos` | `expenses: "Gastos",` |
| 853 | String Literal | `Año {year}` | `yearLabel: "Año {year}",` |
| 857 | String Literal | `Vacío` | `empty: "Vacío"` |
| 862 | String Literal | `GRÁFICO` | `chart: "GRÁFICO",` |
| 869 | String Literal | `Error al cargar facturas` | `loadError: "Error al cargar facturas",` |
| 870 | String Literal | `Marcado como pagado` | `markedPaid: "Marcado como pagado",` |
| 871 | String Literal | `Error al actualizar` | `updateError: "Error al actualizar",` |
| 873 | String Literal | `Error al eliminar` | `deleteError: "Error al eliminar",` |
| 875 | String Literal | `Error al generar PDF` | `pdfError: "Error al generar PDF",` |
| 876 | String Literal | `El cliente no tiene un email válido registrado` | `noEmail: "El cliente no tiene un email válido registrado",` |
| 877 | String Literal | `Factura enviada al cliente` | `sent: "Factura enviada al cliente",` |
| 878 | String Literal | `Error al enviar email` | `sendError: "Error al enviar email",` |
| 880 | String Literal | `¿Seguro que quieres eliminar el registro {num}?` | `deleteConfirm: "¿Seguro que quieres eliminar el registro {num}?",` |
| 883 | String Literal | `Pendiente` | `pending: "Pendiente",` |
| 888 | String Literal | `Gestión de Facturación` | `management: "Gestión de Facturación",` |
| 890 | String Literal | `Control de` | `controlOf: "Control de",` |
| 896 | String Literal | `ANÁLISIS` | `analytics: "ANÁLISIS",` |
| 899 | String Literal | `TOTAL FACTURADO` | `totalBilled: "TOTAL FACTURADO",` |
| 900 | String Literal | `PENDIENTE COBRO` | `pendingPayment: "PENDIENTE COBRO",` |
| 901 | String Literal | `PAGADO MES` | `paidMonth: "PAGADO MES",` |
| 904 | String Literal | `FILTRAR POR ESTADO` | `filterByStatus: "FILTRAR POR ESTADO",` |
| 915 | String Literal | `Total` | `total: "Total",` |
| 916 | String Literal | `Estado` | `status: "Estado",` |
| 917 | String Literal | `Emisión` | `issueDate: "Emisión",` |
| 919 | String Literal | `No se encontraron registros` | `noRecords: "No se encontraron registros",` |
| 923 | String Literal | `Analíticas` | `title: "Analíticas",` |
| 928 | String Literal | `Volumen de Actividad` | `activityVolume: "Volumen de Actividad",` |
| 934 | String Literal | `ACTIVIDAD TOTAL` | `totalActivity: "ACTIVIDAD TOTAL",` |
| 935 | String Literal | `TASA OCUPACIÓN` | `occupancyRate: "TASA OCUPACIÓN",` |
| 939 | String Literal | `CONTACTOS NUEVOS MES` | `newContactsMonth: "CONTACTOS NUEVOS MES",` |
| 941 | String Literal | `INGRESOS TOTALES` | `totalRevenue: "INGRESOS TOTALES",` |
| 944 | String Literal | `Analíticas del Negocio` | `title: "Analíticas del Negocio",` |
| 946 | String Literal | `Métrica` | `metric: "Métrica",` |
| 956 | String Literal | `Análisis de Crecimiento` | `growthAnalysis: "Análisis de Crecimiento",` |
| 960 | String Literal | `Error al cargar datos reales` | `loadError: "Error al cargar datos reales",` |
| 961 | String Literal | `PDF generado con éxito` | `pdfSuccess: "PDF generado con éxito",` |
| 962 | String Literal | `Error al generar PDF` | `pdfError: "Error al generar PDF",` |
| 966 | String Literal | `Esta semana` | `week: "Esta semana",` |
| 970 | String Literal | `Ingresos` | `revenue: "Ingresos",` |
| 972 | String Literal | `Total Facturas` | `totalInvoices: "Total Facturas",` |
| 975 | String Literal | `Ventas vs Actividad` | `salesVsActivity: "Ventas vs Actividad",` |
| 976 | String Literal | `Distribución semanal de actividad` | `weeklyDistribution: "Distribución semanal de actividad",` |
| 977 | String Literal | `Ingresos` | `revenue: "Ingresos",` |
| 980 | String Literal | `Los más destacados del periodo` | `periodHighlights: "Los más destacados del periodo",` |
| 981 | String Literal | `Sin datos registrados` | `noData: "Sin datos registrados",` |
| 985 | String Literal | `Tiempo de Respuesta` | `responseTime: "Tiempo de Respuesta",` |
| 987 | String Literal | `Satisfacción Contacto` | `contactSatisfaction: "Satisfacción Contacto",` |
| 989 | String Literal | `Pendiente` | `pending: "Pendiente",` |
| 990 | String Literal | `Sin votos` | `noVotes: "Sin votos",` |
| 997 | String Literal | `Fecha de exportación` | `exportDate: "Fecha de exportación",` |
| 998 | String Literal | `Métrica principal` | `mainMetric: "Métrica principal",` |
| 1000 | String Literal | `Ingresos Totales` | `totalRevenue: "Ingresos Totales",` |
| 1002 | String Literal | `Total Registros` | `totalRecords: "Total Registros",` |
| 1003 | String Literal | `Capacidad de atención` | `serviceCapacity: "Capacidad de atención",` |
| 1007 | String Literal | `Ajustes` | `title: "Ajustes",` |
| 1009 | String Literal | `Configuración de Perfil` | `title: "Configuración de Perfil",` |
| 1010 | String Literal | `Guardar Perfil` | `save: "Guardar Perfil",` |
| 1012 | String Literal | `Error al subir la imagen` | `photoError: "Error al subir la imagen",` |
| 1013 | String Literal | `Nombre completo` | `fullName: "Nombre completo",` |
| 1016 | String Literal | `Teléfono` | `phone: "Teléfono",` |
| 1017 | String Literal | `Perfil actualizado` | `updated: "Perfil actualizado",` |
| 1018 | String Literal | `Error al guardar perfil` | `saveError: "Error al guardar perfil",` |
| 1021 | String Literal | `Mi Organización` | `title: "Mi Organización",` |
| 1022 | String Literal | `Nombre del negocio` | `businessName: "Nombre del negocio",` |
| 1023 | String Literal | `Actividad del negocio` | `businessActivity: "Actividad del negocio",` |
| 1025 | String Literal | `Dirección fiscal` | `billingAddress: "Dirección fiscal",` |
| 1027 | String Literal | `País` | `country: "País",` |
| 1029 | String Literal | `Símbolo` | `symbol: "Símbolo",` |
| 1030 | String Literal | `Teléfono` | `phone: "Teléfono",` |
| 1031 | String Literal | `Métodos de cobro` | `paymentMethods: "Métodos de cobro",` |
| 1033 | String Literal | `Número Bizum` | `bizumNumber: "Número Bizum",` |
| 1034 | String Literal | `IBAN para transferencia` | `iban: "IBAN para transferencia",` |
| 1035 | String Literal | `Guardar Negocio` | `save: "Guardar Negocio",` |
| 1036 | String Literal | `Ejecuta primero el SQL en Supabase` | `sqlError: "Ejecuta primero el SQL en Supabase",` |
| 1037 | String Literal | `Organización actualizada` | `updated: "Organización actualizada",` |
| 1038 | String Literal | `Error al guardar organización` | `saveError: "Error al guardar organización",` |
| 1042 | String Literal | `Días Laborables` | `workingDays: "Días Laborables",` |
| 1045 | String Literal | `Guardar Horario` | `save: "Guardar Horario",` |
| 1047 | String Literal | `Error al guardar horarios` | `saveError: "Error al guardar horarios",` |
| 1050 | String Literal | `IA Autónoma` | `title: "IA Autónoma",` |
| 1052 | String Literal | `Citas automáticas` | `autoAppointments: "Citas automáticas",` |
| 1053 | String Literal | `Crear clientes CRM` | `autoClients: "Crear clientes CRM",` |
| 1055 | String Literal | `Descripción del negocio` | `businessDesc: "Descripción del negocio",` |
| 1057 | String Literal | `Guardar IA` | `save: "Guardar IA",` |
| 1058 | String Literal | `Configuración de IA actualizada` | `updated: "Configuración de IA actualizada",` |
| 1059 | String Literal | `Error al guardar configuración` | `saveError: "Error al guardar configuración",` |
| 1066 | String Literal | `Suscripción` | `title: "Suscripción",` |
| 1069 | String Literal | `días` | `days: "días",` |
| 1070 | String Literal | `Activo` | `active: "Activo",` |
| 1071 | String Literal | `Activar Suscripción` | `activate: "Activar Suscripción",` |
| 1072 | String Literal | `Cancelar` | `cancel: "Cancelar",` |
| 1073 | String Literal | `Facturas` | `invoices: "Facturas",` |
| 1075 | String Literal | `Error al cancelar` | `cancelError: "Error al cancelar",` |
| 1076 | String Literal | `Error de conexión` | `connectionError: "Error de conexión",` |
| 1079 | String Literal | `Actualiza a SF Gestor Empresarial` | `title: "Actualiza a SF Gestor Empresarial",` |
| 1080 | String Literal | `90 DÍAS GRATIS` | `freeTrial: "90 DÍAS GRATIS",` |
| 1082 | String Literal | `Todo lo que necesitas para crecer` | `planSlogan: "Todo lo que necesitas para crecer",` |
| 1083 | String Literal | `por mes facturado` | `perMonth: "por mes facturado",` |
| 1085 | String Literal | `Clientes y agenda ilimitados` | `crm: "Clientes y agenda ilimitados",` |
| 1088 | String Literal | `Finanzas y facturas` | `finances: "Finanzas y facturas",` |
| 1089 | String Literal | `Productos e inventario` | `products: "Productos e inventario",` |
| 1090 | String Literal | `Estadísticas y métricas` | `metrics: "Estadísticas y métricas",` |
| 1091 | String Literal | `Equipo y fichajes` | `team: "Equipo y fichajes",` |
| 1092 | String Literal | `SF IA en el panel` | `aiPanel: "SF IA en el panel",` |
| 1095 | String Literal | `Cancela en cualquier momento` | `cancelAnytime: "Cancela en cualquier momento",` |
| 1096 | String Literal | `Configuración de precio no encontrada` | `priceError: "Configuración de precio no encontrada",` |
| 1097 | String Literal | `Error: No se encontró el ID de la organización` | `orgIdError: "Error: No se encontró el ID de la organización",` |
| 1098 | String Literal | `Error al procesar el pago` | `checkoutError: "Error al procesar el pago",` |
| 1102 | String Literal | `Conexión` | `connection: "Conexión",` |
| 1103 | String Literal | `Reenvío automático (Forwarding) a` | `forwardingTo: "Reenvío automático (Forwarding) a",` |
| 1104 | String Literal | `Tu email de negocio` | `businessEmail: "Tu email de negocio",` |
| 1105 | String Literal | `Nombre visible` | `displayName: "Nombre visible",` |
| 1106 | String Literal | `Firma automática` | `signature: "Firma automática",` |
| 1108 | String Literal | `Responder con IA` | `replyWithAI: "Responder con IA",` |
| 1109 | String Literal | `Activa la respuesta automática para emails` | `replyWithAISub: "Activa la respuesta automática para emails",` |
| 1110 | String Literal | `Correo de Alertas` | `alertEmail: "Correo de Alertas",` |
| 1113 | String Literal | `Guardar Email` | `save: "Guardar Email",` |
| 1114 | String Literal | `El Correo de Alertas es obligatorio` | `alertEmailRequired: "El Correo de Alertas es obligatorio",` |
| 1115 | String Literal | `Introduce un email válido para las alertas` | `alertEmailInvalid: "Introduce un email válido para las alertas",` |
| 1116 | String Literal | `Configuración de email guardada` | `saved: "Configuración de email guardada",` |
| 1117 | String Literal | `Error al guardar configuración` | `saveError: "Error al guardar configuración",` |
| 1121 | String Literal | `Opción A — Mensaje de ausencia` | `optionA: "Opción A — Mensaje de ausencia",` |
| 1125 | String Literal | `Opción B — Tu número en Meta API` | `optionB: "Opción B — Tu número en Meta API",` |
| 1127 | String Literal | `Opción C — Número dedicado` | `optionC: "Opción C — Número dedicado",` |
| 1135 | String Literal | `Asistente IA Activo` | `aiAssistantActive: "Asistente IA Activo",` |
| 1138 | String Literal | `Automatización IA` | `aiAutomation: "Automatización IA",` |
| 1139 | String Literal | `Asistente gestiona todas las respuestas` | `aiAssistantDesc: "Asistente gestiona todas las respuestas",` |
| 1143 | String Literal | `Respuesta automática email` | `emailAiDesc: "Respuesta automática email",` |
| 1147 | String Literal | `POR IA` | `byAi: "POR IA",` |
| 1150 | String Literal | `Todos` | `all: "Todos",` |
| 1157 | String Literal | `Información` | `info: "Información",` |
| 1159 | String Literal | `No hay conversaciones` | `noConversations: "No hay conversaciones",` |
| 1160 | String Literal | `Los mensajes aparecerán aquí` | `messagesAppearHere: "Los mensajes aparecerán aquí",` |
| 1162 | String Literal | `Conversación eliminada` | `deleted: "Conversación eliminada",` |
| 1163 | String Literal | `Error al eliminar` | `deleteError: "Error al eliminar",` |
| 1165 | String Literal | `Error al enviar` | `sendError: "Error al enviar",` |
| 1166 | String Literal | `Máximo 10MB` | `max10MB: "Máximo 10MB",` |
| 1168 | String Literal | `Error al subir archivo` | `uploadError: "Error al subir archivo",` |
| 1169 | String Literal | `Marcado como resuelto` | `markedResolved: "Marcado como resuelto",` |
| 1170 | String Literal | `Error al actualizar` | `updateError: "Error al actualizar",` |
| 1173 | String Literal | `Eliminar conversación` | `deleteConversation: "Eliminar conversación",` |
| 1175 | String Literal | `PENDIENTE` | `pending: "PENDIENTE",` |
| 1181 | String Literal | `¿Eliminar conversación?` | `title: "¿Eliminar conversación?",` |
| 1185 | String Literal | `Visor de Conversación` | `title: "Visor de Conversación",` |
| 1188 | String Literal | `Vía Email` | `viaEmail: "Vía Email",` |
| 1189 | String Literal | `Sin teléfono registrado` | `noPhone: "Sin teléfono registrado",` |
| 1190 | String Literal | `Llamar a` | `call: "Llamar a",` |
| 1191 | String Literal | `Ver ficha de cliente` | `viewClientCard: "Ver ficha de cliente",` |
| 1192 | String Literal | `Historial gestionado por Asistente IA` | `historyManagedByAi: "Historial gestionado por Asistente IA",` |
| 1196 | String Literal | `Enviar` | `send: "Enviar",` |
| 1197 | String Literal | `La IA está pausada — responde tú` | `aiPaused: "La IA está pausada — responde tú",` |
| 1204 | String Literal | `CORRECTO` | `correct: "CORRECTO",` |
| 1205 | String Literal | `INCORRECTO` | `incorrect: "INCORRECTO",` |
| 1208 | String Literal | `SIN FICHAR` | `noClockIn: "SIN FICHAR",` |
| 1210 | String Literal | `EN TURNO` | `inShift: "EN TURNO",` |
| 1213 | String Literal | `INFORME DE FICHAJES` | `reportTitle: "INFORME DE FICHAJES",` |
| 1214 | String Literal | `Panel de Control` | `controlPanel: "Panel de Control",` |
| 1215 | String Literal | `Fecha del informe` | `reportDate: "Fecha del informe",` |
| 1217 | String Literal | `Ubicación` | `location: "Ubicación",` |
| 1218 | String Literal | `No configurada` | `notConfigured: "No configurada",` |
| 1220 | String Literal | `TOTAL HORAS` | `totalHours: "TOTAL HORAS",` |
| 1222 | String Literal | `Página {page} de {total}` | `pageOf: "Página {page} de {total}",` |
| 1226 | String Literal | `Dirección no encontrada, intenta ser más específico` | `addressNotFound: "Dirección no encontrada, intenta ser más específico",` |
| 1227 | String Literal | `Error al buscar dirección` | `searchError: "Error al buscar dirección",` |
| 1228 | String Literal | `Pulsa primero el botón Buscar para validar la dirección` | `validateFirst: "Pulsa primero el botón Buscar para validar la dirección",` |
| 1229 | String Literal | `Busca primero la dirección del negocio` | `searchFirst: "Busca primero la dirección del negocio",` |
| 1230 | String Literal | `Ubicación del negocio guardada y actualizada` | `savedSuccess: "Ubicación del negocio guardada y actualizada",` |
| 1231 | String Literal | `Error al guardar la ubicación` | `saveError: "Error al guardar la ubicación",` |
| 1232 | String Literal | `Ubicación seleccionada en mapa` | `locationSelected: "Ubicación seleccionada en mapa",` |
| 1234 | String Literal | `Panel de Fichajes` | `title: "Panel de Fichajes",` |
| 1235 | String Literal | `Control diario de entradas y salidas` | `subtitle: "Control diario de entradas y salidas",` |
| 1237 | String Literal | `Configuración de Ubicación del Negocio` | `configTitle: "Configuración de Ubicación del Negocio",` |
| 1238 | String Literal | `DIRECCIÓN DEL NEGOCIO` | `addressLabel: "DIRECCIÓN DEL NEGOCIO",` |
| 1240 | String Literal | `Busca una dirección para ver el mapa` | `mapSearchHint: "Busca una dirección para ver el mapa",` |
| 1241 | String Literal | `Pincha en el mapa o arrastra el marcador para seleccionar la ubicación exacta del negocio` | `mapPinHint: "Pincha en el mapa o arrastra el marcador para seleccionar la ubicación exacta del negocio",` |
| 1242 | String Literal | `RADIO MÁXIMO (METROS)` | `maxRadiusLabel: "RADIO MÁXIMO (METROS)",` |
| 1243 | String Literal | `Guardar configuración` | `saveConfigButton: "Guardar configuración",` |
| 1244 | String Literal | `Ubicación Guardada` | `locationSaved: "Ubicación Guardada",` |
| 1247 | String Literal | `En Turno` | `kpiEnTurno: "En Turno",` |
| 1248 | String Literal | `Sin Fichar` | `kpiSinFichar: "Sin Fichar",` |
| 1249 | String Literal | `Resumen del Día` | `summaryTitle: "Resumen del Día",` |
| 1252 | String Literal | `Estado` | `status: "Estado",` |
| 1255 | String Literal | `Total Horas` | `totalHours: "Total Horas",` |
| 1256 | String Literal | `Hora` | `time: "Hora",` |
| 1257 | String Literal | `Acción` | `action: "Acción",` |
| 1259 | String Literal | `Ubicación` | `location: "Ubicación",` |
| 1261 | String Literal | `Estado Geo` | `geoStatus: "Estado Geo",` |
| 1264 | String Literal | `{count} eventos registrados hoy` | `eventsRegistered: "{count} eventos registrados hoy",` |
| 1270 | String Literal | `Conexión Segura` | `secureConnection: "Conexión Segura",` |
| 1272 | String Literal | `Ubicación` | `location: "Ubicación",` |
| 1273 | String Literal | `Información para la IA` | `aiInfo: "Información para la IA",` |
| 1281 | String Literal | `Link de Google Maps` | `googleMapsPlaceholder: "Link de Google Maps",` |
| 1286 | String Literal | `Usar esta información para la IA` | `useInfoForAI: "Usar esta información para la IA",` |
| 1287 | String Literal | `La IA compartirá tu web, redes y descripción con tus clientes automáticamente` | `useInfoForAIDesc: "La IA compartirá tu web, redes y descripción con tus clientes automáticamente",` |
| 1288 | String Literal | `GUARDAR CONFIGURACIÓN` | `saveConfig: "GUARDAR CONFIGURACIÓN",` |
| 1290 | String Literal | `Configuración de la web guardada` | `saved: "Configuración de la web guardada",` |
| 1291 | String Literal | `Error al guardar` | `saveError: "Error al guardar",` |
| 1292 | String Literal | `Permiso denegado (¿Has ejecutado el SQL?)` | `permissionDenied: "Permiso denegado (¿Has ejecutado el SQL?)",` |

---

### 📄 [`src\lib\projectsContext.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/projectsContext.ts)
- **Cantidad de textos hardcodeados:** 2
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 24 | String Literal | `activo` | `p => p.status === 'activo'` |
| 27 | String Literal | `completado` | `p => p.status === 'completado'` |

---

### 📄 [`src\lib\rag.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/rag.ts)
- **Cantidad de textos hardcodeados:** 12
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 10 | String Literal | `HUGGINGFACE_API_KEY no configurada` | `throw new Error('HUGGINGFACE_API_KEY no configurada')` |
| 47 | String Literal | `[RAG] Embedding tipo:` | `console.log('[RAG] Embedding tipo:',` |
| 63 | String Literal | `Formato de embedding inesperado` | `'Formato de embedding inesperado')` |
| 74 | String Literal | `generateEmbedding falló después de 3 intentos` | `throw new Error('generateEmbedding falló después de 3 intentos')` |
| 114 | String Literal | `[RAG] Error buscando:` | `console.error('[RAG] Error buscando:', err)` |
| 141 | String Literal | `id, invoice_number, concept, total, status, due_date` | `supabase.from('invoices').select('id, invoice_number, concept, total, status, due_date').eq('organization_id', organizationId),` |
| 144 | String Literal | `id, nombre, temperatura, estado, email, notas` | `supabase.from('leads').select('id, nombre, temperatura, estado, email, notas').eq('organization_id', organizationId),` |
| 145 | String Literal | `id, nombre, valor_estimado, etapa, prioridad` | `supabase.from('pipeline_deals').select('id, nombre, valor_estimado, etapa, prioridad').eq('organization_id', organizationId),` |
| 147 | String Literal | `id, nombre, descripcion, precio` | `supabase.from('catalogo_items').select('id, nombre, descripcion, precio').eq('organization_id', organizationId).eq('activo', true)` |
| 147 | String Literal | `activo` | `supabase.from('catalogo_items').select('id, nombre, descripcion, precio').eq('organization_id', organizationId).eq('activo', true)` |
| 163 | String Literal | `sin fecha` | `content: `Factura ${i.invoice_number}: ${i.concept}. Total: ${i.total}€. Estado: ${i.status}. Vence: ${i.due_date\|\|'sin fecha'}`,` |
| 265 | String Literal | `[RAG] Error indexando registro:` | `console.error('[RAG] Error indexando registro:', err)` |

---

### 📄 [`src\lib\sendEmail.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/sendEmail.ts)
- **Cantidad de textos hardcodeados:** 3
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 16 | String Literal | `sendEmail solo puede ejecutarse en el servidor` | `throw new Error('sendEmail solo puede ejecutarse en el servidor');` |
| 33 | String Literal | `Resend error:` | `console.error('Resend error:', error)` |
| 39 | String Literal | `Send email error:` | `console.error('Send email error:', error)` |

---

### 📄 [`src\lib\sendWhatsApp.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/sendWhatsApp.ts)
- **Cantidad de textos hardcodeados:** 2
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 23 | String Literal | `[WhatsApp] Error: No se proporcionó orgId` | `console.error('[WhatsApp] Error: No se proporcionó orgId')` |
| 86 | String Literal | `[WhatsApp] Fatal sending error:` | `console.error('[WhatsApp] Fatal sending error:', error.message)` |

---

### 📄 [`src\lib\stripe.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/stripe.ts)
- **Cantidad de textos hardcodeados:** 7
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 24 | String Literal | `Email IA automático` | `'Email IA automático',` |
| 26 | String Literal | `CRM básico (50 clientes)` | `'CRM básico (50 clientes)',` |
| 27 | String Literal | `Citas básicas` | `'Citas básicas'` |
| 47 | String Literal | `Facturación completa` | `'Facturación completa',` |
| 65 | String Literal | `Agentes IA autónomos` | `'Agentes IA autónomos',` |
| 66 | String Literal | `Múltiples usuarios` | `'Múltiples usuarios',` |
| 68 | String Literal | `Soporte prioritario` | `'Soporte prioritario'` |

---

### 📄 [`src\lib\tavily.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/tavily.ts)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 35 | String Literal | `Tavily error:` | `console.error('Tavily error:', error)` |

---

### 📄 [`src\lib\uploadFile.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/uploadFile.ts)
- **Cantidad de textos hardcodeados:** 2
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 8 | String Literal | `No hay sesión de usuario` | `console.error('No hay sesión de usuario')` |
| 25 | String Literal | `Error al subir:` | `console.error('Error al subir:', error)` |

---

### 📄 [`src\lib\workHours.ts`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/workHours.ts)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 46 | String Literal | `Error fetching work hours:` | `console.error('Error fetching work hours:', err);` |

---

## 🔍 Detalle de Archivos Parcialmente Traducidos (Con useLanguage pero textos hardcodeados)
Estos archivos ya importan el contexto de idioma o tienen configurada la traducción en algunas partes, pero **aún conservan textos en español literales** que no se están traduciendo con la función `t()` y deben ser migrados al diccionario.

### 📄 [`src\app\(dashboard)\dashboard\analytics\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/analytics/page.tsx)
- **Cantidad de textos hardcodeados:** 7
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 95 | String Literal | `total` | `const { data: invoices } = await supabase.from('invoices').select('total').eq('organization_id', organization?.id).eq('status', 'pagada').gte('issue_date', format(firstDayMonth, 'yyyy-MM-dd'));` |
| 105 | String Literal | `clientes` | `{ label: t('analytics.kpis.newContactsRate' as any), value: `${newClientsRate}%`, icon: TrendingUp, color: 'text-emerald-500', cat: 'clientes' },` |
| 111 | String Literal | `), citas: 0, clientes: 0, label: format(d, ` | `return { month: format(d, 'MMM', { locale: dateLocale }), monthNum: format(d, 'MM'), year: format(d, 'yyyy'), citas: 0, clientes: 0, label: format(d, 'MMMM', { locale: dateLocale }) };` |
| 154 | String Literal | `CITAS` | `const labelCitas = getModuleLabel(modules, 'appointments', 'CITAS');` |
| 156 | String Literal | `clientes` | `{ label: t('analytics.kpis.registeredContacts' as any), value: 124, icon: Users, color: 'text-blue-500', cat: 'clientes' },` |
| 284 | String Literal | `citas` | `<Bar dataKey="citas" fill="#1B4FD8" radius={[4, 4, 0, 0]} barSize={40} />` |
| 301 | String Literal | `clientes` | `<Area type="monotone" dataKey="clientes" stroke="#10B981" strokeWidth={3} fillOpacity={0.3} fill="#10B981" />` |

---

### 📄 [`src\app\(dashboard)\dashboard\appointments\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/appointments/page.tsx)
- **Cantidad de textos hardcodeados:** 18
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 267 | String Literal | `p-8 space-y-6 overflow-y-auto custom-scrollbar` | `<div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">` |
| 270 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 274 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 280 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 286 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 290 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 297 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 301 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 308 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 312 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 318 | String Literal | `pendiente` | `appointment.status === 'pendiente' ? "bg-amber-100 text-amber-700" :` |
| 326 | String Literal | `space-y-1 pt-4 border-t border-slate-100 dark:border-[#1E3A5F]` | `<div className="space-y-1 pt-4 border-t border-slate-100 dark:border-[#1E3A5F]">` |
| 411 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 495 | JSX Text | `: a.type === 'videollamada' ?` | `{a.type === 'llamada' ? <Phone size={10} /> : a.type === 'videollamada' ? <Video size={10} /> : <MapPin size={10} />}` |
| 553 | JSX Text | `: a.type === 'videollamada' ?` | `{a.type === 'llamada' ? <Phone size={18} /> : a.type === 'videollamada' ? <Video size={18} /> : <MapPin size={18} />}` |
| 561 | String Literal | `pendiente` | `a.status === 'pendiente' ? "bg-amber-100 text-amber-700" :` |
| 582 | String Literal | `lg:col-span-4 space-y-6` | `<div className="lg:col-span-4 space-y-6">` |
| 585 | String Literal | `space-y-6` | `<div className="space-y-6">` |

---

### 📄 [`src\app\(dashboard)\dashboard\finances\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/finances/page.tsx)
- **Cantidad de textos hardcodeados:** 14
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 81 | String Literal | `Tipo` | `["Concepto", "Tipo", "Monto", "Mes", "Año"],` |
| 81 | String Literal | `Monto` | `["Concepto", "Tipo", "Monto", "Mes", "Año"],` |
| 102 | String Literal | `organization al generar PDF:` | `console.log('organization al generar PDF:', organization)` |
| 108 | String Literal | `Error generando PDF:` | `console.error("Error generando PDF:", error);` |
| 237 | String Literal | `título corto` | `"title": "título corto",` |
| 238 | String Literal | `mensaje en máximo 15 palabras` | `"message": "mensaje en máximo 15 palabras"` |
| 253 | String Literal | `Error parseando alertas IA:` | `console.error("Error parseando alertas IA:", err);` |
| 256 | String Literal | `Error generando alertas:` | `console.error("Error generando alertas:", error);` |
| 313 | String Literal | `Error` | `{ role: 'assistant', content: data.reply \|\| 'Error' }` |
| 316 | String Literal | `Error iniciando auditor:` | `console.error('Error iniciando auditor:', error);` |
| 340 | String Literal | `Error` | `setAuditorMessages(prev => [...prev, { role: 'assistant', content: data.reply \|\| 'Error' }]);` |
| 342 | String Literal | `Error enviando mensaje:` | `console.error('Error enviando mensaje:', error);` |
| 362 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 528 | String Literal | `flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-[200px]` | `<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-[200px]">` |

---

### 📄 [`src\app\(dashboard)\dashboard\finances-business\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/finances-business/page.tsx)
- **Cantidad de textos hardcodeados:** 5
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 137 | String Literal | `título corto` | `"title": "título corto",` |
| 138 | String Literal | `mensaje en máximo 15 palabras` | `"message": "mensaje en máximo 15 palabras"` |
| 153 | String Literal | `Error parseando alertas IA:` | `console.error("Error parseando alertas IA:", err);` |
| 156 | String Literal | `Error generando alertas:` | `console.error("Error generando alertas:", error);` |
| 214 | String Literal | `flex-1 space-y-5 md:space-y-7 lg:space-y-8` | `<div className="flex-1 space-y-5 md:space-y-7 lg:space-y-8">` |

---

### 📄 [`src\app\(dashboard)\dashboard\inventory\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/inventory/page.tsx)
- **Cantidad de textos hardcodeados:** 16
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 48 | String Literal | `Activo` | `estado: "Activo",` |
| 62 | String Literal | `id, nombre, descripcion, precio, activo, deposit, deposit_type` | `.select('id, nombre, descripcion, precio, activo, deposit, deposit_type')` |
| 64 | String Literal | `nombre` | `.order('nombre');` |
| 69 | String Literal | `Error fetching catalog:` | `console.error("Error fetching catalog:", err);` |
| 84 | String Literal | `Activo` | `activo: formData.estado === 'Activo',` |
| 99 | String Literal | `Error en la API` | `if (!res.ok) throw new Error('Error en la API');` |
| 118 | String Literal | `Error al eliminar` | `if (!res.ok) throw new Error('Error al eliminar');` |
| 136 | String Literal | `Activo` | `estado: item.activo ? "Activo" : "Pausado",` |
| 152 | String Literal | `Activo` | `estado: "Activo",` |
| 301 | String Literal | `p-8 space-y-6` | `<div className="p-8 space-y-6">` |
| 359 | String Literal | `flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar` | `<form onSubmit={handleSubmit} id="catalog-form" className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">` |
| 361 | String Literal | `md:col-span-2 space-y-2` | `<div className="md:col-span-2 space-y-2">` |
| 373 | String Literal | `md:col-span-2 space-y-2` | `<div className="md:col-span-2 space-y-2">` |
| 384 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 399 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 406 | String Literal | `Activo` | `<option value="Activo" className="bg-[#111F3A] text-white">{t('inventory.status.active' as any)}</option>` |

---

### 📄 [`src\app\(dashboard)\dashboard\invoices\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/invoices/page.tsx)
- **Cantidad de textos hardcodeados:** 14
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 50 | String Literal | `todos` | `const [statusFilter, setStatusFilter] = useState("todos");` |
| 109 | String Literal | `pendiente` | `if (inv.status === 'pendiente') {` |
| 130 | String Literal | `todos` | `if (statusFilter === 'todos') return matchesSearch;` |
| 137 | String Literal | `pendiente` | `case 'pendiente': return <span className="px-2.5 py-1 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> {t('invoices.status.pending' as any)}</span>;` |
| 170 | String Literal | `del-${id}` | `setActionLoading(`del-${id}`);` |
| 315 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 327 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 339 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 370 | String Literal | `todos` | `<option value="todos">{t('invoices.filters.filterByStatus' as any)}</option>` |
| 372 | String Literal | `pendiente` | `<option value="pendiente">{t('invoices.filters.pending' as any)}</option>` |
| 394 | String Literal | `divide-y divide-[#E2E8F0] dark:divide-[#1E3A5F]` | `<tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E3A5F]">` |
| 444 | Prop (title) | `Enviar por Email` | `title="Enviar por Email"` |
| 451 | Prop (title) | `Editar` | `title="Editar"` |
| 471 | Prop (title) | `Eliminar` | `title="Eliminar"` |

---

### 📄 [`src\app\(dashboard)\dashboard\leads\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/leads/page.tsx)
- **Cantidad de textos hardcodeados:** 13
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 56 | String Literal | `todos` | `const [filterEstado, setFilterEstado] = useState<string>('todos');` |
| 57 | String Literal | `todos` | `const [filterTemp, setFilterTemp] = useState<string>('todos');` |
| 58 | String Literal | `todos` | `const [filterOrigen, setFilterOrigen] = useState<string>('todos');` |
| 85 | String Literal | `Error fetching leads:` | `console.error('Error fetching leads:', error);` |
| 96 | String Literal | `nuevo` | `.update({ estado: 'nuevo', motivo_descarte: null })` |
| 139 | String Literal | `todos` | `const matchesEstado = filterEstado === 'todos' \|\| l.estado === filterEstado;` |
| 140 | String Literal | `todos` | `const matchesTemp = filterTemp === 'todos' \|\| l.temperatura === filterTemp;` |
| 141 | String Literal | `todos` | `const matchesOrigen = filterOrigen === 'todos' \|\| l.origen === filterOrigen;` |
| 272 | String Literal | `todos` | `<option value="todos" className="bg-[#111F3A] text-white">{t('leads.filters.allStates' as any)}</option>` |
| 273 | String Literal | `nuevo` | `<option value="nuevo" className="bg-[#111F3A] text-white">{t('leads.status.nuevo' as any)}</option>` |
| 286 | String Literal | `todos` | `<option value="todos" className="bg-[#111F3A] text-white">{t('leads.filters.allTemps' as any)}</option>` |
| 298 | String Literal | `todos` | `<option value="todos" className="bg-[#111F3A] text-white">{t('leads.filters.allOrigins' as any)}</option>` |
| 351 | String Literal | `space-y-1` | `<div className="space-y-1">` |

---

### 📄 [`src\app\(dashboard)\dashboard\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/page.tsx)
- **Cantidad de textos hardcodeados:** 10
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 181 | String Literal | `activo` | `const activeProjectsCount = data.projects.filter(p => p.status === 'activo').length;` |
| 301 | String Literal | `en-US` | `{new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}` |
| 356 | String Literal | `clientes` | `category="clientes"` |
| 366 | String Literal | `mensajes` | `category="mensajes"` |
| 417 | String Literal | `ingresos` | `<Line type="monotone" dataKey="ingresos" stroke="#1B4FD8" strokeWidth={4} dot={{ r: 4, fill: '#1B4FD8', strokeWidth: 0 }} activeDot={{ r: 6 }} />` |
| 418 | String Literal | `gastos` | `<Line type="monotone" dataKey="gastos" stroke="#EF4444" strokeWidth={4} dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }} activeDot={{ r: 6 }} />` |
| 432 | String Literal | `flex-1 space-y-4` | `<div className="flex-1 space-y-4">` |
| 473 | String Literal | `flex-1 space-y-4` | `<div className="flex-1 space-y-4">` |
| 485 | String Literal | `en-US` | `{new Date(appt.date).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'short' })} • {appt.time}` |
| 508 | String Literal | `space-y-4` | `<div className="space-y-4">` |

---

### 📄 [`src\app\(dashboard)\dashboard\performance\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/performance/page.tsx)
- **Cantidad de textos hardcodeados:** 4
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 137 | String Literal | `total, status, issue_date` | `.select('total, status, issue_date')` |
| 159 | String Literal | `Error fetching performance data:` | `console.error("Error fetching performance data:", err);` |
| 201 | String Literal | `PDF generation error:` | `console.error("PDF generation error:", err);` |
| 386 | String Literal | `mt-4 space-y-2 w-full` | `<div className="mt-4 space-y-2 w-full">` |

---

### 📄 [`src\app\(dashboard)\dashboard\pipeline\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/pipeline/page.tsx)
- **Cantidad de textos hardcodeados:** 6
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 32 | String Literal | `nuevo_lead` | `{ id: 'nuevo_lead', labelKey: 'pipeline.columns.nuevo_lead', bgColor: 'bg-blue-500/15 dark:bg-blue-500/20', iconColor: 'text-blue-500', icon: UserPlus },` |
| 233 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 252 | String Literal | `clientes` | `{ label: t('pipeline.kpis.activeLeads' as any), value: stats.activeCount, icon: Users, color: 'text-blue-500', cat: 'clientes' },` |
| 336 | String Literal | `flex-1 py-3 overflow-y-auto` | `className="flex-1 py-3 overflow-y-auto"` |
| 431 | String Literal | `flex-1 overflow-y-auto p-6 md:p-8 space-y-4 custom-scrollbar` | `<div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 custom-scrollbar">` |
| 433 | String Literal | `space-y-2` | `<div className="space-y-2">` |

---

### 📄 [`src\app\(dashboard)\dashboard\products\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/products/page.tsx)
- **Cantidad de textos hardcodeados:** 22
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 76 | String Literal | `nombre` | `.order('nombre');` |
| 81 | String Literal | `Error fetching items:` | `console.error("Error fetching items:", err);` |
| 108 | String Literal | `Error al añadir` | `if (!res.ok) throw new Error('Error al añadir');` |
| 112 | String Literal | `, precio: ` | `setFormData({ nombre: '', categoria: 'General', precio: '', stock: '', stock_minimo: '0', unidad: 'unidades' });` |
| 142 | String Literal | `Error al actualizar` | `if (!res.ok) throw new Error('Error al actualizar');` |
| 160 | String Literal | `Error al eliminar` | `if (!res.ok) throw new Error('Error al eliminar');` |
| 327 | String Literal | `p-8 space-y-6` | `<div className="p-8 space-y-6">` |
| 360 | String Literal | `p-8 space-y-4` | `<form onSubmit={handleAddItem} className="p-8 space-y-4">` |
| 361 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 366 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 370 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 376 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 380 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 384 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 413 | String Literal | `p-8 space-y-4` | `<form onSubmit={handleEditItem} className="p-8 space-y-4">` |
| 414 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 419 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 423 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 429 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 433 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 437 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 497 | String Literal | `space-y-1` | `<div className="space-y-1">` |

---

### 📄 [`src\app\(dashboard)\dashboard\projects\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/projects/page.tsx)
- **Cantidad de textos hardcodeados:** 16
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 76 | String Literal | `activo` | `activos: projects.filter(p => p.status === 'activo').length,` |
| 77 | String Literal | `completado` | `completados: projects.filter(p => p.status === 'completado').length,` |
| 78 | String Literal | `en-US` | `facturacion: projects.reduce((s, p) => s + Number(p.budget \|\| 0), 0).toLocaleString(language === 'es' ? 'es-ES' : 'en-US'),` |
| 79 | String Literal | `en-US` | `pendiente: projects.reduce((s, p) => s + (Number(p.budget \|\| 0) - Number(p.paid \|\| 0)), 0).toLocaleString(language === 'es' ? 'es-ES' : 'en-US'),` |
| 85 | String Literal | `cancelado` | `const validProjects = projects.filter(p => p.budget && p.status !== 'cancelado');` |
| 91 | String Literal | `completado` | `.filter(p => p.status === 'completado' && p.budget)` |
| 104 | String Literal | `en-US` | `month: d.toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short' }),` |
| 111 | String Literal | `completado` | `projects.filter(p => p.status === 'completado' && p.budget).forEach(p => {` |
| 120 | String Literal | `Proyectos` | `const pageTitle = organization?.sector_config?.['projects']?.label \|\| 'Proyectos';` |
| 130 | String Literal | `space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full` | `<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full">` |
| 134 | String Literal | `space-y-1` | `<div className="space-y-1">` |
| 195 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 221 | String Literal | `en-US` | `{analyticsStats.avgValue.toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}` |
| 231 | String Literal | `en-US` | `{analyticsStats.avgValue.toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}` |
| 267 | String Literal | `ingresos` | `<Bar dataKey="ingresos" fill="#1B4FD8" radius={[0, 4, 4, 0]} barSize={20} />` |
| 286 | String Literal | `ingresos` | `<Line type="monotone" dataKey="ingresos" stroke="#1B4FD8" strokeWidth={3} dot={{ r: 4, fill: '#1B4FD8' }} activeDot={{ r: 6 }} />` |

---

### 📄 [`src\app\(dashboard)\dashboard\settings\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/settings/page.tsx)
- **Cantidad de textos hardcodeados:** 22
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 93 | String Literal | `Error init settings:` | `console.error("Error init settings:", error);` |
| 330 | String Literal | `flex-1 space-y-3` | `<div className="flex-1 space-y-3">` |
| 561 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 562 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 588 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 598 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 675 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 676 | String Literal | `p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-3` | `<div className="p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-3">` |
| 696 | String Literal | `p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-3` | `<div className="p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-3">` |
| 760 | String Literal | `Error fetching email settings:` | `console.error("Error fetching email settings:", err);` |
| 829 | Prop (placeholder) | `Mi Negocio` | `<Field label={t('settings.email.displayName' as any)} value={formData.email_display_name} placeholder="Mi Negocio" onChange={(v) => setFormData({ ...formData, email_display_name: v })} />` |
| 966 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 985 | String Literal | `space-y-3` | `<div className={cn("space-y-3", !isPro && "opacity-50 pointer-events-none")}>` |
| 986 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 1000 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 1066 | String Literal | `p-4 bg-slate-50 dark:bg-[#111F3A] border border-slate-100 dark:border-[#1E3A5F] rounded-xl space-y-3` | `<div className="p-4 bg-slate-50 dark:bg-[#111F3A] border border-slate-100 dark:border-[#1E3A5F] rounded-xl space-y-3">` |
| 1207 | String Literal | `p-6 space-y-5` | `<div className="p-6 space-y-5">` |
| 1225 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 1342 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 1343 | String Literal | `p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-2` | `<div className="p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-2">` |
| 1364 | String Literal | `p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-2` | `<div className="p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-2">` |
| 1371 | String Literal | `p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-2` | `<div className="p-4 bg-slate-50 dark:bg-[#111F3A] rounded-xl border border-slate-100 dark:border-[#1E3A5F] space-y-2">` |

---

### 📄 [`src\app\(dashboard)\dashboard\shifts\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/shifts/page.tsx)
- **Cantidad de textos hardcodeados:** 11
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 89 | String Literal | `fecha` | `.order('fecha');` |
| 94 | String Literal | `Error fetching shifts` | `console.error("Error fetching shifts", err);` |
| 555 | String Literal | `flex-1 overflow-y-auto p-5 md:p-8 space-y-6` | `<form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">` |
| 558 | String Literal | `md:col-span-2 space-y-2` | `<div className="md:col-span-2 space-y-2">` |
| 576 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 590 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 607 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 623 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 638 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 660 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 674 | String Literal | `space-y-2` | `<div className="space-y-2">` |

---

### 📄 [`src\app\(dashboard)\dashboard\team\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/team/page.tsx)
- **Cantidad de textos hardcodeados:** 10
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 57 | String Literal | `activo` | `status: "activo",` |
| 80 | String Literal | `Error fetching vacations` | `console.error("Error fetching vacations", err);` |
| 113 | String Literal | `error` | `type: nuevoEstado === 'aprobada' ? 'success' : 'error',` |
| 149 | String Literal | `Error fetching team` | `console.error("Error fetching team", err);` |
| 282 | String Literal | `pendiente` | `const pendingCount = vacationRequests.filter(r => r.estado === 'pendiente').length;` |
| 332 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 381 | String Literal | `pendiente` | `{(req.estado === 'pendiente' \|\| req.estado === 'aprobada') && (` |
| 389 | String Literal | `pendiente` | `{req.estado === 'pendiente' ? (` |
| 430 | String Literal | `p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar` | `<form onSubmit={handleSubmit} id="team-form" className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">` |
| 473 | String Literal | `space-y-2` | `<div className="space-y-2">` |

---

### 📄 [`src\app\(dashboard)\dashboard\web\page.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/app/(dashboard)/dashboard/web/page.tsx)
- **Cantidad de textos hardcodeados:** 13
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 63 | String Literal | `Posible falta de columnas o acceso en settings:` | `console.warn("Posible falta de columnas o acceso en settings:", err.message);` |
| 74 | String Literal | `No hay usuario autenticado` | `if (!user) throw new Error("No hay usuario autenticado");` |
| 141 | String Literal | `p-8 md:p-12 space-y-10` | `<form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">` |
| 144 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 149 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 150 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 164 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 178 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 194 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 199 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 200 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 229 | String Literal | `space-y-6` | `<div className="space-y-6">` |
| 234 | String Literal | `space-y-2` | `<div className="space-y-2">` |

---

### 📄 [`src\components\dashboard\appointments\AppointmentModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/appointments/AppointmentModal.tsx)
- **Cantidad de textos hardcodeados:** 13
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 51 | String Literal | `pendiente` | `status: "pendiente",` |
| 53 | String Literal | `1 hora` | `duracion: "1 hora",` |
| 72 | String Literal | `1 hora` | `duracion: appointment.duracion \|\| "1 hora",` |
| 130 | String Literal | `p-5 md:p-8 space-y-5 overflow-y-auto flex-1 custom-scrollbar` | `<div className="p-5 md:p-8 space-y-5 overflow-y-auto flex-1 custom-scrollbar">` |
| 132 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 142 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 154 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 168 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 177 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 190 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 201 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 215 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 232 | String Literal | `space-y-2` | `<div className="space-y-2">` |

---

### 📄 [`src\components\dashboard\communications\CommunicationsSidebar.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/communications/CommunicationsSidebar.tsx)
- **Cantidad de textos hardcodeados:** 3
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 46 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 50 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 138 | String Literal | `space-y-4` | `<div className="space-y-4">` |

---

### 📄 [`src\components\dashboard\communications\ConversationList.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/communications/ConversationList.tsx)
- **Cantidad de textos hardcodeados:** 3
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 12 | String Literal | `todos` | `{ id: "todos", labelKey: "communications.tabs.all" },` |
| 138 | String Literal | `flex-1 space-y-2` | `<div className="flex-1 space-y-2">` |
| 241 | String Literal | `Error resolving names in list:` | `console.error("Error resolving names in list:", e);` |

---

### 📄 [`src\components\dashboard\communications\ConversationView.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/communications/ConversationView.tsx)
- **Cantidad de textos hardcodeados:** 4
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 71 | String Literal | `Error updating status:` | `console.error("Error updating status:", e);` |
| 108 | String Literal | `Error fetching client info:` | `console.error("Error fetching client info:", e);` |
| 239 | String Literal | `Resolve Error:` | `console.error("Resolve Error:", e);` |
| 405 | String Literal | `max-w-4xl mx-auto w-full space-y-2` | `<div className="max-w-4xl mx-auto w-full space-y-2">` |

---

### 📄 [`src\components\dashboard\FichajePanel.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/FichajePanel.tsx)
- **Cantidad de textos hardcodeados:** 24
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 36 | String Literal | `CORRECTO` | `if (distance <= geoRadius) return 'CORRECTO';` |
| 37 | String Literal | `INCORRECTO` | `return 'INCORRECTO';` |
| 48 | String Literal | `EN TURNO` | `if (est === 'EN TURNO') return t('fichajePanel.status.inShift');` |
| 60 | String Literal | `error` | `const [searchStatus, setSearchStatus] = useState<{ type: 'success' \| 'error', msg: string } \| null>(null);` |
| 136 | String Literal | `SIN FICHAR` | `let estado = "SIN FICHAR";` |
| 138 | String Literal | `EN TURNO` | `else if (primeraEntrada && !ultimaSalida) estado = "EN TURNO";` |
| 186 | String Literal | `EN TURNO` | `enTurno: groupedData.filter(d => d.estado === "EN TURNO").length,` |
| 187 | String Literal | `SIN FICHAR` | `sinFichar: groupedData.filter(d => d.estado === "SIN FICHAR").length` |
| 250 | String Literal | `CORRECTO` | `const geoStatus = geoStatusVal === 'CORRECTO' ? t('fichajePanel.geoStatus.correct') : (geoStatusVal === 'INCORRECTO' ? t('fichajePanel.geoStatus.incorrect') : '-');` |
| 250 | String Literal | `INCORRECTO` | `const geoStatus = geoStatusVal === 'CORRECTO' ? t('fichajePanel.geoStatus.correct') : (geoStatusVal === 'INCORRECTO' ? t('fichajePanel.geoStatus.incorrect') : '-');` |
| 280 | String Literal | `{total}` | `doc.text(t('fichajePanel.pdf.pageOf').replace('{page}', String(i)).replace('{total}', String(pageCount)), pageWidth - 20, doc.internal.pageSize.height - 10);` |
| 309 | String Literal | `error` | `setSearchStatus({ type: 'error', msg: t('fichajePanel.toast.addressNotFound') });` |
| 312 | String Literal | `error` | `setSearchStatus({ type: 'error', msg: t('fichajePanel.toast.searchError') });` |
| 355 | String Literal | `error` | `setSearchStatus({ type: 'error', msg: t('fichajePanel.toast.saveError') });` |
| 407 | String Literal | `space-y-4` | `<div className="space-y-4">` |
| 459 | String Literal | `Ubicación seleccionada en mapa` | `msg: "Ubicación seleccionada en mapa"` |
| 534 | String Literal | `EN TURNO` | `{groupedData.filter(d => d.estado === 'EN TURNO').length}` |
| 540 | String Literal | `SIN FICHAR` | `{groupedData.filter(d => d.estado === 'SIN FICHAR').length}` |
| 573 | String Literal | `EN TURNO` | `row.estado === 'EN TURNO' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :` |
| 595 | String Literal | `overflow-x-auto max-h-[400px] overflow-y-auto` | `<div className="overflow-x-auto max-h-[400px] overflow-y-auto">` |
| 636 | String Literal | `CORRECTO` | `geoStatusVal === 'CORRECTO' ? "bg-emerald-500/10 text-emerald-500" :` |
| 637 | String Literal | `INCORRECTO` | `geoStatusVal === 'INCORRECTO' ? "bg-red-500/10 text-red-500" :` |
| 640 | String Literal | `CORRECTO` | `{geoStatusVal === 'CORRECTO' ? t('fichajePanel.geoStatus.correct') :` |
| 641 | String Literal | `INCORRECTO` | `geoStatusVal === 'INCORRECTO' ? t('fichajePanel.geoStatus.incorrect') : "-"}` |

---

### 📄 [`src\components\dashboard\finances\AddBusinessExpenseModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/finances/AddBusinessExpenseModal.tsx)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 105 | String Literal | `space-y-3` | `<form onSubmit={handleSubmit} className="space-y-3">` |

---

### 📄 [`src\components\dashboard\finances\AddBusinessIncomeModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/finances/AddBusinessIncomeModal.tsx)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 108 | String Literal | `space-y-3` | `<form onSubmit={handleSubmit} className="space-y-3">` |

---

### 📄 [`src\components\dashboard\finances\AddExpenseModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/finances/AddExpenseModal.tsx)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 148 | String Literal | `Error:` | `console.error('Error:', error);` |

---

### 📄 [`src\components\dashboard\finances\AddIncomeModal.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/finances/AddIncomeModal.tsx)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 148 | String Literal | `Error:` | `console.error('Error:', error);` |

---

### 📄 [`src\components\dashboard\finances\DonutChart.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/finances/DonutChart.tsx)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 100 | String Literal | `w-full max-w-[320px] space-y-4` | `<div className="w-full max-w-[320px] space-y-4">` |

---

### 📄 [`src\components\dashboard\finances\FinancesTable.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/finances/FinancesTable.tsx)
- **Cantidad de textos hardcodeados:** 6
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 132 | String Literal | `Otros gastos` | `setNewType("Otros gastos");` |
| 292 | String Literal | `divide-y divide-slate-50 dark:divide-[#1E3A5F]` | `<tbody className="divide-y divide-slate-50 dark:divide-[#1E3A5F]">` |
| 464 | String Literal | `lg:hidden space-y-4` | `<div className="lg:hidden space-y-4">` |
| 467 | String Literal | `space-y-3` | `<div className="space-y-3">` |
| 541 | String Literal | `space-y-2` | `<div className="space-y-2">` |
| 554 | String Literal | `space-y-3` | `<div className="space-y-3">` |

---

### 📄 [`src\components\dashboard\finances\FinanceTrendChart.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/finances/FinanceTrendChart.tsx)
- **Cantidad de textos hardcodeados:** 2
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 93 | String Literal | `ingresos` | `dataKey="ingresos"` |
| 101 | String Literal | `gastos` | `dataKey="gastos"` |

---

### 📄 [`src\components\dashboard\finances\FinancialAlerts.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/finances/FinancialAlerts.tsx)
- **Cantidad de textos hardcodeados:** 1
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 129 | String Literal | `space-y-4 md:space-y-5 lg:space-y-6 flex flex-col justify-center` | `<div className="space-y-4 md:space-y-5 lg:space-y-6 flex flex-col justify-center">` |

---

### 📄 [`src\components\dashboard\Sidebar.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/components/dashboard/Sidebar.tsx)
- **Cantidad de textos hardcodeados:** 19
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 56 | String Literal | `dashboard` | `{ key: 'dashboard', path: '/dashboard', labelKey: 'sidebar.home', icon: 'Home' },` |
| 72 | String Literal | `negocio` | `id: 'negocio',` |
| 85 | String Literal | `fichaje` | `{ key: 'fichaje', path: '/dashboard/fichaje', labelKey: 'sidebar.fichaje', icon: 'UserCheck' },` |
| 112 | String Literal | `Gestor de Agenda` | `{ key: 'agent_reservations', path: '/dashboard/agent-reservations', label: 'Gestor de Agenda', icon: 'Repeat', hidden: true },` |
| 231 | String Literal | `flex-1 min-h-0 px-2 lg:px-4 flex flex-col gap-6 py-6 overflow-y-auto scrollbar-hide` | `<nav className="flex-1 min-h-0 px-2 lg:px-4 flex flex-col gap-6 py-6 overflow-y-auto scrollbar-hide">` |
| 307 | String Literal | `Cambiar a Español` | `title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}` |
| 355 | String Literal | `Gestión ilimitada de clientes` | `'Gestión ilimitada de clientes',` |
| 356 | String Literal | `Reservas y citas sin límites` | `'Reservas y citas sin límites',` |
| 359 | String Literal | `Estadísticas y métricas pro` | `'Estadísticas y métricas pro'` |
| 371 | Toast/Alert (toast.success) | `Prueba de 90 días activada` | `toast.success('Prueba de 90 días activada')` |
| 375 | String Literal | `Error al activar la prueba` | `toast.error(data.error \|\| 'Error al activar la prueba')` |
| 378 | Toast/Alert (toast.error) | `Error de conexión` | `toast.error('Error de conexión')` |
| 403 | String Literal | `Error al procesar el pago` | `toast.error(data.error \|\| 'Error al procesar el pago')` |
| 407 | Toast/Alert (toast.error) | `Error de conexión` | `toast.error('Error de conexión')` |
| 439 | String Literal | `p-5 md:p-6 space-y-5 md:space-y-6 overflow-y-auto` | `<div className="p-5 md:p-6 space-y-5 md:space-y-6 overflow-y-auto">` |
| 440 | String Literal | `space-y-2 md:space-y-3` | `<div className="space-y-2 md:space-y-3">` |
| 445 | JSX Text | `Gestión completa e IA avanzada` | `<p className="text-[11px] md:text-[12px] text-slate-500 dark:text-slate-400">Gestión completa e IA avanzada</p>` |
| 449 | JSX Text | `/ Mes` | `<p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">/ Mes</p>` |
| 454 | String Literal | `space-y-2 md:space-y-3` | `<div className="space-y-2 md:space-y-3">` |

---

### 📄 [`src\lib\LanguageContext.tsx`](file:///D:/SFFALCON 1.0.1/app.sffalcon.com/src/lib/LanguageContext.tsx)
- **Cantidad de textos hardcodeados:** 2
- **Detalle de hallazgos:**

| Línea | Tipo | Texto en Español | Línea de Código |
| --- | --- | --- | --- |
| 38 | String Literal | `Error saving language preference to localStorage:` | `console.error('Error saving language preference to localStorage:', e);` |
| 66 | String Literal | `useLanguage debe usarse dentro de LanguageProvider` | `throw new Error('useLanguage debe usarse dentro de LanguageProvider');` |

---

## ✅ Archivos Completamente Traducidos o Sin Textos de UI
Los siguientes archivos ya están correctamente internacionalizados o son puramente técnicos y no contienen elementos visuales de texto:

* **Total de archivos correctos:** 44 archivos.
