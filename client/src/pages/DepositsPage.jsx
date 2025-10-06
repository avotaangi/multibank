import React from 'react';
import { useNavigate } from 'react-router-dom';

const DepositsPage = () => {
  const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Вклады
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 pb-4">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 mb-6 animate-slide-in-down-very-slow shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-gray-600 font-ibm text-sm font-normal leading-[110%] mb-2">
              Сумма вкладов
            </div>
            <div className="text-black font-ibm text-3xl font-medium leading-[110%] mb-4">
              600 000,00 ₽
            </div>
            <div className="text-gray-600 font-ibm text-sm font-normal leading-[110%]">
              Средняя доходность: 12% годовых
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in-very-slow">
          {/* Status Message */}
          <div className="text-center mb-8 animate-slide-in-up-very-slow">
            <div className="text-black font-ibm text-sm font-normal leading-[110%]">
              Статус: сейчас ты управляешь своими деньгами, а не они тобой
            </div>
          </div>

          {/* Deposit Cards */}
          <div className="space-y-3 mb-6 animate-slide-in-up-very-slow">
            {/* VTB Deposit */}
            <div className="bg-blue-600 rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-white font-ibm text-xl font-medium leading-[110%] mb-1">
                    100 000,00 ₽
                  </div>
                  <div className="text-white font-ibm text-sm font-normal leading-[110%]">
                    Вклад ВТБ
                  </div>
                </div>
                <div className="text-white font-ibm text-sm font-medium leading-[110%]">
                  9% годовых
                </div>
              </div>
            </div>

            {/* T-Bank Deposit */}
            <div className="bg-gray-800 rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-white font-ibm text-xl font-medium leading-[110%] mb-1">
                    200 000,00 ₽
                  </div>
                  <div className="text-white font-ibm text-sm font-normal leading-[110%]">
                    Вклад Т-банк
                  </div>
                </div>
                <div className="text-white font-ibm text-sm font-medium leading-[110%]">
                  9% годовых
                </div>
              </div>
            </div>

            {/* Alfa Deposit */}
            <div className="bg-red-500 rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-white font-ibm text-xl font-medium leading-[110%] mb-1">
                    300 000,00 ₽
                  </div>
                  <div className="text-white font-ibm text-sm font-normal leading-[110%]">
                    Вклад Альфа
                  </div>
                </div>
                <div className="text-white font-ibm text-sm font-medium leading-[110%]">
                  13% годовых
                </div>
              </div>
            </div>
          </div>


          {/* Automation Section */}
          <div className="bg-white rounded-2xl p-6 animate-slide-in-up-very-slow shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="text-black font-ibm text-xl font-medium leading-[110%] mb-2">
                Автоматизация пополнения вкладов
              </div>
              <div className="text-gray-600 font-ibm text-sm font-normal leading-[110%] mb-6">
                Настройте автоматические переводы для регулярного пополнения
              </div>
              <button className="bg-blue-500 text-white font-ibm text-base font-medium px-8 py-3 rounded-xl mb-3 hover:bg-blue-600 transition-colors">
                Настроить автоперевод
              </button>
              <div className="text-blue-600 font-ibm text-sm font-medium leading-[110%] cursor-pointer hover:text-blue-700 transition-colors">
                Подробнее →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-20"></div>
    </div>
  );
};

export default DepositsPage;
