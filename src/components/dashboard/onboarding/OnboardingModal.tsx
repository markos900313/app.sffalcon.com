'use client'

import { parseTime } from '@/lib/utils/time'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Upload,
  Briefcase,
  Globe,
  Phone,
  CheckCircle2,
  Info,
  Mail,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useOrganization } from '@/context/OrganizationContext'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/LanguageContext'

interface OnboardingModalProps {
  onComplete: () => void
  onCancel?: () => void
}

const COUNTRIES = [
  { code: 'ES', flag: '🇪🇸', currency: 'EUR', symbol: '€' },
  { code: 'US', flag: '🇺🇸', currency: 'USD', symbol: '$' },
  { code: 'MX', flag: '🇲🇽', currency: 'MXN', symbol: '$' },
  { code: 'CO', flag: '🇨🇴', currency: 'COP', symbol: '$' },
  { code: 'AR', flag: '🇦🇷', currency: 'ARS', symbol: '$' },
  { code: 'GB', flag: '🇬🇧', currency: 'GBP', symbol: '£' },
  { code: 'FR', flag: '🇫🇷', currency: 'EUR', symbol: '€' },
  { code: 'DE', flag: '🇩🇪', currency: 'EUR', symbol: '€' },
  { code: 'CU', flag: '🇨🇺', currency: 'CUP', symbol: '$' },
  { code: 'CL', flag: '🇨🇱', currency: 'CLP', symbol: '$' },
  { code: 'PE', flag: '🇵🇪', currency: 'PEN', symbol: 'S/' },
]

const HOURS = Array.from({ length: 24 }, (_, i) => {
  return `${i.toString().padStart(2, '0')}:00`
})

