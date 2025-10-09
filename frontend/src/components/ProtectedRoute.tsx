'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spin } from 'antd'
import { useAuthStore } from '@/store/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, accessToken, user } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Check if we have a token in store (from persistence)
      const storeToken = accessToken
      const localToken = localStorage.getItem('access_token')
      
      if (!storeToken && !localToken) {
        router.push('/login')
        setIsChecking(false)
        return
      }

      // If we have token and user data from persistence, we're good
      if (isAuthenticated && user) {
        setIsChecking(false)
        return
      }

      // Otherwise redirect to login
      if (!isAuthenticated) {
        router.push('/login')
      }
      
      setIsChecking(false)
    }

    checkAuth()
  }, [isAuthenticated, accessToken, user, router])

  if (isChecking || !isAuthenticated) {
    return (
      <div className="page-loading">
        <Spin size="large" />
      </div>
    )
  }

  return <>{children}</>
}

