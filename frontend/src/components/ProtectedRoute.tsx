'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Spin } from 'antd'
import { useAuthStore } from '@/store/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, getCurrentUser } = useAuthStore()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        router.push('/login')
        return
      }

      if (!isAuthenticated) {
        try {
          await getCurrentUser()
        } catch (error) {
          router.push('/login')
        }
      }
    }

    checkAuth()
  }, [isAuthenticated, getCurrentUser, router])

  if (!isAuthenticated) {
    return (
      <div className="page-loading">
        <Spin size="large" />
      </div>
    )
  }

  return <>{children}</>
}

