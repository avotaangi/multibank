import { useState } from 'react'
import useAuthStore from '../stores/authStore'
import { useTelegramUser } from '../hooks/useTelegramUser'
import { User, Mail, Phone, Globe, Shield, LogOut } from 'lucide-react'

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuthStore()
  const telegramUser = useTelegramUser()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    preferences: {
      currency: user?.preferences?.currency || 'USD',
      language: user?.preferences?.language || 'ru',
      notifications: {
        email: user?.preferences?.notifications?.email ?? true,
        telegram: user?.preferences?.notifications?.telegram ?? true
      }
    }
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('preferences.')) {
      const prefPath = name.split('.')
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefPath[1]]: prefPath[2] ? {
            ...prev.preferences[prefPath[1]],
            [prefPath[2]]: type === 'checkbox' ? checked : value
          } : (type === 'checkbox' ? checked : value)
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleSave = async () => {
    const result = await updateProfile(formData)
    if (result.success) {
      setIsEditing(false)
    }
  }

  const handleLogout = async () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showConfirm(
        'Вы уверены, что хотите выйти?',
        async (confirmed) => {
          if (confirmed) {
            await logout()
          }
        }
      )
    } else {
      await logout()
    }
  }

  return (
    <div className="p-2 sm:p-3 md:p-4 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Профиль</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium"
        >
          {isEditing ? 'Отмена' : 'Редактировать'}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
          {telegramUser.photoUrl ? (
            <img 
              src={telegramUser.photoUrl} 
              alt={telegramUser.displayName}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm sm:text-base text-gray-500 truncate">@{user?.username || 'username'}</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                user?.isVerified ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-xs sm:text-sm text-gray-500">
                {user?.isVerified ? 'Верифицирован' : 'Не верифицирован'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-start sm:items-center space-x-3">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-1 sm:mt-0 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm sm:text-base text-gray-900 break-all">{user?.email || 'Не указан'}</p>
              )}
            </div>
          </div>

          <div className="flex items-start sm:items-center space-x-3">
            <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-1 sm:mt-0 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Телефон</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm sm:text-base text-gray-900">{user?.phone || 'Не указан'}</p>
              )}
            </div>
          </div>

          <div className="flex items-start sm:items-center space-x-3">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-1 sm:mt-0 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Язык</label>
              {isEditing ? (
                <select
                  name="preferences.language"
                  value={formData.preferences.language}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="uk">Українська</option>
                </select>
              ) : (
                <p className="text-sm sm:text-base text-gray-900">
                  {formData.preferences.language === 'ru' ? 'Русский' :
                   formData.preferences.language === 'en' ? 'English' : 'Українська'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start sm:items-center space-x-3">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-1 sm:mt-0 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Валюта</label>
              {isEditing ? (
                <select
                  name="preferences.currency"
                  value={formData.preferences.currency}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="RUB">RUB</option>
                  <option value="UAH">UAH</option>
                </select>
              ) : (
                <p className="text-sm sm:text-base text-gray-900">{formData.preferences.currency}</p>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors"
            >
              Сохранить изменения
            </button>
          </div>
        )}
      </div>

      {/* Notifications Settings */}
      <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Уведомления</h3>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-sm sm:text-base font-medium text-gray-900">Email уведомления</p>
              <p className="text-xs sm:text-sm text-gray-500">Получать уведомления на email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                name="preferences.notifications.email"
                checked={formData.preferences.notifications.email}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-10 h-5 sm:w-11 sm:h-6 bg-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-sm sm:text-base font-medium text-gray-900">Telegram уведомления</p>
              <p className="text-xs sm:text-sm text-gray-500">Получать уведомления в Telegram</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                name="preferences.notifications.telegram"
                checked={formData.preferences.notifications.telegram}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-10 h-5 sm:w-11 sm:h-6 bg-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Безопасность</h3>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base font-medium text-gray-900">PIN-код</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {user?.security?.pinSet ? 'Настроен' : 'Не настроен'}
                </p>
              </div>
            </div>
            <button className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium flex-shrink-0">
              {user?.security?.pinSet ? 'Изменить' : 'Установить'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base font-medium text-gray-900">Двухфакторная аутентификация</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {user?.security?.twoFactorEnabled ? 'Включена' : 'Отключена'}
                </p>
              </div>
            </div>
            <button className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium flex-shrink-0">
              {user?.security?.twoFactorEnabled ? 'Отключить' : 'Включить'}
            </button>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Информация об аккаунте</h3>
        
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">ID пользователя:</span>
            <span className="text-gray-900 font-mono text-xs sm:text-sm break-all">{user?.telegramId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Дата регистрации:</span>
            <span className="text-gray-900 text-xs sm:text-sm">
              {(() => {
                if (!user?.createdAt) return 'Не указано';
                const date = new Date(user.createdAt);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}.${month}.${year}`;
              })()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Последний вход:</span>
            <span className="text-gray-900 text-xs sm:text-sm">
              {(() => {
                if (!user?.lastLogin) return 'Не указано';
                const date = new Date(user.lastLogin);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}.${month}.${year}`;
              })()}
            </span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 font-medium py-2 text-sm sm:text-base"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Выйти из аккаунта</span>
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
