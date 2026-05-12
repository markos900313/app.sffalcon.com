export async function handleIncomingMessage(supabase: any, orgId: string, ticketId: string, remoteJid: string, text: string) {

  // 1. Obtener configuración de la organización
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, plan, ai_settings')
    .eq('id', orgId)
    .single()

  if (!org || !org.ai_settings?.enabled) {
    return // IA desactivada
  }

  // 2. Comprobar horario laboral si está configurado
  const now = new Date()
  const currentDay = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][now.getDay()]
  const schedule = org.ai_settings.schedule?.[currentDay]

  let isWorkingHours = true
  if (schedule && schedule.enabled) {
    const time = now.getHours() * 100 + now.getMinutes()
    const start = parseInt(schedule.start.replace(':', ''))
    const end = parseInt(schedule.end.replace(':', ''))
    isWorkingHours = time >= start && time <= end
  }

  // 3. Generar respuesta con IA via Groq
  const { data: history } = await supabase
    .from('messages')
    .select('content, sender_type')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false })
    .limit(5)

  const context = history?.reverse().map((m: any) => `${m.sender_type === 'customer' ? 'Cliente' : 'Agente'}: ${m.content}`).join('\n') || ''

  let aiResponse: string | null = null
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `Eres el asistente de ${org.name}. Responde de forma breve y profesional.` },
          { role: 'user', content: context ? `${context}\nCliente: ${text}` : text }
        ],
        max_tokens: 300
      })
    })
    const groqData = await groqRes.json()
    aiResponse = groqData.choices?.[0]?.message?.content || null
  } catch (err) {
    console.error('Error Groq:', err)
    return
  }

  if (!aiResponse) return

  // 4. Decidir si RESPONDER o SUGERIR
  const forceSugerencia = org.plan === 'free' || (isWorkingHours && org.ai_settings.mode === 'suggestion')

  console.log(`[AI Logic] Org: ${org.name} (${orgId}), Plan: ${org.plan}, Hours: ${isWorkingHours ? 'In' : 'Out'}, Mode: ${org.ai_settings.mode} -> Decision: ${forceSugerencia ? 'SUGGESTION' : 'AUTO-REPLY'}`)

  await supabase
    .from('messages')
    .delete()
    .eq('ticket_id', ticketId)
    .eq('sender_type', 'ai_suggestion')

  if (forceSugerencia) {
    await supabase.from('messages').insert({
      ticket_id: ticketId,
      content: aiResponse,
      sender_type: 'ai_suggestion',
      channel: 'whatsapp'
    })
  } else {
    await supabase.from('messages').insert({
      ticket_id: ticketId,
      content: aiResponse,
      sender_type: 'ai_auto',
      channel: 'whatsapp'
    })

    try {
      await sendWhatsAppMessage(orgId, remoteJid, aiResponse)
      await supabase.from('messages')
        .update({ metadata: { auto_responded: true } })
        .eq('ticket_id', ticketId)
        .eq('content', text)
    } catch (err) {
      console.error('Error enviando auto-respuesta:', err)
    }
  }
}

async function sendWhatsAppMessage(orgId: string, jid: string, text: string) {
  const SERVER_URL = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || 'https://wa.soportefacil.com'
  const API_KEY = process.env.WHATSAPP_API_KEY || 'sf_whatsapp_2026_secret'

  const response = await fetch(`${SERVER_URL}/api/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({ orgId, jid, text })
  })

  if (!response.ok) {
    throw new Error('Failed to send WhatsApp message')
  }
}

export async function sendManualResponse(orgId: string, ticketId: string, remoteJid: string, text: string) {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()

  await sendWhatsAppMessage(orgId, remoteJid, text)

  await supabase.from('messages').insert({
    ticket_id: ticketId,
    content: text,
    sender_type: 'agent',
    channel: 'whatsapp'
  })

  await supabase.from('tickets')
    .update({ last_message_at: new Date() })
    .eq('id', ticketId)
}