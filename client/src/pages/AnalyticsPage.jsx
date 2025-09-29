import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTestCardsStore from '../stores/testCardsStore';
import useTransfersStore from '../stores/transfersStore';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { getAllCards } = useTestCardsStore();
  const { getAllTransfers } = useTransfersStore();
  
  // Получаем все последние переводы
  const recentTransfers = getAllTransfers();
  
  // Функция для форматирования перевода
  const formatTransfer = (transfer) => {
    const bankNames = {
      'alfa': 'Альфа-Банк',
      'vtb': 'ВТБ', 
      'tbank': 'T-Банк'
    };
    
    const fromBankName = bankNames[transfer.fromBank] || transfer.fromBank;
    const toBankName = bankNames[transfer.toBank] || transfer.toBank;
    
    if (transfer.type === 'internal') {
      return {
        title: `Перевод между банками`,
        subtitle: `${fromBankName} → ${toBankName}`,
        amount: `- ${transfer.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`,
        icon: '🔄',
        iconBg: 'bg-blue-500'
      };
    } else {
      return {
        title: `Перевод ${transfer.recipient}`,
        subtitle: `С ${fromBankName}`,
        amount: `- ${transfer.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`,
        icon: '👤',
        iconBg: 'bg-green-500'
      };
    }
  };
  
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Месяц');
  const [selectedBank, setSelectedBank] = useState('Мультибанк');
  const [selectedTransfer, setSelectedTransfer] = useState('Переводы');
  const [selectedCard, setSelectedCard] = useState(null);

  // Базовые карты
  const baseCards = [
    {
      id: 'alfa',
      name: 'Альфа-Банк',
      balance: '10 544,40 ₽',
      color: '#EF3124',
      logo: 'A',
      cardNumber: '5294 **** **** 2498',
      analytics: {
        income: '125 600 ₽',
        expenses: '89 200 ₽',
        transactions: 67,
        categories: [
          { name: 'Бизнес', amount: '25 000 ₽', percentage: 28 },
          { name: 'Инвестиции', amount: '18 500 ₽', percentage: 21 },
          { name: 'Личные', amount: '22 300 ₽', percentage: 25 },
          { name: 'Остальное', amount: '23 400 ₽', percentage: 26 }
        ]
      }
    },
    {
      id: 'vtb',
      name: 'ВТБ',
      balance: '45 230 ₽',
      color: '#0055BC',
      logo: 'ВТБ',
      cardNumber: '3568 **** **** 8362',
      analytics: {
        income: '45 230 ₽',
        expenses: '12 450 ₽',
        transactions: 23,
        categories: [
          { name: 'Продукты', amount: '3 200 ₽', percentage: 25 },
          { name: 'Транспорт', amount: '2 800 ₽', percentage: 22 },
          { name: 'Развлечения', amount: '1 900 ₽', percentage: 15 },
          { name: 'Остальное', amount: '4 550 ₽', percentage: 38 }
        ]
      }
    },
    {
      id: 'tbank',
      name: 'T-Банк',
      balance: '67 890 ₽',
      color: '#2F2F2F',
      logo: 'T',
      cardNumber: '6352 **** **** 9837',
      analytics: {
        income: '67 890 ₽',
        expenses: '28 340 ₽',
        transactions: 45,
        categories: [
          { name: 'Покупки', amount: '8 500 ₽', percentage: 30 },
          { name: 'Кафе', amount: '5 200 ₽', percentage: 18 },
          { name: 'Услуги', amount: '4 800 ₽', percentage: 17 },
          { name: 'Остальное', amount: '9 840 ₽', percentage: 35 }
        ]
      }
    }
  ];

  // Объединяем базовые карты с тестовыми
  const testCards = getAllCards();
  const allCards = [...baseCards, ...testCards];

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setSelectedBank(card.name);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 100px)' }}>
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
            Аналитика
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="px-2 min-[360px]:px-3 min-[375px]:px-4 pb-3 min-[360px]:pb-4 animate-slide-in-down">
        <div className="flex gap-1 min-[360px]:gap-2 min-[375px]:gap-3">
          {/* Month Dropdown */}
          <div className="relative flex-1">
            <button 
              onClick={() => setIsMonthOpen(!isMonthOpen)}
              className="bg-gray-200 rounded-[26px] px-2 min-[360px]:px-3 min-[375px]:px-4 py-1.5 min-[360px]:py-2 min-[375px]:py-2.5 flex items-center justify-center space-x-0.5 min-[360px]:space-x-1 w-full"
            >
              <span className="text-black font-ibm text-xs min-[360px]:text-sm min-[375px]:text-base">{selectedMonth}</span>
              <svg className={`w-3 h-3 min-[360px]:w-4 min-[360px]:h-4 transition-transform ${isMonthOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isMonthOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  {selectedMonth !== 'Месяц' && (
                    <button 
                      onClick={() => { setSelectedMonth('Месяц'); setIsMonthOpen(false); }}
                      className="w-full text-left px-3 min-[360px]:px-4 py-2 text-black font-ibm text-sm min-[360px]:text-base hover:bg-gray-200"
                    >
                      Месяц
                    </button>
                  )}
                  {selectedMonth !== 'Квартал' && (
                    <button 
                      onClick={() => { setSelectedMonth('Квартал'); setIsMonthOpen(false); }}
                      className="w-full text-left px-3 min-[360px]:px-4 py-2 text-black font-ibm text-sm min-[360px]:text-base hover:bg-gray-200"
                    >
                      Квартал
                    </button>
                  )}
                  {selectedMonth !== 'Год' && (
                    <button 
                      onClick={() => { setSelectedMonth('Год'); setIsMonthOpen(false); }}
                      className="w-full text-left px-3 min-[360px]:px-4 py-2 text-black font-ibm text-sm min-[360px]:text-base hover:bg-gray-200"
                    >
                      Год
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bank Dropdown */}
          <div className="relative flex-1">
            <button 
              onClick={() => setIsBankOpen(!isBankOpen)}
              className="bg-gray-200 rounded-[26px] px-2 min-[360px]:px-3 min-[375px]:px-4 py-1.5 min-[360px]:py-2 min-[375px]:py-2.5 flex items-center justify-center space-x-0.5 min-[360px]:space-x-1 w-full"
            >
              <span className="text-black font-ibm text-xs min-[360px]:text-sm min-[375px]:text-base">{selectedBank}</span>
              <svg className={`w-3 h-3 min-[360px]:w-4 min-[360px]:h-4 transition-transform ${isBankOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isBankOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  {selectedBank !== 'Мультибанк' && (
                    <button 
                      onClick={() => { setSelectedBank('Мультибанк'); setSelectedCard(null); setIsBankOpen(false); }}
                      className="w-full text-left px-3 min-[360px]:px-4 py-2 text-black font-ibm text-sm min-[360px]:text-base hover:bg-gray-200"
                    >
                      Мультибанк
                    </button>
                  )}
                  {allCards.map((card) => (
                    selectedBank !== card.name && (
                      <button 
                        key={card.id}
                        onClick={() => { handleCardSelect(card); setIsBankOpen(false); }}
                        className="w-full text-left px-3 min-[360px]:px-4 py-2 text-black font-ibm text-sm min-[360px]:text-base hover:bg-gray-200"
                      >
                        <span>{card.name}</span>
                      </button>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Transfer Dropdown */}
          <div className="relative flex-1">
            <button 
              onClick={() => setIsTransferOpen(!isTransferOpen)}
              className="bg-gray-200 rounded-[26px] px-2 min-[360px]:px-3 min-[375px]:px-4 py-1.5 min-[360px]:py-2 min-[375px]:py-2.5 flex items-center justify-center space-x-0.5 min-[360px]:space-x-1 w-full"
            >
              <span className="text-black font-ibm text-xs min-[360px]:text-sm min-[375px]:text-base">{selectedTransfer}</span>
              <svg className={`w-3 h-3 min-[360px]:w-4 min-[360px]:h-4 transition-transform ${isTransferOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isTransferOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  {selectedTransfer !== 'Переводы' && (
                    <button 
                      onClick={() => { setSelectedTransfer('Переводы'); setIsTransferOpen(false); }}
                      className="w-full text-left px-3 min-[360px]:px-4 py-2 text-black font-ibm text-sm min-[360px]:text-base hover:bg-gray-200"
                    >
                      Переводы
                    </button>
                  )}
                  {selectedTransfer !== 'Без перевода' && (
                    <button 
                      onClick={() => { setSelectedTransfer('Без перевода'); setIsTransferOpen(false); }}
                      className="w-full text-left px-3 min-[360px]:px-4 py-2 text-black font-ibm text-sm min-[360px]:text-base hover:bg-gray-200"
                    >
                      Без перевода
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Donut Chart and Summary */}
      <div className="px-3 min-[360px]:px-4 min-[375px]:px-5 pb-4 min-[360px]:pb-6 animate-fade-in">
        <div className="relative flex justify-center">
          {/* Donut Chart */}
          <div className="relative w-[150px] h-[150px] min-[360px]:w-[170px] min-[360px]:h-[170px] min-[375px]:w-[187px] min-[375px]:h-[187px] flex items-center justify-center">
            {/* Chart segments */}
            <div 
              className="absolute inset-0 rounded-full animate-donut-entrance" 
              style={{ 
                background: 'conic-gradient(from 0deg, #3C82F6 0deg 72deg, #F59E0C 72deg 144deg, #EF4444 144deg 216deg, #844FD9 216deg 288deg, #12B981 288deg 360deg)'
              }}
            ></div>
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-black font-ibm text-lg min-[360px]:text-xl min-[375px]:text-2xl font-medium leading-[90%]">52 500 ₽</div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex justify-between mt-4 min-[360px]:mt-6">
          <div className="text-center">
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">85 884 ₽</div>
            <div className="text-gray-600 font-ibm text-xs min-[360px]:text-sm font-medium leading-[110%]">Доходы</div>
          </div>
          <div className="text-center">
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">52 500 ₽</div>
            <div className="text-gray-600 font-ibm text-xs min-[360px]:text-sm font-medium leading-[110%]">Расходы</div>
          </div>
          <div className="text-center">
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">45 884 ₽</div>
            <div className="text-gray-600 font-ibm text-xs min-[360px]:text-sm font-medium leading-[110%]">Операций</div>
          </div>
        </div>
      </div>

      {/* Expenses by Category */}
      <div className="px-3 min-[360px]:px-4 min-[375px]:px-5 pb-4 min-[360px]:pb-6 mt-2 min-[360px]:mt-3 animate-slide-in-down">
        <div className="text-black font-ibm text-base min-[360px]:text-lg font-medium leading-[110%] mb-3 min-[360px]:mb-4">Расходы по категориям</div>
        <div className="grid grid-cols-2 gap-3 min-[360px]:gap-4">
          <div className="flex items-center space-x-2 min-[360px]:space-x-3">
            <div className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 bg-blue-500 rounded-full"></div>
            <span className="text-black font-ibm text-sm min-[360px]:text-base font-medium">Переводы</span>
          </div>
          <div className="flex items-center space-x-2 min-[360px]:space-x-3">
            <div className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 bg-orange-500 rounded-full"></div>
            <span className="text-black font-ibm text-sm min-[360px]:text-base font-medium">Продукты</span>
          </div>
          <div className="flex items-center space-x-2 min-[360px]:space-x-3">
            <div className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 bg-red-500 rounded-full"></div>
            <span className="text-black font-ibm text-sm min-[360px]:text-base font-medium">Транспорт</span>
          </div>
          <div className="flex items-center space-x-2 min-[360px]:space-x-3">
            <div className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 bg-purple-500 rounded-full"></div>
            <span className="text-black font-ibm text-sm min-[360px]:text-base font-medium">Развлечения</span>
          </div>
          <div className="flex items-center space-x-2 min-[360px]:space-x-3">
            <div className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 bg-green-500 rounded-full"></div>
            <span className="text-black font-ibm text-sm min-[360px]:text-base font-medium">Остальное</span>
          </div>
        </div>
      </div>

      {/* Operations Section */}
      <div className="px-3 min-[360px]:px-4 min-[375px]:px-5 pb-4 min-[360px]:pb-6 mt-2 min-[360px]:mt-3 animate-scale-in">
        <div className="flex items-center justify-between mb-3 min-[360px]:mb-4">
          <div className="text-black font-ibm text-base min-[360px]:text-lg font-medium leading-[110%]">Операции</div>
          <div className="text-gray-500 font-ibm text-xs min-[360px]:text-sm font-normal leading-[110%]">Посмотреть все</div>
        </div>
        <div className="text-gray-500 font-ibm text-sm min-[360px]:text-base font-medium leading-[110%] mb-3 min-[360px]:mb-4">Сегодня</div>
        
        {/* Operations List */}
        <div className="space-y-2 min-[360px]:space-y-3">
          {/* Последние переводы */}
          {recentTransfers.map((transfer, index) => {
            const formatted = formatTransfer(transfer);
            return (
              <div key={transfer.id} className="bg-gray-100 rounded-[32px] flex items-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-3 animate-slide-in-down">
                <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 bg-white rounded-full flex items-center justify-center mr-3 min-[360px]:mr-4 border border-gray-300">
                  <div className={`w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 ${formatted.iconBg} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold text-xs min-[360px]:text-sm">{formatted.icon}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">{formatted.title}</div>
                  <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">{formatted.subtitle}</div>
                </div>
                <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">{formatted.amount}</div>
              </div>
            );
          })}
          
          {/* Магнит */}
          <div className="bg-gray-100 rounded-[32px] flex items-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-3 animate-slide-in-down">
            <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 bg-white rounded-full flex items-center justify-center mr-3 min-[360px]:mr-4 border border-gray-300">
              <div className="w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs min-[360px]:text-sm">M</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">Магнит</div>
              <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">Продукты</div>
            </div>
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">- 78 ₽</div>
          </div>

          {/* Яндекс.Такси */}
          <div className="bg-gray-100 rounded-[32px] flex items-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-3 animate-slide-in-down">
            <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 bg-white rounded-full flex items-center justify-center mr-3 min-[360px]:mr-4 border border-gray-300">
              <div className="w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">Я</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">Яндекс.Такси</div>
              <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">Такси</div>
            </div>
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">- 578 ₽</div>
          </div>

          {/* Самокат */}
          <div className="bg-gray-100 rounded-[32px] flex items-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-3 animate-slide-in-down">
            <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 bg-white rounded-full flex items-center justify-center mr-3 min-[360px]:mr-4 border border-gray-300">
              <div className="w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs min-[360px]:text-sm">S</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">Самокат</div>
              <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">Продукты</div>
            </div>
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">- 1 150 ₽</div>
          </div>
        </div>
      </div>

      {/* Subscriptions Section */}
      <div className="px-3 min-[360px]:px-4 min-[375px]:px-5 pb-4 min-[360px]:pb-6 mt-2 min-[360px]:mt-3 animate-slide-in-down">
        <div className="flex items-center justify-between mb-3 min-[360px]:mb-4">
          <div className="text-black font-ibm text-base min-[360px]:text-lg font-medium leading-[110%]">Подписки</div>
          <div className="text-gray-500 font-ibm text-xs min-[360px]:text-sm font-normal leading-[110%]">Посмотреть все</div>
        </div>
        
        {/* Subscriptions List */}
        <div className="space-y-2 min-[360px]:space-y-3">
          {/* Яндекс.Плюс */}
          <div className="bg-gray-100 rounded-[32px] flex items-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-3 animate-slide-in-down">
            <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 bg-white rounded-full flex items-center justify-center mr-3 min-[360px]:mr-4 border border-gray-300">
              <div className="w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">Я+</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">Яндекс.Плюс</div>
              <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">Подписки</div>
            </div>
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">- 399 ₽</div>
          </div>

          {/* Кинотеатр okko */}
          <div className="bg-gray-100 rounded-[32px] flex items-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-3 animate-slide-in-down">
            <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 bg-white rounded-full flex items-center justify-center mr-3 min-[360px]:mr-4 border border-gray-300">
              <div className="w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">ok</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">Кинотеатр okko</div>
              <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">Подписки</div>
            </div>
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">- 199 ₽</div>
          </div>
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-20"></div>
    </div>
  );
};

export default AnalyticsPage;
