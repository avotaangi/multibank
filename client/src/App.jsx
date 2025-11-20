import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthStore from './stores/authStore'
import { useEffect, useState } from 'react'
import { getTelegramWebApp } from './utils/telegram'
import { useTelegramButtons } from './hooks/useTelegramButtons'
import { useScrollToTop } from './hooks/useScrollToTop'

// Components
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import PasswordAuth from './components/PasswordAuth'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MyCardsPage from './pages/MyCardsPage'
import CardAnalyticsPage from './pages/CardAnalyticsPage'
import AccountsPage from './pages/AccountsPage'
import TransactionsPage from './pages/TransactionsPage'
import TransferPage from './pages/TransferPage'
import TransferByAccountPage from './pages/TransferByAccountPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import PaymentsPage from './pages/PaymentsPage'
import HistoryPage from './pages/HistoryPage'
import ChatsPage from './pages/ChatsPage'
import MainPage from './pages/MainPage'
import AnalyticsPage from './pages/AnalyticsPage'
import BudgetPlanningPage from './pages/BudgetPlanningPage'
import DepositsPage from './pages/DepositsPage'
import CreditsPage from './pages/CreditsPage'
import RewardsPage from './pages/RewardsPage'
import LeadsPage from './pages/LeadsPage'
import SecurityPage from './pages/SecurityPage'
import InsuranceDetailsPage from './pages/InsuranceDetailsPage'
import InsuranceCascoPage from './pages/InsuranceCascoPage'
import AutopayDetailsPage from './pages/AutopayDetailsPage'
import VBankPlusPage from './pages/VBankPlusPage'
import VBankPlusDetailsPage from './pages/VBankPlusDetailsPage'
import PasswordPage from './pages/PasswordPage'
import YourBankPage from './pages/YourBankPage'

// Component to scroll to top on route change
function ScrollToTop() {
  useScrollToTop()
  return null
}

function App() {
  const { user, isLoading, initializeAuth, setUser, isAuthenticated, setAuthenticated } = useAuthStore()
  
  // Инициализируем Telegram кнопки
  useTelegramButtons()

  useEffect(() => {
    // Always reset authentication state on page load/refresh
    setAuthenticated(false)
    
    // Simple Telegram WebApp initialization
    const webApp = getTelegramWebApp()
    if (webApp) {
      console.log('React: Telegram WebApp found, initializing...')
      webApp.ready()
      webApp.enableClosingConfirmation()
      webApp.expand()
    } else {
      console.log('React: Telegram WebApp not found')
    }
    
    // Initialize auth with timeout
    const authTimeout = setTimeout(() => {
      setUser({ id: 1, name: 'Test User' })
    }, 2000)
    
    initializeAuth().finally(() => {
      clearTimeout(authTimeout)
    })
  }, [initializeAuth, setAuthenticated])

  // Проверяем, нужно ли показывать экран входа с паролем
  const shouldShowPasswordAuth = !isAuthenticated && !isLoading
  const location = useLocation()
  const isPasswordPage = location.pathname === '/password'
  const isYourBankPage = location.pathname === '/your-bank'
  const isVBankPlusPage = location.pathname.startsWith('/vbank-plus')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  // Показываем страницу "Ваш банк" только если не аутентифицирован и не на других страницах
  if (shouldShowPasswordAuth && !isPasswordPage && !isVBankPlusPage) {
    return <YourBankPage />
  }

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
        />
        <Route path="/vbank-plus" element={<VBankPlusPage />} />
        <Route path="/vbank-plus/details" element={<VBankPlusDetailsPage />} />
        <Route path="/password" element={<PasswordPage />} />
        <Route path="/your-bank" element={<YourBankPage />} />
        
        {/* Protected routes - temporarily disabled for testing */}
            <Route 
              path="/" 
              element={<Layout />}
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="my-cards" element={<MyCardsPage />} />
              <Route path="card-analytics/:cardId" element={<CardAnalyticsPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="transfer" element={<TransferPage />} />
              <Route path="transfer-by-account" element={<TransferByAccountPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="chats" element={<ChatsPage />} />
              <Route path="main" element={<MainPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="budget-planning" element={<BudgetPlanningPage />} />
              <Route path="deposits" element={<DepositsPage />} />
              <Route path="credits" element={<CreditsPage />} />
              <Route path="rewards" element={<RewardsPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="insurance-details/:policyId" element={<InsuranceDetailsPage />} />
              <Route path="insurance-casco" element={<InsuranceCascoPage />} />
              <Route path="autopay-details/:autopayId" element={<AutopayDetailsPage />} />
            </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