export default function OnboardingModal({ onComplete, onCancel }: OnboardingModalProps) {
  const { organization, loading: orgLoading } = useOrganization()
  const { t, language } = useLanguage()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [totalSteps] = useState(8)
  const supabase = createClient()
  const router = useRouter()

  const getCountryName = (code: string) => {
    switch (code) {
      case 'ES': return language === 'es' ? 'España' : 'Spain';
      case 'US': return language === 'es' ? 'EEUU' : 'USA';
      case 'MX': return language === 'es' ? 'México' : 'Mexico';
      case 'CO': return language === 'es' ? 'Colombia' : 'Colombia';
      case 'AR': return language === 'es' ? 'Argentina' : 'Argentina';
      case 'GB': return language === 'es' ? 'Reino Unido' : 'United Kingdom';
      case 'FR': return language === 'es' ? 'Francia' : 'France';
      case 'DE': return language === 'es' ? 'Alemania' : 'Germany';
      case 'CU': return language === 'es' ? 'Cuba' : 'Cuba';
      case 'CL': return language === 'es' ? 'Chile' : 'Chile';
      case 'PE': return language === 'es' ? 'Perú' : 'Peru';
      default: return '';
    }
  }

  const getDayLabel = (id: number) => {
    const labelsES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const labelsEN = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return language === 'es' ? labelsES[id - 1] : labelsEN[id - 1];
  }

  // Form State
  const [formData, setFormData] = useState({
    // Step 2: Profile
    fullName: '',
    cargo: '',
    personalPhone: '',
    avatarFile: null as File | null,
    avatarUrl: '',

    // Step 3: Business
    businessName: organization?.name || '',
    isAutonomo: false,
    countryCode: organization?.country || 'ES',
    currency: 'EUR',
    businessPhone: organization?.whatsapp_number || '',
    businessEmail: organization?.email_channel || '',
    sector: '', 
    logoFile: null as File | null,
    logoUrl: organization?.logo_url || '',

    // Step 4: Schedule
    selectedDays: organization?.working_days || [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '18:00',

    // Step 5: Personality
    personality: 'amigable',
    description: '',

    // Step 7: Consent
    consentAccepted: false,

    // Step 8: Plan
    selectedPlan: 'pro'
  })
  const [showHelp, setShowHelp] = useState(false)

  const isUS = formData.countryCode === 'US' || formData.currency === 'USD'

  const PLAN_OPTIONS = [
    {
      id: 'pro',
      name: language === 'es' ? 'SF Gestor Empresarial' : 'SF Business Manager',
      price: isUS ? '$29' : '29€',
      features: [
        language === 'es' ? 'Clientes y agenda ilimitados' : 'Unlimited clients and schedule',
        language === 'es' ? 'Comunicaciones WhatsApp + Email' : 'WhatsApp + Email communications',
        language === 'es' ? 'IA responde por ti 24/7' : 'AI responds for you 24/7',
        language === 'es' ? 'Finanzas y facturas' : 'Finance and invoices',
        language === 'es' ? 'Productos e inventario' : 'Products and inventory',
        language === 'es' ? 'Estadísticas y métricas' : 'Statistics and metrics',
        language === 'es' ? 'Equipo y fichajes' : 'Team and clock-ins',
        language === 'es' ? 'SF IA en el panel' : 'SF AI in dashboard'
      ],
      badge: language === 'es' ? 'Todo incluido' : 'All-in-one',
      highlight: true,
      subtitle: language === 'es' ? '90 días GRATIS · Sin tarjeta' : '90 days FREE · No card'
    }
  ]

  if (orgLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0a0f1c] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  const nextStep = async () => {
    if (step === 7 && formData.consentAccepted && organization?.id) {
      // Save consent to Supabase
      const { error } = await supabase
        .from('organizations')
        .update({
          consent_accepted: true,
          consent_accepted_at: new Date().toISOString()
        })
        .eq('id', organization.id)

      if (error) {
        console.warn('Could not save consent (columns might not exist):', error)
      }
    }
    setStep(s => Math.min(s + 1, totalSteps))
  }
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('modals.onboarding.logoSizeError'))
      return
    }
    setFormData(prev => ({ ...prev, logoFile: file }))
    setFormData(prev => ({ ...prev, logoUrl: URL.createObjectURL(file) }))
  }

  const handleComplete = async () => {
    console.log('Completando onboarding...')

    if (!organization?.id) {
      toast.error(t('modals.onboarding.toastOrgError'))
      console.error('Onboarding Error: No organization.id found')
      return
    }

    setLoading(true)
    try {
      console.log('Obteniendo usuario...')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(t('modals.onboarding.toastUserError'))

      // Upload Logo
      let finalLogoUrl = formData.logoUrl
      if (formData.logoFile) {
        console.log('Subiendo logo...')
        const fileExt = formData.logoFile.name.split('.').pop()
        const fileName = `logo-${organization?.id}-${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, formData.logoFile)

        if (uploadError) throw uploadError
        finalLogoUrl = supabase.storage.from('logos').getPublicUrl(fileName).data.publicUrl
      }

      // Upload Avatar
      let finalAvatarUrl = formData.avatarUrl
      if (formData.avatarFile) {
        console.log('Subiendo avatar...')
        const fileExt = formData.avatarFile.name.split('.').pop()
        const fileName = `avatar-${user.id}-${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, formData.avatarFile)

        if (!uploadError) {
          finalAvatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl
        }
      }

      const selectedCountry = COUNTRIES.find(c => c.code === formData.countryCode) || COUNTRIES[0]

      // 3. Calcular info de plan y trial
      console.log('Calculando plan...')
      const isTrial = formData.selectedPlan !== 'free'
      const trialDays = 90
      const trialEndsAt = isTrial
        ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
        : null

      // 1. Actualizar organización
      console.log('Actualizando organización...')
      const { error: orgError } = await supabase
        .from('organizations')
        .update({
          name: formData.businessName,
          country: formData.countryCode,
          currency: formData.currency,
          currency_symbol: selectedCountry.symbol || '$',
          phone: formData.businessPhone,
          email: formData.businessEmail,
          whatsapp_number: formData.businessPhone,
          email_channel: formData.businessEmail,
          ai_sector_prompt: `${formData.sector}. ${formData.description}`,
          onboarding_completed: true,
          working_hours_start: parseTime(formData.startTime),
          working_hours_end: parseTime(formData.endTime),
          working_days: formData.selectedDays,
          auto_reply_enabled: true,
          ai_auto_appointments: true,
          ai_auto_clients: true,
          plan: formData.selectedPlan,
          trial_ends_at: trialEndsAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization?.id)

      if (orgError) throw orgError

      // 1.1. Sincronizar Email Corporativo en settings
      console.log('Sincronizando settings...')
      const { error: settingsError } = await supabase
        .from('settings')
        .upsert({
          organization_id: organization.id,
          email_inbound: formData.businessEmail,
          email_display_name: formData.businessName,
          email_signature: `--\nAtentamente,\n${formData.businessName}`,
          email_ai_enabled: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'organization_id' })

      if (settingsError) {
        console.warn('Error al sincronizar settings:', settingsError)
        // No lanzamos error para no bloquear el onboarding si falla settings
      }

      // 2. Actualizar perfil
      console.log('Actualizando perfil...')
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          cargo: formData.cargo,
          phone: formData.personalPhone,
          avatar_url: finalAvatarUrl,
          onboarding_completed: true
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      console.log('Onboarding completado exitosamente')
      toast.success(t('modals.onboarding.toastCompleteSuccess'))

      // Primero llamamos a onComplete para que el componente padre sepa que terminó
      if (onComplete) onComplete()

      // Redirigimos y refrescamos para asegurar que el layout detecte el cambio de onboarding_completed
      router.push('/dashboard')
      router.refresh()

    } catch (error: any) {
      console.error('Error crítico en onboarding:', error)
      toast.error(t('modals.onboarding.toastCompleteError') + (error.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = () => {
    if (step === 2) return formData.fullName && formData.cargo
    if (step === 3) return formData.businessName && formData.businessPhone && formData.businessEmail
    if (step === 4) return formData.selectedDays.length > 0
    if (step === 5) return formData.description.length > 10
    if (step === 7) return formData.consentAccepted
    if (step === 8) return formData.selectedPlan
    return true
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-[#0a0f1c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10 flex flex-col max-h-[90vh]"
      >
        {/* Progress Bar */}
        <div className="px-10 py-8 bg-gradient-to-b from-white/[0.02] to-transparent relative">
          <button
            onClick={onCancel || onComplete}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all z-20"
            title={t('modals.onboarding.close')}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-between relative mb-4">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-1/2 z-0" />
            <motion.div
              className="absolute top-1/2 left-0 h-[2px] bg-blue-500 -translate-y-1/2 z-0"
              initial={{ width: 0 }}
              animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
            />
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className={cn(
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  step === i ? "border-blue-500 bg-blue-500/20 text-blue-400" :
                    step > i ? "border-blue-600 bg-blue-600 text-white" : "border-white/10 bg-[#0a0f1c] text-white/20"
                )}
              >
                {step > i ? <CheckCircle2 className="w-5 h-5 text-white" /> : <span className="text-sm font-bold">{i}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-10 pb-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <div className="space-y-6 text-center py-12">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12"
                  >
                    <CheckCircle2 className="w-12 h-12 text-blue-500" />
                  </motion.div>
                  <header>
                    <h2 className="text-4xl font-bold text-white mb-4">{t('modals.onboarding.welcomeTitle')}</h2>
                    <p className="text-xl text-white/40 max-w-md mx-auto">{t('modals.onboarding.welcomeDesc')}</p>
                  </header>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <header>
                    <h2 className="text-3xl font-bold text-white mb-2">{t('modals.onboarding.profileTitle')}</h2>
                    <p className="text-white/40">{t('modals.onboarding.profileDesc')}</p>
                  </header>

                  <div className="flex flex-col md:flex-row gap-8 py-4">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative group cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setFormData(prev => ({ ...prev, avatarFile: file, avatarUrl: URL.createObjectURL(file) }))
                            }
                          }}
                          className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                        />
                        <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center bg-white/5 overflow-hidden group-hover:border-blue-500/50 transition-all">
                          {formData.avatarUrl ? (
                            <img src={formData.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                          ) : (
                            <Upload className="w-8 h-8 text-white/20" />
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{t('modals.onboarding.profilePhoto')}</span>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-white/30 uppercase tracking-widest">{t('modals.onboarding.fullName')}</label>
                        <input
                          value={formData.fullName}
                          onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                          placeholder="Juan Pérez"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-white/30 uppercase tracking-widest">{t('modals.onboarding.cargo')}</label>
                          <input
                            value={formData.cargo}
                            onChange={e => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                            placeholder="Director, Dueño..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-white/30 uppercase tracking-widest">{t('modals.onboarding.personalPhone')}</label>
                          <input
                            value={formData.personalPhone}
                            onChange={e => setFormData(prev => ({ ...prev, personalPhone: e.target.value }))}
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                            placeholder="+34 600..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <header>
                    <h2 className="text-3xl font-bold text-white mb-2">{t('modals.onboarding.businessTitle')}</h2>
                    <p className="text-white/40">{t('modals.onboarding.businessDesc')}</p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-white/30 uppercase tracking-widest">{t('modals.onboarding.businessName')}</label>
                        <input
                          value={formData.businessName}
                          onChange={e => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                          className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                          placeholder="Nombre de tu empresa"
                        />
                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                          <input
                            type="checkbox"
                            checked={formData.isAutonomo}
                            onChange={e => {
                              const checked = e.target.checked
                              setFormData(prev => ({
                                ...prev,
                                isAutonomo: checked,
                                businessName: checked ? prev.fullName : prev.businessName
                              }))
                            }}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-0"
                          />
                          <span className="text-xs text-white/40">{t('modals.onboarding.autonomoCheckbox')}</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-white/30 uppercase tracking-widest">{t('modals.onboarding.country')}</label>
                          <select
                            value={formData.countryCode}
                            onChange={e => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                            className="w-full bg-[#0f1629] border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none font-medium"
                          >
                            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {getCountryName(c.code)}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-white/30 uppercase tracking-widest">{t('modals.onboarding.currency')}</label>
                          <select
                            value={formData.currency}
                            onChange={e => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                            className="w-full bg-[#0f1629] border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none font-medium"
                          >
                            <option value="EUR">Euro (€)</option>
                            <option value="USD">Dólar ($)</option>
                            <option value="MXN">Peso MXN ($)</option>
                            <option value="COP">Peso COP ($)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-white/30 uppercase tracking-widest">{t('modals.onboarding.activity')}</label>
                        <input
                          value={formData.sector}
                          onChange={e => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                          className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                          placeholder="Ej: Clínica Dental, Centro de Estética..."
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-white/30 uppercase tracking-widest">{t('modals.onboarding.businessPhone')}</label>
                          <input
                            value={formData.businessPhone}
                            onChange={e => setFormData(prev => ({ ...prev, businessPhone: e.target.value }))}
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                            placeholder="+34 600 000 000"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-white/30 uppercase tracking-widest">{t('modals.onboarding.businessEmail')}</label>
                          <input
                            value={formData.businessEmail}
                            onChange={e => setFormData(prev => ({ ...prev, businessEmail: e.target.value }))}
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                            placeholder="contacto@empresa.com"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative group cursor-pointer shrink-0">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                          />
                          <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center bg-white/5 overflow-hidden group-hover:border-blue-500/50 transition-all">
                            {formData.logoUrl ? (
                              <img src={formData.logoUrl} className="w-full h-full object-cover" alt="Logo" />
                            ) : (
                              <Upload className="w-5 h-5 text-white/20" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-white mb-1 uppercase tracking-wider">{t('modals.onboarding.businessLogo')}</p>
                          <p className="text-[10px] text-white/30">PNG, JPG o SVG (máx 2MB)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <header>
                    <h2 className="text-3xl font-bold text-white mb-2">{t('modals.onboarding.scheduleTitle')}</h2>
                    <p className="text-white/40">{t('modals.onboarding.scheduleDesc')}</p>
                  </header>

                  <div className="space-y-8 py-4">
                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-white/30 uppercase tracking-widest">{t('modals.onboarding.workingDays')}</label>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6, 7].map(id => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              selectedDays: prev.selectedDays.includes(id)
                                ? prev.selectedDays.filter(d => d !== id)
                                : [...prev.selectedDays, id]
                            }))}
                            className={cn(
                              "w-12 h-12 rounded-xl border-2 font-bold transition-all",
                              formData.selectedDays.includes(id)
                                ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                : "bg-white/5 border-white/5 text-white/30 hover:border-white/10"
                            )}
                          >
                            {getDayLabel(id)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-white/30 uppercase tracking-widest">{t('modals.onboarding.startTime')}</label>
                        <select
                          value={formData.startTime}
                          onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                          className="w-full bg-[#0f1629] border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none font-medium"
                        >
                          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-white/30 uppercase tracking-widest">{t('modals.onboarding.endTime')}</label>
                        <select
                          value={formData.endTime}
                          onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                          className="w-full bg-[#0f1629] border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none font-medium"
                        >
                          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex items-start gap-4">
                      <Info className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                      <p className="text-sm text-blue-400/80 leading-relaxed font-medium">
                        {t('modals.onboarding.aiActiveNotice')
                          .replace('{days}', formData.selectedDays.map(id => getDayLabel(id)).join(', '))
                          .replace('{start}', formData.startTime)
                          .replace('{end}', formData.endTime)
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <header>
                    <h2 className="text-3xl font-bold text-white mb-2">{t('modals.onboarding.personalityTitle')}</h2>
                    <p className="text-white/40">{t('modals.onboarding.personalityDesc')}</p>
                  </header>

                  <div className="space-y-8 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'amigable', title: t('modals.onboarding.personalityFriendly'), icon: Phone, example: t('modals.onboarding.personalityFriendlyExample') },
                        { id: 'profesional', title: t('modals.onboarding.personalityProfessional'), icon: Briefcase, example: t('modals.onboarding.personalityProfessionalExample') }
                      ].map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, personality: p.id }))}
                          className={cn(
                            "flex flex-col items-start p-5 rounded-2xl border-2 text-left transition-all",
                            formData.personality === p.id
                              ? "bg-blue-500/20 border-blue-500"
                              : "bg-white/5 border-white/5 hover:border-white/10"
                          )}
                        >
                          <p.icon className={cn("w-6 h-6 mb-3", formData.personality === p.id ? "text-blue-400" : "text-white/30")} />
                          <p className="text-sm font-bold text-white mb-1">{p.title}</p>
                          <p className="text-[10px] text-white/40 font-mono italic leading-none">{p.example}</p>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-white/30 uppercase tracking-widest">{t('modals.onboarding.businessDescriptionLabel')}</label>
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-white/80 focus:outline-none focus:border-blue-500/50 transition-all font-medium min-h-[120px]"
                        placeholder={t('modals.onboarding.businessDescriptionPlaceholder')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (() => {
                const waLink = `https://wa.me/34651398878?text=Hola,%20soy%20${encodeURIComponent(formData.businessName)}`

                return (
                  <div className="space-y-6">
                    <header>
                      <h2 className="text-3xl font-bold text-white mb-2">{t('modals.onboarding.integrationsTitle')}</h2>
                      <p className="text-white/40">{t('modals.onboarding.integrationsDesc')}</p>
                    </header>

                    <div className="space-y-6 py-4">
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                              <Phone className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">WhatsApp Business</h3>
                              <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">{t('modals.onboarding.waOptionTitle')}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {/* Opción A */}
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-white">{t('modals.onboarding.waOptionA')}</h4>
                            </div>
                            <p className="text-[11px] text-white/50 leading-relaxed">
                              {t('modals.onboarding.waOptionADesc')}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="text"
                                readOnly
                                value={waLink}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-[12px] text-white/70 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(waLink)
                                  toast.success(t('modals.onboarding.waCopiedToast'))
                                }}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[12px] rounded-xl transition-all whitespace-nowrap"
                              >
                                {t('modals.onboarding.waCopyBtn')}
                              </button>
                            </div>
                          </div>

                          {/* Opción B */}
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                            <h4 className="text-xs font-bold text-white">{t('modals.onboarding.waOptionB')}</h4>
                            <p className="text-[11px] text-white/50 leading-relaxed">
                              {t('modals.onboarding.waOptionBDesc')}
                            </p>
                          </div>

                          {/* Opción C */}
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-white">{t('modals.onboarding.waOptionC')}</h4>
                              <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                                {language === 'es' ? 'Recomendado' : 'Recommended'}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/50 leading-relaxed">
                              {t('modals.onboarding.waOptionCDesc')}
                            </p>
                          </div>
                        </div>

                        <p className="text-[10px] text-emerald-400/60 font-medium text-center italic uppercase tracking-wider">
                          {t('modals.onboarding.waIntegrationHelp')}
                        </p>

                        <p className="text-[11px] text-white/30 text-center pt-2">
                          {t('modals.onboarding.waSupportHelp').replace('{phone}', '+34 604 989 742')}
                        </p>
                      </div>

                      <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">{t('modals.onboarding.emailTitle')}</h3>
                            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">{t('modals.onboarding.emailDesc')}</p>
                          </div>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">
                          {t('modals.onboarding.emailExplanation')}
                        </p>

                        <div className="bg-blue-400/5 border border-blue-400/10 rounded-xl p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">{t('modals.onboarding.emailGuideTitle')}</span>
                          </div>
                          <div className="text-[11px] text-white/50 leading-relaxed whitespace-pre-line">
                            {t('modals.onboarding.emailGuideDesc')}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-white/30 uppercase tracking-widest">{t('modals.onboarding.emailUsernameLabel')}</label>
                          <div className="relative flex items-center">
                            <input
                              value={formData.businessEmail.split('@')[0]}
                              onChange={e => {
                                const value = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '');
                                setFormData(prev => ({ ...prev, businessEmail: `${value}@sffalcon.com` }))
                              }}
                              className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-4 pr-32 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                              placeholder={t('modals.onboarding.emailUsernamePlaceholder')}
                            />
                            <div className="absolute right-4 text-white/30 font-bold pointer-events-none">
                              @sffalcon.com
                            </div>
                          </div>
                          <p className="text-[10px] text-white/20 italic">
                            {language === 'es' ? 'Ej: ' : 'E.g., '}{formData.businessEmail.split('@')[0] || 'yourbusiness'}@sffalcon.com
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {step === 7 && (
                <div className="space-y-6">
                  <header>
                    <h2 className="text-3xl font-bold text-white mb-2">{t('modals.onboarding.consentTitle')}</h2>
                    <p className="text-white/40">{t('modals.onboarding.consentDesc')}</p>
                  </header>

                  <div className="py-6 space-y-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
                        <Info className="w-6 h-6 text-blue-400" />
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">
                        {t('modals.onboarding.consentExplanation')}
                      </p>
                    </div>

                    <label className="flex items-start gap-4 p-4 rounded-2xl border-2 border-white/5 bg-white/[0.02] cursor-pointer hover:border-blue-500/30 transition-all group">
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={formData.consentAccepted}
                          onChange={e => setFormData(prev => ({ ...prev, consentAccepted: e.target.checked }))}
                          className="w-6 h-6 rounded-lg border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                      <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                        {t('modals.onboarding.consentCheckbox')}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {step === 8 && (
                <div className="space-y-6">
                  <div className="flex justify-center py-4">
                    {PLAN_OPTIONS.map((p: any) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, selectedPlan: p.id }))}
                        className={cn(
                          "relative flex flex-col items-start p-6 rounded-2xl border-2 text-left transition-all group max-w-md w-full",
                          formData.selectedPlan === p.id
                            ? "bg-blue-600/10 border-blue-500"
                            : "bg-white/5 border-white/5 hover:border-white/10"
                        )}
                      >
                        {p.badge && (
                          <span className={cn(
                            "absolute -top-3 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            p.highlight ? "bg-blue-600 text-white" : "bg-white/10 text-white/60"
                          )}>
                            {p.badge}
                          </span>
                        )}
                        <div className="flex items-center justify-between w-full mb-4">
                          <h3 className="text-xl font-bold text-white">{p.name}</h3>
                          <div className="text-right">
                            <span className="text-2xl font-black text-blue-400">{p.price}</span>
                            <span className="text-xs font-normal text-white/40 ml-1">{t('modals.subscription.perMonth')}</span>
                            <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-wider">{p.subtitle}</p>
                          </div>
                        </div>
                        <ul className="space-y-3 mb-6 w-full">
                          {p.features.map((f: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-white/60">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <div className={cn(
                          "mt-auto w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-center transition-all",
                          formData.selectedPlan === p.id ? "bg-blue-600 text-white" : "bg-white/5 text-white/40 group-hover:bg-white/10"
                        )}>
                          {formData.selectedPlan === p.id ? t('modals.onboarding.planActive') : t('modals.onboarding.planSelect')}
                        </div>
                      </button>
                    ))}
                  </div>

                  <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
                    {t('modals.onboarding.trialNotice')}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-10 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1 || loading}
            className={cn(
              "w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-bold text-xs md:text-sm uppercase tracking-widest transition-all",
              step === 1 || loading ? "opacity-0 pointer-events-none" : "border-white/10 text-white/40 hover:bg-white/5 active:scale-95"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            {t('modals.onboarding.prevButton')}
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs md:text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-blue-600/20"
            >
              {t('modals.onboarding.nextButton')}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={loading || !isStepValid()}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 md:px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] active:scale-[0.98] text-white font-bold text-sm md:text-base uppercase tracking-widest transition-all shadow-2xl shadow-blue-600/30"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="hidden md:inline">{t('modals.onboarding.completeButton')}</span>
                  <span className="md:hidden">{t('modals.onboarding.completeButtonShort')}</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>

      {/* Internal Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
