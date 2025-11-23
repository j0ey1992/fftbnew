'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppKitAccount } from '@reown/appkit/react'
import { useAdmin } from '@/hooks/useAdmin'

export default function OrderNavigation() {
  const pathname = usePathname()
  const { isConnected, address } = useAppKitAccount()
  const { isAdmin } = useAdmin()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="bg-black/30 backdrop-blur-md border-b border-white/10 py-3 px-4 mb-8">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link 
            href="/"
            className="text-white font-medium hover:text-blue-400 transition-colors"
          >
            Home
          </Link>
          
          <Link 
            href="/orders/status"
            className={`${
              pathname?.includes('/orders/status') ? 'text-blue-400' : 'text-white'
            } font-medium hover:text-blue-400 transition-colors`}
          >
            Check Order Status
          </Link>
          
          {isAdmin && (
            <Link 
              href="/admin/orders"
              className={`${
                pathname?.includes('/admin/orders') ? 'text-blue-400' : 'text-white'
              } font-medium hover:text-blue-400 transition-colors`}
            >
              Admin Dashboard
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {isConnected && address ? (
            <div className="text-sm text-gray-400">
              Connected: <span className="text-blue-400 font-mono">{address.substring(0, 6)}...{address.substring(address.length - 4)}</span>
            </div>
          ) : (
            <appkit-button />
          )}
        </div>
      </div>
    </div>
  )
}