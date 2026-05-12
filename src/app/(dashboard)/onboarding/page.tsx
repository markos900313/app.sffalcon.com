'use client'

import React, { useEffect, useState } from 'react'
import OnboardingModal from '@/components/dashboard/onboarding/OnboardingModal'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile?.onboarding_completed) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    }

    checkOnboarding()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c]">
      <OnboardingModal 
        onComplete={async () => {
          router.push('/dashboard')
        }} 
        onCancel={async () => {
          await supabase.auth.signOut()
          router.push('/login')
        }}
      />
    </div>
  )
}
