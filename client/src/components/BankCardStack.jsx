import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const BankCardStack = () => {
  const navigate = useNavigate();
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
      cardNumber: '**** 1234',
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
      cardNumber: '**** 5678',
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

  const handleStart = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    startX.current = clientX;
    currentX.current = clientX;
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    currentX.current = clientX;
    const deltaX = currentX.current - startX.current;
    
    // Ограничиваем свайп только влево (отрицательные значения)
    if (deltaX < 0) {
      setSwipeOffset(Math.abs(deltaX));
    }
  };

  const handleEnd = (e) => {
    if (!isDragging) return;
    
    const deltaX = currentX.current - startX.current;
    
    // Если свайп больше 100px влево - переходим на страницу "Мои карты"
    if (deltaX < -100) {
      // Добавляем плавный переход
      const container = e.currentTarget;
      container.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      container.style.transform = 'translateX(-100%)';
      
      setTimeout(() => {
        navigate('/my-cards');
      }, 200);
    }
    
    setIsDragging(false);
    setSwipeOffset(0);
  };


  return (
    <div className="relative w-full flex justify-center pb-8">
      {/* Bank Cards Stack - Horizontal */}
      <div 
        className="relative h-[220px] w-[450px] cursor-pointer select-none overflow-hidden"
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        style={{ transform: `translateX(-${swipeOffset * 0.1}px)` }}
      >
        {/* VTB Card */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[320px] h-[220px] rounded-[27px] z-30 transition-transform duration-200 hover:scale-105"
          style={{ 
            backgroundColor: cards[0].color,
            transform: `translateX(calc(-50% - ${swipeOffset > 50 ? swipeOffset * 0.3 : 0}px))`
          }}
        >
          <div className="p-6 h-full flex items-center justify-between">
            <div className="text-white text-xl font-bold font-ibm">{cards[0].logo}</div>
            <div className="text-white text-2xl font-normal font-ibm">{cards[0].balance}</div>
          </div>
        </div>
        
        {/* T-Bank Card */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[320px] h-[220px] rounded-[27px] z-20 transition-transform duration-200 hover:scale-105"
          style={{ 
            backgroundColor: cards[1].color,
            transform: `translateX(calc(-50% + 25px - ${swipeOffset > 100 ? swipeOffset * 0.2 : 0}px))`
          }}
        >
          <div className="p-6 h-full flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center">
                <span className="text-gray-800 font-bold text-sm">{cards[1].logo}</span>
              </div>
              <div className="text-white text-xl font-bold font-ibm">БАНК</div>
            </div>
            <div className="text-white text-2xl font-normal font-ibm">{cards[1].balance}</div>
          </div>
        </div>
        
        {/* Alpha Bank Card */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[320px] h-[220px] rounded-[27px] z-10 transition-transform duration-200 hover:scale-105"
          style={{ 
            backgroundColor: cards[2].color,
            transform: `translateX(calc(-50% + 50px - ${swipeOffset > 150 ? swipeOffset * 0.1 : 0}px))`
          }}
        >
          <div className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-red-500 font-bold text-lg">{cards[2].logo}</span>
              </div>
              <div className="w-5 h-5 bg-white/20 rounded-full border border-white/30 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
              </div>
            </div>
            <div className="text-white text-2xl font-normal font-ibm text-right">{cards[2].balance}</div>
            <div className="text-white text-base font-normal font-ibm">{cards[2].cardNumber}</div>
          </div>
        </div>
      </div>

      {/* Swipe Indicator */}
      {isDragging && swipeOffset > 20 && (
        <div className="absolute top-[240px] left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-gray-500 text-sm font-ibm">
            Свайпните влево для просмотра всех карт
          </div>
          <div className="w-8 h-1 bg-gray-300 rounded mx-auto mt-2"></div>
        </div>
      )}
    </div>
  );
};

export default BankCardStack;
