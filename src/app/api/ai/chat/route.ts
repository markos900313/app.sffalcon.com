import { NextRequest, NextResponse } from 'next/server'
import { searchRelevant } from '@/lib/rag'

const PROVIDERS = {
  groq: {
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: process.env.GROQ_API_KEY || '',
    model_fast: 'llama-3.1-8b-instant',
    model_smart: 'llama-3.3-70b-versatile'
  },
  openrouter: {
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    model_fast: 'google/gemma-4-27b-it:free',
    model_smart: 'google/gemma-4-27b-it:free'
  },
  mistral: {
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    apiKey: process.env.MISTRAL_API_KEY || '',
    model_fast: 'mistral-small-latest',
    model_smart: 'mistral-small-latest'
  }
}

async function callAI(
  systemPrompt: string,
  userMessage: string,
  history: any[] = [],
  temperature: number = 0.5,
  useSmartModel: boolean = false
): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6).map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    })),
    { role: 'user', content: userMessage }
  ]

  const providerList = [
    {
      ...PROVIDERS.groq,
      model: useSmartModel
        ? PROVIDERS.groq.model_smart
        : PROVIDERS.groq.model_fast
    },
    {
      ...PROVIDERS.openrouter,
      model: PROVIDERS.openrouter.model_smart
    },
    {
      ...PROVIDERS.mistral,
      model: PROVIDERS.mistral.model_smart
    }
  ]

  for (const provider of providerList) {
    if (!provider.apiKey) continue
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      }
      // OpenRouter requiere header extra
      if (provider.endpoint.includes('openrouter')) {
        headers['HTTP-Referer'] = 'https://app.sffalcon.com'
        headers['X-Title'] = 'SF Gestor Empresarial'
      }

      const res = await fetch(provider.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: provider.model,
          messages,
          max_tokens: 150,
          temperature
        })
      })

      if (!res.ok) {
        const err = await res.text()
        console.warn(`[AI] ${provider.endpoint} falló:`,
          res.status, err.slice(0, 100))
        continue // Intentar siguiente proveedor
      }

      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content
      if (reply) {
        console.log(`[AI] Respondió: ${provider.endpoint}`)
        return reply
      }
    } catch (err: any) {
      console.warn(`[AI] Error con proveedor:`,
        err.message)
      continue
    }
  }

  return 'No pude procesar tu consulta en este momento. Inténtalo de nuevo.'
}

