import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit } from 'lucide-react';

const MyCardsPage = () => {
  const navigate = useNavigate();
  
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

  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    // Анимация входа карт сверху вниз с эффектом "улетания"
    const timer = setTimeout(() => {
      setCardsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = (card) => {
    const cardIndex = cards.findIndex(c => c.id === card.id);
    // Переходим на страницу аналитики с передачей индекса карты
    navigate('/card-analytics', { 
      state: { cardIndex: cardIndex } 
    });
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


      {/* Cards List - Always visible */}
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




      {/* Bottom padding for mobile */}
      <div className="h-20"></div>
    </div>
  );
};

export default MyCardsPage;
