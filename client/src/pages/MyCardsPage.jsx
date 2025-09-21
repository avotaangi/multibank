import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit } from 'lucide-react';

const MyCardsPage = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardsVisible, setCardsVisible] = useState(false);

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
  };

  const closeAnalytics = () => {
    setSelectedCard(null);
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

      {/* Selected Card Display */}
      {selectedCard && (
        <div className="px-6 py-4">
          <div 
            className="w-full h-[189px] rounded-[27px] p-6 flex flex-col justify-between"
            style={{ backgroundColor: selectedCard.color }}
          >
            {/* Card Content */}
            <div className="p-6 h-full flex flex-col justify-between">
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
                {selectedCard.id === 'alfabank' && (
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
          </div>
        </div>
      )}

      {/* Cards List */}
      <div className="relative z-10 px-6 py-4 space-y-4">
        {cards.map((card, index) => (
          <div
            key={card.id}
            data-card-id={card.id}
            className={`relative w-full h-[189px] rounded-[27px] cursor-pointer transition-all duration-600 ease-out hover:scale-105 ${
              cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-20'
            } ${selectedCard?.id === card.id ? 'ring-4 ring-blue-500 ring-opacity-50 scale-105' : ''}`}
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
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
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

      {/* Show as List Button */}
      <div className="relative z-10 px-6 py-4">
        <button className="w-full h-7 border border-black rounded-[10px] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
          <div className="text-black font-manrope font-light text-xs leading-[110%]">
            Показать списком
          </div>
        </button>
      </div>

      {/* Analytics Modal */}
      {selectedCard && (
        <div className="px-6 py-4">
          <div className="bg-white w-full rounded-3xl p-6 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: selectedCard.color }}
                >
                  <span className="text-white font-bold text-lg">{selectedCard.logo}</span>
                </div>
                <div>
                  <div className="text-lg font-semibold font-ibm">{selectedCard.name}</div>
                  <div className="text-sm text-gray-500 font-ibm">{selectedCard.cardNumber}</div>
                </div>
              </div>
              <button 
                onClick={closeAnalytics}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
        </div>
      )}

      {/* Bottom padding for mobile */}
      <div className="h-20"></div>
    </div>
  );
};

export default MyCardsPage;
