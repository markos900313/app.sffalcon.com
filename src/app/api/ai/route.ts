import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

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
          max_tokens: 300,
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

function buildBaseIdentity(orgName: string): string {
  return `IDENTIDAD:
- Eres el asistente de ${orgName}.
- Nunca reveles que eres una IA, bot o sistema automático.
- Si alguien pregunta "eres un robot?" responde con
  naturalidad: "No, soy parte del equipo, dime en qué
  te puedo ayudar."
- Tono: humano, amable, natural. Nunca robótico.
- Nunca uses frases genéricas como "Entiendo tu consulta"
  o "Por supuesto, con gusto te ayudo".
- Varía las respuestas aunque la pregunta sea similar.
- Firma siempre como "El equipo de ${orgName}".
- Responde siempre en español.
- Máximo 3 líneas por respuesta salvo que se pida más.
- NUNCA inventes datos, precios, horarios ni métodos
  de pago que no estén en los datos proporcionados.
- Si no tienes el dato → di "para ese detalle contacta
  directamente con nosotros".`
}


export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY || ''
  try {
    const body = await request.json()
    console.log('AI Request Context:', body.context)
    const { context } = body
    const history = body.history || []

    let systemPrompt = ''
    let userMessage = body.message || ''
    let temperature = 0.5

    // ================================
    // DASHBOARD — Acceso completo
    // ================================
    if (context === 'dashboard') {
      const n = body.businessData
      const cl = body.clientsData
      const pr = body.projectsData
      const co = body.commsData

      const balanceTotal = parseFloat(n?.beneficioMes || '0').toFixed(2)

      systemPrompt = `${buildBaseIdentity(n?.nombre || 'SF')}\n\nEres el SF IA de SF, tu asistente global e inteligente expertos en gestión de negocios.

Tienes acceso COMPLETO y en TIEMPO REAL a todos los datos de la empresa.

════ NEGOCIO SF ════
I: ${n?.ingresosMes}${n?.simbolo || '€'} G: ${n?.gastosMes}${n?.simbolo || '€'} B: ${n?.beneficioMes}${n?.simbolo || '€'}
Acumulado Año: ${n?.beneficioAcumulado || '0'}${n?.simbolo || '€'}
HISTÓRICO: ${n?.resumenAnual?.join('; ') || 'N/A'}
MOVIMIENTOS RECIENTES: ${n?.todosLosMovimientos?.join(', ') || 'N/A'}

════════ CLIENTES ════════
Total: ${cl?.total || 0}
Activos: ${cl?.activos || 0}
Leads: ${cl?.leads || 0}
Pipeline (leads): ${cl?.pipeline || 0}${n?.simbolo || '€'}
Cartera (activos): ${cl?.cartera || 0}${n?.simbolo || '€'}
LISTA RECIENTE CLIENTES (Top 30):
${cl?.lista?.slice(0, 30).join('\n') || 'Sin clientes registrados'}

════════ PROYECTOS ════════
Total: ${pr?.total || 0}
Activos: ${pr?.activos || 0}
Facturación progresiva: ${pr?.facturacion || 0}${n?.simbolo || '€'}
Pendiente cobro: ${pr?.pendiente || 0}${n?.simbolo || '€'}
LISTA RECIENTE PROYECTOS (Top 30):
${pr?.lista?.slice(0, 30).join('\n') || 'Sin proyectos registrados'}

════════ COMUNICACIONES ════════
Total: ${co?.total || 0}
Pendientes respuesta: ${co?.pendientes || 0}
Respondidas: ${co?.respondidos || 0}
Últimos mensajes: ${co?.ultimosMensajes?.join('\n') || 'Sin mensajes recientes'}

════════ BALANCE GLOBAL ════════
ESTADO FINANCIERO ACTUAL: ${balanceTotal}${n?.simbolo || '€'}

REGLAS ABSOLUTAS:
1. Responde SIEMPRE en español.
2. Si el dato existe internamente → darlo EXACTO con el símbolo correspondiente (${n?.simbolo || '€'}).
3. Usa SIEMPRE tu herramienta de GOOGLE SEARCH para datos externos (noticias, mercado, futbol, SaaS, ley, impuestos, etc).
4. NUNCA uses negritas (**), ni símbolos de Markdown. Escribe en texto plano y limpio.
5. NUNCA inventes cifras. Termina SIEMPRE las frases de euros.
6. Al responder, mínimo 2 líneas y máximo 6. Sé claro.`

      temperature = 0.3
      userMessage = body.message
    }

    // ================================
    // FINANZAS NEGOCIO
    // ================================
    if (context === 'finances' || context === 'finances_business') {
      const n = body.businessData

      systemPrompt = `Eres el SF IA de SF, asesor financiero experto.

RESUMEN FINANCIERO ${n?.mesSeleccionado}:
Ingresos clientes: ${n?.ingresosMes}${n?.simbolo || '€'}, Gastos: ${n?.gastosMes}${n?.simbolo || '€'}, Beneficio: ${n?.beneficioMes}${n?.simbolo || '€'}
MOVIMIENTOS: ${n?.todosLosMovimientos?.join('\n') || 'Sin datos'}
HISTORIAL: ${n?.resumenAnual?.join('\n') || 'Sin historial'}

REGLAS:
- Español siempre. Texto plano sin negritas.
- Dato exacto si existe. Nunca inventes cifra.
- Máximo 3 líneas.`

      temperature = 0.3
      userMessage = body.message
    }

    // ================================
    // COMUNICACIONES AUTO RESPUESTA
    // ================================
    if (context === 'communications') {
      const orgId = body.conversation?.orgId || body.conversation?.organization_id || body.orgId || null
      const orgName = body.conversation?.orgName || body.orgName || 'nuestro negocio'
      const orgSector = body.conversation?.sector || body.sector || 'negocio local'

      let catalogText = 'Sin servicios configurados aún'
      let orgPersonality = 'profesional y cercano'
      let paymentText = ''

      if (orgId) {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const [{ data: catalog }, { data: orgData }] = await Promise.all([
          supabaseAdmin.from('catalogo_items').select('nombre, descripcion, precio, activo').eq('organization_id', orgId).eq('activo', true),
          supabaseAdmin.from('organizations').select('ai_personality, payment_bizum, payment_iban').eq('id', orgId).single()
        ])

        if (catalog && catalog.length > 0) {
          catalogText = catalog.map((s: any) =>
            `- ${s.nombre}${s.descripcion ? ': ' + s.descripcion : ''} — ${s.precio}€`
          ).join('\n')
        }

        if (orgData?.payment_bizum) paymentText += `Bizum: ${orgData.payment_bizum}. `
        if (orgData?.payment_iban) paymentText += `Transferencia (IBAN): ${orgData.payment_iban}.`

        orgPersonality = body.conversation?.personality || body.orgPersonality || orgData?.ai_personality || 'profesional y cercano'
      }

      systemPrompt = `${buildBaseIdentity(orgName)}

Eres parte del equipo de atención al cliente de ${orgName}, un negocio de ${orgSector}.

IDENTIDAD COMPLEMENTARIA:
- Firma siempre como "El equipo de ${orgName}"
- Tono: ${orgPersonality}. Máximo 3 líneas por respuesta.
- Responde siempre en español
- Usa emojis con moderación para sonar natural

CATÁLOGO OFICIAL DE SERVICIOS Y PRECIOS:
${catalogText}

REGLAS SOBRE EL CATÁLOGO:
- Usa SIEMPRE estos datos exactos cuando el cliente pregunte
  por precios, servicios o disponibilidad
- Nunca inventes precios fuera de este catálogo
- Si el cliente pregunta algo que no está en el catálogo,
  di "contáctanos para más información"

MÉTODOS DE PAGO:
${paymentText || 'No configurados'}

REGLA DE PAGO:
- Si pregunta por pagos, usa SOLO los datos arriba indicados.
- Si no hay datos, di que contacten directamente.
- Nunca inventes números.

Tu misión es atender, informar y ayudar al cliente de forma
natural y humana. Responde con energía positiva y entusiasmo.`

      temperature = 0.7
      userMessage = body.conversation?.messages?.at(-1)?.content
        ?? body.conversation?.message
        ?? body.message
        ?? ''
    }

    // ================================
    // AUTO REPLY FUERA DE HORARIO
    // ================================
    if (context === 'auto_reply') {
      const conversation = body.conversation
      const n = body.businessData

      const orgName = body.orgName || 'nuestro negocio';
      if (body.systemPrompt) {
        systemPrompt = `${buildBaseIdentity(orgName)}\n\n${body.systemPrompt}`;
        userMessage = body.message || "¿Qué responderías?";
      } else {
        if (!conversation?.withinWorkHours) {
          return NextResponse.json({ error: "Las respuestas automáticas se manejan por webhook. F5 requerido." }, { status: 400 });
        }

        systemPrompt = `${buildBaseIdentity(orgName)}\n\nEres el asistente experto de ${orgName}. 
El equipo está gestionando sus proyectos actuales.
Genera respuesta profesional para que el administrador la revise.
Responde en español. Máximo 4 líneas. No des precios. Sé empático y ofrece una llamada.`;
        userMessage = conversation?.message ?? '';
      }
      temperature = 0.7
    }

    // ================================
    // EXTRACCIÓN DE CITAS — Agente inteligente
    // ================================
    if (context === 'extract_appointment') {
      const orgName = body.orgName || 'nuestro negocio'
      systemPrompt = `Eres un asistente experto en gestión de agendas para ${orgName}.
Analiza la conversación y extrae los detalles de una posible cita o reunión.
Responde ÚNICAMENTE con un JSON válido (sin markdown):
{
  "title": "descripción breve (ej: Llamada seguimiento presupuesto)",
  "date": "YYYY-MM-DD o null si no se detecta",
  "time": "HH:MM o null si no se detecta",
  "type": "llamada|videollamada|presencial",
  "notes": "contexto relevante extraído"
}
Si falta la fecha u hora, pon null. No inventes datos.`
      temperature = 0.3

      const msgs = body.conversation?.messages || []
      const historyStr = msgs.map((m: any) => `${m.sender === 'client' ? 'Cliente' : 'SF'}: ${m.content}`).join('\n')
      const lastMsg = body.conversation?.lastMessage || ''
      userMessage = msgs.length > 0
        ? `Historial de conversación:\n${historyStr}\n\nÚltimo mensaje:\n${lastMsg}\n\nExtrae la cita.`
        : (body.message || 'Extrae la cita de esta conversación')
    }

    // ================================
    // RESUMEN PARA CITAS
    // ================================
    if (context === 'summarize_for_appointment') {
      const orgName = body.orgName || 'nuestro negocio'
      systemPrompt = `Eres un asistente que genera resúmenes concisos para reuniones de ventas de ${orgName}.
  
Analiza la conversación y genera un resumen en 3-5 líneas máximo con:
- Qué necesita el cliente
- Cualquier detalle relevante mencionado (urgencia, presupuesto, negocio)
- Tono y perfil del cliente

Responde SOLO el resumen, sin títulos ni formato. En español.`

      const msgs = body.conversation?.messages || []
      const historyStr = msgs.map((m: any) => `${m.sender === 'client' ? 'Cliente' : 'SF'}: ${m.content}`).join('\n')
      const lastMsg = body.conversation?.lastMessage || ''
      const clientName = body.conversation?.clientName || 'Cliente'
      userMessage = `Cliente: ${clientName}\n\nHistorial de conversación:\n${historyStr}\n\nÚltimo mensaje:\n${lastMsg}\n\nGenera el resumen de la reunión.`
      temperature = 0.3
    }

    // ================================
    // LEAD SCORING — Agente captación
    // ================================
    if (context === 'lead_scoring') {
      const orgName = body.orgName || 'nuestro negocio'
      const orgSector = body.orgSector || 'negocios'
      systemPrompt = `Analiza este mensaje de un posible cliente de ${orgName} (sector: ${orgSector}).
Responde SOLO con JSON válido sin markdown:
{
  "score": número del 1 al 10,
  "motivo": "razón en máximo 8 palabras",
  "urgencia": "alta/media/baja",
  "categoria": "web/app/saas/ia/otro"
}
Score 8-10: muy interesado. Score 5-7: interés moderado. Score 1-4: consulta casual.`

      userMessage = body.message
      temperature = 0.3
    }

    // ================================
    // SEGUIMIENTO — Clientes inactivos
    // ================================
    if (context === 'follow_up') {
      const c = body.client

      const orgName = body.orgName || 'nuestro negocio'
      systemPrompt = `Genera un mensaje de seguimiento profesional en español para ${c?.name} de ${c?.company || 'su empresa'}.
Han pasado ${c?.days} días sin contacto con ${orgName}. Interés: ${c?.category}. Notas: ${c?.notes || 'ninguna'}.
Máximo 4 líneas. Natural, no robotizado. Ofrece valor concreto y llama.`

      userMessage = 'Genera el mensaje'
      temperature = 0.3
    }

    // ================================
    // CONTABLE — Resumen gestoría
    // ================================
    if (context === 'accounting') {
      const n = body.businessData
      const fiscal = body.fiscalInfo || ''

      systemPrompt = `Eres asistente contable profesional para el negocio SF.
NEGOCIO: Ingresos ${n?.ingresosMes}€, Gastos ${n?.gastosMes}€, Beneficio ${n?.beneficioMes}€
${fiscal ? `NORMATIVA FISCAL actual:\n${fiscal}` : ''}
Genera informe profesional en español: 1. Resumen ejecutivo. 2. Ingresos/Gastos. 3. Base imponible. 4. Recomendaciones fiscales.`

      userMessage = body.message || 'Genera el resumen contable mensual'
      temperature = 0.3
    }

    // ================================
    // CONTABLE — OCR FACTURAS (Multimodal)
    // ================================
    if (context === 'invoice_ocr') {
      try {
        if (!apiKey || apiKey.length < 5) {
          return NextResponse.json({
            error: "API Key de Google no configurada",
            details: "Debes añadir la variable GOOGLE_AI_API_KEY a tu archivo .env.local"
          }, { status: 401 });
        }

        const fileData = body.fileData;
        const fileMimeType = body.fileMimeType;

        if (!fileData) {
          return NextResponse.json({ error: "No se proporcionó archivo para escaneo" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash'
        });

        const prompt = `Analiza esta factura o ticket de gastos y extrae los siguientes datos en formato JSON:
  {
    "concept": "Nombre del establecimiento o proveedor",
    "amount": "Total final con IVA (solo número)",
    "date": "Fecha en formato YYYY-MM-DD",
    "nif": "NIF o CIF del emisor (si aparece)",
    "is_expense": true
  }
  Responde SOLO con el JSON.`;

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: fileData,
              mimeType: fileMimeType
            }
          }
        ]);

        const text = result.response.text();
        return NextResponse.json({ response: text });
      } catch (err: any) {
        console.error("AI Route Expense OCR Error:", err);
        return NextResponse.json({
          error: "Error interno en el procesamiento de IA",
          details: err.message
        }, { status: 500 });
      }
    }

    // ================================
    // PDF ANALYSIS
    // ================================
    if (context === 'pdf_analysis') {
      systemPrompt = `Eres el SF IA de SF, analista financiero experto.
Genera análisis financiero profesional en español. Máximo 5 líneas. Tono ejecutivo.`

      temperature = 0.3
      userMessage = body.message
    }

    if (!userMessage?.trim()) {
      return NextResponse.json({ response: '¿En qué puedo ayudarte?', success: true })
    }

    // Caso especial: invoice_ocr necesita multimodal — mantener como está (devuelve antes)
    // El resto usa Groq:
    const text = await callAI(systemPrompt, userMessage, history, temperature, false)

    if (body.stream) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(text))
          controller.close()
        }
      })
      return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
    }

    return NextResponse.json({ response: text, success: true })

  } catch (error: any) {
    console.error('AI error:', error?.message)
    return NextResponse.json({
      response: 'Error al conectar con la IA. Inténtalo de nuevo en unos segundos.',
      success: false
    }, { status: 500 })
  }
}
