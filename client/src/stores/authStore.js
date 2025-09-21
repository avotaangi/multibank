import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  // Initialize authentication
  initializeAuth: async () => {
    set({ isLoading: true })
    
    try {
      // Check if we're in Telegram Web App
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        
        // Get init data from Telegram
        const initData = tg.initData
        
        if (initData) {
          // Try to authenticate with Telegram data
          const response = await api.post('/auth/telegram', {
            initData
          })
          
          const { token, user } = response.data
          
          // Set token for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({ 
            user, 
            token, 
            isLoading: false,
            error: null 
          })
          
          return
        }
      }
      
      // Check for existing token in localStorage
      const { token } = get()
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // Verify token is still valid
        try {
          const response = await api.get('/auth/me')
          set({ 
            user: response.data.user, 
            isLoading: false,
            error: null 
          })
          return
        } catch (error) {
          // Token is invalid, clear it
          set({ user: null, token: null })
        }
      }
      
      set({ isLoading: false })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ 
        user: null, 
        token: null, 
        isLoading: false,
        error: error.response?.data?.message || 'Authentication failed'
      })
    }
  },

  // Login with Telegram
  loginWithTelegram: async (initData) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.post('/auth/telegram', { initData })
      const { token, user } = response.data
      
      // Set token for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      set({ 
        user, 
        token, 
        isLoading: false,
        error: null 
      })
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      set({ 
        user: null, 
        token: null, 
        isLoading: false,
        error: errorMessage 
      })
      return { success: false, error: errorMessage }
    }
  },

  // Set PIN
  setPin: async (pin) => {
    set({ isLoading: true, error: null })
    
    try {
      await api.post('/auth/pin', { pin })
      set({ isLoading: false, error: null })
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to set PIN'
      set({ isLoading: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  // Verify PIN
  verifyPin: async (pin) => {
    set({ isLoading: true, error: null })
    
    try {
      await api.post('/auth/pin/verify', { pin })
      set({ isLoading: false, error: null })
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid PIN'
      set({ isLoading: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh')
      const { token } = response.data
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      set({ token })
      
      return { success: true }
    } catch (error) {
      console.error('Token refresh error:', error)
      return { success: false }
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear token and user data
      delete api.defaults.headers.common['Authorization']
      set({ 
        user: null, 
        token: null, 
        error: null 
      })
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.put('/users/profile', profileData)
      set({ 
        user: { ...get().user, ...response.data.user },
        isLoading: false,
        error: null 
      })
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile'
      set({ isLoading: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}))

export default useAuthStore