import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Edit } from 'lucide-react';

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
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const cards = [
    {
      id: 'vtb',
      name: 'ВТБ',
      balance: '2 876,87 ₽',
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
      balance: '4 983,43 ₽',
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
    },
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
    }
  ];

  // Получаем индекс выбранной карты из state или используем 0 по умолчанию
  useEffect(() => {
    if (location.state?.cardIndex !== undefined) {
      setCurrentCardIndex(location.state.cardIndex);
    }
  }, [location.state]);

  const currentCard = cards[currentCardIndex];

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
    if (deltaX < 0 && currentCardIndex < cards.length - 1) {
      // Свайп влево - показываем следующую карту
      setSwipeOffset(Math.abs(deltaX));
    } else if (deltaX > 0 && currentCardIndex > 0) {
      // Свайп вправо - показываем предыдущую карту
      setSwipeOffset(deltaX);
    }
  };

  const handleEnd = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaX = currentX.current - startX.current;
    
    // Если свайп больше 100px влево - переключаем на следующую карту
    if (deltaX < -100 && currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
    // Если свайп больше 100px вправо - переключаем на предыдущую карту
    else if (deltaX > 100 && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
    
    setIsDragging(false);
    setSwipeOffset(0);
  };

  const handleBackToCards = () => {
    navigate('/my-cards');
  };

  return (
    <div className="min-h-screen bg-white animate-slide-up">
      {/* Header */}
      <div className="relative z-10 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBackToCards}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-black font-ibm text-lg font-normal leading-[110%] text-center">
            Аналитика карт
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Card Stack with Swipe */}
      <div className="relative w-full flex justify-center pb-8 px-2 sm:px-4 overflow-hidden">
        <div 
          className="relative h-[180px] sm:h-[200px] md:h-[220px] w-[320px] sm:w-[400px] md:w-[550px] cursor-pointer select-none overflow-visible"
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          style={{ transform: `translateX(${swipeOffset * 0.1}px)` }}
        >
          {/* Previous card (left) */}
          {currentCardIndex > 0 && (
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[240px] sm:w-[280px] md:w-[320px] h-[180px] sm:h-[200px] md:h-[220px] rounded-[20px] sm:rounded-[24px] md:rounded-[27px] z-10 shadow-lg"
              style={{ 
                backgroundColor: cards[currentCardIndex - 1].color,
                transform: `translateX(calc(-50% - 40px))`,
                opacity: 0.7,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div className="p-4 sm:p-5 md:p-6 h-full flex flex-col justify-between">
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  {cards[currentCardIndex - 1].id === 'vtb' && (
                    <div className="w-8 sm:w-10 md:w-12 h-3 sm:h-4 bg-white rounded"></div>
                  )}
                  {cards[currentCardIndex - 1].id === 'tbank' && (
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-yellow-400 rounded flex items-center justify-center">
                        <span className="text-gray-800 font-bold text-xs sm:text-sm">{cards[currentCardIndex - 1].logo}</span>
                      </div>
                      <div className="text-white text-sm sm:text-base md:text-lg font-bold font-ibm">БАНК</div>
                    </div>
                  )}
                  {cards[currentCardIndex - 1].id === 'alfa' && (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-red-500 font-bold text-sm sm:text-base md:text-lg">{cards[currentCardIndex - 1].logo}</span>
                    </div>
                  )}
                </div>
                
                {/* Balance */}
                <div className="text-white text-sm sm:text-base md:text-lg font-normal font-ibm text-right">
                  {cards[currentCardIndex - 1].balance}
                </div>
                
                {/* Card Number */}
                <div className="text-white text-xs sm:text-sm font-normal font-ibm text-right">
                  {cards[currentCardIndex - 1].cardNumber}
                </div>
              </div>
            </div>
          )}
          
          {/* Current card (center) */}
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[240px] sm:w-[280px] md:w-[320px] h-[180px] sm:h-[200px] md:h-[220px] rounded-[20px] sm:rounded-[24px] md:rounded-[27px] z-30"
            style={{ 
              backgroundColor: currentCard.color,
              transform: `translateX(-50%)`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div className="p-6 h-full flex flex-col justify-between">
              {/* Top Row */}
              <div className="flex items-center justify-between">
                {currentCard.id === 'vtb' && (
                  <div className="w-8 sm:w-10 md:w-12 h-3 sm:h-4 bg-white rounded"></div>
                )}
                {currentCard.id === 'tbank' && (
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-yellow-400 rounded flex items-center justify-center">
                      <span className="text-gray-800 font-bold text-xs sm:text-sm">{currentCard.logo}</span>
                    </div>
                    <div className="text-white text-base sm:text-lg md:text-xl font-bold font-ibm">БАНК</div>
                  </div>
                )}
                {currentCard.id === 'alfa' && (
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-red-500 font-bold text-sm sm:text-base md:text-lg">{currentCard.logo}</span>
                    </div>
                    <div className="text-white text-base sm:text-lg md:text-xl font-bold font-ibm">БАНК</div>
                  </div>
                )}
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white/20 rounded-full border border-white/30 flex items-center justify-center">
                  <Edit size={10} className="text-white sm:w-3 sm:h-3" />
                </div>
              </div>
              
              {/* Balance */}
              <div className="text-white text-lg sm:text-xl md:text-2xl font-normal font-ibm text-right">{currentCard.balance}</div>
              
              {/* Card Number */}
              <div className="text-white text-sm sm:text-base font-normal font-ibm text-right">{currentCard.cardNumber}</div>
            </div>
          </div>
          
          {/* Next card (right) */}
          {currentCardIndex < cards.length - 1 && (
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[240px] sm:w-[280px] md:w-[320px] h-[180px] sm:h-[200px] md:h-[220px] rounded-[20px] sm:rounded-[24px] md:rounded-[27px] z-20 shadow-lg"
              style={{ 
                backgroundColor: cards[currentCardIndex + 1].color,
                transform: `translateX(calc(-50% + 40px))`,
                opacity: 0.6,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div className="p-4 sm:p-5 md:p-6 h-full flex flex-col justify-between">
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  {cards[currentCardIndex + 1].id === 'vtb' && (
                    <div className="w-8 sm:w-10 md:w-12 h-3 sm:h-4 bg-white rounded"></div>
                  )}
                  {cards[currentCardIndex + 1].id === 'tbank' && (
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-yellow-400 rounded flex items-center justify-center">
                        <span className="text-gray-800 font-bold text-xs sm:text-sm">{cards[currentCardIndex + 1].logo}</span>
                      </div>
                      <div className="text-white text-sm sm:text-base md:text-lg font-bold font-ibm">БАНК</div>
                    </div>
                  )}
                  {cards[currentCardIndex + 1].id === 'alfa' && (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-red-500 font-bold text-sm sm:text-base md:text-lg">{cards[currentCardIndex + 1].logo}</span>
                    </div>
                  )}
                </div>
                
                {/* Balance */}
                <div className="text-white text-sm sm:text-base md:text-lg font-normal font-ibm text-right">
                  {cards[currentCardIndex + 1].balance}
                </div>
                
                {/* Card Number */}
                <div className="text-white text-xs sm:text-sm font-normal font-ibm text-right">
                  {cards[currentCardIndex + 1].cardNumber}
                </div>
              </div>
            </div>
          )}
        </div>
        
      </div>

      {/* Analytics */}
      <div className="px-6 py-4">
        <div 
          className="bg-white w-full rounded-3xl p-6 shadow-lg border border-gray-200"
          style={{
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: 'fadeInUp 0.4s ease-out'
          }}
        >
          {/* Card Header */}
          <div 
            className="flex items-center space-x-3 mb-6"
            style={{ animation: 'slideInFromLeft 0.5s ease-out' }}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                backgroundColor: currentCard.color,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <span className="text-white text-xl font-bold">{currentCard.logo}</span>
            </div>
            <div>
              <div className="text-base sm:text-lg font-semibold font-ibm">{currentCard.name}</div>
              <div className="text-xs sm:text-sm text-gray-500 font-ibm">{currentCard.cardNumber}</div>
            </div>
          </div>

          {/* Balance */}
          <div 
            className="text-center mb-6"
            style={{ animation: 'fadeInUp 0.6s ease-out' }}
          >
            <div className="text-xl sm:text-2xl md:text-3xl font-bold font-ibm">{currentCard.balance}</div>
            <div className="text-xs sm:text-sm text-gray-500 font-ibm">Текущий баланс</div>
          </div>

          {/* Analytics Summary */}
          <div 
            className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6"
            style={{ animation: 'slideInFromRight 0.7s ease-out' }}
          >
            <div className="text-center">
              <div className="text-sm sm:text-base md:text-lg font-semibold text-green-600 font-ibm">{currentCard.analytics.income}</div>
              <div className="text-xs text-gray-500 font-ibm">Доходы</div>
            </div>
            <div className="text-center">
              <div className="text-sm sm:text-base md:text-lg font-semibold text-red-600 font-ibm">{currentCard.analytics.expenses}</div>
              <div className="text-xs text-gray-500 font-ibm">Расходы</div>
            </div>
            <div className="text-center">
              <div className="text-sm sm:text-base md:text-lg font-semibold text-blue-600 font-ibm">{currentCard.analytics.transactions}</div>
              <div className="text-xs text-gray-500 font-ibm">Операций</div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="text-base sm:text-lg font-semibold font-ibm mb-4">Расходы по категориям</div>
            <div className="space-y-3">
              {currentCard.analytics.categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: [
                          '#3B82F6', '#10B981', '#F59E0B', '#EF4444'
                        ][index % 4]
                      }}
                    ></div>
                    <div className="text-xs sm:text-sm font-ibm">{category.name}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 sm:w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${category.percentage}%`,
                          backgroundColor: [
                            '#3B82F6', '#10B981', '#F59E0B', '#EF4444'
                          ][index % 4]
                        }}
                      ></div>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold font-ibm w-12 sm:w-16 text-right">{category.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-20"></div>
    </div>
  );
};

export default CardAnalyticsPage;
