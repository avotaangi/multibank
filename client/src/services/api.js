import axios from 'axios'

// Create axios instance
// Используем FastAPI вместо Node.js бэкенда
const apiBase = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || 'http://localhost:8000'
// Убеждаемся, что baseURL заканчивается на /api для всех запросов
const baseURL = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`
const api = axios.create({
  baseURL: baseURL,
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
  getAccounts: (params = {}) => api.get('/accounts', { params }),
  getBankingAccounts: (params = {}) => api.get('/accounts/banking', { params }),
  getAccount: (id, params = {}) => api.get(`/accounts/${id}`, { params }),
  createAccount: (data, params = {}) => api.post('/accounts', data, { params }),
  updateAccount: (id, data) => api.put(`/accounts/${id}`, data),
  setDefaultAccount: (id) => api.put(`/accounts/${id}/default`),
  getBalance: (id, params = {}) => api.get(`/accounts/${id}/balance`, { params }),
}

export const transactionAPI = {
  getTransactions: (params) => api.get('/transactions', { params }),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  createTransfer: (data) => api.post('/transactions/transfer', data),
  getSummary: (params) => api.get('/transactions/stats/summary', { params }),
  getAccountTransactions: (accountId, params = {}) => api.get(`/accounts/${accountId}/transactions`, { params }),
}

// Consents API - для всех типов согласий
export const consentsAPI = {
  // Account Consents
  createAccountConsent: (data, params = {}) => api.post('/consents/accounts', data, { params }),
  getAccountConsent: (consentId, params = {}) => api.get(`/consents/accounts/${consentId}`, { params }),
  revokeAccountConsent: (consentId, params = {}) => api.delete(`/consents/accounts/${consentId}`, { params }),
  
  // Payment Consents
  createPaymentConsent: (data, params = {}) => api.post('/consents/payments', data, { params }),
  getPaymentConsent: (consentId, params = {}) => api.get(`/consents/payments/${consentId}`, { params }),
  revokePaymentConsent: (consentId, params = {}) => api.delete(`/consents/payments/${consentId}`, { params }),
  
  // Product Agreement Consents
  createProductAgreementConsent: (data, params = {}) => api.post('/consents/product-agreements', data, { params }),
  getProductAgreementConsent: (consentId, params = {}) => api.get(`/consents/product-agreements/${consentId}`, { params }),
  revokeProductAgreementConsent: (consentId, params = {}) => api.delete(`/consents/product-agreements/${consentId}`, { params }),
}

export const paymentAPI = {
  createPayment: (data, params = {}, headers = {}) => {
    const config = {
      params,
      headers: {
        ...headers
      }
    }
    return api.post('/payments', data, config)
  },
  getPayment: (paymentId, params = {}, headers = {}) => {
    const config = {
      params,
      headers: {
        ...headers
      }
    }
    return api.get(`/payments/${paymentId}`, config)
  },
}

export const telegramAPI = {
  getWebAppConfig: () => api.get('/telegram/webapp-config'),
  verifyWebAppData: (initData) => api.post('/telegram/verify-webapp', { initData }),
}

export const rewardsAPI = {
  getBalance: (externalAccountID) => api.get(`/rewards/balance/${externalAccountID}`),
  redeem: (externalAccountID, data) => api.post(`/rewards/redeem/${externalAccountID}`, data),
}

// Products API - продукты и договоры
export const productsAPI = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getProduct: (productId, params = {}) => api.get(`/products/${productId}`, { params }),
  
  // Agreements
  getAgreements: (params = {}) => api.get('/products/agreements', { params }),
  createAgreement: (data, params = {}) => api.post('/products/agreements', { data, params }),
  getAgreement: (agreementId, params = {}) => api.get(`/products/agreements/${agreementId}`, { params }),
  closeAgreement: (agreementId, data = {}, params = {}) => api.delete(`/products/agreements/${agreementId}`, { data, params }),
  
  // Bank Products API - продукты из банков с балансами
  getBankProducts: (params = {}) => api.get('/products', { params }),
}

// Banking API - токены и информация о банках
export const bankingAPI = {
  getBanks: () => api.get('/auth/banks'),
  getBankToken: (bank, params = {}) => api.post('/auth/bank-token', null, { params: { bank, ...params } }),
}

// Leads API - операции с лидами
export const leadsAPI = {
  getLeadsStatus: (params = {}, headers = {}) => {
    const config = {
      params: {
        ...params,
        // Если leadId - массив, axios автоматически сериализует его правильно
      },
      headers: {
        ...headers
      },
      paramsSerializer: {
        indexes: null // Для правильной сериализации массива leadId как leadId=1&leadId=2
      }
    };
    return api.get('/leads', config);
  },
  addLeads: (data, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.post('/leads', data, config);
  },
  checkLeads: (data, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.post('/leads/check', data, config);
  },
}

// Credit Products API - управление продуктами кредитной организации
export const creditProductsAPI = {
  // Products
  getProducts: (params = {}, headers = {}) => {
    const config = {
      params,
      headers: {
        ...headers
      }
    };
    return api.get('/credit-products/products', config);
  },
  getProduct: (productId, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.get(`/credit-products/products/${productId}`, config);
  },
  
  // Customer Leads
  createCustomerLead: (data, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.post('/credit-products/customer-leads', data, config);
  },
  getCustomerLead: (customerLeadId, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.get(`/credit-products/customer-leads/${customerLeadId}`, config);
  },
  deleteCustomerLead: (customerLeadId, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.delete(`/credit-products/customer-leads/${customerLeadId}`, config);
  },
  
  // Product Offers
  createProductOffer: (data, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.post('/credit-products/product-offers', data, config);
  },
  getProductOffers: (headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.get('/credit-products/product-offers', config);
  },
  getProductOffer: (offerId, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.get(`/credit-products/product-offers/${offerId}`, config);
  },
  deleteProductOffer: (offerId, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.delete(`/credit-products/product-offers/${offerId}`, config);
  },
  
  // Product Offer Consents
  createProductOfferConsent: (data, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.post('/credit-products/product-offer-consents', data, config);
  },
  getProductOfferConsent: (consentId, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.get(`/credit-products/product-offer-consents/${consentId}`, config);
  },
  deleteProductOfferConsent: (consentId, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.delete(`/credit-products/product-offer-consents/${consentId}`, config);
  },
  
  // Product Applications
  createProductApplication: (data, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.post('/credit-products/product-application', data, config);
  },
  getProductApplications: (headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.get('/credit-products/product-application', config);
  },
  getProductApplication: (productApplicationId, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.get(`/credit-products/product-application/${productApplicationId}`, config);
  },
  deleteProductApplication: (productApplicationId, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.delete(`/credit-products/product-application/${productApplicationId}`, config);
  },
}

// Cash Loan Applications API (Заявки на кредит наличными)
export const cashLoanApplicationsAPI = {
  // Создать заявку
  createApplication: (data, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.post('/cash-loan-applications', data, config);
  },
  
  // Получить статус заявки
  getApplicationStatus: (applicationId, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.get(`/cash-loan-applications/${applicationId}`, config);
  },
  
  // Принять предложение
  confirmApplication: (applicationId, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.patch(`/cash-loan-applications/${applicationId}/confirm`, {}, config);
  },
}

// Card Management API (Управление картой ФЛ)
export const cardManagementAPI = {
  // Получить список карт для банка
  getCards: (bank, clientId, headers = {}) => {
    // Формируем client_id в формате teamXXX-{clientId}
    const teamId = import.meta.env.VITE_CLIENT_ID || 'team096';
    const fullClientId = `${teamId}-${clientId}`;
    
    const config = {
      headers: {
        ...headers
      },
      params: {
        bank: bank,
        client_id: fullClientId
      }
    };
    return api.get(`/cards`, config);
  },
  
  // Получить детали карты с полным номером
  getCardDetails: (bank, cardId, clientId, showFullNumber = true, headers = {}) => {
    // Формируем client_id в формате teamXXX-{clientId}
    const teamId = import.meta.env.VITE_CLIENT_ID || 'team096';
    const fullClientId = `${teamId}-${clientId}`;
    
    const config = {
      headers: {
        ...headers
      },
      params: {
        bank: bank,
        client_id: fullClientId,
        show_full_number: showFullNumber
      }
    };
    return api.get(`/cards/${cardId}`, config);
  },
  
  // Получить реквизиты карты (legacy, для совместимости)
  getCredentials: (bank, headers = {}) => {
    const config = {
      headers: {
        ...headers
      },
      params: {
        bank: bank
      }
    };
    // Используем новый эндпоинт для получения карт
    return api.get(`/cards`, config);
  },
  
  // Получить CVV
  getCvv: (publicId, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.get(`/card-management/cvv/${publicId}`, config);
  },
  
  // Токенизация карты
  tokenizeCard: (publicId, data, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.post(`/card-management/token/${publicId}`, data, config);
  },
  
  // Получить токены
  getTokens: (publicId, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.get(`/card-management/tokens/${publicId}`, config);
  },
}

// Card Operations API (Управление картой ФЛ, операционные запросы)
export const cardOperationsAPI = {
  // Закрыть карту
  closeCard: (publicId, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.post(`/card-operations/close/${publicId}`, {}, config);
  },
  
  // Сменить PIN-код
  changePin: (publicId, data, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.post(`/card-operations/pin/${publicId}`, data, config);
  },
  
  // Изменить статус карты (блокировка/разблокировка)
  changeStatus: (publicId, data, headers = {}) => {
    const config = {
      headers: {
        ...headers
      }
    };
    return api.put(`/card-operations/status/${publicId}`, data, config);
  },
}

// Universal Payments API (Сервис платежа с базовым сценарием оплаты)
export const universalPaymentsAPI = {
  // Получить детальную информацию по платежу
  getPayment: (paymentId, headers = {}) => {
    const config = { headers };
    return api.get(`/universal-payments/payments/${paymentId}`, config);
  },
  
  // Получить список продуктов клиента
  getProducts: (params = {}, headers = {}) => {
    const config = {
      params,
      headers
    };
    return api.get('/universal-payments/products', config);
  },
  
  // Начать оплату (получить форму с полями)
  startPayment: (data, headers = {}) => {
    const config = { headers };
    return api.post('/universal-payments/payments/start', data, config);
  },
  
  // Создать платеж
  requestPayment: (data, headers = {}) => {
    const config = { headers };
    return api.post('/universal-payments/payments/request', data, config);
  },
  
  // Подтвердить платеж
  confirmPayment: (data, headers = {}) => {
    const config = { headers };
    return api.post('/universal-payments/payments/confirm', data, config);
  },
  
  // Получить чек по платежу
  getPaymentCheck: (paymentId, headers = {}) => {
    const config = { headers };
    return api.get(`/universal-payments/payments/${paymentId}/check`, config);
  },
}

// Mobile Payments API (Сервис платежа сотовому оператору)
export const mobilePaymentsAPI = {
  // Получить список продуктов клиента
  getProducts: (data, headers = {}) => {
    const config = { headers };
    return api.post('/mobile-payments/products', data, config);
  },
  
  // Получить информацию о номере телефона (определить оператора)
  getPhoneInfo: (data, headers = {}) => {
    const config = { headers };
    return api.post('/mobile-payments/phones/info', data, config);
  },
  
  // Начать платеж
  startPayment: (data, headers = {}) => {
    const config = { headers };
    return api.post('/mobile-payments/payments/start', data, config);
  },
  
  // Создать платеж
  requestPayment: (data, headers = {}) => {
    const config = { headers };
    return api.post('/mobile-payments/payments/request', data, config);
  },
  
  // Подтвердить платеж
  confirmPayment: (data, headers = {}) => {
    const config = { headers };
    return api.post('/mobile-payments/payments/confirm', data, config);
  },
  
  // Получить информацию о платеже
  getPayment: (paymentId, headers = {}) => {
    const config = { headers };
    return api.get(`/mobile-payments/payments/${paymentId}`, config);
  },
  
  // Получить чек по платежу
  getPaymentCheck: (paymentId, headers = {}) => {
    const config = { headers };
    return api.get(`/mobile-payments/payments/${paymentId}/check`, config);
  },
}

export default api
