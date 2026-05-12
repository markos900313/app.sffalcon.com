"use client"

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const ParticlesBackground = dynamic(() => import('./ParticlesBackground'), { ssr: false })

export default function ParticlesLoader() {
  const [isDesktop, setIsDesktop] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!mounted || !isDesktop) return null

  return <ParticlesBackground />
}
