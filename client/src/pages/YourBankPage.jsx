import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, CreditCard, Shield, TrendingUp, Sparkles, 
  Star, Zap, Bell, Wallet, PieChart, Target, Users, 
  Globe, Infinity, CheckCircle
} from 'lucide-react';

const YourBankPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [agreement1, setAgreement1] = useState(false);
  const [agreement2, setAgreement2] = useState(false);
  const [agreement3, setAgreement3] = useState(false);

  // Отладка состояния модального окна
  React.useEffect(() => {
    console.log('Modal state changed:', showModal);
  }, [showModal]);

  const handleMultibankClick = () => {
    console.log('Мультибанк button clicked, opening modal');
    setShowModal(true);
    console.log('Modal state set to true');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setAgreement1(false);
    setAgreement2(false);
    setAgreement3(false);
  };

  const handleLoginWithSubscription = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Login with subscription clicked', { agreement1, agreement2, agreement3, navigate });
    
    if (!agreement1 || !agreement2 || !agreement3) {
      alert('Необходимо принять все соглашения');
      return;
    }
    
    console.log('Navigating to /password?subscription=true');
    
    // Закрываем модальное окно
    setShowModal(false);
    
    // Небольшая задержка для закрытия модального окна
    setTimeout(() => {
      // Переход на страницу с паролем для входа с подпиской
      try {
        navigate('/password?subscription=true', { replace: false });
        console.log('Navigation called to /password?subscription=true');
      } catch (error) {
        console.error('Navigation error:', error);
        // Альтернативный способ - через window.location
        window.location.href = '/password?subscription=true';
      }
    }, 100);
  };

  const handleLoginWithoutSubscription = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Login without subscription clicked', { agreement1, agreement2, agreement3, navigate });
    
    if (!agreement1 || !agreement2 || !agreement3) {
      alert('Необходимо принять все соглашения');
      return;
    }
    
    console.log('Navigating to /password?subscription=false');
    
    // Закрываем модальное окно
    setShowModal(false);
    
    // Небольшая задержка для закрытия модального окна
    setTimeout(() => {
      // Переход на страницу с паролем для входа без подписки
      try {
        navigate('/password?subscription=false', { replace: false });
        console.log('Navigation called to /password?subscription=false');
      } catch (error) {
        console.error('Navigation error:', error);
        // Альтернативный способ - через window.location
        window.location.href = '/password?subscription=false';
      }
    }, 100);
  };

  // Функция для скачивания PDF файла (кроссплатформенная)
  const handleDownloadPDF = async (e, filename) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const pdfPath = `/documents/${filename}`;
      
      // Загружаем файл через fetch
      const response = await fetch(pdfPath);
      if (!response.ok) {
        throw new Error('Не удалось загрузить файл');
      }
      
      // Создаем blob из ответа
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Функция для скачивания через создание ссылки
      const downloadFile = (fileUrl, fileFileName) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileFileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        
        setTimeout(() => {
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(fileUrl);
          }, 100);
        }, 0);
      };
      
      // Проверяем платформу
      const isTelegramWebApp = window.Telegram?.WebApp;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      // Определяем стратегию скачивания в зависимости от платформы
      
      // Для iOS (включая Telegram на iOS) - приоритет Web Share API
      if (isIOS && navigator.share) {
        try {
          const file = new File([blob], filename, { type: 'application/pdf' });
          
          // Проверяем поддержку sharing файлов (iOS 13+)
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: filename,
              text: 'Скачать документ'
            });
            // Освобождаем память после успешного sharing
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
            return;
          }
        } catch (shareError) {
          // Если sharing не удался, продолжаем с обычным скачиванием
          console.log('Web Share API не доступен, используем обычное скачивание:', shareError);
        }
      }
      
      // Для Telegram Web App (все платформы)
      if (isTelegramWebApp) {
        // Пробуем прямой URL - Telegram может обработать скачивание
        const directLink = document.createElement('a');
        directLink.href = pdfPath;
        directLink.download = filename;
        directLink.target = '_blank';
        directLink.style.display = 'none';
        document.body.appendChild(directLink);
        directLink.click();
        setTimeout(() => {
          document.body.removeChild(directLink);
        }, 100);
        
        // Fallback через blob для надежности (особенно важно для Android в Telegram)
        setTimeout(() => {
          downloadFile(blobUrl, filename);
        }, 300);
      } 
      // Для Android (не в Telegram)
      else if (isAndroid) {
        // Для Android используем blob download (работает в большинстве случаев)
        downloadFile(blobUrl, filename);
      } 
      // Для ПК и других платформ
      else {
        downloadFile(blobUrl, filename);
      }
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
      
      // Fallback: пробуем открыть прямой URL
      try {
        const pdfPath = `/documents/${filename}`;
        const link = document.createElement('a');
        link.href = pdfPath;
        link.download = filename;
        link.target = '_blank';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
      } catch (fallbackError) {
        console.error('Ошибка при fallback скачивании:', fallbackError);
        alert('Не удалось скачать файл. Попробуйте еще раз.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-center">
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            VBank
          </div>
        </div>
      </div>

      {/* Multibank Section */}
      <div className="px-4 mb-6">

        {/* Free Features */}
        <div className="mb-6">
          <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden" style={{ backgroundColor: '#3C82F6' }}>
            <div className="p-4" style={{ backgroundColor: '#3C82F6' }}>
              <div className="mb-3">
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">Для всех бесплатно</div>
              </div>
              <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                Базовые возможности доступны без подписки
              </div>
            </div>
            <div className="px-4 pb-4 pt-4 bg-white">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-black font-ibm text-base font-normal leading-[110%]">
                      Отображение счетов из других банков
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-black font-ibm text-base font-normal leading-[110%]">
                      Переводы с разных счетов
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-black font-ibm text-base font-normal leading-[110%]">
                      История операций
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-black font-ibm text-base font-normal leading-[110%]">
                      Настройка автоплатежей
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Features - All visible */}
        <div className="mb-6">
          <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden" style={{ backgroundColor: '#3C82F6' }}>
            <div className="p-4" style={{ backgroundColor: '#3C82F6' }}>
              <div className="mb-3">
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">Премиум-функции</div>
              </div>
              <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                В подписке «VBank Плюс»
              </div>
            </div>
            <div className="px-4 pb-4 pt-4 bg-white">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <PieChart className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-black font-ibm text-base font-normal leading-[110%]">
                      Аналитика по всем банкам
                    </div>
                  </div>
                  <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-black font-ibm text-base font-normal leading-[110%]">
                      Планирование бюджета, используя накопительный счет (планируйте с выгодой)
                    </div>
                  </div>
                  <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-black font-ibm text-base font-normal leading-[110%]">
                      Агрегация страховок
                    </div>
                  </div>
                  <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-black font-ibm text-base font-normal leading-[110%]">
                      Персональные финансовые советы
                    </div>
                  </div>
                  <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white py-4 px-4">
        <button
          onClick={handleMultibankClick}
          className="w-full text-white font-ibm text-base font-medium py-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
          style={{ backgroundColor: '#3C82F6' }}
        >
          <Sparkles className="w-5 h-5" />
          <span>Мультибанк</span>
        </button>
      </div>

      {/* Spacer for fixed button */}
      <div className="h-24"></div>

      {/* Modal with Agreements */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4"
          style={{ zIndex: 99999 }}
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative z-[99999] max-h-[90vh] overflow-y-auto"
            style={{ zIndex: 99999 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 font-ibm">
                Соглашения
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Agreements */}
            <div className="space-y-4 mb-6">
              {/* Согласие 1: Персональные данные */}
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreement1}
                  onChange={(e) => setAgreement1(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-gray-900 font-ibm font-medium text-sm">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDownloadPDF(e, 'personal-data-agreement.pdf');
                      }}
                      className="text-blue-600 underline hover:text-blue-700 text-left"
                    >
                      Скачать выписку: Согласие на обработку персональных данных
                    </button>
                  </div>
                  <div className="text-gray-500 font-ibm text-xs mt-1">
                    Разрешаю обработку моих персональных данных
                  </div>
                </div>
              </label>

              {/* Согласие 2: Кредитная история и доступ к счетам */}
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreement2}
                  onChange={(e) => setAgreement2(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-gray-900 font-ibm font-medium text-sm">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDownloadPDF(e, 'credit-history-agreement.pdf');
                      }}
                      className="text-blue-600 underline hover:text-blue-700 text-left"
                    >
                      Скачать выписку: Согласие на получение кредитной истории и доступ к счетам
                    </button>
                  </div>
                  <div className="text-gray-500 font-ibm text-xs mt-1 space-y-1">
                    <div>• Согласие на получение кредитной истории и сведений из ГИС (включая ПДН)</div>
                    <div>• Согласие на доступ к счетам и операциям (информационное согласие)</div>
                    <div>• Согласие на инициирование платежей и переводов</div>
                    <div>• Согласие на неограниченный доступ к операциям</div>
                    <div>• Согласие на передачу данных третьим сторонам (финтех, страховщики)</div>
                  </div>
                </div>
              </label>

              {/* Согласие 3: Биометрия */}
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreement3}
                  onChange={(e) => setAgreement3(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-gray-900 font-ibm font-medium text-sm">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDownloadPDF(e, 'biometry-agreement.pdf');
                      }}
                      className="text-blue-600 underline hover:text-blue-700 text-left"
                    >
                      Скачать выписку: Согласие на использование биометрии для подтверждения операций
                    </button>
                  </div>
                  <div className="text-gray-500 font-ibm text-xs mt-1">
                    Разрешаю использование биометрических данных для подтверждения операций
                  </div>
                </div>
              </label>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={(e) => {
                  console.log('Button clicked - with subscription');
                  handleLoginWithSubscription(e);
                }}
                disabled={!agreement1 || !agreement2 || !agreement3}
                className={`w-full py-3 rounded-2xl font-ibm font-semibold text-base transition-all ${
                  agreement1 && agreement2 && agreement3
                    ? 'text-white shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                style={{ 
                  pointerEvents: (!agreement1 || !agreement2 || !agreement3) ? 'none' : 'auto',
                  backgroundColor: (agreement1 && agreement2 && agreement3) ? '#3C82F6' : undefined
                }}
              >
                Войти с подпиской VBank+
              </button>
              
              <button
                type="button"
                onClick={(e) => {
                  console.log('Button clicked - without subscription');
                  handleLoginWithoutSubscription(e);
                }}
                disabled={!agreement1 || !agreement2 || !agreement3}
                className={`w-full py-3 rounded-2xl font-ibm font-semibold text-base transition-all border-2 ${
                  agreement1 && agreement2 && agreement3
                    ? 'border-blue-600 text-blue-600 hover:bg-blue-50 active:scale-[0.98] cursor-pointer bg-white'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                }`}
                style={{ pointerEvents: (!agreement1 || !agreement2 || !agreement3) ? 'none' : 'auto' }}
              >
                Войти без подписки
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourBankPage;

