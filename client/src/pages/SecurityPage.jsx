import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Smartphone, Clock, CheckCircle, XCircle, Info, LogOut, Eye, EyeOff } from 'lucide-react';
import InfoPanel from '../components/InfoPanel';
import { usePageInfo } from '../hooks/usePageInfo';
import useAuthStore from '../stores/authStore';

const SecurityPage = () => {
  const navigate = useNavigate();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const { user } = useAuthStore();
  
  // Mock data - в реальности это будет из API
  const [loginHistory] = useState([
    {
      id: 1,
      device: 'iPhone 14 Pro',
      location: 'Москва, Россия',
      ip: '192.168.1.1',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
      status: 'success'
    },
    {
      id: 2,
      device: 'MacBook Pro',
      location: 'Москва, Россия',
      ip: '192.168.1.2',
      time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 день назад
      status: 'success'
    },
    {
      id: 3,
      device: 'Android Phone',
      location: 'Санкт-Петербург, Россия',
      ip: '192.168.1.100',
      time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 дней назад
      status: 'failed'
    }
  ]);

  const [activeSessions] = useState([
    {
      id: 1,
      device: 'iPhone 14 Pro',
      location: 'Москва, Россия',
      ip: '192.168.1.1',
      lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 минут назад
      current: true
    },
    {
      id: 2,
      device: 'MacBook Pro',
      location: 'Москва, Россия',
      ip: '192.168.1.2',
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
      current: false
    }
  ]);

  const [securitySettings] = useState({
    pinEnabled: true,
    twoFactorEnabled: false,
    biometricEnabled: false,
    notificationsEnabled: true
  });

  const [showPinSettings, setShowPinSettings] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [showPin, setShowPin] = useState(false);

  const formatDate = (date) => {
    if (!date) return 'Не указано';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };
  
  const formatDateWithTime = (date) => {
    if (!date) return 'Не указано';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };
  

  const handleLogoutSession = (sessionId) => {
    // В реальности здесь будет API запрос
    console.log('Logout session:', sessionId);
    alert('Сессия завершена');
  };

  const handleChangePin = () => {
    // В реальности здесь будет API запрос
    console.log('Change PIN');
    alert('PIN изменен');
    setShowPinSettings(false);
    setPinValue('');
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="w-10"></div>
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Безопасность
          </div>
          <button
            onClick={() => setShowInfoPanel(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 pt-6 space-y-6">
        {/* Security Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-black font-ibm text-lg font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-500" />
            Настройки безопасности
          </h3>
          
          <div className="space-y-4">
            {/* PIN Code */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-black font-ibm text-sm font-medium">
                    PIN-код
                  </div>
                  <div className="text-gray-500 font-ibm text-xs">
                    {securitySettings.pinEnabled ? 'Включен' : 'Выключен'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPinSettings(!showPinSettings)}
                className="text-blue-600 font-ibm text-sm font-medium hover:text-blue-700"
              >
                {showPinSettings ? 'Отмена' : 'Изменить'}
              </button>
            </div>

            {showPinSettings && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <div>
                  <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                    Новый PIN-код
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      value={pinValue}
                      onChange={(e) => setPinValue(e.target.value)}
                      maxLength={6}
                      placeholder="Введите 4-6 цифр"
                      className="w-full bg-white rounded-[27px] px-4 py-3 text-gray-900 font-ibm text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    />
                    <button
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleChangePin}
                  disabled={pinValue.length < 4}
                  className="w-full bg-blue-500 text-white font-ibm text-sm font-medium py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Сохранить
                </button>
              </div>
            )}

            {/* Two Factor Authentication */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-black font-ibm text-sm font-medium">
                    Двухфакторная аутентификация
                  </div>
                  <div className="text-gray-500 font-ibm text-xs">
                    {securitySettings.twoFactorEnabled ? 'Включена' : 'Выключена'}
                  </div>
                </div>
              </div>
              <button className="text-blue-600 font-ibm text-sm font-medium hover:text-blue-700">
                {securitySettings.twoFactorEnabled ? 'Выключить' : 'Включить'}
              </button>
            </div>

            {/* Biometric Authentication */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-black font-ibm text-sm font-medium">
                    Биометрическая аутентификация
                  </div>
                  <div className="text-gray-500 font-ibm text-xs">
                    {securitySettings.biometricEnabled ? 'Включена' : 'Выключена'}
                  </div>
                </div>
              </div>
              <button className="text-blue-600 font-ibm text-sm font-medium hover:text-blue-700">
                {securitySettings.biometricEnabled ? 'Выключить' : 'Включить'}
              </button>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-black font-ibm text-lg font-semibold mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-green-500" />
            Активные сессии
          </h3>
          
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-black font-ibm text-sm font-medium">
                        {session.device}
                      </span>
                      {session.current && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-ibm font-medium">
                          Текущая
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500 font-ibm text-xs">
                      {session.location} • {session.ip}
                    </div>
                    <div className="text-gray-400 font-ibm text-xs mt-1">
                      Последняя активность: {formatDate(session.lastActivity)}
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <button
                    onClick={() => handleLogoutSession(session.id)}
                    className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Login History */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-black font-ibm text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-500" />
            История входов
          </h3>
          
          <div className="space-y-3">
            {loginHistory.map((login) => (
              <div key={login.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  {login.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-black font-ibm text-sm font-medium">
                      {login.device}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-ibm font-medium ${
                      login.status === 'success' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {login.status === 'success' ? 'Успешно' : 'Неудачно'}
                    </span>
                  </div>
                  <div className="text-gray-500 font-ibm text-xs">
                    {login.location} • {login.ip}
                  </div>
                  <div className="text-gray-400 font-ibm text-xs mt-1">
                    {formatDate(login.time)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 text-blue-600 font-ibm text-sm font-medium hover:text-blue-700">
            Показать всю историю
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <InfoPanel
        isOpen={showInfoPanel}
        onClose={() => setShowInfoPanel(false)}
        title={pageInfo.title}
        content={pageInfo.content}
        color={pageInfo.color}
      />
    </div>
  );
};

export default SecurityPage;

