'use client'

import { useState, useEffect } from 'react'
import { isCurrentUserAdmin } from '@/lib/auth-service'
import { useAppKitAccount } from '@reown/appkit/react'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { isConnected } = useAppKitAccount()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isConnected) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const adminStatus = await isCurrentUserAdmin()
        setIsAdmin(adminStatus)
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [isConnected])

  return { isAdmin, isLoading }
}