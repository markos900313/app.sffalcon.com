import Stripe from 'stripe'
let stripeInstance: Stripe | null = null;

export const getStripe = () => {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia' as any
    })
  }
  return stripeInstance
}

// Para compatibilidad con lo que ya escribí en las rutas
export const stripe = typeof window === 'undefined' ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any
}) : null as any;

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 19.99,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    features: [
      'Email IA automático',
      'Hasta 100 conversaciones/mes',
      'CRM básico (50 clientes)',
      'Citas básicas'
    ],
    limits: {
      conversations: 100,
      clients: 50,
      whatsapp: false,
      invoicing: false,
      analytics: false,
      agents: false
    }
  },
  pro: {
    name: 'SF Gestor Empresarial',
    price: 29,
    priceId: process.env.STRIPE_PRICE_PRO!,
    features: [
      'Todo Starter',
      'WhatsApp IA',
      'Conversaciones ilimitadas',
      'CRM ilimitado',
      'Facturación completa',
      'Analytics avanzado'
    ],
    limits: {
      conversations: -1,
      clients: -1,
      whatsapp: true,
      invoicing: true,
      analytics: true,
      agents: false
    }
  },
  ultra: {
    name: 'Ultra Pro',
    price: 79.99,
    priceId: process.env.STRIPE_PRICE_ULTRA!,
    features: [
      'Todo Pro',
      'Agentes IA autónomos',
      'Múltiples usuarios',
      'API acceso',
      'Soporte prioritario'
    ],
    limits: {
      conversations: -1,
      clients: -1,
      whatsapp: true,
      invoicing: true,
      analytics: true,
      agents: true
    }
  }
}
