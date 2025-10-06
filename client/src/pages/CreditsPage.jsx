import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreditsPage = () => {
  const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Кредиты
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
            background: 'radial-gradient(61.6% 28.45% at 50.13% -1.11%, rgba(217, 213, 0, 0.096) 32.69%, rgba(217, 213, 0, 0.192) 86.54%)'
          }}
        >
          <div className="text-center">
            <div className="text-black font-ibm text-base font-normal leading-[110%] mb-2">
              Осталось до погашения кредитов
            </div>
            <div className="text-black font-ibm text-3xl font-medium leading-[110%]">
              80 000,00 ₽
            </div>
          </div>
        </div>

        {/* White Content Area */}
        <div className="bg-white rounded-b-[100px] -mt-6 relative z-10 px-5 pt-8 pb-6 animate-fade-in">
          {/* Status Message */}
          <div className="text-center mb-8 animate-slide-in-up">
            <div className="text-black font-ibm text-sm font-normal leading-[110%]">
              Статус: балансируй кредиты — живи спокойно
            </div>
          </div>

          {/* Credit Cards */}
          <div className="space-y-4 animate-slide-in-up">
            {/* VTB Credit */}
            <div className="bg-blue-600 rounded-[27px] p-4 h-[91px] flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="text-white font-ibm text-sm font-normal leading-[110%]">
                  Сумма кредита
                </div>
                <div className="text-white font-ibm text-sm font-normal leading-[110%]">
                  Кредит ВТБ
                </div>
              </div>
              <div className="text-white font-ibm text-2xl font-normal leading-[110%] text-center">
                500 000,00 ₽
              </div>
              <div className="text-white font-ibm text-xs font-normal leading-[110%] text-center">
                Следующий платеж 30 сентября: 12 000,00 ₽
              </div>
            </div>

            {/* T-Bank Credit */}
            <div className="bg-gray-800 rounded-[27px] p-4 h-[91px] flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="text-white font-ibm text-sm font-normal leading-[110%]">
                  Сумма кредита
                </div>
                <div className="text-white font-ibm text-sm font-normal leading-[110%]">
                  Кредит Т-банк
                </div>
              </div>
              <div className="text-white font-ibm text-2xl font-normal leading-[110%] text-center">
                100 000,00 ₽
              </div>
              <div className="text-white font-ibm text-xs font-normal leading-[110%] text-center">
                Следующий платеж 30 сентября: 3 000,00 ₽
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;
