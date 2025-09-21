import { useEffect, useState } from 'react'
import useAuthStore from '../stores/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import { AlertCircle, CheckCircle } from 'lucide-react'

const LoginPage = () => {
  const { loginWithTelegram, isLoading, error, clearError } = useAuthStore()
  const [isTelegramReady, setIsTelegramReady] = useState(false)

  useEffect(() => {
    // Check if we're in Telegram Web App
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // Wait for Telegram to be ready
      if (tg.isReady) {
        setIsTelegramReady(true)
        handleTelegramLogin()
      } else {
        tg.ready()
        setIsTelegramReady(true)
        handleTelegramLogin()
      }
    } else {
      // Not in Telegram, show manual login option
      setIsTelegramReady(true)
    }
  }, [])

  const handleTelegramLogin = async () => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      const initData = tg.initData
      
      if (initData) {
        clearError()
        await loginWithTelegram(initData)
      }
    }
  }

  const handleManualLogin = async () => {
    // For development/testing purposes
    const testInitData = 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%7D&chat_instance=-123456789&chat_type=sender&auth_date=1234567890&hash=test_hash'
    
    clearError()
    await loginWithTelegram(testInitData)
  }

  if (!isTelegramReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Инициализация...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">MB</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">MultiBank</h1>
            <p className="text-gray-600">Безопасный банкинг в Telegram</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Login Options */}
          <div className="space-y-4">
            {window.Telegram?.WebApp ? (
              <div className="text-center">
                <div className="mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Обнаружено Telegram Web App
                  </p>
                </div>
                
                <button
                  onClick={handleTelegramLogin}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Вход...
                    </div>
                  ) : (
                    'Войти через Telegram'
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Откройте это приложение в Telegram
                  </p>
                </div>
                
                <button
                  onClick={handleManualLogin}
                  disabled={isLoading}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Вход...
                    </div>
                  ) : (
                    'Тестовый вход'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Возможности:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Безопасные переводы
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                История транзакций
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Управление счетами
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Уведомления в Telegram
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
