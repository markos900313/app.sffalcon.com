import { createClient } from '@supabase/supabase-js'

/**
 * Utility to send WhatsApp messages with automatic JID resolution
 * and production-ready logging.
 */
export const sendWhatsApp = async ({
  to,
  message,
  orgId,
  attachments = []
}: {
  to: string
  message: string
  orgId: string
  attachments?: any[]
}) => {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || 'https://wa.soportefacil.com').replace(/\/$/, '')
    const apiKey = process.env.WHATSAPP_API_KEY || 'sf_whatsapp_2026_secret'
    
    if (!orgId) {
      console.error('[WhatsApp] Error: No se proporcionó orgId')
      return { success: false, error: 'orgId is required' }
    }
    let targetJid = to.includes('@') ? to : `${to.replace(/\D/g, '')}@s.whatsapp.net`

    // 1. Resolve JID from Database if a plain number is provided
    if (!to.includes('@') && orgId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: comms } = await supabase
        .from('communications')
        .select('contact_identifier')
        .eq('organization_id', orgId)
        .eq('channel', 'whatsapp')
        .or(`contact_identifier.eq.${to},contact_identifier.ilike.${to.replace(/\D/g, '')}%`)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (comms && comms.length > 0) {
        const matched = comms[0].contact_identifier
        if (matched && matched.includes('@')) {
          targetJid = matched
          console.log(`[WhatsApp] JID Resolved: ${to} -> ${targetJid}`)
        }
      }
    }

    console.log(`[WhatsApp] Sending message to ${targetJid} (Org: ${orgId})`)

    // 2. Physical delivery to Baileys Server
    const payload = {
      orgId: String(orgId),
      to: targetJid,
      message,
      attachments
    }

    console.log(`[WhatsApp] Posting to ${baseUrl}/send with payload:`, JSON.stringify(payload))

    const response = await fetch(`${baseUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(payload)
    })

    const resText = await response.text()
    let resData: any
    try { resData = JSON.parse(resText) } catch (e) { resData = resText }

    if (!response.ok) {
      console.error(`[WhatsApp] Server Error (${response.status}):`, resData)
      return { success: false, error: resData?.message || resData?.error || resText }
    }

    return { success: true, data: resData }

  } catch (error: any) {
    console.error('[WhatsApp] Fatal sending error:', error.message)
    return { success: false, error: error.message }
  }
}
