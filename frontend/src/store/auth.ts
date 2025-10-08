/**
 * Authentication Store - Zustand
 * Manages user authentication state
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { message } from 'antd'

interface User {
  id: string
  email: string
  fullName: string
  role: string
  organizationId: string
  organization?: {
    name: string
    slug: string
  }
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  getCurrentUser: () => Promise<void>
  setUser: (user: User) => void
  clearAuth: () => void
}

interface RegisterData {
  email: string
  password: string
  fullName: string
  organizationName: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          
          const { data } = await api.post('/auth/login', {
            email,
            password,
          })

          // Save tokens
          localStorage.setItem('access_token', data.accessToken)
          localStorage.setItem('refresh_token', data.refreshToken)

          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          message.success('Login successful!')
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true })
          
          const response = await api.post('/auth/register', data)

          // Save tokens
          localStorage.setItem('access_token', response.data.accessToken)
          localStorage.setItem('refresh_token', response.data.refreshToken)

          set({
            user: response.data.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          message.success('Registration successful!')
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          // Call logout endpoint to blacklist token
          await api.post('/auth/logout')
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API error:', error)
        } finally {
          // Clear local storage
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')

          // Clear state
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          })

          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
      },

      getCurrentUser: async () => {
        try {
          const { data } = await api.get('/auth/me')
          
          set({
            user: data,
            isAuthenticated: true,
          })
        } catch (error) {
          // Token invalid, clear auth
          get().clearAuth()
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      clearAuth: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

