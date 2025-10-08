'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Spin } from 'antd'
import { useAuthStore } from '@/store/auth'

export default function Home() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  return (
    <div className="page-loading">
      <Spin size="large" />
    </div>
  )
}

