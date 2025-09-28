import React, { useState, useRef } from 'react';
import useBalanceStore from '../stores/balanceStore';
import useTestCardsStore from '../stores/testCardsStore';

const BankCardStack = () => {
  const { getFormattedBalance } = useBalanceStore();
  const { getAllCards } = useTestCardsStore();
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const baseCards = [
    {
      id: 'alfa',
      name: 'Альфа-Банк',
      balance: getFormattedBalance('alfa'),
      color: '#EF3124',
      logo: 'A',
      cardNumber: '5294 **** **** 2498',
      cardholderName: 'София Львова',
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
  const cards = [...baseCards, ...testCards];

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
    
    // Ограничиваем свайп только влево (отрицательные значения)
    if (deltaX < 0) {
      const offset = Math.abs(deltaX);
      // Увеличиваем максимальный свайп для лучшего раскрытия карт
      setSwipeOffset(Math.min(offset, 300));
    }
  };

  const handleEnd = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const deltaX = currentX.current - startX.current;
    
    // Если свайп больше 150px влево - переходим на страницу "Мои карты"
    // Увеличиваем порог для лучшего раскрытия карт
    if (deltaX < -150) {
      // Плавный переход без паузы
      window.location.href = '/my-cards';
    } else {
      // Если свайп недостаточный, возвращаем карты в исходное положение
      setIsDragging(false);
      setSwipeOffset(0);
    }
  };

  const handleCardClick = (e) => {
    // Если это был свайп, не обрабатываем клик
    if (isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Переходим на страницу "Мои карты"
    window.location.href = '/my-cards';
  };



  return (
    <div className="relative w-full flex justify-center items-center pb-4 px-4 sm:px-6 md:px-8 overflow-hidden">
      {/* Triple Arrow Left */}
      <div className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-40">
        <div className="flex items-center space-x-1">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </div>
      </div>

      {/* Bank Cards Stack - Horizontal */}
      <div 
        className="relative h-[120px] sm:h-[130px] md:h-[140px] w-[220px] sm:w-[240px] md:w-[260px] cursor-pointer select-none overflow-visible touch-pan-y"
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onClick={handleCardClick}
        style={{ 
          transform: `translateX(-${swipeOffset * 0.15}px)`,
          touchAction: 'pan-y',
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {/* Alpha Bank Card */}
        <div 
          data-card="0"
          className="absolute top-0 left-0 w-[220px] sm:w-[240px] md:w-[260px] h-[120px] sm:h-[130px] md:h-[140px] rounded-[16px] sm:rounded-[18px] md:rounded-[20px] z-30 transition-transform duration-200"
          style={{ 
            backgroundColor: cards[0].color,
            transform: `translateX(${swipeOffset > 30 ? -swipeOffset * 0.35 : -20}px)`,
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            boxShadow: '0px 4px 3.8px 1px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div className="p-1.5 sm:p-2 md:p-3 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between h-8">
              <div className="flex flex-col">
                <div className="text-white text-base sm:text-lg md:text-xl font-bold font-ibm">{cards[0].logo}</div>
                <div className="w-8 h-0.5 bg-white mt-1"></div>
              </div>
              <div className="text-white text-sm sm:text-base md:text-lg font-normal font-ibm">{cards[0].balance}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-white text-xs sm:text-sm font-normal font-ibm">{cards[0].cardNumber}</div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-white/20 rounded-full border border-white/30 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* VTB Card */}
        <div 
          data-card="1"
          className="absolute top-0 left-0 w-[220px] sm:w-[240px] md:w-[260px] h-[120px] sm:h-[130px] md:h-[140px] rounded-[16px] sm:rounded-[18px] md:rounded-[20px] z-20 transition-transform duration-200"
          style={{ 
            backgroundColor: cards[1].color,
            transform: `translateX(${20 - (swipeOffset > 60 ? swipeOffset * 0.25 : 0) - 20}px)`,
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            boxShadow: '0px 4px 3.8px 1px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div className="p-1.5 sm:p-2 md:p-3 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between h-8">
              <div className="text-white text-base sm:text-lg md:text-xl font-bold font-ibm">{cards[1].logo}</div>
              <div className="text-white text-sm sm:text-base md:text-lg font-normal font-ibm">{cards[1].balance}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-white text-xs sm:text-sm font-normal font-ibm">{cards[1].cardNumber}</div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-white/20 rounded-full border border-white/30 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* T-Bank Card */}
        <div 
          data-card="2"
          className="absolute top-0 left-0 w-[220px] sm:w-[240px] md:w-[260px] h-[120px] sm:h-[130px] md:h-[140px] rounded-[16px] sm:rounded-[18px] md:rounded-[20px] z-10 transition-transform duration-200"
          style={{ 
            backgroundColor: cards[2].color,
            transform: `translateX(${40 - (swipeOffset > 90 ? swipeOffset * 0.15 : 0) - 20}px)`,
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            boxShadow: '0px 4px 3.8px 1px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div className="p-1.5 sm:p-2 md:p-3 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between h-8">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-yellow-400 rounded flex items-center justify-center">
                  <span className="text-gray-800 font-bold text-sm font-bold">{cards[2].logo}</span>
                </div>
                <div className="text-white text-base sm:text-lg md:text-xl font-bold font-ibm">БАНК</div>
              </div>
              <div className="text-white text-sm sm:text-base md:text-lg font-normal font-ibm">{cards[2].balance}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-white text-xs sm:text-sm font-normal font-ibm">{cards[2].cardNumber}</div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-white/20 rounded-full border border-white/30 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Indicator */}
      {isDragging && swipeOffset > 20 && (
        <div className="absolute top-[220px] left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-gray-500 text-xs sm:text-sm font-ibm">
            Свайпните влево для просмотра всех карт
          </div>
          <div className="w-6 sm:w-8 h-1 bg-white rounded mx-auto mt-2"></div>
        </div>
      )}
    </div>
  );
};

export default BankCardStack;
