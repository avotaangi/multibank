import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Edit } from 'lucide-react';

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
  
  console.log(`Current card: ${currentCard.name} at index ${currentCardIndex}`);

  // Swipe handlers
  const handleStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    startX.current = clientX;
    currentX.current = clientX;
    console.log('Swipe start:', clientX);
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    currentX.current = clientX;
    const deltaX = currentX.current - startX.current;
    
    setSwipeOffset(deltaX);
    console.log('Swipe move:', deltaX);
  };

  const handleEnd = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaX = currentX.current - startX.current;
    console.log('Swipe end:', deltaX, 'currentIndex:', currentCardIndex);
    
    // Если свайп больше 50px влево - переключаем на следующую карту
    if (deltaX < -50 && currentCardIndex < cards.length - 1) {
      console.log('Swiping to next card');
      setCurrentCardIndex(currentCardIndex + 1);
    }
    // Если свайп больше 50px вправо - переключаем на предыдущую карту
    else if (deltaX > 50 && currentCardIndex > 0) {
      console.log('Swiping to previous card');
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
      <div 
        className="px-12 py-4 relative cursor-pointer select-none"
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Background cards - упрощенная логика */}
        {cards.map((card, index) => {
          if (index === currentCardIndex) return null; // Пропускаем текущую выбранную карту
          
          const isPrevious = index < currentCardIndex; // Предыдущие карты (выше в списке)
          const isNext = index > currentCardIndex; // Следующие карты (ниже в списке)
          const distance = Math.abs(index - currentCardIndex);
          
          console.log(`Rendering background card: ${card.name} at index ${index}, current: ${currentCardIndex}, isPrevious: ${isPrevious}, isNext: ${isNext}, distance: ${distance}`);
          
          if (isPrevious) {
            console.log(`PREVIOUS CARD: ${card.name} will be positioned at translateX: ${-30 - (currentCardIndex - index - 1) * 20}`);
          }
          
          // Простая и понятная логика позиционирования
          let translateX, translateY, scale, opacity;
          
          if (isPrevious) {
            // Предыдущие карты - слева на заднем плане, хорошо видны
            const position = currentCardIndex - index; // 1, 2, 3...
            translateX = -25 - (position - 1) * 18; // Ближе к главной карте
            translateY = (position - 1) * 4; // Смещение вниз для эффекта стопки
            scale = 0.88 - (position - 1) * 0.03; // Масштаб для заднего плана
            opacity = 0.85 - (position - 1) * 0.08; // Хорошая прозрачность
          } else {
            // Следующие карты - справа от главной, видны с отступом
            const position = index - currentCardIndex; // 1, 2, 3...
            translateX = 35 + (position - 1) * 25; // Дальше от главной карты для видимости
            translateY = (position - 1) * 5; // Смещение вниз
            scale = 0.85 - (position - 1) * 0.03; // Масштаб
            opacity = 0.8 - (position - 1) * 0.1; // Прозрачность
          }
          
          // Ограничиваем значения для максимальной видимости
          scale = Math.max(scale, 0.8);
          opacity = Math.max(opacity, 0.7);
          
          console.log(`Card ${card.name}: translateX=${translateX}, translateY=${translateY}, scale=${scale}, opacity=${opacity}`);
          
          return (
            <div
              key={`bg-${card.id}`}
              className="absolute top-4 left-12 w-[calc(100%-6rem)] h-[189px] rounded-[27px] transition-all duration-600 ease-out shadow-lg"
              style={{
                backgroundColor: card.color,
                transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
                opacity: opacity,
                zIndex: isPrevious ? 5 - distance : 15 - distance,
              }}
            >
              <div className="p-6 h-full flex flex-col justify-between">
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  {card.id === 'vtb' && (
                    <div className="w-12 h-4 bg-white rounded"></div>
                  )}
                  {card.id === 'tbank' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center">
                        <span className="text-gray-800 font-bold text-sm">{card.logo}</span>
                      </div>
                      <div className="text-white text-lg font-bold font-ibm">БАНК</div>
                    </div>
                  )}
                  {card.id === 'alfa' && (
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-red-500 font-bold text-lg">{card.logo}</span>
                    </div>
                  )}
                </div>
                
                {/* Balance */}
                <div className="text-white text-lg font-normal font-ibm text-right">
                  {card.balance}
                </div>
                
                {/* Card Number */}
                <div className="text-white text-sm font-normal font-ibm text-right">
                  {card.cardNumber}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Current selected card */}
        <div 
          className="relative w-[calc(100%-6rem)] h-[189px] rounded-[27px] p-6 flex flex-col justify-between z-20 transition-all duration-600 ease-out shadow-2xl"
          style={{ 
            backgroundColor: currentCard.color,
            transform: `translateX(${swipeOffset * 0.1}px)`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Top Row */}
          <div className="flex items-center justify-between">
            {currentCard.id === 'vtb' && (
              <div className="w-12 h-4 bg-white rounded"></div>
            )}
            {currentCard.id === 'tbank' && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center">
                  <span className="text-gray-800 font-bold text-sm">{currentCard.logo}</span>
                </div>
                <div className="text-white text-xl font-bold font-ibm">БАНК</div>
              </div>
            )}
            {currentCard.id === 'alfa' && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-red-500 font-bold text-lg">{currentCard.logo}</span>
                </div>
                <div className="text-white text-xl font-bold font-ibm">БАНК</div>
              </div>
            )}
            <div className="w-5 h-5 bg-white/20 rounded-full border border-white/30 flex items-center justify-center">
              <Edit size={12} className="text-white" />
            </div>
          </div>
          
          {/* Balance */}
          <div className="text-white text-2xl font-normal font-ibm text-right">{currentCard.balance}</div>
          
          {/* Card Number */}
          <div className="text-white text-base font-normal font-ibm text-right">{currentCard.cardNumber}</div>
        </div>
        
        {/* Swipe indicator */}
        {isDragging && Math.abs(swipeOffset) > 10 && (
          <div className="absolute top-[220px] left-1/2 transform -translate-x-1/2 text-center">
            <div className="text-gray-500 text-sm font-ibm">
              {swipeOffset < 0 ? 'Свайпните влево для следующей карты' : 'Свайпните вправо для предыдущей карты'}
            </div>
            <div className="w-8 h-1 bg-gray-300 rounded mx-auto mt-2"></div>
          </div>
        )}
        
        {/* Left swipe hint - показываем когда есть предыдущие карты */}
        {currentCardIndex > 0 && !isDragging && (
          <div className="absolute top-[100px] left-2 text-center">
            <div className="text-gray-400 text-xs font-ibm">
              ← Свайп вправо
            </div>
            <div className="w-4 h-1 bg-gray-300 rounded mx-auto mt-1"></div>
          </div>
        )}
        
        {/* Right swipe hint - показываем когда есть следующие карты */}
        {currentCardIndex < cards.length - 1 && !isDragging && (
          <div className="absolute top-[100px] right-2 text-center">
            <div className="text-gray-400 text-xs font-ibm">
              Свайп влево →
            </div>
            <div className="w-4 h-1 bg-gray-300 rounded mx-auto mt-1"></div>
          </div>
        )}
      </div>

      {/* Analytics */}
      <div className="px-6 py-4">
        <div className="bg-white w-full rounded-3xl p-6 shadow-lg border border-gray-200">
          {/* Card Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: currentCard.color }}
            >
              <span className="text-white text-xl font-bold">{currentCard.logo}</span>
            </div>
            <div>
              <div className="text-lg font-semibold font-ibm">{currentCard.name}</div>
              <div className="text-sm text-gray-500 font-ibm">{currentCard.cardNumber}</div>
            </div>
          </div>

          {/* Balance */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold font-ibm">{currentCard.balance}</div>
            <div className="text-sm text-gray-500 font-ibm">Текущий баланс</div>
          </div>

          {/* Analytics Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600 font-ibm">{currentCard.analytics.income}</div>
              <div className="text-xs text-gray-500 font-ibm">Доходы</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600 font-ibm">{currentCard.analytics.expenses}</div>
              <div className="text-xs text-gray-500 font-ibm">Расходы</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600 font-ibm">{currentCard.analytics.transactions}</div>
              <div className="text-xs text-gray-500 font-ibm">Операций</div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="text-lg font-semibold font-ibm mb-4">Расходы по категориям</div>
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
                    <div className="text-sm font-ibm">{category.name}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
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
                    <div className="text-sm font-semibold font-ibm w-16 text-right">{category.amount}</div>
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
