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
          className="relative rounded-t-[100px] pt-8 pb-6 px-6 mb-6 animate-slide-in-down"
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
        <div className="bg-white rounded-b-[100px] -mt-6 relative z-10 px-5 pt-8 pb-6 animate-fade-in">
          {/* Status Message */}
          <div className="text-center mb-8 animate-slide-in-up">
            <div className="text-black font-ibm text-sm font-normal leading-[110%]">
              Статус: сейчас ты управляешь своими деньгами, а не они тобой
            </div>
          </div>

          {/* Deposit Cards */}
          <div className="space-y-4 mb-6 animate-slide-in-up">
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
          <div className="bg-gray-100 rounded-[27px] p-4 mb-4 animate-slide-in-up">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-red-500 font-ibm text-lg font-medium leading-[110%] mb-2">
                  Новая совместная цель
                </div>
                <div className="text-black font-ibm text-base font-normal leading-[110%]">
                  Настройте новую цель с указанием суммы, срока и участников
                </div>
              </div>
              <div className="text-red-500 font-inter text-xl font-normal">
                +
              </div>
            </div>
          </div>

          {/* Automation Section */}
          <div className="bg-gray-100 rounded-[29px] p-4 animate-slide-in-up">
            <div className="text-center mb-4">
              <div className="text-red-500 font-ibm text-lg font-medium leading-[110%] mb-4">
                Автоматизация пополнения вкладов
              </div>
              <button className="bg-red-500 text-white font-ibm text-base font-medium leading-[110%] px-6 py-2 rounded-[27px] mb-2">
                Настроить автоперевод
              </button>
              <div className="text-black font-ibm text-sm font-normal leading-[110%]">
                Подробнее
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositsPage;
