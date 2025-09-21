import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import BankCardStack from '../components/BankCardStack';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Background Elements */}
      <div className="relative overflow-hidden">
        {/* Background blur */}
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"></div>
        
        {/* Background gradient */}
        <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full blur-3xl" 
             style={{ 
               background: 'radial-gradient(circle, rgba(239, 49, 36, 0.3) 0%, rgba(255, 255, 255, 0.1) 70%)'
             }}>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-full shadow-lg"></div>
            <div>
              <div className="text-white font-ibm text-sm font-normal leading-[110%]">
                Мультибанк
              </div>
              <div className="text-white font-ibm text-lg font-normal leading-[110%]">
                {user?.firstName || 'Иван'} {user?.lastName || 'Иванов'}
              </div>
            </div>
          </div>
          <div className="w-8 h-8 bg-white rounded-full shadow-lg"></div>
        </div>
      </div>

      {/* Total Budget */}
      <div className="relative z-10 text-center px-6 py-4">
        <div className="text-black font-ibm text-lg font-normal leading-[110%] mb-2">
          Общий бюджет
        </div>
        <div className="text-black font-ibm text-3xl font-normal leading-[110%] tracking-[-0.02em]">
          18 404,7 ₽
        </div>
      </div>

            {/* Bank Cards Stack */}
            <div className="relative z-10 px-2 py-4">
              <BankCardStack />
            </div>

      {/* Add Bank Button */}
      <div className="relative z-10 text-center py-8">
        <div className="text-black font-ibm text-base font-normal leading-[110%] inline-flex items-center space-x-2">
          <span className="font-manrope text-lg">+</span>
          <span>Добавить банк</span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="relative z-10 px-6 py-4">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => navigate('/transfer')}
            className="h-12 border border-black rounded-[22px] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <div className="text-black font-ibm text-xs font-normal leading-[110%] text-center">
              Между банками
            </div>
          </button>
          
          <button className="h-12 border border-black rounded-[22px] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
            <div className="text-black font-ibm text-xs font-normal leading-[110%] text-center">
              Перевести по телефону
            </div>
          </button>
          
          <button className="h-12 border border-black rounded-[22px] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
            <div className="text-black font-ibm text-xs font-normal leading-[110%] text-center">
              Вклады и кредиты
            </div>
          </button>
          
          <button className="h-12 border border-black rounded-[22px] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
            <div className="text-black font-ibm text-xs font-normal leading-[110%] text-center">
              Планирование бюджета
            </div>
          </button>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="relative z-10 px-6 py-4">
        <div className="border border-black rounded-[27px] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-black font-manrope font-medium text-lg leading-[110%]">
              Аналитика | Октябрь
            </div>
            <div className="text-black font-ibm font-light text-xs leading-[110%] cursor-pointer hover:underline">
              Подробнее
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Income */}
            <div className="flex items-center justify-between">
              <div className="w-3/4 h-4 bg-green-400/60 rounded-[10px]"></div>
              <div className="text-black font-ibm font-normal text-xs leading-[110%] ml-3">
                120 473 ₽
              </div>
            </div>
            
            {/* Expenses */}
            <div className="flex items-center justify-between">
              <div className="w-1/2 h-4 bg-red-400/60 rounded-[10px]"></div>
              <div className="text-black font-ibm font-normal text-xs leading-[110%] ml-3">
                54 986 ₽
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operations Section */}
      <div className="relative z-10 px-6 py-4">
        <div className="border border-black rounded-[27px] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-black font-ibm font-medium text-lg leading-[110%]">
              Операции | Октябрь
            </div>
            <div className="text-black font-ibm font-light text-xs leading-[110%] cursor-pointer hover:underline">
              Подробнее
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-black font-ibm font-light text-xs leading-[110%] mb-3">
              Сегодня
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="text-black font-ibm font-normal text-base leading-[110%]">
                  Surf Coffee
                </div>
                <div className="text-black font-ibm font-light text-xs leading-[110%]">
                  Кофейни
                </div>
              </div>
              <div className="text-black font-ibm font-normal text-base leading-[110%]">
                -660 ₽
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Transactions Button */}
      <div className="relative z-10 px-6 py-4">
        <div className="border border-black rounded-[15px_15px_17px_17px] bg-white p-6">
          <div className="text-black font-ibm font-normal text-xs leading-[110%] mb-4">
            Все транзакции
          </div>
          
          <div className="border border-black rounded-[32px] bg-white p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 border border-black rounded-[30px]"></div>
            <div className="flex-1">
              <div className="text-black font-manrope font-light text-lg leading-[110%]">
                Surf Coffee
              </div>
              <div className="text-black font-manrope font-light text-xs leading-[110%]">
                Кофейни
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

export default DashboardPage;