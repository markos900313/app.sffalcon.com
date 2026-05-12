// La instancia se crea dentro para evitar errores en el cliente durante la importación

export const sendEmail = async ({
  to,
  subject,
  text,
  attachments = []
}: {
  to: string
  subject: string
  text: string
  attachments?: any[]
}) => {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('sendEmail solo puede ejecutarse en el servidor');
    }
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'SF Gestor Empresarial <noreply@sffalcon.com>',
      to: [to],
      subject,
      text,
      attachments: attachments.map(a => ({
        filename: a.name,
        path: a.url
      })),
      replyTo: 'inbound@sffalcon.com'
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Send email error:', error)
    return { success: false, error }
  }
}