export async function POST(request: NextRequest) {
  try {
    const { message, organizationId, history } = await request.json()

    if (!message || !organizationId) {
      return NextResponse.json(
        { error: 'Faltan parámetros' },
        { status: 400 }
      )
    }

    // Crear cliente dentro del handler para garantizar
    // que las variables de entorno estén disponibles
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Leer datos en paralelo con manejo de errores
    const [
      orgResult,
      clientsResult,
      appointmentsResult,
      projectsResult,
      financesResult,
      invoicesResult,
      communicationsResult,
      catalogResult,
      staffResult,
      leadsResult,
      pipelineResult,
      inventoryResult,
      vacacionesResult,
      fichajesResult,
      shiftsResult
    ] = await Promise.allSettled([
      supabase.from('organizations')
        .select('name, ai_sector_prompt, ai_personality')
        .eq('id', organizationId)
        .single(),
      supabase.from('clients')
        .select('name, email, phone, status, category')
        .eq('organization_id', organizationId)
        .limit(30),
      supabase.from('appointments')
        .select('title, date, time, status, notes, customer_name, servicio')
        .eq('organization_id', organizationId)
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(20),
      supabase.from('projects')
        .select('name, status, budget, paid, progress')
        .eq('organization_id', organizationId)
        .limit(15),
      supabase.from('finance_entries')
        .select('type, concept, amount, category, month, year')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase.from('invoices')
        .select(`
          concept, total, status, 
          due_date, issue_date, invoice_number,
          clients ( name, email )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase.from('communications')
        .select('contact_name, channel, status, updated_at')
        .eq('organization_id', organizationId)
        .order('updated_at', { ascending: false })
        .limit(20),
      supabase.from('catalogo_items')
        .select('nombre, descripcion, precio, activo')
        .eq('organization_id', organizationId)
        .eq('activo', true)
        .limit(20),
      supabase.from('staff')
        .select('id, full_name, role, status')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .limit(20),
      supabase.from('leads')
        .select('nombre, temperatura, estado, email, telefono, notas')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.from('pipeline_deals')
        .select('nombre, valor_estimado, etapa, prioridad')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.from('inventory_items')
        .select('nombre, stock, stock_minimo, unidad, precio')
        .eq('organization_id', organizationId)
        .limit(20),
      supabase.from('vacaciones')
        .select('staff_id, fecha_inicio, fecha_fin, dias, estado, motivo')
        .eq('organization_id', organizationId)
        .order('fecha_inicio', { ascending: true })
        .limit(20),
      supabase.from('fichajes')
        .select('staff_id, tipo, timestamp, canal')
        .eq('organization_id', organizationId)
        .gte('timestamp', new Date().toISOString().split('T')[0] + 'T00:00:00')
        .lte('timestamp', new Date().toISOString().split('T')[0] + 'T23:59:59')
        .order('timestamp', { ascending: true })
        .limit(20),
      supabase.from('shifts')
        .select('staff_id, fecha, hora_inicio, hora_fin, tipo_turno')
        .eq('organization_id', organizationId)
        .gte('fecha', new Date().toISOString().split('T')[0])
        .order('fecha', { ascending: true })
        .limit(20)
    ])

    // Extraer datos con fallback seguro
    const org = orgResult.status === 'fulfilled'
      ? orgResult.value.data : null
    const clients = clientsResult.status === 'fulfilled'
      ? clientsResult.value.data || [] : []
    const appointments = appointmentsResult.status === 'fulfilled'
      ? appointmentsResult.value.data || [] : []
    const projects = projectsResult.status === 'fulfilled'
      ? projectsResult.value.data || [] : []
    const finances = financesResult.status === 'fulfilled'
      ? financesResult.value.data || [] : []
    const invoices = invoicesResult.status === 'fulfilled'
      ? invoicesResult.value.data || [] : []
    const communications = communicationsResult.status === 'fulfilled'
      ? communicationsResult.value.data || [] : []
    const catalog = catalogResult.status === 'fulfilled'
      ? catalogResult.value.data || [] : []
    const staff = staffResult.status === 'fulfilled'
      ? staffResult.value.data || [] : []
    const leads = leadsResult.status === 'fulfilled'
      ? leadsResult.value.data || [] : []
    const pipeline = pipelineResult.status === 'fulfilled'
      ? pipelineResult.value.data || [] : []
    const inventory = inventoryResult.status === 'fulfilled'
      ? inventoryResult.value.data || [] : []
    const vacaciones = vacacionesResult.status === 'fulfilled'
      ? vacacionesResult.value.data || [] : []
    const fichajes = fichajesResult.status === 'fulfilled'
      ? fichajesResult.value.data || [] : []
    const shifts = shiftsResult.status === 'fulfilled'
      ? shiftsResult.value.data || [] : []
    const totalPendiente = 0 // temporal para compatibilidad

    // PRE-CÁLCULOS DE RAZONAMIENTO
    const totalIngresos = finances
      .filter((f: any) => f.type === 'ingreso')
      .reduce((s: any, f: any) => s + parseFloat(f.amount || 0), 0)

    const totalGastos = finances
      .filter((f: any) => f.type === 'gasto')
      .reduce((s: any, f: any) => s + parseFloat(f.amount || 0), 0)

    const beneficioNeto = totalIngresos - totalGastos

    const totalFacturasPendientes = invoices
      .filter((i: any) => i.status === 'pendiente')
      .reduce((s: any, i: any) => s + parseFloat(i.total || 0), 0)

    const totalProyectosPendientes = projects
      .filter((p: any) => p.status === 'activo')
      .reduce((s: any, p: any) =>
        s + (parseFloat(p.budget || 0) - parseFloat(p.paid || 0)), 0)

    const totalPendienteCobro =
      totalFacturasPendientes + totalProyectosPendientes

    const leadCaliente = leads
      .filter((l: any) => l.temperatura === 'caliente')[0]

    const dealLeadCaliente = pipeline
      .find((p: any) => leadCaliente &&
        p.nombre.toLowerCase()
          .includes(leadCaliente.nombre?.toLowerCase()
            ?.split(' ')[0] || ''))

    const facturasMasUrgentes = invoices
      .filter((i: any) => i.status === 'pendiente' && i.due_date)
      .sort((a: any, b: any) =>
        new Date(a.due_date).getTime() -
        new Date(b.due_date).getTime())
      .slice(0, 2)

    const diasHastaVencimiento = facturasMasUrgentes[0]
      ? Math.ceil((new Date(facturasMasUrgentes[0].due_date)
        .getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    const oportunidadPrioridad = pipeline
      .sort((a: any, b: any) =>
        parseFloat(b.valor_estimado || 0) -
        parseFloat(a.valor_estimado || 0))[0]

    // ══ ANÁLISIS PROFUNDO ══

    // 1. SALUD FINANCIERA
    const margenBeneficio = totalIngresos > 0
      ? Math.round((beneficioNeto / totalIngresos) * 100)
      : 0
    const alertaFinanciera = beneficioNeto < 0
      ? 'PÉRDIDAS'
      : margenBeneficio < 20
        ? 'MARGEN_BAJO'
        : 'SALUDABLE'

    // 2. PIPELINE SCORING
    const pipelineScore = pipeline.map((p: any) => {
      const lead = leads.find((l: any) =>
        l.nombre?.toLowerCase()
          .includes(p.nombre?.toLowerCase()
            ?.split(' ')[0] || ''))
      const tempScore = lead?.temperatura === 'caliente'
        ? 3 : lead?.temperatura === 'tibio' ? 2 : 1
      const etapaScore = p.etapa === 'negociacion'
        ? 4 : p.etapa === 'propuesta'
          ? 3 : p.etapa === 'contactado'
            ? 2 : 1
      const valorScore = parseFloat(
        p.valor_estimado || 0) / 1000
      return {
        nombre: p.nombre,
        etapa: p.etapa,
        valor: p.valor_estimado,
        score: tempScore + etapaScore + valorScore,
        prioridad: tempScore + etapaScore > 5
          ? 'ALTA' : tempScore + etapaScore > 3
            ? 'MEDIA' : 'BAJA'
      }
    }).sort((a: any, b: any) => b.score - a.score)

    // 3. PRÓXIMAS ACCIONES RECOMENDADAS
    const accionesRecomendadas = []

    // Comunicaciones pendientes
    if (communications.filter(
      (c: any) => c.status === 'pending').length > 0) {
      accionesRecomendadas.push(
        `responder_${communications.filter(
          (c: any) => c.status === 'pending').length
        }_mensajes`)
    }

    // Facturas próximas a vencer (7 días)
    const facturasPorVencer = invoices.filter(
      (i: any) => i.status === 'pendiente' && i.due_date &&
        Math.ceil((new Date(i.due_date).getTime() -
          Date.now()) / (1000 * 60 * 60 * 24)) <= 7 &&
        Math.ceil((new Date(i.due_date).getTime() -
          Date.now()) / (1000 * 60 * 60 * 24)) >= 0
    )
    if (facturasPorVencer.length > 0) {
      accionesRecomendadas.push(
        `cobrar_${facturasPorVencer.length
        }_facturas_vencen_esta_semana`)
    }

    // Lead caliente sin deal
    if (leadCaliente && !dealLeadCaliente) {
      accionesRecomendadas.push(
        `crear_propuesta_${leadCaliente.nombre}`)
    }

    // Pipeline en negociacion sin cerrar
    const enNegociacion = pipeline.filter(
      (p: any) => p.etapa === 'negociacion')
    if (enNegociacion.length > 0) {
      accionesRecomendadas.push(
        `cerrar_negociacion_${enNegociacion[0].nombre
        }_${enNegociacion[0].valor_estimado}€`)
    }

    // 4. ANÁLISIS DE CLIENTES
    const clientesActivos = clients.filter(
      (c: any) => c.status === 'activo')
    const clientesLeads = clients.filter(
      (c: any) => c.status === 'lead')
    const tasaConversion = clients.length > 0
      ? Math.round(
        (clientesActivos.length / clients.length) * 100)
      : 0

    // 5. RESUMEN EJECUTIVO
    const estadoGeneral = beneficioNeto > 0 &&
      totalPendienteCobro > totalIngresos
      ? 'BUENO_PENDIENTE_ALTO'
      : beneficioNeto > 0
        ? 'BUENO'
        : 'ATENCIÓN'

    const orgName = org?.name || 'tu negocio'
    // Log para debug en Vercel
    console.log('AI Chat - Datos cargados:', {
      org: orgName,
      clients: clients.length,
      appointments: appointments.length,
      projects: projects.length,
      finances: finances.length,
      invoices: invoices.length,
      communications: communications.length,
      catalog: catalog.length,
      staff: staff.length,
      leads: leads.length,
      pipeline: pipeline.length,
      inventory: inventory.length,
      vacaciones: vacaciones.length,
      fichajes: fichajes.length
    })

    const now = new Date()
    const fechaHoy = now.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Europe/Madrid'
    })
    const horaHoy = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Madrid'
    })

    let systemPrompt = ''

    // RAG: buscar datos relevantes para esta pregunta
    let ragContext = ''
    try {
      ragContext = await searchRelevant(
        message,
        organizationId,
        10
      )
    } catch (ragErr) {
      console.warn('[RAG] Fallback a datos completos:', ragErr)
    }

    try {
      systemPrompt = `Asistente interno de "${orgName}". ${fechaHoy} ${horaHoy}.
REGLAS: máx 1-2 líneas CORTAS|solo el dato exacto|sin explicaciones extra|Este chat es SOLO lectura — NO puede modificar, crear ni borrar datos.|Si piden MODIFICAR datos (marcar pagada, borrar, crear, actualizar, cambiar estado) → responde: "Para eso ve al módulo de [facturas/clientes/etc] en el panel."|Si piden CONSULTAR datos (de quién es, cuánto es, cuándo vence) → responde DIRECTAMENTE con el dato exacto.|NUNCA confundas una consulta con una acción.|sin listas salvo que se pidan explícitamente|hilo conversación|en preguntas cortas como "la más cara" o "cuándo vence" → responde SIEMPRE sobre el último tema mencionado (facturas si se habló de facturas, citas si se habló de citas, etc.)|"la más cara" o "el mayor importe" después de hablar de facturas → ordenar FACTURAS_PENDIENTES por total descendente y devolver la primera con su cliente. La factura más cara es siempre la de mayor número en el campo total.|cuando pregunten "sus emails" o "dime más" después de hablar de clientes ACTIVOS → responder SOLO con los emails de clientes con status=activo, no leads|"la más cara" después de hablar de facturas → responder con la factura de mayor total de FACTURAS_PENDIENTES, NUNCA del CATALOGO.|usa SIEMPRE los valores de ANÁLISIS_NEGOCIO para responder preguntas de prioridad, urgencia y razonamiento|beneficio = valor exacto de FINANZAS.beneficio|total pendiente = valor exacto de TOTAL_PENDIENTE_COBRO.|ANTI-BUCLE: NUNCA repitas la misma respuesta ni entres en bucle. Si ya respondiste sobre un dato, da la respuesta directa sin dudar. Si el dato es SFF-2026-003 por 6050€, responde exactamente eso sin añadir "no" ni correcciones.|cuando dudes entre dos datos elige siempre el de mayor valor numérico y responde sin vacilar.
RAZONAMIENTO:prioridades=temperatura lead+etapa pipeline+valor|urgente=comms pendientes+facturas vencidas+leads calientes|análisis mes=% objetivo, ingresos vs pendiente|quién llamar=lead más caliente en etapa avanzada con mayor valor.

RESUMEN_HOY:citas_hoy=${appointments.filter((a: any) => a.date === new Date().toISOString().split('T')[0]).length}|mensajes_pendientes=${communications.filter((c: any) => c.status === 'pending').length}|fichajes=${fichajes.length}

CLIENTES(${clients.length}):${clients.map((c: any) => `${c.name}|${c.status}|${c.email || ''}|${c.company || ''}`).join(';')}

CITAS(${appointments.length}):${appointments.map((a: any) => `${a.date} ${a.time?.slice(0, 5)}|${a.title}|${a.status}`).join(';')}

PROYECTOS(${projects.length}):${projects.map((p: any) => `${p.name}|${p.status}|${p.budget}€|cobrado:${p.paid}€|pendiente:${parseFloat(p.budget || 0) - parseFloat(p.paid || 0)}€`).join(';')}

FINANZAS:ingresos=${totalIngresos}€|gastos=${totalGastos}€|beneficio=${beneficioNeto}€|top_gastos:${finances.filter((f: any) => f.type === 'gasto').sort((a: any, b: any) => b.amount - a.amount).slice(0, 3).map((f: any) => `${f.concept}:${f.amount}€`).join(',')}

TOTAL_PENDIENTE_COBRO:facturas=${totalFacturasPendientes}€+proyectos=${totalProyectosPendientes}€=TOTAL=${totalPendienteCobro}€
FACTURAS_PENDIENTES(${invoices.filter((i: any) => i.status === 'pendiente').length}):${invoices.filter((i: any) => i.status === 'pendiente').map((i: any) => `${i.invoice_number}|cliente:${(i.clients as any)?.name || 'sin asignar'}|${i.concept}|${i.total}€|vence:${i.due_date || 'sin fecha'}`).join(';')}

COMUNICACIONES:pendientes=${communications.filter((c: any) => c.status === 'pending').length}|${communications.filter((c: any) => c.status === 'pending').map((c: any) => `${c.contact_name}(${c.channel})`).join(',')}

CATALOGO:${catalog.map((c: any) => `${c.nombre}:${c.precio}€`).join('|')}

EQUIPO(${staff.length}):${staff.map((s: any) => `${s.full_name}|${s.role}`).join(';')}

LEADS(${leads.length}):${leads.map((l: any) => `NOMBRE:${l.nombre}|temp:${l.temperatura}|estado:${l.estado}|email:${l.email || 'sin email'}|tel:${l.telefono || ''}`).join(';')}

PIPELINE(total:${pipeline.reduce((s: number, p: any) => s + (parseFloat(p.valor_estimado) || 0), 0)}€):${pipeline.map((p: any) => `${p.nombre}|${p.etapa}|${p.valor_estimado}€`).join(';')}

ANÁLISIS_NEGOCIO:
estado=${estadoGeneral === 'BUENO_PENDIENTE_ALTO' ? 'Negocio rentable con cobros pendientes altos' : estadoGeneral === 'BUENO' ? 'Negocio en buena salud' : 'Requiere atención'}
llamar_hoy=${leadCaliente?.nombre || 'ninguno'}|motivo=caliente${dealLeadCaliente ? '+deal ' + dealLeadCaliente.etapa + ' ' + dealLeadCaliente.valor_estimado + '€' : ''}
factura_urgente=${facturasMasUrgentes[0]?.invoice_number || 'ninguna'}|vence_en=${diasHastaVencimiento !== null ? diasHastaVencimiento + ' días' : 'N/A'}
facturas_vencen_7dias=${facturasPorVencer.length}|importe=${facturasPorVencer.reduce((s: any, f: any) => s + parseFloat(f.total || 0), 0)}€
oportunidad_top=${pipelineScore[0]?.nombre || 'ninguna'}|score=${pipelineScore[0]?.score?.toFixed(1) || 0}|prioridad=${pipelineScore[0]?.prioridad || ''}
pipeline_scoring:${pipelineScore.map((p: any) => `${p.nombre}|${p.prioridad}|${p.score?.toFixed(1)}`).join(';')}
total_pendiente_cobro=${totalPendienteCobro}€
salud_financiera=${alertaFinanciera}|margen=${margenBeneficio}%
clientes:activos=${clientesActivos.length}|leads=${clientesLeads.length}|conversion=${tasaConversion}%
acciones_recomendadas=${accionesRecomendadas.join('|') || 'sin_acciones_urgentes'}
comunicaciones_urgentes=${communications.filter((c: any) => c.status === 'pending').length}

${ragContext ? `
DATOS_RELEVANTES_PARA_ESTA_PREGUNTA:
${ragContext}
(Usa estos datos específicos para responder con máxima precisión)` : ''}

INVENTARIO(unidades_fisicas_en_stock):${inventory.map((i: any) => `${i.nombre}:${i.stock}${i.unidad || 'uds'}(min:${i.stock_minimo})`).join('|')}
STOCK_BAJO:${inventory.filter((i: any) => parseFloat(i.stock) <= parseFloat(i.stock_minimo)).map((i: any) => i.nombre).join(',') || 'ninguno'}

FICHAJES_HOY(${fichajes.length}):${fichajes.map((f: any) => { const emp = (staff as any[]).find(s => s.id === f.staff_id); return `${emp?.full_name || '?'}|${f.tipo}|${new Date(f.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })}` }).join(';') || 'ninguno'}

VACACIONES:${vacaciones.map((v: any) => { const emp = (staff as any[]).find(s => s.id === v.staff_id); return `${emp?.full_name || '?'}|${v.fecha_inicio}→${v.fecha_fin}|${v.estado}` }).join(';') || 'ninguna'}
TURNOS_PROXIMOS(${shifts.length}):${shifts.map((s: any) => { const emp = (staff as any[]).find(e => e.id === s.staff_id); return `${emp?.full_name || '?'}|${s.fecha}|${s.hora_inicio?.slice(0, 5)}-${s.hora_fin?.slice(0, 5)}|${s.tipo_turno || ''}` }).join(';') || 'ninguno'}`
    } catch (promptError) {
      console.error('Error construyendo prompt:', promptError)
      systemPrompt = `Eres el asistente de ${orgName}. Responde en español sobre los datos del negocio.`
    }

    const reply = await callAI(
      systemPrompt,
      message,
      history || [],
      0.3,
      true // usar modelo inteligente
    )

    return NextResponse.json({ reply })

  } catch (error: any) {
    console.error('AI Chat error:', error?.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
