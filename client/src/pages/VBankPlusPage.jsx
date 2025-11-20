import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, Zap, TrendingUp, CreditCard, Lock } from 'lucide-react';

const VBankPlusPage = () => {
  const navigate = useNavigate();

  const handleSubscribeClick = () => {
    navigate('/vbank-plus/details');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="pt-8 pb-6 px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-ibm">
            VBank Plus
          </h1>
          <p className="text-gray-600 font-ibm text-lg">
            Премиум подписка для вашего финансового комфорта
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="px-4 mb-6">
        <div 
          onClick={handleSubscribeClick}
          className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-3xl p-6 shadow-2xl transform transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-ibm text-xl font-bold">
                  VBank Plus
                </div>
                <div className="text-white text-opacity-90 font-ibm text-sm">
                  Премиум подписка
                </div>
              </div>
            </div>
            <div className="text-white font-ibm text-2xl font-bold">
              ₽
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-2xl p-4 mb-4">
            <div className="text-white text-opacity-90 font-ibm text-sm mb-2">
              Активируйте подписку и получите:
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <span className="text-white font-ibm text-sm">Расширенная аналитика</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <span className="text-white font-ibm text-sm">Приоритетная поддержка</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <span className="text-white font-ibm text-sm">Эксклюзивные возможности</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 text-white text-opacity-90 font-ibm text-sm">
            <span>Нажмите, чтобы узнать больше</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="px-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-ibm text-center">
          Что включено в подписку
        </h2>
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-gray-900 font-ibm font-medium">Детальная аналитика</div>
                <div className="text-gray-500 font-ibm text-sm">Отслеживайте все ваши финансы</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-gray-900 font-ibm font-medium">Быстрые переводы</div>
                <div className="text-gray-500 font-ibm text-sm">Мгновенные операции без комиссий</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-pink-600" />
              </div>
              <div className="flex-1">
                <div className="text-gray-900 font-ibm font-medium">Управление картами</div>
                <div className="text-gray-500 font-ibm text-sm">Все ваши карты в одном месте</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VBankPlusPage;

