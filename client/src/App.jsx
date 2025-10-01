import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthStore from './stores/authStore'
import { useEffect } from 'react'
import { getTelegramWebApp } from './utils/telegram'

// Components
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MyCardsPage from './pages/MyCardsPage'
import CardAnalyticsPage from './pages/CardAnalyticsPage'
import AccountsPage from './pages/AccountsPage'
import TransactionsPage from './pages/TransactionsPage'
import TransferPage from './pages/TransferPage'
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

// Component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  const { user, isLoading, initializeAuth, setUser } = useAuthStore()

  useEffect(() => {
    // Ultra aggressive Telegram WebApp initialization
    const initTelegramWebApp = () => {
      const webApp = getTelegramWebApp()
      if (webApp) {
        console.log('React: Telegram WebApp found, initializing...')
        webApp.ready()
        webApp.enableClosingConfirmation()
        
        // Immediate multiple expansions with requestFullscreen
        webApp.expand()
        webApp.expand()
        webApp.expand()
        webApp.expand()
        webApp.expand()
        
        // Try requestFullscreen immediately
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(e => console.log('React: requestFullscreen failed:', e))
        }
        
        // Multiple expansion attempts with various delays and requestFullscreen
        setTimeout(() => {
          console.log('React: Force expanding...')
          webApp.expand()
          webApp.expand()
          webApp.expand()
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.log('React: requestFullscreen failed:', e))
          }
        }, 10)
        
        setTimeout(() => {
          console.log('React: Force expanding again...')
          webApp.expand()
          webApp.expand()
          webApp.expand()
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.log('React: requestFullscreen failed:', e))
          }
        }, 50)
        
        setTimeout(() => {
          console.log('React: Force expanding again...')
          webApp.expand()
          webApp.expand()
          webApp.expand()
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.log('React: requestFullscreen failed:', e))
          }
        }, 100)
        
        setTimeout(() => {
          console.log('React: Force expanding again...')
          webApp.expand()
          webApp.expand()
          webApp.expand()
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.log('React: requestFullscreen failed:', e))
          }
        }, 200)
        
        setTimeout(() => {
          console.log('React: Force expanding again...')
          webApp.expand()
          webApp.expand()
          webApp.expand()
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.log('React: requestFullscreen failed:', e))
          }
        }, 500)
        
        setTimeout(() => {
          console.log('React: Final expansion attempt...')
          webApp.expand()
          webApp.expand()
          webApp.expand()
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.log('React: requestFullscreen failed:', e))
          }
        }, 1000)
        
        setTimeout(() => {
          console.log('React: Ultra final expansion attempt...')
          webApp.expand()
          webApp.expand()
          webApp.expand()
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.log('React: requestFullscreen failed:', e))
          }
        }, 2000)
        
        return true
      }
      return false
    }
    
    // Try immediately
    if (!initTelegramWebApp()) {
      // Try again after delay
      setTimeout(() => {
        if (!initTelegramWebApp()) {
          console.log('React: Telegram WebApp not found')
        }
      }, 100)
    }
    
    // Initialize auth with timeout
    const authTimeout = setTimeout(() => {
      setUser({ id: 1, name: 'Test User' })
    }, 2000)
    
    initializeAuth().finally(() => {
      clearTimeout(authTimeout)
    })
  }, [initializeAuth])

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

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
        />
        
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
            </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
