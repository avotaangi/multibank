import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Info } from 'lucide-react';
import useBalanceStore from '../stores/balanceStore';
import useTestCardsStore from '../stores/testCardsStore';
import { useTelegramUser } from '../hooks/useTelegramUser';
import InfoPanel from '../components/InfoPanel';
import { usePageInfo } from '../hooks/usePageInfo';

const MyCardsPage = () => {
  const navigate = useNavigate();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const getFormattedBalance = useBalanceStore((state) => state.getFormattedBalance);
  const telegramUser = useTelegramUser();
  
  // Получаем тестовые карты из стора
  const { getAllCards } = useTestCardsStore();
  const testCards = getAllCards() || [];
  
  // Проверяем, что store инициализирован
  if (!getAllCards) {
    return <div>Загрузка...</div>;
  }
  
  const baseCards = [
    {
      id: 'vbank',
      name: 'VBank',
      balance: getFormattedBalance('vbank'),
      color: '#0055BC',
      logo: 'VBank',
      cardNumber: '5294 **** **** 2498',
      cardholderName: telegramUser.displayName,
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
      id: 'abank',
      name: 'ABank',
      balance: getFormattedBalance('abank'),
      color: '#EF3124',
      logo: 'ABank',
      cardNumber: '3568 **** **** 8362',
      cardholderName: telegramUser.displayName,
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
      id: 'sbank',
      name: 'SBank',
      balance: getFormattedBalance('sbank'),
      color: '#00A859',
      logo: 'SBank',
      cardNumber: '6352 **** **** 9837',
      cardholderName: telegramUser.displayName,
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
            card.bankId === 'vbank' ? '#0055BC' : 
            card.bankId === 'abank' ? '#EF3124' : '#00A859',
    logo: card.bankId === 'sberbank' ? 'С' : 
          card.bankId === 'vbank' ? 'VBank' : 
          card.bankId === 'abank' ? 'ABank' : 'SBank',
    cardholderName: telegramUser.displayName,
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


  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="w-10"></div>
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Мои карты
          </div>
          <button
            onClick={() => setShowInfoPanel(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </div>


      {/* Cards List - Always visible */}
      <div className="px-5 py-2 space-y-4">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`relative w-full h-[189px] rounded-[27px] cursor-pointer transition-all duration-600 ease-out hover:scale-105 `}
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
                  {card.id === 'vbank' && (
                      <div className="text-white text-2xl font-bold font-ibm">{card.logo}</div>
                  )}
                  {card.id === 'abank' && (
                    <div className="text-white text-2xl font-bold font-ibm">{card.logo}</div>
                  )}
                  {card.id === 'sbank' && (
                    <div className="text-white text-2xl font-bold font-ibm">{card.logo}</div>
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

      {/* Info Panel */}
      <InfoPanel
        isOpen={showInfoPanel}
        onClose={() => setShowInfoPanel(false)}
        title={pageInfo.title}
        content={pageInfo.content}
        color={pageInfo.color}
      />
    </div>
  );
};

export default MyCardsPage;
