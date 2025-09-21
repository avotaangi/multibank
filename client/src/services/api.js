import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Try to refresh token
      try {
        const refreshResponse = await api.post('/auth/refresh')
        const { token } = refreshResponse.data
        
        // Update authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        originalRequest.headers['Authorization'] = `Bearer ${token}`
        
        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert('Session expired. Please restart the app.')
        }
        
        // Clear stored auth data
        localStorage.removeItem('multibank-auth')
        window.location.href = '/login'
        
        return Promise.reject(refreshError)
      }
    }

    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.'
    }

    return Promise.reject(error)
  }
)

// API methods
export const authAPI = {
  // Telegram authentication
  loginWithTelegram: (initData) => api.post('/auth/telegram', { initData }),
  
  // PIN management
  setPin: (pin) => api.post('/auth/pin', { pin }),
  verifyPin: (pin) => api.post('/auth/pin/verify', { pin }),
  
  // User info
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
}

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  updatePreferences: (data) => api.put('/users/preferences', data),
  getStats: () => api.get('/users/stats'),
  deleteAccount: () => api.delete('/users/account'),
}

export const accountAPI = {
  getAccounts: () => api.get('/accounts'),
  getAccount: (id) => api.get(`/accounts/${id}`),
  createAccount: (data) => api.post('/accounts', data),
  updateAccount: (id, data) => api.put(`/accounts/${id}`, data),
  setDefaultAccount: (id) => api.put(`/accounts/${id}/default`),
  getBalance: (id) => api.get(`/accounts/${id}/balance`),
}

export const transactionAPI = {
  getTransactions: (params) => api.get('/transactions', { params }),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  createTransfer: (data) => api.post('/transactions/transfer', data),
  getSummary: (params) => api.get('/transactions/stats/summary', { params }),
}

export const telegramAPI = {
  getWebAppConfig: () => api.get('/telegram/webapp-config'),
  verifyWebAppData: (initData) => api.post('/telegram/verify-webapp', { initData }),
}

export default api
