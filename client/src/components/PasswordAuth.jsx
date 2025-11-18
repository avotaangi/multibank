import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramUser } from '../hooks/useTelegramUser';

const PasswordAuth = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const telegramUser = useTelegramUser();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 4) {
      setError('Пароль должен содержать минимум 4 цифры');
      return;
    }

    setIsLoading(true);
    setError('');

    // Имитация проверки пароля - принимаем любые 4 цифры
    setTimeout(() => {
      if (password.length === 4 && /^\d{4}$/.test(password)) {
        // Любые 4 цифры принимаются - вызываем callback для аутентификации
        onAuthenticated();
      } else {
        setError('Введите 4 цифры');
        setPassword('');
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleKeyPress = (digit) => {
    if (password.length < 4) {
      const newPassword = password + digit;
      setPassword(newPassword);
      setError('');
      
      // Если ввели 4 цифры - сразу переходим на главную страницу
      if (newPassword.length === 4) {
        onAuthenticated();
      }
    }
  };

  const handleDelete = () => {
    setPassword(prev => prev.slice(0, -1));
    setError('');
  };

  const handleFaceID = () => {
    setIsLoading(true);
    setError('');
    
    // Имитация Face ID - показываем окно на 2-3 секунды
    setTimeout(() => {
      onAuthenticated();
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Welcome Banner */}
      <div className="relative py-2 px-3 text-center shadow-2xl mx-4 mt-2 mb-2 rounded-xl" style={{ backgroundColor: '#25355A', color: '#F4EBE2' }}>
        {/* Content */}
        <div>
          {/* Welcome Text */}
          <div className="space-y-1">
            <div className="text-sm font-medium animate-fade-in-up">
              Вас приветствует
            </div>
            <div className="text-lg font-bold tracking-wide animate-fade-in-up-delay bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
              Мультибанк
            </div>
            <div className="text-xs opacity-90 animate-fade-in-up-delay-2">
              Ваш надежный финансовый партнер
            </div>
          </div>
        </div>
        
        {/* Animated Border */}
        <div className="absolute bottom-0 left-0 w-full h-2 animate-pulse" style={{ backgroundColor: '#D35B7A' }}></div>
        
        {/* Floating Particles */}
        <div className="absolute top-2 left-2 w-1 h-1 bg-white/20 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-4 right-4 w-0.5 h-0.5 bg-white/30 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-4 left-4 w-1 h-1 bg-white/15 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 mx-4">
      <div className="flex flex-col items-center space-y-8">
        {/* User Name */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-black">
            {telegramUser.displayName ? telegramUser.displayName.split(' ')[0] : 'Пользователь'}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            введите любые 4 цифры для теста
          </p>
        </div>

        {/* Password Dots */}
        <div className="flex space-x-4">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 ${
                index < password.length
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-blue-500 text-lg font-medium">Имитация Face ID</div>
              <div className="text-gray-500 text-sm">Сканирование лица...</div>
            </div>
          </div>
        )}
      </div>

      {/* Keypad */}
      <div className="w-full max-w-xs mt-16 mx-auto">
        <div className="grid grid-cols-3 gap-4 justify-items-center">
          {/* Numbers 1-9 */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              disabled={isLoading}
              className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-medium text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          
          {/* Bottom row */}
          <button
            onClick={() => navigate('/login')}
            disabled={isLoading}
            className="w-16 h-16 flex items-center justify-center text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            Выйти
          </button>
          
          <button
            onClick={() => handleKeyPress('0')}
            disabled={isLoading}
            className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-medium text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            0
          </button>
          
          <button
            onClick={handleFaceID}
            disabled={isLoading}
            className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
      </div>

    </div>
  );
};

export default PasswordAuth;
