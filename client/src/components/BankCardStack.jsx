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
    <div className="relative w-full flex justify-center items-center pb-4 px-1 min-[355px]:px-2 min-[380px]:px-5 overflow-hidden">
      {/* Triple Arrow Left */}
      <div className="absolute left-1 min-[380px]:left-2 top-1/2 transform -translate-y-1/2 z-40">
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
        className="relative h-[140px] min-[355px]:h-[160px] min-[380px]:h-[189px] min-[375px]:h-[200px] w-full cursor-pointer select-none overflow-visible touch-pan-y flex justify-center"
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
        {/* Cards Container - Centered */}
        <div className="relative w-[180px] min-[320px]:w-[200px] min-[355px]:w-[240px] min-[380px]:w-[280px] min-[375px]:w-[300px] sm:w-[320px] md:w-[340px] lg:w-[360px] xl:w-[380px] h-[140px] min-[355px]:h-[160px] min-[380px]:h-[189px] min-[375px]:h-[200px] sm:h-[220px] md:h-[240px] lg:h-[260px] xl:h-[280px]">
          {/* Alpha Bank Card */}
          <div 
            data-card="0"
            className="absolute top-0 w-[200px] min-[355px]:w-[240px] min-[380px]:w-[280px] min-[375px]:w-[300px] sm:w-[320px] md:w-[340px] lg:w-[360px] xl:w-[380px] h-[140px] min-[355px]:h-[160px] min-[380px]:h-[189px] min-[375px]:h-[200px] sm:h-[220px] md:h-[240px] lg:h-[260px] xl:h-[280px] rounded-[27px] z-30 transition-transform duration-200"
            style={{ 
              backgroundColor: cards[0].color,
              left: `${swipeOffset > 30 ? -swipeOffset * 0.35 : -35}px`,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              boxShadow: '0px 4px 3.8px 1px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div className="p-3 min-[320px]:p-4 min-[355px]:p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 h-full flex flex-col justify-between">
              {/* Top section */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="text-white text-lg min-[320px]:text-xl min-[355px]:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-ibm">{cards[0].logo}</div>
                  <div className="w-8 h-0.5 bg-white mt-1"></div>
                </div>
                <div className="text-white text-sm min-[320px]:text-base min-[355px]:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal font-ibm">{cards[0].balance}</div>
              </div>
              
              {/* Bottom section */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                <div className="text-white text-xs min-[320px]:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-normal font-ibm mb-1">Евгений Богатов</div>
                <div className="text-white text-xs min-[320px]:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-normal font-ibm">{cards[0].cardNumber}</div>
                </div>
                <div className="text-white text-sm min-[320px]:text-base min-[355px]:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold">МИР</div>
              </div>
            </div>
          </div>
          
          {/* VTB Card */}
          <div 
            data-card="1"
            className="absolute top-0 w-[200px] min-[355px]:w-[240px] min-[380px]:w-[280px] min-[375px]:w-[300px] sm:w-[320px] md:w-[340px] lg:w-[360px] xl:w-[380px] h-[140px] min-[355px]:h-[160px] min-[380px]:h-[189px] min-[375px]:h-[200px] sm:h-[220px] md:h-[240px] lg:h-[260px] xl:h-[280px] rounded-[27px] z-20 transition-transform duration-200"
            style={{ 
              backgroundColor: cards[1].color,
              left: '0px',
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              boxShadow: '0px 4px 3.8px 1px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div className="p-3 min-[320px]:p-4 min-[355px]:p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 h-full flex flex-col justify-between">
              {/* Top section */}
              <div className="flex items-center justify-between">
                <div className="text-white text-lg min-[320px]:text-xl min-[355px]:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-ibm">{cards[1].logo}</div>
                <div className="text-white text-sm min-[320px]:text-base min-[355px]:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal font-ibm">{cards[1].balance}</div>
              </div>
              
              {/* Bottom section */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <div className="text-white text-sm font-normal font-ibm mb-1">Евгений Богатов</div>
                  <div className="text-white text-sm font-normal font-ibm">{cards[1].cardNumber}</div>
                </div>
                <div className="text-white text-sm min-[320px]:text-base min-[355px]:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold">МИР</div>
              </div>
            </div>
          </div>
          
          {/* T-Bank Card */}
          <div 
            data-card="2"
            className="absolute top-0 w-[200px] min-[355px]:w-[240px] min-[380px]:w-[280px] min-[375px]:w-[300px] sm:w-[320px] md:w-[340px] lg:w-[360px] xl:w-[380px] h-[140px] min-[355px]:h-[160px] min-[380px]:h-[189px] min-[375px]:h-[200px] sm:h-[220px] md:h-[240px] lg:h-[260px] xl:h-[280px] rounded-[27px] z-10 transition-transform duration-200"
            style={{ 
              backgroundColor: cards[2].color,
              left: '35px',
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              boxShadow: '0px 4px 3.8px 1px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div className="p-3 min-[320px]:p-4 min-[355px]:p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 h-full flex flex-col justify-between">
              {/* Top section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center">
                    <span className="text-gray-800 font-bold text-sm">{cards[2].logo}</span>
                  </div>
                  <div className="text-white text-lg min-[320px]:text-xl min-[355px]:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-ibm">БАНК</div>
                </div>
                <div className="text-white text-sm min-[320px]:text-base min-[355px]:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal font-ibm">{cards[2].balance}</div>
              </div>
              
              {/* Bottom section */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <div className="text-white text-sm font-normal font-ibm mb-1">Евгений Богатов</div>
                  <div className="text-white text-sm font-normal font-ibm">{cards[2].cardNumber}</div>
                </div>
                <div className="text-white text-sm min-[320px]:text-base min-[355px]:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold">МИР</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Indicator */}
      {isDragging && swipeOffset > 20 && (
        <div className="absolute top-[200px] left-1/2 transform -translate-x-1/2 text-center">
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
