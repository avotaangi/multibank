import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Star } from 'lucide-react';
import useSubscriptionStore from '../stores/subscriptionStore';

const PremiumBlock = ({ featureName, children }) => {
  const navigate = useNavigate();
  const isSubscribedFn = useSubscriptionStore((state) => state.isSubscribed);
  const [showModal, setShowModal] = useState(false);

  // Если есть подписка - показываем контент
  if (isSubscribedFn()) {
    return children;
  }

  // Если нет подписки - показываем блокировку
  const handleUnlock = () => {
    setShowModal(true);
  };

  const handleTrialStart = () => {
    // Устанавливаем пробный период на 1 месяц
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    useSubscriptionStore.getState().setSubscription('trial', endDate.toISOString());
    setShowModal(false);
    // Перезагружаем страницу для применения изменений
    window.location.reload();
  };

  return (
    <>
      {/* Premium Block Banner - в начале страницы */}
      <div className="px-4 mb-4">
        <div 
          className="rounded-[27px] border border-gray-200 overflow-hidden cursor-pointer"
          style={{ backgroundColor: '#3C82F6' }}
          onClick={handleUnlock}
        >
          <div className="p-4" style={{ backgroundColor: '#3C82F6' }}>
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-white font-ibm text-lg font-medium leading-[110%] mb-1">
                  Премиум функция заблокирована
                </div>
                <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%]">
                  {featureName}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUnlock();
              }}
              className="w-full bg-white text-[#3C82F6] font-ibm text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Разблокировать
            </button>
            <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
          </div>
        </div>
      </div>

      {/* Blurred Content */}
      <div className="relative">
        <div style={{ filter: 'blur(5px)', opacity: 0.5, pointerEvents: 'none' }}>
          {children}
        </div>
        
        {/* Overlay */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm rounded-2xl"
        >
          <div className="text-center px-4">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <div className="text-gray-600 font-ibm text-sm">
              Функция доступна с подпиской VBank+
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-[27px] border border-gray-200 overflow-hidden w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4" style={{ backgroundColor: '#EF4444' }}>
              <div className="text-center">
                <div className="text-white font-ibm text-2xl font-medium leading-[110%] mb-2">
                  Премиум функция
                </div>
                <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%]">
                  {featureName}
                </div>
              </div>
            </div>
            <div className="px-4 pb-4 pt-4 bg-white">
              <div className="bg-gray-50 rounded-[27px] p-4 mb-4">
                <div className="text-gray-900 font-ibm font-semibold mb-2 text-center">
                  Доступна в подписке VBank+
                </div>
                <div className="text-gray-600 font-ibm text-sm text-center">
                  Попробуйте бесплатно 1 месяц
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleTrialStart}
                  className="w-full text-white font-ibm font-bold text-lg py-4 rounded-xl transition-all"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  Перейти на пробный период (1 месяц) VBank+
                </button>
                
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-gray-100 text-gray-700 font-ibm font-semibold text-base py-3 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PremiumBlock;

