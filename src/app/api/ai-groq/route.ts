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

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Control de tokens por organización por día
async function checkAndUpdateTokens(
  organizationId: string,
  estimatedTokens: number
): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().split('T')[0]
  const DAILY_LIMIT = 400000 // dejamos 100k de margen sobre 500k

  try {
    const { data } = await supabaseAdmin
      .from('ai_token_usage')
      .select('tokens_used')
      .eq('organization_id', organizationId)
      .eq('date', today)
      .single()

    const used = data?.tokens_used || 0
    const remaining = DAILY_LIMIT - used

    if (remaining <= 0) {
      return { allowed: false, remaining: 0 }
    }

    // Actualizar o insertar uso del día
    await supabaseAdmin
      .from('ai_token_usage')
      .upsert({
        organization_id: organizationId,
        date: today,
        tokens_used: used + estimatedTokens
      }, {
        onConflict: 'organization_id,date'
      })

    return { allowed: true, remaining: remaining - estimatedTokens }
  } catch {
    // Si falla el control, permitir el mensaje
    return { allowed: true, remaining: DAILY_LIMIT }
  }
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
  try {
    const body = await request.json()
    const { context } = body
    const history = body.history || []

    const orgId = body.orgId || body.conversation?.orgId
      || body.conversation?.organization_id || null

    if (orgId) {
      const estimatedTokens = Math.ceil(
        (body.message?.length || 100) / 4
      ) + 500 // estimación conservadora

      const { allowed } = await checkAndUpdateTokens(
        orgId, estimatedTokens
      )

      if (!allowed) {
        return NextResponse.json({
          response: 'Estamos procesando muchas consultas ahora mismo. ' +
            'Te respondemos en breve.',
          success: true
        })
      }
    }

    let systemPrompt = ''
    let userMessage = body.message || ''
    let temperature = 0.5
    let useSmartModel = false

    // ================================
    // AUTO REPLY FUERA DE HORARIO
    // ================================
    if (context === 'auto_reply') {
      const orgName = body.orgName || 'SF'
      if (body.systemPrompt) {
        systemPrompt = `${buildBaseIdentity(orgName)}\n\n${body.systemPrompt}`
        userMessage = body.message || body.conversation?.lastMessage || '¿Qué responderías?'
      } else {
        return NextResponse.json({
          error: 'Las respuestas automáticas requieren systemPrompt'
        }, { status: 400 })
      }
      temperature = 0.7
      useSmartModel = true
    }

    // ================================
    // EXTRACCIÓN DE CITAS
    // ================================
    if (context === 'extract_appointment') {
      systemPrompt = `Eres un asistente experto en gestión de agendas.
Analiza la conversación y extrae los detalles de una posible cita o reserva.
Responde ÚNICAMENTE con un JSON válido (sin markdown):
{
  "title": "descripción breve",
  "date": "YYYY-MM-DD o null si no se detecta",
  "time": "HH:MM o null si no se detecta",
  "type": "llamada|videollamada|presencial|reserva",
  "notes": "contexto relevante extraído"
}
Si falta la fecha u hora, pon null. No inventes datos.`
      temperature = 0.3

      const msgs = body.conversation?.messages || []
      const historyStr = msgs.map((m: any) =>
        `${m.sender === 'client' ? 'Cliente' : 'Negocio'}: ${m.content}`
      ).join('\n')
      const lastMsg = body.conversation?.lastMessage || ''
      userMessage = `Historial:\n${historyStr}\n\nÚltimo mensaje:\n${lastMsg}\n\nExtrae la cita.`
    }

    // ================================
    // RESUMEN PARA CITAS
    // ================================
    if (context === 'summarize_for_appointment') {
      systemPrompt = `Genera un resumen conciso en 3-5 líneas:
- Qué necesita el cliente
- Detalles relevantes (urgencia, número personas, tipo evento)
- Perfil del cliente
Responde SOLO el resumen, sin títulos. En español.`
      temperature = 0.3

      const msgs = body.conversation?.messages || []
      const historyStr = msgs.map((m: any) =>
        `${m.sender === 'client' ? 'Cliente' : 'Negocio'}: ${m.content}`
      ).join('\n')
      const lastMsg = body.conversation?.lastMessage || ''
      const clientName = body.conversation?.clientName || 'Cliente'
      userMessage = `Cliente: ${clientName}\n\nHistorial:\n${historyStr}\n\nÚltimo mensaje:\n${lastMsg}\n\nGenera el resumen.`
    }

    // ================================
    // LEAD SCORING
    // ================================
    if (context === 'lead_scoring') {
      systemPrompt = `Analiza este mensaje de un posible cliente.
Responde SOLO con JSON válido sin markdown:
{
  "score": número del 1 al 10,
  "motivo": "razón en máximo 8 palabras",
  "urgencia": "alta/media/baja",
  "categoria": "reserva/evento/consulta/otro"
}`
      temperature = 0.3
      userMessage = body.message
    }

    // ================================
    // SEGUIMIENTO — Clientes inactivos
    // ================================
    if (context === 'follow_up') {
      const c = body.client
      systemPrompt = `Genera un mensaje de seguimiento profesional en español para ${c?.name}.
Han pasado ${c?.days} días sin contacto. Notas: ${c?.notes || 'ninguna'}.
Máximo 4 líneas. Natural, cercano. Ofrece valor concreto.`
      temperature = 0.3
      userMessage = 'Genera el mensaje'
    }

    // ================================
    // CHAT GENERAL DEL DASHBOARD
    // ================================
    if (context === 'dashboard' || context === 'communications') {
      const orgName = body.orgName || 'SF'
      const base = buildBaseIdentity(orgName)
      const customPrompt = body.systemPrompt || `Eres un asistente de negocio profesional.
Responde en español. Máximo 4 líneas. Tono profesional y cercano.`

      systemPrompt = `${base}\n\n${customPrompt}`
      temperature = context === 'communications' ? 0.7 : 0.3
      userMessage = body.message || body.conversation?.message || ''
    }

    if (!userMessage?.trim()) {
      return NextResponse.json({ response: '¿En qué puedo ayudarte?' })
    }

    const response = await callAI(systemPrompt, userMessage, history, temperature, useSmartModel)
    return NextResponse.json({ response })

  } catch (error: any) {
    console.error('Groq AI error:', error?.message)
    return NextResponse.json({
      response: 'Error al conectar con la IA. Inténtalo de nuevo.',
      success: false
    }, { status: 500 })
  }
}
