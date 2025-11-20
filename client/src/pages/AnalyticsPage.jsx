import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useTestCardsStore from '../stores/testCardsStore';
import useTransfersStore from '../stores/transfersStore';
import InfoPanel from '../components/InfoPanel';
import PremiumBlock from '../components/PremiumBlock';
import { usePageInfo } from '../hooks/usePageInfo';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { Info } from 'lucide-react';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const { getAllCards } = useTestCardsStore();
  const { getAllTransfers } = useTransfersStore();
  
  // Прокрутка наверх при монтировании
  useScrollToTop();
  
  // Получаем все последние переводы
  const allTransfers = getAllTransfers();
  
  // Функция для форматирования перевода
  const formatTransfer = (transfer) => {
    const bankNames = {
      'abank': 'ABank',
      'vbank': 'VBank', 
      'sbank': 'SBank'
    };
    
    const fromBankName = bankNames[transfer.fromBank] || transfer.fromBank;
    const toBankName = bankNames[transfer.toBank] || transfer.toBank;
    
    // Находим карту для отображения
    const fromCard = allCards.find(card => card.id === transfer.fromBank);
    
    if (transfer.type === 'internal') {
      return {
        title: `Перевод между банками`,
        subtitle: `${fromBankName} → ${toBankName}`,
        amount: `- ${transfer.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`,
        icon: '',
        iconBg: 'bg-blue-500',
        cardInfo: fromCard ? {
          name: fromCard.name,
          color: fromCard.color,
          logo: fromCard.logo,
          cardNumber: fromCard.cardNumber
        } : null
      };
    } else {
      return {
        title: `Перевод ${transfer.recipient}`,
        subtitle: `С ${fromBankName}`,
        amount: `- ${transfer.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`,
        icon: '',
        iconBg: 'bg-green-500',
        cardInfo: fromCard ? {
          name: fromCard.name,
          color: fromCard.color,
          logo: fromCard.logo,
          cardNumber: fromCard.cardNumber
        } : null
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
      id: 'vbank',
      name: 'VBank',
      balance: '45 230 ₽',
      color: '#0055BC',
      logo: 'VBank',
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
      id: 'abank',
      name: 'ABank',
      balance: '10 544,40 ₽',
      color: '#EF3124',
      logo: 'ABank',
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
      id: 'sbank',
      name: 'SBank',
      balance: '67 890 ₽',
      color: '#00A859',
      logo: 'SBank',
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

  // Фильтруем переводы в зависимости от выбранной карты
  const recentTransfers = selectedCard 
    ? allTransfers.filter(transfer => transfer.fromBank === selectedCard.id)
    : allTransfers;

  // Функция для определения карты операции
  const getOperationCard = (operationType) => {
    const cardMapping = {
      'magnit': 'abank',      // Магнит - ABank
      'yandex_taxi': 'vbank',  // Яндекс.Такси - VBank
      'samokat': 'sbank',    // Самокат - SBank
      'yandex_plus': 'abank', // Яндекс.Плюс - ABank
      'okko': 'vbank',         // Кинотеатр okko - VBank
      'vbank_plus': 'vbank',   // VBank+ - VBank
      'static_transfer': 'abank' // Статический перевод - ABank
    };
    return cardMapping[operationType];
  };

  // Фильтруем статические операции в зависимости от выбранной карты
  const shouldShowOperation = (operationType) => {
    if (!selectedCard) return true; // Показываем все операции если выбран Мультибанк
    return getOperationCard(operationType) === selectedCard.id;
  };

  // Функция для расчета затрат по выбранной карте
  const calculateSpendingByCard = () => {
    let totalSpending = 0;
    
    // Суммируем затраты из переводов только если выбрано "Переводы"
    if (selectedTransfer === 'Переводы') {
      recentTransfers.forEach(transfer => {
        totalSpending += transfer.amount;
      });
    }
    
    // Суммируем затраты из статических операций с учетом фильтра по месяцам
    const staticOperations = [
      { type: 'magnit', amount: 78 },
      { type: 'yandex_taxi', amount: 578 },
      { type: 'samokat', amount: 1150 },
      { type: 'yandex_plus', amount: 399 },
      { type: 'okko', amount: 199 },
      { type: 'vbank_plus', amount: 299 },
      { type: 'static_transfer', amount: 1500 }
    ];
    
    // Применяем множитель в зависимости от выбранного периода
    let periodMultiplier = 1;
    if (selectedMonth === 'Квартал') {
      periodMultiplier = 3;
    } else if (selectedMonth === 'Год') {
      periodMultiplier = 12;
    }
    
    staticOperations.forEach(operation => {
      if (shouldShowOperation(operation.type)) {
        // Исключаем статический перевод, если выбрано "Без перевода"
        if (operation.type === 'static_transfer' && selectedTransfer === 'Без перевода') {
          return;
        }
        totalSpending += operation.amount * periodMultiplier;
      }
    });
    
    return totalSpending;
  };

  const totalSpending = calculateSpendingByCard();

  // Данные о страховых полисах (для расчета ПДН)
  const insurancePolicies = [
    {
      id: 'osago-1',
      type: 'OSAGO',
      company: 'Ингосстрах',
      monthlyPayment: 4500
    },
    {
      id: 'dms-1',
      type: 'DMS',
      company: 'ВСК',
      monthlyPayment: 3500
    }
  ];

  // Расчет ПДН с учетом страховок
  const totalInsurancePayments = insurancePolicies.reduce((sum, policy) => sum + (policy.monthlyPayment || 0), 0);
  const monthlyIncome = 120473; // Доходы из статистики
  const monthlyExpenses = totalSpending;
  const pdn = monthlyIncome - monthlyExpenses - totalInsurancePayments;

  // AI рекомендации по страховкам
  const insuranceRecommendations = [
    {
      type: 'optimization',
      message: 'КАСКО продлён автоматически — сэкономьте 3 200 ₽, выбрав тариф "Город"'
    },
    {
      type: 'suggestion',
      message: 'У вас ипотека в Сбере — оформите страхование жизни в Ингосстрахе со скидкой 20%'
    },
    {
      type: 'suggestion',
      message: 'Вы ездите 15 000 км/год — КАСКО дешевле на 18%'
    }
  ];

  // Функция для генерации градиента кольца
  const getDonutGradient = () => {
    if (selectedTransfer === 'Без перевода') {
      // Только 4 цвета без синего (переводы): Продукты, Транспорт, Развлечения, Остальное
      return 'conic-gradient(from 0deg, #F59E0C 0deg 90deg, #EF4444 90deg 180deg, #844FD9 180deg 270deg, #12B981 270deg 360deg)';
    } else {
      // Полный градиент с синим цветом (5 цветов)
      return 'conic-gradient(from 0deg, #3C82F6 0deg 72deg, #F59E0C 72deg 144deg, #EF4444 144deg 216deg, #844FD9 216deg 288deg, #12B981 288deg 360deg)';
    }
  };


  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setSelectedBank(card.name);
  };

  // Закрытие всех выпадающих списков при клике вне их
  const handleOutsideClick = () => {
    setIsMonthOpen(false);
    setIsBankOpen(false);
    setIsTransferOpen(false);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }} onClick={handleOutsideClick}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Аналитика
          </div>
          <button
            onClick={() => setShowInfoPanel(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </div>

      <PremiumBlock featureName="Аналитика по всем банкам">
      {/* Filter Buttons */}
      <div className="px-2 min-[360px]:px-3 min-[375px]:px-4 pb-3 min-[360px]:pb-4 relative z-50">
        <div className="flex gap-1 min-[360px]:gap-2 min-[375px]:gap-3">
          {/* Month Dropdown */}
          <div className="relative flex-1">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMonthOpen(!isMonthOpen); }}
              className="bg-gray-200 rounded-[26px] px-2 min-[360px]:px-3 min-[375px]:px-4 py-1.5 min-[360px]:py-2 min-[375px]:py-2.5 flex items-center justify-center space-x-0.5 min-[360px]:space-x-1 w-full relative z-50"
            >
              <span className="text-black font-ibm text-xs min-[360px]:text-sm min-[375px]:text-base">{selectedMonth}</span>
              <svg className={`w-3 h-3 min-[360px]:w-4 min-[360px]:h-4 transition-transform ${isMonthOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isMonthOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-[999999] pointer-events-auto" style={{ position: 'absolute', zIndex: 999999 }} onClick={(e) => e.stopPropagation()}>
                <div className="py-2">
                  <button 
                    onClick={() => { setSelectedMonth('Месяц'); setIsMonthOpen(false); }}
                    className={`w-full text-left px-3 min-[360px]:px-4 py-2 text-black font-ibm text-sm min-[360px]:text-base hover:bg-gray-200 cursor-pointer transition-colors pointer-events-auto select-none active:bg-gray-300 active:bg-gray-300 ${selectedMonth === 'Месяц' ? 'bg-blue-100' : ''}`}
                  >
                    Месяц
                  </button>
                  <button 
                    onClick={() => { setSelectedMonth('Квартал'); setIsMonthOpen(false); }}
                    className={`w-full text-left px-3 min-[360px]:px-4 py-2 text-black font-ibm text-sm min-[360px]:text-base hover:bg-gray-200 cursor-pointer transition-colors pointer-events-auto select-none active:bg-gray-300 ${selectedMonth === 'Квартал' ? 'bg-blue-100' : ''}`}
                  >
                    Квартал
                  </button>
                  <button 
                    onClick={() => { setSelectedMonth('Год'); setIsMonthOpen(false); }}
                    className={`w-full text-left px-3 min-[360px]:px-4 py-2 text-black font-ibm text-sm min-[360px]:text-base hover:bg-gray-200 cursor-pointer transition-colors pointer-events-auto select-none active:bg-gray-300 ${selectedMonth === 'Год' ? 'bg-blue-100' : ''}`}
                  >
                    Год
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bank Dropdown */}
          <div className="relative flex-1">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsBankOpen(!isBankOpen); }}
              className="bg-gray-200 rounded-[26px] px-2 min-[360px]:px-3 min-[375px]:px-4 py-1.5 min-[360px]:py-2 min-[375px]:py-2.5 flex items-center justify-center space-x-0.5 min-[360px]:space-x-1 w-full relative z-50"
            >
              <span className="text-black font-ibm text-xs min-[360px]:text-sm min-[375px]:text-base">{selectedBank}</span>
              <svg className={`w-3 h-3 min-[360px]:w-4 min-[360px]:h-4 transition-transform ${isBankOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isBankOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-[999999] pointer-events-auto" style={{ position: 'absolute', zIndex: 999999 }} onClick={(e) => e.stopPropagation()}>
                <div className="py-2">
                  <button 
                    onClick={() => { setSelectedBank('Мультибанк'); setSelectedCard(null); setIsBankOpen(false); }}
                    className={`w-full text-left px-3 min-[360px]:px-4 py-2 text-black font-ibm text-sm min-[360px]:text-base hover:bg-gray-200 cursor-pointer transition-colors pointer-events-auto select-none active:bg-gray-300 ${selectedBank === 'Мультибанк' ? 'bg-blue-100' : ''}`}
                  >
                    Мультибанк
                  </button>
                  {allCards.map((card) => (
                    <button 
                      key={card.id}
                      onClick={() => { handleCardSelect(card); setIsBankOpen(false); }}
                      className={`w-full text-left px-3 min-[360px]:px-4 py-2 text-black font-ibm text-sm min-[360px]:text-base hover:bg-gray-200 cursor-pointer transition-colors pointer-events-auto select-none active:bg-gray-300 ${selectedBank === card.name ? 'bg-blue-100' : ''}`}
                    >
                      <span>{card.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Transfer Dropdown */}
          <div className="relative flex-1">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsTransferOpen(!isTransferOpen); }}
              className="bg-gray-200 rounded-[26px] px-2 min-[360px]:px-3 min-[375px]:px-4 py-1.5 min-[360px]:py-2 min-[375px]:py-2.5 flex items-center justify-center space-x-0.5 min-[360px]:space-x-1 w-full relative z-50"
            >
              <span className="text-black font-ibm text-xs min-[360px]:text-sm min-[375px]:text-base">{selectedTransfer}</span>
              <svg className={`w-3 h-3 min-[360px]:w-4 min-[360px]:h-4 transition-transform ${isTransferOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isTransferOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-[999999] pointer-events-auto" style={{ position: 'absolute', zIndex: 999999 }} onClick={(e) => e.stopPropagation()}>
                <div className="py-2">
                  <button 
                    onClick={() => { setSelectedTransfer('Переводы'); setIsTransferOpen(false); }}
                    className={`w-full text-left px-3 min-[360px]:px-4 py-2 text-black font-ibm text-sm min-[360px]:text-base hover:bg-gray-200 cursor-pointer transition-colors pointer-events-auto select-none active:bg-gray-300 ${selectedTransfer === 'Переводы' ? 'bg-blue-100' : ''}`}
                  >
                    Переводы
                  </button>
                  <button 
                    onClick={() => { setSelectedTransfer('Без перевода'); setIsTransferOpen(false); }}
                    className={`w-full text-left px-3 min-[360px]:px-4 py-2 text-black font-ibm text-sm min-[360px]:text-base hover:bg-gray-200 cursor-pointer transition-colors pointer-events-auto select-none active:bg-gray-300 ${selectedTransfer === 'Без перевода' ? 'bg-blue-100' : ''}`}
                  >
                    Без перевода
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Donut Chart and Summary */}
      <div className="px-3 min-[360px]:px-4 min-[375px]:px-5 pb-4 min-[360px]:pb-6 relative z-10">
        <div className="relative flex justify-center">
          {/* Donut Chart */}
          <div className="relative w-[150px] h-[150px] min-[360px]:w-[170px] min-[360px]:h-[170px] min-[375px]:w-[187px] min-[375px]:h-[187px] flex items-center justify-center">
            {/* Chart segments */}
            <div 
              className="absolute inset-0 rounded-full animate-donut-entrance" 
              style={{ 
                background: getDonutGradient()
              }}
            ></div>
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-black font-ibm text-lg min-[360px]:text-xl min-[375px]:text-2xl font-medium leading-[90%]">{totalSpending.toLocaleString('ru-RU')} ₽</div>
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
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">{totalSpending.toLocaleString('ru-RU')} ₽</div>
            <div className="text-gray-600 font-ibm text-xs min-[360px]:text-sm font-medium leading-[110%]">Расходы</div>
          </div>
          <div className="text-center">
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">45 884 ₽</div>
            <div className="text-gray-600 font-ibm text-xs min-[360px]:text-sm font-medium leading-[110%]">Операций</div>
          </div>
        </div>

      </div>


      {/* Expenses by Category */}
      <div className="px-3 min-[360px]:px-4 min-[375px]:px-5 pb-4 min-[360px]:pb-6 mt-2 min-[360px]:mt-3">
        <div className="text-black font-ibm text-base min-[360px]:text-lg font-medium leading-[110%] mb-3 min-[360px]:mb-4">Расходы по категориям</div>
        <div className="grid grid-cols-2 gap-3 min-[360px]:gap-4">
          {selectedTransfer === 'Переводы' && (
          <div className="flex items-center space-x-2 min-[360px]:space-x-3">
            <div className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 bg-blue-500 rounded-full"></div>
            <span className="text-black font-ibm text-sm min-[360px]:text-base font-medium">Переводы</span>
          </div>
          )}
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
      <div className="px-3 min-[360px]:px-4 min-[375px]:px-5 pb-4 min-[360px]:pb-6 mt-2 min-[360px]:mt-3">
        <div className="flex items-center justify-between mb-3 min-[360px]:mb-4">
          <div className="text-black font-ibm text-base min-[360px]:text-lg font-medium leading-[110%]">Операции</div>
          <div className="text-gray-500 font-ibm text-xs min-[360px]:text-sm font-normal leading-[110%]">Посмотреть все</div>
        </div>
        <div className="text-gray-500 font-ibm text-sm min-[360px]:text-base font-medium leading-[110%] mb-3 min-[360px]:mb-4">Сегодня</div>
        
        {/* Operations List */}
        <div className="space-y-2 min-[360px]:space-y-3">
          {/* Последние переводы */}
          {selectedTransfer === 'Переводы' && recentTransfers.map((transfer, index) => {
            const formatted = formatTransfer(transfer);
            return (
              <div key={transfer.id} className="bg-gray-100 rounded-[32px] flex items-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-3">
                <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 bg-white rounded-full flex items-center justify-center mr-3 min-[360px]:mr-4 border border-gray-300">
                  <div className={`w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 ${formatted.iconBg} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold text-xs min-[360px]:text-sm">{formatted.icon}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">{formatted.title}</div>
                    {formatted.cardInfo && (
                      <div className="ml-2">
                        <div 
                          className="w-12 h-8 rounded-md flex items-center justify-between px-1 shadow-sm"
                          style={{ 
                            background: `linear-gradient(135deg, ${formatted.cardInfo.color} 0%, ${formatted.cardInfo.color}CC 100%)`
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">{formatted.cardInfo.logo}</span>
                            </div>
                          </div>
                          <div className="text-white text-xs font-medium">
                            {formatted.cardInfo.cardNumber.split(' ')[0]}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">{formatted.subtitle}</div>
                </div>
                <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">{formatted.amount}</div>
              </div>
            );
          })}

          {/* Статический перевод */}
          {shouldShowOperation('static_transfer') && selectedTransfer === 'Переводы' && (
          <div className="bg-gray-100 rounded-[32px] flex items-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-3">
            <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 bg-white rounded-full flex items-center justify-center mr-3 min-[360px]:mr-4 border border-gray-300">
              <div className="w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 bg-blue-500 rounded-full flex items-center justify-center">
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">Перевод другу</div>
                <div className="ml-2">
                  <div 
                    className="w-12 h-8 rounded-md flex items-center justify-between px-1 shadow-sm"
                    style={{ 
                      background: 'linear-gradient(135deg, #3B82F6 0%, #3B82F6CC 100%)'
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">А</span>
                      </div>
                    </div>
                    <div className="text-white text-xs font-medium">5294</div>
                  </div>
                </div>
              </div>
              <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">Перевод</div>
            </div>
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">- 1 500 ₽</div>
          </div>
          )}
          
          {/* Магнит */}
          {shouldShowOperation('magnit') && (
          <div className="bg-gray-100 rounded-[32px] flex items-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-3">
            <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 bg-white rounded-full flex items-center justify-center mr-3 min-[360px]:mr-4 border border-gray-300">
              <div className="w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs min-[360px]:text-sm">M</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">Магнит</div>
                <div className="ml-2">
                  <div 
                    className="w-12 h-8 rounded-md flex items-center justify-between px-1 shadow-sm"
                    style={{ 
                      background: 'linear-gradient(135deg, #EF3124 0%, #EF3124CC 100%)'
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">А</span>
                      </div>
                    </div>
                    <div className="text-white text-xs font-medium">5294</div>
                  </div>
                </div>
              </div>
              <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">Продукты</div>
            </div>
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">- 78 ₽</div>
          </div>
          )}

          {/* Яндекс.Такси */}
          {shouldShowOperation('yandex_taxi') && (
          <div className="bg-gray-100 rounded-[32px] flex items-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-3">
            <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 bg-white rounded-full flex items-center justify-center mr-3 min-[360px]:mr-4 border border-gray-300">
              <div className="w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">Я</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">Яндекс.Такси</div>
                <div className="ml-2">
                  <div 
                    className="w-12 h-8 rounded-md flex items-center justify-between px-1 shadow-sm"
                    style={{ 
                      background: 'linear-gradient(135deg, #0055BC 0%, #0055BCCC 100%)'
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">В</span>
                      </div>
                    </div>
                    <div className="text-white text-xs font-medium">3568</div>
                  </div>
                </div>
              </div>
              <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">Такси</div>
            </div>
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">- 578 ₽</div>
          </div>
          )}

          {/* Самокат */}
          {shouldShowOperation('samokat') && (
          <div className="bg-gray-100 rounded-[32px] flex items-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-3">
            <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 bg-white rounded-full flex items-center justify-center mr-3 min-[360px]:mr-4 border border-gray-300">
              <div className="w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs min-[360px]:text-sm">S</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">Самокат</div>
                <div className="ml-2">
                  <div 
                    className="w-12 h-8 rounded-md flex items-center justify-between px-1 shadow-sm"
                    style={{ 
                      background: 'linear-gradient(135deg, #2F2F2F 0%, #2F2F2FCC 100%)'
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">T</span>
                      </div>
                    </div>
                    <div className="text-white text-xs font-medium">6352</div>
                  </div>
                </div>
              </div>
              <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">Продукты</div>
            </div>
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">- 1 150 ₽</div>
          </div>
          )}
        </div>
      </div>

      {/* Subscriptions Section */}
      <div className="px-3 min-[360px]:px-4 min-[375px]:px-5 pb-4 min-[360px]:pb-6 mt-2 min-[360px]:mt-3">
        <div className="flex items-center justify-between mb-3 min-[360px]:mb-4">
          <div className="text-black font-ibm text-base min-[360px]:text-lg font-medium leading-[110%]">Подписки</div>
          <div className="text-gray-500 font-ibm text-xs min-[360px]:text-sm font-normal leading-[110%]">Посмотреть все</div>
        </div>
        
        {/* Subscriptions List */}
        <div className="space-y-2 min-[360px]:space-y-3">
          {/* Яндекс.Плюс */}
          {shouldShowOperation('yandex_plus') && (
          <div className="bg-gray-100 rounded-[32px] flex items-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-3">
            <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 bg-white rounded-full flex items-center justify-center mr-3 min-[360px]:mr-4 border border-gray-300">
              <div className="w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">Я+</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">Яндекс.Плюс</div>
                <div className="ml-2">
                  <div 
                    className="w-12 h-8 rounded-md flex items-center justify-between px-1 shadow-sm"
                    style={{ 
                      background: 'linear-gradient(135deg, #EF3124 0%, #EF3124CC 100%)'
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">А</span>
                      </div>
                    </div>
                    <div className="text-white text-xs font-medium">5294</div>
                  </div>
                </div>
              </div>
              <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">Подписки</div>
            </div>
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">- 399 ₽</div>
          </div>
          )}

          {/* Кинотеатр okko */}
          {shouldShowOperation('okko') && (
          <div className="bg-gray-100 rounded-[32px] flex items-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-3">
            <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 bg-white rounded-full flex items-center justify-center mr-3 min-[360px]:mr-4 border border-gray-300">
              <div className="w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">ok</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">Кинотеатр okko</div>
                <div className="ml-2">
                  <div 
                    className="w-12 h-8 rounded-md flex items-center justify-between px-1 shadow-sm"
                    style={{ 
                      background: 'linear-gradient(135deg, #0055BC 0%, #0055BCCC 100%)'
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">В</span>
                      </div>
                    </div>
                    <div className="text-white text-xs font-medium">3568</div>
                  </div>
                </div>
              </div>
              <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">Подписки</div>
            </div>
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">- 199 ₽</div>
          </div>
          )}

          {/* VBank+ */}
          {shouldShowOperation('vbank_plus') && (
          <div className="bg-gray-100 rounded-[32px] flex items-center px-3 min-[360px]:px-4 py-2 min-[360px]:py-3">
            <div className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 bg-white rounded-full flex items-center justify-center mr-3 min-[360px]:mr-4 border border-gray-300">
              <div className="w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">V+</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">VBank+</div>
                <div className="ml-2">
                  <div 
                    className="w-12 h-8 rounded-md flex items-center justify-between px-1 shadow-sm"
                    style={{ 
                      background: 'linear-gradient(135deg, #0055BC 0%, #0055BCCC 100%)'
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">В</span>
                      </div>
                    </div>
                    <div className="text-white text-xs font-medium">3568</div>
                  </div>
                </div>
              </div>
              <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">Подписки</div>
            </div>
            <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-lg font-medium leading-[110%]">- 299 ₽</div>
          </div>
          )}
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-20"></div>

      </PremiumBlock>

      {/* Info Panel */}
      <InfoPanel
        isOpen={showInfoPanel}
        onClose={() => setShowInfoPanel(false)}
        title={pageInfo.title}
        content={pageInfo.content}
        color={pageInfo.color}
      />
    </div>
  );
};

export default AnalyticsPage;
