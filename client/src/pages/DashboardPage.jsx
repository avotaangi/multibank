import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import BankCardStack from '../components/BankCardStack';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated background blurs */}
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-gradient-to-br from-red-400/30 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -left-32 -top-32 w-96 h-96 bg-gradient-to-br from-rose-400/30 to-red-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute right-1/4 -bottom-32 w-80 h-80 bg-gradient-to-br from-red-400/20 to-rose-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* Top Header with Profile */}
      <div className="relative z-10 bg-gradient-to-r from-white/80 via-white/90 to-white/80 backdrop-blur-md px-5 pt-6 pb-4 rounded-b-[40px] shadow-lg border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-xl overflow-hidden ring-4 ring-white/50">
                 <img 
                   src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" 
                   alt="Софья Львова" 
                   className="w-full h-full object-cover"
                 />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
            </div>
            <div>
              <div className="text-gray-600 font-ibm text-sm font-medium leading-[110%] tracking-wide">
                Мультибанк
              </div>
              <div className="text-gray-900 font-ibm text-lg font-semibold leading-[110%]">
                София Львова
              </div>
            </div>
          </div>
          <div className="relative">
            <button className="w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Total Budget */}
      <div className="relative z-10 text-center px-5 py-6">
        <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
          <div className="text-gray-600 font-ibm text-base font-medium leading-[110%] mb-3 tracking-wide">
            Общий бюджет
          </div>
          <div className="text-gray-900 font-ibm text-4xl font-bold leading-[110%] tracking-[-0.02em] mb-2">
            18 404,7 ₽
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-red-600 font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>+12.5% за месяц</span>
          </div>
        </div>
      </div>

            {/* Bank Cards Stack */}
            <div className="relative z-10 py-2">
              <BankCardStack />
            </div>

      {/* Add Bank Button */}
      <div className="relative z-10 text-center py-3">
        <button className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-ibm text-base font-medium leading-[110%] px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 inline-flex items-center space-x-2">
          <span className="font-manrope text-lg">+</span>
          <span>Добавить банк</span>
        </button>
      </div>

      {/* Quick Action Buttons */}
      <div className="relative z-10 px-5 py-4">
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/transfer')}
            className="h-28 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/20 rounded-2xl flex flex-col items-center justify-center hover:from-white hover:to-white/90 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="w-10 h-10 mb-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </div>
            <div className="text-gray-800 font-ibm text-xs font-medium leading-[110%] text-center">
              Между банками
            </div>
          </button>
          
          <button className="h-28 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/20 rounded-2xl flex flex-col items-center justify-center hover:from-white hover:to-white/90 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl">
            <div className="w-10 h-10 mb-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M5 3L19 12L5 21V3Z" fill="#4285F4"/>
                <path d="M5 3L12 12L5 21V3Z" fill="#34A853"/>
                <path d="M12 12L19 12L12 21V12Z" fill="#FBBC05"/>
                <path d="M12 3L19 12L12 12V3Z" fill="#EA4335"/>
              </svg>
            </div>
            <div className="text-gray-800 font-ibm text-xs font-medium leading-[110%] text-center">
              Перевести по телефону
            </div>
          </button>
          
          <button className="h-28 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/20 rounded-2xl flex flex-col items-center justify-center hover:from-white hover:to-white/90 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl">
            <div className="w-10 h-10 mb-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                <path d="M10 16l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z"/>
              </svg>
            </div>
            <div className="text-gray-800 font-ibm text-xs font-medium leading-[110%] text-center">
              Планирование бюджета
            </div>
          </button>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="relative z-10 px-5 py-4">
        <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="text-gray-900 font-ibm font-semibold text-lg leading-[110%]">
              Аналитика | Октябрь
            </div>
            <button className="text-red-600 font-ibm font-medium text-sm leading-[110%] cursor-pointer hover:underline transition-colors">
              Подробнее
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Income */}
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="h-4 bg-gradient-to-r from-red-400 to-red-500 rounded-full shadow-inner overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-red-300 to-red-400 rounded-full shadow-lg"></div>
                </div>
              </div>
              <div className="text-gray-900 font-ibm font-semibold text-sm leading-[110%] flex items-center space-x-1">
                <span>120 473 ₽</span>
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {/* Expenses */}
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="h-4 bg-gradient-to-r from-rose-400 to-rose-500 rounded-full shadow-inner overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-r from-rose-300 to-rose-400 rounded-full shadow-lg"></div>
                </div>
              </div>
              <div className="text-gray-900 font-ibm font-semibold text-sm leading-[110%] flex items-center space-x-1">
                <span>54 986 ₽</span>
                <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operations Section */}
      <div className="relative z-10 px-5 py-4">
        <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="text-gray-900 font-ibm font-semibold text-lg leading-[110%]">
              Операции | Октябрь
            </div>
            <button className="text-red-600 font-ibm font-medium text-sm leading-[110%] cursor-pointer hover:underline transition-colors">
              Подробнее
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="text-gray-600 font-ibm font-medium text-sm leading-[110%] mb-4">
              Сегодня
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-white/50 to-white/30 rounded-2xl border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-gray-900 font-ibm font-semibold text-base leading-[110%]">
                  Surf Coffee
                </div>
                <div className="text-gray-600 font-ibm font-medium text-sm leading-[110%]">
                  Кофейни
                </div>
              </div>
              <div className="text-red-600 font-ibm font-semibold text-base leading-[110%]">
                -660 ₽
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Transactions Button */}
      <div className="relative z-10 px-5 py-4">
        <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-xl">
          <div className="text-gray-600 font-ibm font-medium text-sm leading-[110%] mb-4">
            Все транзакции
          </div>
          
          <button className="w-full bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm border border-white/30 rounded-3xl p-4 flex items-center space-x-4 hover:from-white hover:to-white/80 transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <div className="text-gray-900 font-ibm font-semibold text-base leading-[110%]">
                Surf Coffee
              </div>
              <div className="text-gray-600 font-ibm font-medium text-sm leading-[110%]">
                Кофейни
              </div>
            </div>
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-20"></div>
    </div>
  );
};

export default DashboardPage;