import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit } from 'lucide-react';

const MyCardsPage = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  useEffect(() => {
    // Анимация входа карт сверху вниз с эффектом "улетания"
    const timer = setTimeout(() => {
      setCardsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

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

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setCurrentCardIndex(cards.findIndex(c => c.id === card.id));
    setIsTransitioning(true);
    
    // Завершаем переход через 600ms
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  const closeAnalytics = () => {
    setSelectedCard(null);
    setCurrentCardIndex(0);
    setIsTransitioning(false);
  };

  // Swipe handlers
  const handleStart = (e) => {
    if (!selectedCard) return;
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    startX.current = clientX;
    currentX.current = clientX;
  };

  const handleMove = (e) => {
    if (!isDragging || !selectedCard) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    currentX.current = clientX;
    const deltaX = currentX.current - startX.current;
    
    setSwipeOffset(deltaX);
  };

  const handleEnd = (e) => {
    if (!isDragging || !selectedCard) return;
    
    const deltaX = currentX.current - startX.current;
    
    // Если свайп больше 100px влево - переключаем на следующую карту
    if (deltaX < -100 && currentCardIndex < cards.length - 1) {
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);
      setSelectedCard(cards[nextIndex]);
    }
    // Если свайп больше 100px вправо - переключаем на предыдущую карту
    else if (deltaX > 100 && currentCardIndex > 0) {
      const prevIndex = currentCardIndex - 1;
      setCurrentCardIndex(prevIndex);
      setSelectedCard(cards[prevIndex]);
    }
    
    setIsDragging(false);
    setSwipeOffset(0);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white animate-slide-up">
      {/* Header */}
      <div className="relative z-10 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBackToDashboard}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-black font-ibm text-lg font-normal leading-[110%] text-center">
            Мои карты
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Fixed Card Stack at Top */}
      {selectedCard && (
        <div 
          className="px-6 py-4 relative"
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
        >
          {/* Background cards with beautiful transition */}
          {cards.map((card, index) => {
            if (index === currentCardIndex) return null; // Skip current card
            
            const isBehind = index < currentCardIndex;
            const distance = Math.abs(index - currentCardIndex);
            const scale = Math.max(0.9 - distance * 0.05, 0.8);
            const translateX = isBehind ? -distance * 15 : distance * 15;
            const translateY = distance * 5;
            const opacity = Math.max(0.6 - distance * 0.15, 0.3);
            
            return (
              <div
                key={`bg-${card.id}`}
                className="absolute top-4 left-6 w-full h-[189px] rounded-[27px] transition-all duration-600 ease-out shadow-lg"
                style={{
                  backgroundColor: card.color,
                  transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
                  opacity: opacity,
                  zIndex: 10 - distance,
                  transitionDelay: isTransitioning ? `${distance * 100}ms` : '0ms',
                  boxShadow: `0 4px 20px rgba(0, 0, 0, ${0.1 + distance * 0.05})`
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
            className="relative w-full h-[189px] rounded-[27px] p-6 flex flex-col justify-between z-20 transition-all duration-600 ease-out shadow-2xl"
            style={{ 
              backgroundColor: selectedCard.color,
              transform: `translateX(${swipeOffset * 0.1}px)`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Top Row */}
            <div className="flex items-center justify-between">
              {selectedCard.id === 'vtb' && (
                <div className="w-12 h-4 bg-white rounded"></div>
              )}
              {selectedCard.id === 'tbank' && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center">
                    <span className="text-gray-800 font-bold text-sm">{selectedCard.logo}</span>
                  </div>
                  <div className="text-white text-xl font-bold font-ibm">БАНК</div>
                </div>
              )}
              {selectedCard.id === 'alfa' && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <span className="text-red-500 font-bold text-lg">{selectedCard.logo}</span>
                  </div>
                  <div className="text-white text-xl font-bold font-ibm">БАНК</div>
                </div>
              )}
              <div className="w-5 h-5 bg-white/20 rounded-full border border-white/30 flex items-center justify-center">
                <Edit size={12} className="text-white" />
              </div>
            </div>
            
            {/* Balance */}
            <div className="text-white text-2xl font-normal font-ibm text-right">{selectedCard.balance}</div>
            
            {/* Card Number */}
            <div className="text-white text-base font-normal font-ibm text-right">{selectedCard.cardNumber}</div>
          </div>
          
          {/* Swipe indicator */}
          {isDragging && Math.abs(swipeOffset) > 20 && (
            <div className="absolute top-[220px] left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-gray-500 text-sm font-ibm">
                {swipeOffset < 0 ? 'Свайпните влево для следующей карты' : 'Свайпните вправо для предыдущей карты'}
              </div>
              <div className="w-8 h-1 bg-gray-300 rounded mx-auto mt-2"></div>
            </div>
          )}
        </div>
      )}

      {/* Cards List - Hidden when card is selected */}
      {!selectedCard && (
        <div className="relative z-10 px-6 py-4 space-y-4">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`relative w-full h-[189px] rounded-[27px] cursor-pointer transition-all duration-600 ease-out hover:scale-105 ${
                cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-20'
              }`}
              style={{ 
                backgroundColor: card.color,
                transitionDelay: `${index * 100}ms`
              }}
              onClick={() => handleCardClick(card)}
            >
              {/* Card Content */}
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
                  
                  {/* Edit Icon */}
                  <div className="w-5 h-5 bg-white/20 rounded-full border border-white/30 flex items-center justify-center">
                    <Edit size={12} className="text-white" />
                  </div>
                </div>

                {/* Balance */}
                <div className="text-white text-2xl font-normal font-ibm text-right">
                  {card.balance}
                </div>

                {/* Card Number */}
                <div className="text-white text-base font-normal font-ibm">
                  {card.cardNumber}
                </div>
              </div>

              {/* Bottom Right Circle */}
              <div className="absolute bottom-4 right-4 w-7 h-7 bg-white/20 border border-white rounded-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* Show as List Button */}
      <div className="relative z-10 px-6 py-4">
        <button className="w-full h-7 border border-black rounded-[10px] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
          <div className="text-black font-manrope font-light text-xs leading-[110%]">
            Показать списком
          </div>
        </button>
      </div>


      {/* Fixed Bottom Analytics */}
      {selectedCard && (
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto z-50 shadow-2xl border-t border-gray-200">
            {/* Close Button */}
            <div className="flex justify-end mb-6">
              <button 
                onClick={closeAnalytics}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Card Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: selectedCard.color }}
              >
                <span className="text-white text-xl font-bold">{selectedCard.logo}</span>
              </div>
              <div>
                <div className="text-lg font-semibold font-ibm">{selectedCard.name}</div>
                <div className="text-sm text-gray-500 font-ibm">{selectedCard.cardNumber}</div>
              </div>
            </div>

            {/* Balance */}
            <div className="text-center mb-6">
              <div className="text-3xl font-bold font-ibm">{selectedCard.balance}</div>
              <div className="text-sm text-gray-500 font-ibm">Текущий баланс</div>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600 font-ibm">{selectedCard.analytics.income}</div>
                <div className="text-xs text-gray-500 font-ibm">Доходы</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600 font-ibm">{selectedCard.analytics.expenses}</div>
                <div className="text-xs text-gray-500 font-ibm">Расходы</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 font-ibm">{selectedCard.analytics.transactions}</div>
                <div className="text-xs text-gray-500 font-ibm">Операций</div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="text-lg font-semibold font-ibm mb-4">Расходы по категориям</div>
              <div className="space-y-3">
                {selectedCard.analytics.categories.map((category, index) => (
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
      )}

      {/* Bottom padding for mobile */}
      <div className="h-20"></div>
    </div>
  );
};

export default MyCardsPage;
