'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
}

const BENEFITS = [
  'Gestión ilimitada de contactos',
  'Reservas y citas sin límites',
  'Control financiero inteligente',
  'IA 24/7 (WhatsApp + Email)',
  'Estadísticas y métricas pro'
]

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
        }),
      })
      
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Error al procesar el pago')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop — mismo que Communications */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal container — mismo diseño que Communications */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">Nueva Suscripción</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1E3A5F] rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Plan Seleccionado</label>
                <div className="bg-slate-50 dark:bg-[#0D1B35] border border-slate-200 dark:border-[#1E3A5F] rounded-xl p-5 flex items-center justify-between group transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20">
                  <div className="space-y-1">
                    <p className="text-[15px] font-bold text-[#0F172A] dark:text-[#F1F5F9]">Plan Profesional</p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">Gestión completa e IA avanzada</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[18px] font-black text-[#0F172A] dark:text-[#F1F5F9]">29€</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">/ Mes</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Beneficios Incluidos</label>
                <div className="space-y-2">
                  {BENEFITS.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#0D1B35]/50 border border-slate-100 dark:border-[#1E3A5F]/50 rounded-lg group hover:bg-slate-100 dark:hover:bg-[#0D1B35] transition-colors">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/40">
                        <Check className="w-3 h-3 text-blue-500" />
                      </div>
                      <span className="text-[13px] text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-[#1E3A5F] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={onClose}
                className="w-full sm:w-auto order-2 sm:order-1 text-[14px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors px-4 py-2 uppercase tracking-tight"
              >
                Cancelar
              </button>

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full sm:w-auto order-1 sm:order-2 relative overflow-hidden bg-[#1B4FD8] hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-[14px] font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-tight"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Confirmar Suscripción'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
