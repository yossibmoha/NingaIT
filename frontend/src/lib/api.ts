/**
 * API Client - Axios configuration with auth interceptors
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // Refresh token
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        })

        // Save new access token
        localStorage.setItem('access_token', data.accessToken)

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        }
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
    
    // Don't show message for 401 on login page
    if (error.response?.status !== 401 || typeof window === 'undefined' || !window.location.pathname.includes('/login')) {
      message.error(errorMessage)
    }

    return Promise.reject(error)
  }
)

export default api

