/**
 * Authentication Store - Zustand
 * Manages user authentication state with REAL backend API
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { message } from 'antd'
import api from '@/lib/api'

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
          
          // Call real backend API
          const { data } = await api.post('/auth/login', {
            email,
            password,
          })

          // Save tokens to localStorage
          localStorage.setItem('access_token', data.accessToken)
          localStorage.setItem('refresh_token', data.refreshToken)

          // Update state
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
          const errorMessage = error.response?.data?.message || error.message || 'Login failed'
          message.error(errorMessage)
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true })
          
          // Call real backend API
          const { data: responseData } = await api.post('/auth/register', {
            email: data.email,
            password: data.password,
            fullName: data.fullName,
            organizationName: data.organizationName,
          })

          // Save tokens to localStorage
          localStorage.setItem('access_token', responseData.accessToken)
          localStorage.setItem('refresh_token', responseData.refreshToken)

          // Update state
          set({
            user: responseData.user,
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          message.success('Registration successful!')
        } catch (error: any) {
          set({ isLoading: false })
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
          message.error(errorMessage)
          throw error
        }
      },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      
      // Call backend logout (blacklists access token and revokes refresh token)
      await api.post('/auth/logout', {
        refreshToken,
      })
    } catch (error) {
      console.error('Logout API error:', error)
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

      // Clear state
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      })

      message.success('Logged out successfully')

      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  },

      getCurrentUser: async () => {
        try {
          const state = get()
          const token = localStorage.getItem('access_token')
          
          if (!token) {
            get().clearAuth()
            return
          }

          // Get user data from backend
          const { data } = await api.get('/auth/me')
          
          set({
            user: data,
            isAuthenticated: true,
          })
        } catch (error) {
          console.error('Get current user error:', error)
          get().clearAuth()
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      clearAuth: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        
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
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
