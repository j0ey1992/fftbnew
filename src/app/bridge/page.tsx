'use client'

import { useEffect } from 'react'

export default function BridgePage() {
  useEffect(() => {
    window.location.href = 'https://fftb-frontend.vercel.app/'
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0f1f] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white/60">Redirecting to FFTB Bridge...</p>
      </div>
    </div>
  )
}
