import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit } from 'lucide-react';
import useBalanceStore from '../stores/balanceStore';
import useTestCardsStore from '../stores/testCardsStore';

const MyCardsPage = () => {
  const navigate = useNavigate();
  const { getFormattedBalance } = useBalanceStore();
  
  // Подписываемся на изменения в сторе тестовых карт
  const testCards = useTestCardsStore((state) => state.testCards);
  
  const baseCards = [
    {
      id: 'alfa',
      name: 'Альфа-Банк',
      balance: getFormattedBalance('alfa'),
      color: '#EF3124',
      logo: 'A',
      cardNumber: '5294 **** **** 2498',
      cardholderName: 'Евгений Богатов',
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
      cardholderName: 'Евгений Богатов',
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
      cardholderName: 'Евгений Богатов',
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

  // Добавляем баланс к тестовым картам
  const testCardsWithBalance = testCards.map(card => ({
    ...card,
    balance: getFormattedBalance(card.bankId) || '0 ₽',
    color: card.bankId === 'sberbank' ? '#21A038' : 
            card.bankId === 'vtb' ? '#0055BC' : 
            card.bankId === 'alfa' ? '#EF3124' : '#2F2F2F',
    logo: card.bankId === 'sberbank' ? 'С' : 
          card.bankId === 'vtb' ? 'ВТБ' : 
          card.bankId === 'alfa' ? 'А' : 'Т',
    cardholderName: 'Евгений Богатов',
    analytics: {
      income: '0 ₽',
      expenses: '0 ₽',
      transactions: 0,
      categories: []
    }
  }));
  
  const cards = [...baseCards, ...testCardsWithBalance];

  // Убираем старую анимацию, теперь используем CSS анимации

  const handleCardClick = (card) => {
    console.log('MyCardsPage - clicking card:', card.id);
    console.log('MyCardsPage - navigating to:', `/card-analytics/${card.id}`);
    // Переходим на страницу аналитики с cardId в URL
    navigate(`/card-analytics/${card.id}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white animate-slide-up">
      {/* Header */}
      <div className="relative z-10 px-3 sm:px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBackToDashboard}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
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
      <div className="relative z-10 px-3 sm:px-6 py-4 space-y-4">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`relative w-full h-[189px] rounded-[27px] cursor-pointer transition-all duration-600 ease-out hover:scale-105 animate-slide-in-down-slow`}
              style={{ 
                backgroundColor: card.color,
                boxShadow: '0px 4px 3.8px 1px rgba(0, 0, 0, 0.25)'
              }}
              onClick={() => handleCardClick(card)}
            >
              {/* Card Content */}
              <div className="p-6 h-full flex flex-col justify-between">
                {/* Top section */}
                <div className="flex items-center justify-between">
                  {card.id === 'alfa' && (
                    <div className="flex flex-col">
                      <div className="text-white text-2xl font-bold font-ibm">{card.logo}</div>
                      <div className="w-8 h-0.5 bg-white mt-1"></div>
                    </div>
                  )}
                  {card.id === 'vtb' && (
                    <div className="text-white text-2xl font-bold font-ibm">{card.logo}</div>
                  )}
                  {card.id === 'tbank' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center">
                        <span className="text-gray-800 font-bold text-sm">{card.logo}</span>
                      </div>
                      <div className="text-white text-2xl font-bold font-ibm">БАНК</div>
                    </div>
                  )}
                  {card.isTest && (
                    <div className="text-white text-2xl font-bold font-ibm">{card.logo}</div>
                  )}
                  <div className="text-white text-lg font-normal font-ibm">{card.balance}</div>
                </div>
                
                {/* Bottom section */}
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <div className="text-white text-sm font-normal font-ibm mb-1">{card.cardholderName}</div>
                    <div className="text-white text-sm font-normal font-ibm">
                      {card.isTest ? card.cardNumber : card.cardNumber}
                    </div>
                  </div>
                  <div className="text-white text-lg font-bold">МИР</div>
                </div>
              </div>
            </div>
          ))}
        </div>




      {/* Bottom padding for mobile */}
      <div className="h-20"></div>
    </div>
  );
};

export default MyCardsPage;
