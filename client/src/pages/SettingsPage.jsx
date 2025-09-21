import { useState } from 'react'
import useAuthStore from '../stores/authStore'
import { Settings, Bell, Shield, Globe, HelpCircle, Info } from 'lucide-react'

const SettingsPage = () => {
  const { user, updateProfile } = useAuthStore()
  const [settings, setSettings] = useState({
    currency: user?.preferences?.currency || 'USD',
    language: user?.preferences?.language || 'ru',
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      telegram: user?.preferences?.notifications?.telegram ?? true,
      transactions: true,
      security: true
    },
    privacy: {
      showBalance: true,
      biometricAuth: false
    }
  })

  const handleSettingChange = (path, value) => {
    const keys = path.split('.')
    setSettings(prev => {
      const newSettings = { ...prev }
      let current = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  const handleSave = async () => {
    await updateProfile({
      preferences: {
        currency: settings.currency,
        language: settings.language,
        notifications: settings.notifications
      }
    })
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Settings className="h-6 w-6 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Общие</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Язык приложения
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
              <option value="uk">Українська</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Основная валюта
            </label>
            <select
              value={settings.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD - Доллар США</option>
              <option value="EUR">EUR - Евро</option>
              <option value="RUB">RUB - Российский рубль</option>
              <option value="UAH">UAH - Украинская гривна</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Уведомления</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email уведомления</p>
              <p className="text-sm text-gray-500">Получать уведомления на email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => handleSettingChange('notifications.email', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Telegram уведомления</p>
              <p className="text-sm text-gray-500">Получать уведомления в Telegram</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.telegram}
                onChange={(e) => handleSettingChange('notifications.telegram', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Уведомления о транзакциях</p>
              <p className="text-sm text-gray-500">Получать уведомления о всех операциях</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.transactions}
                onChange={(e) => handleSettingChange('notifications.transactions', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Уведомления безопасности</p>
              <p className="text-sm text-gray-500">Получать уведомления о безопасности</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.security}
                onChange={(e) => handleSettingChange('notifications.security', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Приватность и безопасность</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Показывать баланс</p>
              <p className="text-sm text-gray-500">Отображать суммы на главном экране</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showBalance}
                onChange={(e) => handleSettingChange('privacy.showBalance', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Биометрическая аутентификация</p>
              <p className="text-sm text-gray-500">Использовать отпечаток пальца или Face ID</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.biometricAuth}
                onChange={(e) => handleSettingChange('privacy.biometricAuth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Help & Support */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <HelpCircle className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Помощь и поддержка</h3>
        </div>
        
        <div className="space-y-3">
          <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <p className="font-medium text-gray-900">Часто задаваемые вопросы</p>
            <p className="text-sm text-gray-500">Ответы на популярные вопросы</p>
          </button>
          
          <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <p className="font-medium text-gray-900">Связаться с поддержкой</p>
            <p className="text-sm text-gray-500">Получить помощь от команды поддержки</p>
          </button>
          
          <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <p className="font-medium text-gray-900">Обратная связь</p>
            <p className="text-sm text-gray-500">Поделиться мнением о приложении</p>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Info className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">О приложении</h3>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Версия:</span>
            <span className="text-gray-900">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Сборка:</span>
            <span className="text-gray-900">2024.01.01</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Разработчик:</span>
            <span className="text-gray-900">MultiBank Team</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Сохранить настройки
      </button>
    </div>
  )
}

export default SettingsPage
