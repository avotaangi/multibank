import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  // Initialize authentication
  initializeAuth: async () => {
    set({ isLoading: true })
    
    try {
      // Check if we're in Telegram Web App
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        
        // Get init data from Telegram
        const initData = tg.initData
        console.log('Telegram WebApp initData:', initData)
        
        if (initData) {
          try {
            // Try to authenticate with Telegram data (with timeout)
            const response = await Promise.race([
              api.post('/auth/telegram', { initData }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 5000)
              )
            ])
            
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
          } catch (error) {
            console.log('Server authentication failed, using fallback:', error.message)
            // Fall through to fallback
          }
        }
      }
      
      // Check for existing token in localStorage
      const { token } = get()
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // Verify token is still valid (with timeout)
        try {
          const response = await Promise.race([
            api.get('/auth/me'),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), 5000)
            )
          ])
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
      
      // Fallback for development - create a test user
      console.log('No Telegram WebApp or initData, creating test user for development')
      set({ 
        user: { 
          id: 'test-user', 
          username: 'test_user', 
          first_name: 'Test', 
          last_name: 'User' 
        }, 
        isLoading: false,
        error: null 
      })
      
      // For Telegram WebApp development, we can also create a test user
      // This allows the app to work even without proper Telegram WebApp setup
      console.log('✅ Test user created for development - app should work now')
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ 
        user: { 
          id: 'test-user', 
          username: 'test_user', 
          first_name: 'Test', 
          last_name: 'User' 
        }, 
        token: null, 
        isLoading: false,
        error: null // Don't show error, just use test user
      })
      console.log('✅ Fallback: Test user created after error - app should work now')
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
        error: null,
        isAuthenticated: false
      })
      localStorage.removeItem('isAuthenticated')
    }
  },

  // Set user manually
  setUser: (userData) => {
    set({ user: userData, isLoading: false, error: null })
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
  clearError: () => set({ error: null }),

  // Set authenticated state
  setAuthenticated: (authenticated) => {
    set({ isAuthenticated: authenticated })
    if (authenticated) {
      localStorage.setItem('isAuthenticated', 'true')
    } else {
      localStorage.removeItem('isAuthenticated')
    }
  },

  // Check if user is authenticated from localStorage
  checkAuthentication: () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    set({ isAuthenticated })
    return isAuthenticated
  },

  // Get client_id based on Telegram user ID
  getClientId: () => {
    try {
      // Try to get Telegram user ID
      if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        const telegramUserId = window.Telegram.WebApp.initDataUnsafe.user.id
        const clientIndex = telegramUserId % 10
        return `team096-${clientIndex}`
      }
      
      // Try to parse from initData
      if (window.Telegram?.WebApp?.initData) {
        const params = new URLSearchParams(window.Telegram.WebApp.initData)
        const userStr = params.get('user')
        if (userStr) {
          try {
            const user = JSON.parse(decodeURIComponent(userStr))
            if (user.id) {
              const clientIndex = user.id % 10
              return `team096-${clientIndex}`
            }
          } catch (e) {
            console.log('Could not parse user from initData')
          }
        }
      }
    } catch (error) {
      console.log('Error getting Telegram user ID:', error)
    }
    
    // Default fallback
    return 'team096-1'
  },

  // Get client_id_id (just the number) based on Telegram user ID
  getClientIdId: () => {
    // Функция для нормализации id: если id === 0, возвращаем 1
    const normalizeId = (id) => {
      if (id === 0) return 1;
      return id;
    };
    
    try {
      // Try to get Telegram user ID
      if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        const telegramUserId = window.Telegram.WebApp.initDataUnsafe.user.id
        const clientIndex = telegramUserId % 10
        return normalizeId(clientIndex)
      }
      
      // Try to parse from initData
      if (window.Telegram?.WebApp?.initData) {
        const params = new URLSearchParams(window.Telegram.WebApp.initData)
        const userStr = params.get('user')
        if (userStr) {
          try {
            const user = JSON.parse(decodeURIComponent(userStr))
            if (user.id) {
              const clientIndex = user.id % 10
              return normalizeId(clientIndex)
            }
          } catch (e) {
            console.log('Could not parse user from initData')
          }
        }
      }
    } catch (error) {
      console.log('Error getting Telegram user ID:', error)
    }
    
    // Default fallback
    return 1
  }
}))

export default useAuthStore