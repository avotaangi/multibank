import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTelegramUser } from '../hooks/useTelegramUser';
import useAuthStore from '../stores/authStore';
import useSubscriptionStore from '../stores/subscriptionStore';

const PasswordPage = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFaceID, setIsFaceID] = useState(false); // Отслеживаем, используется ли Face ID
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const telegramUser = useTelegramUser();
  const { setAuthenticated } = useAuthStore();
  const { setSubscription } = useSubscriptionStore();
  
  const hasSubscription = searchParams.get('subscription') === 'true';
  
  // Устанавливаем подписку при входе с subscription=true
  useEffect(() => {
    if (hasSubscription) {
      // Устанавливаем пробный период на 1 месяц
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      setSubscription('trial', endDate.toISOString());
    }
  }, [hasSubscription, setSubscription]);

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
        // Устанавливаем подписку если была выбрана
        if (hasSubscription) {
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);
          setSubscription('trial', endDate.toISOString());
        }
        // Аутентификация и переход на главную страницу
        setAuthenticated(true);
        navigate('/dashboard');
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
        setIsLoading(true);
        setIsFaceID(false); // Это не Face ID, а ввод пароля
        setTimeout(() => {
          // Устанавливаем подписку если была выбрана
          if (hasSubscription) {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
            setSubscription('trial', endDate.toISOString());
          }
          setAuthenticated(true);
          navigate('/dashboard');
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    setPassword(prev => prev.slice(0, -1));
    setError('');
  };

  const handleFaceID = () => {
    setIsLoading(true);
    setIsFaceID(true); // Устанавливаем флаг, что используется Face ID
    setError('');
    
    // Имитация Face ID - показываем окно на 2-3 секунды
    setTimeout(() => {
      // Устанавливаем подписку если была выбрана
      if (hasSubscription) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        setSubscription('trial', endDate.toISOString());
      }
      setAuthenticated(true);
      navigate('/dashboard');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Welcome Banner */}
      <div className="px-4 mb-4">
        <div className="rounded-[27px] border border-gray-200 overflow-hidden" style={{ backgroundColor: '#3C82F6' }}>
          <div className="p-4" style={{ backgroundColor: '#3C82F6' }}>
            <div className="text-center">
              <div className="text-white font-ibm text-2xl font-medium leading-[110%] mb-2">
                Мультибанк
              </div>
              <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-2">
                Ваш цифровой помощник
              </div>
              {hasSubscription && (
                <div className="mt-2 inline-block bg-white text-[#3C82F6] text-xs font-ibm font-medium px-3 py-1 rounded-full">
                  VBank+ Подписка активна
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 mx-4">
        <div className="flex flex-col items-center space-y-8">
          {/* User Name */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 font-ibm">
              {telegramUser.displayName ? telegramUser.displayName.split(' ')[0] : 'Пользователь'}
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-ibm">
              Введите любые 4 цифры
            </p>
          </div>

          {/* Password Dots */}
          <div className="flex space-x-4">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  index < password.length
                    ? 'bg-blue-500 border-blue-500 scale-110'
                    : 'border-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center font-ibm animate-shake">
              {error}
            </div>
          )}

          {/* Loading Indicator - только для Face ID */}
          {isLoading && isFaceID && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-blue-600 text-lg font-medium font-ibm">Проверка...</div>
                <div className="text-gray-500 text-sm font-ibm">Пожалуйста, подождите</div>
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
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-medium text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-all shadow-md disabled:opacity-50 font-ibm"
              >
                {num}
              </button>
            ))}
            
            {/* Bottom row */}
            <button
              onClick={() => navigate('/vbank-plus')}
              disabled={isLoading}
              className="w-16 h-16 flex items-center justify-center text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 font-ibm"
            >
              Назад
            </button>
            
            <button
              onClick={() => handleKeyPress('0')}
              disabled={isLoading}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-medium text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-all shadow-md disabled:opacity-50 font-ibm"
            >
              0
            </button>
            
            <button
              onClick={handleFaceID}
              disabled={isLoading}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-all shadow-md disabled:opacity-50"
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

export default PasswordPage;

