import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Edit } from 'lucide-react';
import useBalanceStore from '../stores/balanceStore';
import { useTelegramUser } from '../hooks/useTelegramUser';

// Функция для форматирования имени: первое слово целиком, второе - одна буква с точкой
const formatDisplayName = (fullName) => {
  if (!fullName) return '';
  const nameParts = fullName.trim().split(' ');
  if (nameParts.length === 1) return nameParts[0];
  if (nameParts.length === 2) {
    return `${nameParts[0]} ${nameParts[1][0]}.`;
  }
  // Если больше двух слов, берем первое и последнее
  return `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`;
};

// CSS анимации
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInFromRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes sequentialFadeIn {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-sequential-1 {
    animation: sequentialFadeIn 0.8s ease-out 0.1s both;
  }
  
  .animate-sequential-2 {
    animation: sequentialFadeIn 0.8s ease-out 0.3s both;
  }
  
  .animate-sequential-3 {
    animation: sequentialFadeIn 0.8s ease-out 0.5s both;
  }
`;

// Добавляем стили в head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const CardAnalyticsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cardId } = useParams();
  const { getFormattedBalance, bankBalances } = useBalanceStore();
  const telegramUser = useTelegramUser();
  
  // Вычисляем общий бюджет динамически с реактивным обновлением
  const totalBudget = useMemo(() => {
    const total = Object.values(bankBalances).reduce((sum, balance) => sum + balance, 0);
    return `${total.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;
  }, [bankBalances]);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(() => {
    // Устанавливаем правильный индекс на основе cardId
    if (cardId === 'alfa') return 0; // Красная карта - первая
    if (cardId === 'vtb') return 1;  // Синяя карта - вторая  
    if (cardId === 'tbank') return 2; // Черная карта - третья
    return 0; // По умолчанию
  });
  const [isDragging, setIsDragging] = useState(false);
  const [showOtherBankModal, setShowOtherBankModal] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);

  const cards = [
    {
      id: 'alfa',
      name: 'Альфа-Банк',
      balance: getFormattedBalance('alfa'),
      color: '#EF3124',
      logo: 'A',
      cardNumber: '5294 **** **** 2498',
      operations: [
        { name: 'Surf Coffee', category: 'Кофейня', amount: '- 650 ₽', icon: '☕', iconColor: 'bg-blue-100', textColor: 'text-blue-600' },
        { name: 'Lime', category: 'Одежда и обувь', amount: '- 7 350 ₽', icon: 'LIME', iconColor: 'bg-green-100', textColor: 'text-green-600' },
        { name: 'Магнит', category: 'Продукты', amount: '- 1 158 ₽', icon: 'M', iconColor: 'bg-red-100', textColor: 'text-red-600' }
      ],
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
      balance: getFormattedBalance('vtb'),
      color: '#0055BC',
      logo: 'ВТБ',
      cardNumber: '3568 **** **** 8362',
      operations: [
        { name: 'Перевод', category: 'Переводы', amount: '- 150 ₽', icon: 'ВТБ', iconColor: 'bg-blue-100', textColor: 'text-blue-600' },
        { name: 'Яндекс.Такси', category: 'Такси', amount: '- 578 ₽', icon: 'YT', iconColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
        { name: 'Самокат', category: 'Продукты', amount: '- 1 150 ₽', icon: 'S', iconColor: 'bg-pink-100', textColor: 'text-pink-600' }
      ],
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
      balance: getFormattedBalance('tbank'),
      color: '#2F2F2F',
      logo: 'T',
      cardNumber: '6352 **** **** 9837',
      operations: [
        { name: 'Магнит', category: 'Продукты', amount: '- 78 ₽', icon: 'M', iconColor: 'bg-red-100', textColor: 'text-red-600' },
        { name: 'MTC', category: 'Мобильная связь', amount: '- 600 ₽', icon: 'MTC', iconColor: 'bg-red-100', textColor: 'text-red-600' },
        { name: 'WB', category: 'Переводы', amount: '- 3 157 ₽', icon: 'WB', iconColor: 'bg-purple-100', textColor: 'text-purple-600' }
      ],
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

  // Обновляем индекс карты при изменении cardId
  useEffect(() => {
    console.log('CardAnalyticsPage - cardId:', cardId);
    if (cardId) {
      if (cardId === 'alfa') {
        console.log('Setting cardIndex to 0 (Альфа-Банк)');
        setCurrentCardIndex(0);
      } else if (cardId === 'vtb') {
        console.log('Setting cardIndex to 1 (ВТБ)');
        setCurrentCardIndex(1);
      } else if (cardId === 'tbank') {
        console.log('Setting cardIndex to 2 (T-Банк)');
        setCurrentCardIndex(2);
      }
    }
  }, [cardId]);

  const currentCard = cards[currentCardIndex];
  
  console.log('CardAnalyticsPage - currentCardIndex:', currentCardIndex);
  console.log('CardAnalyticsPage - currentCard:', currentCard?.name);
  console.log('CardAnalyticsPage - previous card exists:', currentCardIndex > 0);
  console.log('CardAnalyticsPage - previous card data:', currentCardIndex > 0 ? cards[currentCardIndex - 1] : 'none');
  console.log('CardAnalyticsPage - next card exists:', currentCardIndex < cards.length - 1);
  console.log('CardAnalyticsPage - cards length:', cards.length);

  // Swipe handlers
  const handleStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    startX.current = clientX;
    currentX.current = clientX;
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    currentX.current = clientX;
    const deltaX = currentX.current - startX.current;
    
    // Ограничиваем свайп в зависимости от направления и доступных карт
    // Анимация шатания удалена
  };

  const handleEnd = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaX = currentX.current - startX.current;
    
    // Если свайп больше 100px влево - переключаем на следующую карту
    if (deltaX < -100 && currentCardIndex < cards.length - 1 && cards[currentCardIndex + 1]) {
      setCurrentCardIndex(currentCardIndex + 1);
      setAnimationKey(prev => prev + 1); // Перезапускаем анимацию
    }
    // Если свайп больше 100px вправо - переключаем на предыдущую карту
    else if (deltaX > 100 && currentCardIndex > 0 && cards[currentCardIndex - 1]) {
      setCurrentCardIndex(currentCardIndex - 1);
      setAnimationKey(prev => prev + 1); // Перезапускаем анимацию
    }
    
    setIsDragging(false);
  };


  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            {currentCard?.name || 'Аналитика карт'}
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Card Stack with Swipe */}
      <div className="relative w-full flex justify-center pb-8 px-4 min-[360px]:pb-10 min-[360px]:px-6 min-[375px]:pb-12 min-[375px]:px-8 sm:px-10 md:px-12 overflow-hidden">
        
        <div 
          className="relative h-[160px] w-[280px] min-[370px]:h-[170px] min-[370px]:w-[300px] min-[375px]:h-[180px] min-[375px]:w-[320px] min-[380px]:h-[190px] min-[380px]:w-[340px] sm:h-[210px] sm:w-[380px] md:h-[230px] md:w-[420px] lg:h-[250px] lg:w-[460px] xl:h-[270px] xl:w-[500px] 2xl:h-[290px] 2xl:w-[540px] cursor-pointer select-none overflow-visible flex justify-center"
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          style={{}}
        >
          
          {/* Current card (center) */}
          <div 
            className="w-[280px] h-[160px] min-[370px]:w-[300px] min-[370px]:h-[170px] min-[375px]:w-[320px] min-[375px]:h-[180px] min-[380px]:w-[340px] min-[380px]:h-[190px] sm:w-[380px] sm:h-[210px] md:w-[420px] md:h-[230px] lg:w-[460px] lg:h-[250px] xl:w-[500px] xl:h-[270px] 2xl:w-[540px] 2xl:h-[290px] rounded-[27px] z-30"
            style={{ 
              backgroundColor: currentCard.color,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0px 4px 3.8px 1px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div className="p-6 h-full flex flex-col justify-between">
              {/* Top section */}
              <div className="flex items-center justify-between">
                {currentCard.id === 'alfa' && (
                  <div className="flex flex-col">
                    <div className="text-white text-2xl font-bold font-ibm">{currentCard.logo}</div>
                    <div className="w-8 h-0.5 bg-white mt-1"></div>
                  </div>
                )}
                {currentCard.id === 'vtb' && (
                  <div className="text-white text-2xl font-bold font-ibm">{currentCard.logo}</div>
                )}
                {currentCard.id === 'tbank' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center">
                      <span className="text-gray-800 font-bold text-sm">{currentCard.logo}</span>
                    </div>
                    <div className="text-white text-2xl font-bold font-ibm">БАНК</div>
                  </div>
                )}
                {currentCard.id === 'unconfirmed' && (
                  <div className="text-white text-2xl font-bold font-ibm">{currentCard.logo}</div>
                )}
                <div className="text-white text-lg font-normal font-ibm">{currentCard.balance}</div>
              </div>
              
              {/* Bottom section */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <div className="text-white text-sm font-normal font-ibm mb-1">{telegramUser.displayName}</div>
                  <div className="text-white text-sm font-normal font-ibm">{currentCard.cardNumber}</div>
                </div>
                <div className="text-white text-lg font-bold">МИР</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card Indicators */}
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {cards.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentCardIndex 
                    ? 'bg-gray-600 w-6 sm:w-8 md:w-10' 
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        
      </div>

      {/* Total Budget Section */}
      <div className="px-4 min-[360px]:px-6 min-[375px]:px-8 sm:px-10 md:px-12 py-2 min-[360px]:py-3 min-[375px]:py-4 sm:py-4 md:py-5">
        <div className="text-center">
          <div className="text-black font-ibm text-sm min-[360px]:text-base sm:text-lg md:text-xl font-normal leading-[110%]">
            Общий бюджет {totalBudget}
          </div>
        </div>
      </div>

      {/* Transfer Section */}
      <div key={`transfer-${animationKey}`} className="px-4 min-[360px]:px-6 min-[375px]:px-8 sm:px-10 md:px-12 py-2 min-[360px]:py-3 min-[375px]:py-4 sm:py-4 md:py-5 animate-sequential-1">
        <div className="text-black font-ibm text-lg sm:text-xl md:text-2xl font-medium leading-[110%] mb-4 sm:mb-5 md:mb-6">
          Перевод между своими банками
        </div>
        <div className="flex space-x-2 min-[360px]:space-x-3 min-[375px]:space-x-3 sm:space-x-4 md:space-x-5 overflow-x-auto scrollbar-hide">
          {/* Показываем только карты, которые не являются текущей выбранной картой */}
          {cards.map((card, index) => {
            if (card.id === currentCard.id) return null; // Пропускаем текущую карту
            
            return (
              <div key={card.id} className="flex-shrink-0 w-[70px] h-[80px] min-[360px]:w-[75px] min-[360px]:h-[85px] min-[370px]:w-[80px] min-[370px]:h-[90px] min-[375px]:w-[85px] min-[375px]:h-[95px] min-[380px]:w-[90px] min-[380px]:h-[100px] sm:w-[100px] sm:h-[110px] md:w-[110px] md:h-[120px] rounded-[22px] flex flex-col items-center justify-center p-1" style={{ backgroundColor: card.color }}>
                {card.id === 'vtb' && (
                  <div className="text-white text-sm font-bold font-ibm mb-1">ВТБ</div>
                )}
                {card.id === 'tbank' && (
                  <div className="flex items-center space-x-1 mb-1">
                    <div className="w-4 h-4 bg-yellow-400 rounded flex items-center justify-center">
                      <span className="text-gray-800 font-bold text-xs">T</span>
                    </div>
                    <div className="text-white text-sm font-bold font-ibm">БАНК</div>
                  </div>
                )}
                {card.id === 'alfa' && (
                  <div className="text-white text-sm font-bold font-ibm mb-1">A</div>
                )}
                <div className="text-white text-sm font-normal font-ibm">{formatDisplayName(telegramUser.displayName)}</div>
              </div>
            );
          })}
          
          {/* Other Bank Card */}
          <div 
            className="flex-shrink-0 w-[70px] h-[80px] min-[360px]:w-[75px] min-[360px]:h-[85px] min-[370px]:w-[80px] min-[370px]:h-[90px] min-[375px]:w-[85px] min-[375px]:h-[95px] min-[380px]:w-[90px] min-[380px]:h-[100px] sm:w-[100px] sm:h-[110px] md:w-[110px] md:h-[120px] bg-gray-200 rounded-[22px] flex flex-col items-center justify-center p-1 cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => setShowOtherBankModal(true)}
          >
            <div className="text-gray-600 text-sm font-normal font-ibm text-center">Другой банк</div>
          </div>
        </div>
      </div>

      {/* Operations Section */}
      <div key={`operations-${animationKey}`} className="px-4 min-[360px]:px-6 min-[375px]:px-8 sm:px-10 md:px-12 py-2 min-[360px]:py-3 min-[375px]:py-4 sm:py-4 md:py-5 animate-sequential-2">
        <div className="flex items-center justify-between mb-3 min-[360px]:mb-4 min-[375px]:mb-4 sm:mb-5 md:mb-6">
          <div className="text-black font-ibm text-base min-[360px]:text-lg sm:text-xl md:text-2xl font-medium leading-[110%]">
            Операции
          </div>
          <div className="text-gray-500 font-ibm text-xs min-[360px]:text-sm sm:text-base md:text-lg font-normal leading-[110%]">
            Посмотреть все
          </div>
        </div>
        <div className="text-gray-500 font-ibm text-sm min-[360px]:text-base sm:text-lg md:text-xl font-medium leading-[110%] mb-3 min-[360px]:mb-4 min-[375px]:mb-4 sm:mb-5 md:mb-6">
          Сегодня
        </div>
        
        {/* Operations List */}
        <div className="space-y-3">
          {currentCard.isUnconfirmed ? (
            <div className="text-center py-8">
              <div className="text-gray-500 font-ibm text-lg mb-4">Подтвердите карту в банке</div>
              <button 
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-ibm font-medium rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => alert('Переход в банк для подтверждения карты')}
              >
                Перейти в банк
              </button>
            </div>
          ) : (
            currentCard.operations.map((operation, index) => (
            <div key={index} className="relative w-full max-w-[335px] h-[45px] min-[360px]:max-w-[350px] min-[360px]:h-[47px] min-[375px]:max-w-[365px] min-[375px]:h-[49px] sm:max-w-[350px] sm:h-[55px] md:max-w-[380px] md:h-[60px] bg-gray-100 rounded-[32px] flex items-center px-4 min-[360px]:px-5 min-[375px]:px-5 mx-auto">
              <div className={`w-[35px] h-[35px] min-[360px]:w-[38px] min-[360px]:h-[38px] min-[375px]:w-[42px] min-[375px]:h-[42px] sm:w-[60px] sm:h-[55px] md:w-[65px] md:h-[60px] ${operation.iconColor} rounded-[30px] flex items-center justify-center mr-3 min-[360px]:mr-4`}>
                <div className={`${operation.textColor} font-bold text-xs min-[360px]:text-sm`}>
                  {operation.icon}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-base font-medium leading-[110%]">{operation.name}</div>
                <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">{operation.category}</div>
              </div>
              <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-base font-medium leading-[110%]">{operation.amount}</div>
            </div>
            ))
          )}
        </div>
      </div>


      {/* Bottom padding for mobile */}
      <div className="h-20"></div>

      {/* Other Bank Modal */}
      {showOtherBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-200 rounded-2xl p-6 mx-4 max-w-sm w-full">
            <div className="text-center">
              <div className="text-lg font-semibold font-ibm text-gray-800 mb-4">
                Здесь будут отображены банки
              </div>
              <button
                onClick={() => setShowOtherBankModal(false)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium font-ibm hover:bg-blue-600 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardAnalyticsPage;
