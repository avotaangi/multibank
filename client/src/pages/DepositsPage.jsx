import React from 'react';
import { useNavigate } from 'react-router-dom';

const DepositsPage = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ paddingTop: '100px' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBackToDashboard}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Вклады
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 pb-4">
        {/* Header Section with Gradient */}
        <div 
          className="relative rounded-t-[100px] pt-8 pb-6 px-6 mb-6 animate-slide-in-down-very-slow"
          style={{
            background: 'radial-gradient(61.6% 28.45% at 50.13% -1.11%, rgba(217, 213, 0, 0.096) 32.69%, rgba(101, 249, 22, 0.192) 86.54%)'
          }}
        >
          <div className="text-center">
            <div className="text-black font-ibm text-base font-normal leading-[110%] mb-2">
              Сумма вкладов
            </div>
            <div className="text-black font-ibm text-3xl font-medium leading-[110%] mb-4">
              600 000,00 ₽
            </div>
            <div className="text-black font-ibm text-sm font-normal leading-[110%]">
              Средняя доходность: 12% годовых
            </div>
          </div>
        </div>

        {/* White Content Area */}
        <div className="bg-white rounded-b-[100px] -mt-6 relative z-10 px-5 pt-8 pb-6 animate-fade-in-very-slow">
          {/* Status Message */}
          <div className="text-center mb-8 animate-slide-in-up-very-slow">
            <div className="text-black font-ibm text-sm font-normal leading-[110%]">
              Статус: сейчас ты управляешь своими деньгами, а не они тобой
            </div>
          </div>

          {/* Deposit Cards */}
          <div className="space-y-4 mb-6 animate-slide-in-up-very-slow">
            {/* VTB Deposit */}
            <div className="bg-blue-600 rounded-[27px] p-4 h-[78px] flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-ibm text-2xl font-normal leading-[110%] mb-1">
                  100 000,00 ₽
                </div>
                <div className="text-white font-ibm text-base font-normal leading-[110%]">
                  Вклад ВТБ
                </div>
              </div>
              <div className="text-white font-ibm text-sm font-normal leading-[110%]">
                9% годовых
              </div>
            </div>

            {/* T-Bank Deposit */}
            <div className="bg-gray-800 rounded-[27px] p-4 h-[78px] flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-ibm text-2xl font-normal leading-[110%] mb-1">
                  200 000,00 ₽
                </div>
                <div className="text-white font-ibm text-base font-normal leading-[110%]">
                  Вклад Т-банк
                </div>
              </div>
              <div className="text-white font-ibm text-sm font-normal leading-[110%]">
                9% годовых
              </div>
            </div>

            {/* Alfa Deposit */}
            <div className="bg-red-500 rounded-[27px] p-4 h-[78px] flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-ibm text-2xl font-normal leading-[110%] mb-1">
                  300 000,00 ₽
                </div>
                <div className="text-white font-ibm text-base font-normal leading-[110%]">
                  Вклад Альфа
                </div>
              </div>
              <div className="text-white font-ibm text-sm font-normal leading-[110%]">
                13% годовых
              </div>
            </div>
          </div>

          {/* New Joint Goal Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[32px] p-6 mb-6 animate-slide-in-up-very-slow border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-blue-700 font-ibm text-lg font-semibold leading-[110%]">
                    Новая совместная цель
                  </div>
                </div>
                <div className="text-gray-600 font-ibm text-sm font-normal leading-[110%] mb-4">
                  Настройте новую цель с указанием суммы, срока и участников
                </div>
                <button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-ibm text-sm font-semibold px-4 py-2 rounded-[20px] shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Создать цель
                </button>
              </div>
              <div className="text-blue-500 font-ibm text-2xl font-bold ml-4">
                +
              </div>
            </div>
          </div>

          {/* Automation Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[32px] p-6 animate-slide-in-up-very-slow border border-blue-100 shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="text-blue-700 font-ibm text-xl font-semibold leading-[110%] mb-2">
                Автоматизация пополнения вкладов
              </div>
              <div className="text-gray-600 font-ibm text-sm font-normal leading-[110%] mb-6">
                Настройте автоматические переводы для регулярного пополнения
              </div>
              <button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-ibm text-base font-semibold leading-[110%] px-8 py-3 rounded-[24px] mb-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Настроить автоперевод
              </button>
              <div className="text-blue-600 font-ibm text-sm font-medium leading-[110%] cursor-pointer hover:text-blue-700 transition-colors">
                Подробнее →
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositsPage;
