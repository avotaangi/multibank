import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Edit, Eye, EyeOff, CreditCard, Lock, Smartphone, Shield, XCircle, Key, Download, Info } from 'lucide-react';
import { useQuery, useMutation } from 'react-query';
import useBalanceStore from '../stores/balanceStore';
import { useTelegramUser } from '../hooks/useTelegramUser';
import { cardManagementAPI, cardOperationsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import InfoPanel from '../components/InfoPanel';
import { usePageInfo } from '../hooks/usePageInfo';

// Функция для форматирования имени: первое слово целиком, второе - одна буква с точкой
const formatDisplayName = (fullName) => {
  if (!fullName) return '';
  const nameParts = fullName.trim().split(' ');
  if (nameParts.length === 1) return nameParts[0];
  if (nameParts.length === 2) {
    return `${nameParts[0]} ${nameParts[1][0]}.`;
  }
  // Если больше двух слов, берем первое и последнее
  return `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`;
};

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
  
  @keyframes sequentialFadeIn {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  . {
    animation: sequentialFadeIn 0.8s ease-out 0.1s both;
  }
  
  . {
    animation: sequentialFadeIn 0.8s ease-out 0.3s both;
  }
  
  . {
    animation: sequentialFadeIn 0.8s ease-out 0.5s both;
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
  const { cardId } = useParams();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const { getFormattedBalance, bankBalances } = useBalanceStore();
  const telegramUser = useTelegramUser();
  
  // Вычисляем общий бюджет динамически с реактивным обновлением
  const totalBudget = useMemo(() => {
    const total = Object.values(bankBalances).reduce((sum, balance) => sum + balance, 0);
    return `${total.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;
  }, [bankBalances]);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(() => {
    // Устанавливаем правильный индекс на основе cardId
    if (cardId === 'vbank') return 0; // Синяя карта - первая
    if (cardId === 'abank') return 1;  // Красная карта - вторая  
    if (cardId === 'sbank') return 2; // Зеленая карта - третья
    return 0; // По умолчанию
  });
  const [isDragging, setIsDragging] = useState(false);
  const [showOtherBankModal, setShowOtherBankModal] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);

  // Card Management state
  const [showCvv, setShowCvv] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  
  // Card Operations state
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [cardStatus, setCardStatus] = useState('ACTIVE'); // ACTIVE, BLOCK, PERMANENTBLOCK
  const [pinData, setPinData] = useState({ pin: '', publicKeyId: '' });
  
  // Define cards first
  const cards = useMemo(() => [
    {
      id: 'vbank',
      name: 'VBank',
      balance: getFormattedBalance('vbank'),
      color: '#0055BC',
      logo: 'VBank',
      cardNumber: '5294 **** **** 2498',
      operations: [
        { name: 'Surf Coffee', category: 'Кофейня', amount: '- 650 ₽', icon: '☕', iconColor: 'bg-blue-100', textColor: 'text-blue-600' },
        { name: 'Lime', category: 'Одежда и обувь', amount: '- 7 350 ₽', icon: 'LIME', iconColor: 'bg-green-100', textColor: 'text-green-600' },
        { name: 'Магнит', category: 'Продукты', amount: '- 1 158 ₽', icon: 'M', iconColor: 'bg-red-100', textColor: 'text-red-600' }
      ],
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
      operations: [
        { name: 'Перевод', category: 'Переводы', amount: '- 150 ₽', icon: 'VBank', iconColor: 'bg-blue-100', textColor: 'text-blue-600' },
        { name: 'Яндекс.Такси', category: 'Такси', amount: '- 578 ₽', icon: 'YT', iconColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
        { name: 'Самокат', category: 'Продукты', amount: '- 1 150 ₽', icon: 'S', iconColor: 'bg-pink-100', textColor: 'text-pink-600' }
      ],
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
      operations: [
        { name: 'Магнит', category: 'Продукты', amount: '- 78 ₽', icon: 'M', iconColor: 'bg-red-100', textColor: 'text-red-600' },
        { name: 'MTC', category: 'Мобильная связь', amount: '- 600 ₽', icon: 'MTC', iconColor: 'bg-red-100', textColor: 'text-red-600' },
        { name: 'Самокат', category: 'Продукты', amount: '- 1 150 ₽', icon: 'S', iconColor: 'bg-pink-100', textColor: 'text-pink-600' }
      ],
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
  ], [getFormattedBalance]);
  
  // Get publicId from current card
  const publicId = useMemo(() => {
    const currentCard = cards[currentCardIndex];
    return currentCard?.id || cardId;
  }, [currentCardIndex, cardId, cards]);
  
  // Fetch card credentials
  const { data: cardCredentials, isLoading: isLoadingCredentials, refetch: refetchCredentials } = useQuery(
    ['cardCredentials', publicId],
    () => cardManagementAPI.getCredentials(publicId),
    {
      enabled: showCredentials && !!publicId,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );
  
  // Fetch CVV
  const { data: cardCvv, isLoading: isLoadingCvv, refetch: refetchCvv } = useQuery(
    ['cardCvv', publicId],
    () => cardManagementAPI.getCvv(publicId),
    {
      enabled: showCvv && !!publicId,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );
  
  // Fetch tokens
  const { data: cardTokens, isLoading: isLoadingTokens, refetch: refetchTokens } = useQuery(
    ['cardTokens', publicId],
    () => cardManagementAPI.getTokens(publicId),
    {
      enabled: !!publicId,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );
  
  // Card Operations mutations
  const blockCardMutation = useMutation(
    (data) => cardOperationsAPI.changeStatus(publicId, data),
    {
      onSuccess: () => {
        console.log('Card status changed successfully');
        setCardStatus('BLOCK');
        setShowBlockModal(false);
      },
      onError: (error) => {
        console.error('Error changing card status:', error);
      },
    }
  );
  
  const unblockCardMutation = useMutation(
    (data) => cardOperationsAPI.changeStatus(publicId, data),
    {
      onSuccess: () => {
        console.log('Card unblocked successfully');
        setCardStatus('ACTIVE');
        setShowBlockModal(false);
      },
      onError: (error) => {
        console.error('Error unblocking card:', error);
      },
    }
  );
  
  const closeCardMutation = useMutation(
    () => cardOperationsAPI.closeCard(publicId),
    {
      onSuccess: () => {
        console.log('Card closed successfully');
        setShowCloseModal(false);
      },
      onError: (error) => {
        console.error('Error closing card:', error);
      },
    }
  );
  
  const changePinMutation = useMutation(
    (data) => cardOperationsAPI.changePin(publicId, data),
    {
      onSuccess: () => {
        console.log('PIN changed successfully');
        setShowPinModal(false);
        setPinData({ pin: '', publicKeyId: '' });
      },
      onError: (error) => {
        console.error('Error changing PIN:', error);
      },
    }
  );
  
  const handleBlockCard = () => {
    blockCardMutation.mutate({
      newStatus: 'BLOCK',
      reason: 'Заблокировано пользователем'
    });
  };
  
  const handleUnblockCard = () => {
    unblockCardMutation.mutate({
      newStatus: 'ACTIVE',
      reason: 'Разблокировано пользователем'
    });
  };
  
  const handleCloseCard = () => {
    closeCardMutation.mutate();
  };
  
  const handleChangePin = () => {
    if (!pinData.pin || !pinData.publicKeyId) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    changePinMutation.mutate({
      Pin: pinData.pin,
      publicKeyId: pinData.publicKeyId
    });
  };

  // Обновляем индекс карты при изменении cardId
  useEffect(() => {
    console.log('CardAnalyticsPage - cardId:', cardId);
    if (cardId) {
      if (cardId === 'vbank') {
        console.log('Setting cardIndex to 0 (VBank)');
        setCurrentCardIndex(0);
      } else if (cardId === 'abank') {
        console.log('Setting cardIndex to 1 (ABank)');
        setCurrentCardIndex(1);
      } else if (cardId === 'sbank') {
        console.log('Setting cardIndex to 2 (SBank)');
        setCurrentCardIndex(2);
      }
    }
  }, [cardId]);

  const currentCard = cards[currentCardIndex];
  
  console.log('CardAnalyticsPage - currentCardIndex:', currentCardIndex);
  console.log('CardAnalyticsPage - currentCard:', currentCard?.name);
  console.log('CardAnalyticsPage - previous card exists:', currentCardIndex > 0);
  console.log('CardAnalyticsPage - previous card data:', currentCardIndex > 0 ? cards[currentCardIndex - 1] : 'none');
  console.log('CardAnalyticsPage - next card exists:', currentCardIndex < cards.length - 1);
  console.log('CardAnalyticsPage - cards length:', cards.length);

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
    // Анимация шатания удалена
  };

  const handleEnd = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaX = currentX.current - startX.current;
    
    // Если свайп больше 100px влево - переключаем на следующую карту
    if (deltaX < -100 && currentCardIndex < cards.length - 1 && cards[currentCardIndex + 1]) {
      setCurrentCardIndex(currentCardIndex + 1);
      setAnimationKey(prev => prev + 1); // Перезапускаем анимацию
    }
    // Если свайп больше 100px вправо - переключаем на предыдущую карту
    else if (deltaX > 100 && currentCardIndex > 0 && cards[currentCardIndex - 1]) {
      setCurrentCardIndex(currentCardIndex - 1);
      setAnimationKey(prev => prev + 1); // Перезапускаем анимацию
    }
    
    setIsDragging(false);
  };

  // Функция для обработки клика по карте в разделе переводов
  const handleTransferCardClick = (selectedCard) => {
    // Отправитель - карта, на которой мы сейчас стоим (сверху)
    const fromCard = currentCard; // "Банк, с которого хотите перевести"
    // Получатель - выбранная карта из блока "Перевод между своими банками"
    const toCard = selectedCard; // Получатель (выбранная карта из блока "Перевод между своими банками")
    
    console.log('Логика перевода:');
    console.log('Отправитель (карта сверху):', fromCard.name, '- "Банк, с которого хотите перевести"');
    console.log('Получатель (выбранная карта из блока "Перевод между своими банками"):', toCard.name, '- Получатель');
    
    // Навигация на страницу "Между банками" с параметрами
    navigate('/transfer', {
      state: {
        fromCard: fromCard, // Отправитель (карта сверху)
        toCard: toCard,     // Получатель (выбранная карта)
        transferType: 'internal'
      }
    });
  };

  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Fixed Header and Card Stack */}
      <div className="sticky top-0 z-20 bg-white">
        {/* Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
              {currentCard?.name || 'Аналитика карт'}
            </div>
            <button
              onClick={() => setShowInfoPanel(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Info className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Card Stack with Swipe */}
        <div className="relative w-full flex justify-center pb-8 px-4 min-[360px]:pb-10 min-[360px]:px-6 min-[375px]:pb-12 min-[375px]:px-8 sm:px-10 md:px-12 overflow-hidden">
        
        <div 
          className="relative h-[160px] w-[280px] min-[370px]:h-[170px] min-[370px]:w-[300px] min-[375px]:h-[180px] min-[375px]:w-[320px] min-[380px]:h-[190px] min-[380px]:w-[340px] sm:h-[210px] sm:w-[380px] md:h-[230px] md:w-[420px] lg:h-[250px] lg:w-[460px] xl:h-[270px] xl:w-[500px] 2xl:h-[290px] 2xl:w-[540px] cursor-pointer select-none overflow-visible flex justify-center"
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          style={{}}
        >
          
          {/* Current card (center) */}
          <div 
            className="w-[280px] h-[160px] min-[370px]:w-[300px] min-[370px]:h-[170px] min-[375px]:w-[320px] min-[375px]:h-[180px] min-[380px]:w-[340px] min-[380px]:h-[190px] sm:w-[380px] sm:h-[210px] md:w-[420px] md:h-[230px] lg:w-[460px] lg:h-[250px] xl:w-[500px] xl:h-[270px] 2xl:w-[540px] 2xl:h-[290px] rounded-[27px] z-30"
            style={{ 
              backgroundColor: currentCard.color,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0px 4px 3.8px 1px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div className="p-6 h-full flex flex-col justify-between">
              {/* Top section */}
              <div className="flex items-center justify-between">
                {currentCard.id === 'vbank' && (
                    <div className="text-white text-2xl font-bold font-ibm">{currentCard.logo}</div>
                )}
                {currentCard.id === 'abank' && (
                  <div className="text-white text-2xl font-bold font-ibm">{currentCard.logo}</div>
                )}
                {currentCard.id === 'sbank' && (
                  <div className="text-white text-2xl font-bold font-ibm">{currentCard.logo}</div>
                )}
                {currentCard.id === 'unconfirmed' && (
                  <div className="text-white text-2xl font-bold font-ibm">{currentCard.logo}</div>
                )}
                <div className="text-white text-lg font-normal font-ibm">{currentCard.balance}</div>
              </div>
              
              {/* Bottom section */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <div className="text-white text-sm font-normal font-ibm mb-1">{telegramUser.displayName}</div>
                  <div className="text-white text-sm font-normal font-ibm">{currentCard.cardNumber}</div>
                </div>
                <div className="text-white text-lg font-bold">МИР</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card Indicators */}
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {cards.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentCardIndex 
                    ? 'bg-gray-600 w-6 sm:w-8 md:w-10' 
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        
        </div>
        
        {/* Total Budget Section - Fixed with cards */}
        <div className="px-4 min-[360px]:px-6 min-[375px]:px-8 sm:px-10 md:px-12 py-2 min-[360px]:py-3 min-[375px]:py-4 sm:py-4 md:py-5">
          <div className="text-center">
            <div className="text-black font-ibm text-sm min-[360px]:text-base sm:text-lg md:text-xl font-normal leading-[110%]">
              Общий бюджет {totalBudget}
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Section */}
      <div key={`transfer-${animationKey}`} className="px-4 min-[360px]:px-6 min-[375px]:px-8 sm:px-10 md:px-12 py-2 min-[360px]:py-3 min-[375px]:py-4 sm:py-4 md:py-5 ">
        <div className="text-black font-ibm text-lg sm:text-xl md:text-2xl font-medium leading-[110%] mb-4 sm:mb-5 md:mb-6">
          Перевод между своими банками
        </div>
        <div className="flex space-x-2 min-[360px]:space-x-3 min-[375px]:space-x-3 sm:space-x-4 md:space-x-5 overflow-x-auto scrollbar-hide">
          {/* Показываем только карты, которые не являются текущей выбранной картой */}
          {cards.map((card, index) => {
            if (card.id === currentCard.id) return null; // Пропускаем текущую карту
            
            return (
              <div 
                key={card.id} 
                className="flex-shrink-0 w-[70px] h-[80px] min-[360px]:w-[75px] min-[360px]:h-[85px] min-[370px]:w-[80px] min-[370px]:h-[90px] min-[375px]:w-[85px] min-[375px]:h-[95px] min-[380px]:w-[90px] min-[380px]:h-[100px] sm:w-[100px] sm:h-[110px] md:w-[110px] md:h-[120px] rounded-[22px] flex flex-col items-center justify-center p-1 cursor-pointer hover:scale-105 transition-transform duration-200" 
                style={{ backgroundColor: card.color }}
                onClick={() => handleTransferCardClick(card)}
              >
                {card.id === 'vbank' && (
                  <div className="text-white text-sm font-bold font-ibm mb-1">{card.logo}</div>
                )}
                {card.id === 'abank' && (
                  <div className="text-white text-sm font-bold font-ibm mb-1">{card.logo}</div>
                )}
                {card.id === 'sbank' && (
                  <div className="text-white text-sm font-bold font-ibm mb-1">{card.logo}</div>
                )}
                <div className="text-white text-sm font-normal font-ibm">{formatDisplayName(telegramUser.displayName)}</div>
              </div>
            );
          })}
          
          {/* Other Bank Card */}
          <div 
            className="flex-shrink-0 w-[70px] h-[80px] min-[360px]:w-[75px] min-[360px]:h-[85px] min-[370px]:w-[80px] min-[370px]:h-[90px] min-[375px]:w-[85px] min-[375px]:h-[95px] min-[380px]:w-[90px] min-[380px]:h-[100px] sm:w-[100px] sm:h-[110px] md:w-[110px] md:h-[120px] bg-gray-200 rounded-[22px] flex flex-col items-center justify-center p-1 cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => setShowOtherBankModal(true)}
          >
            <div className="text-gray-600 text-sm font-normal font-ibm text-center">Другой банк</div>
          </div>
        </div>
      </div>

      {/* Card Information Section */}
      <div key={`card-info-${animationKey}`} className="px-4 min-[360px]:px-6 min-[375px]:px-8 sm:px-10 md:px-12 py-2 min-[360px]:py-3 min-[375px]:py-4 sm:py-4 md:py-5 ">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 font-ibm flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Информация о карте
            </h2>
            <button
              onClick={() => {
                const currentCard = cards[currentCardIndex];
                const cardInfo = {
                  bank: currentCard?.name || 'Неизвестно',
                  cardNumber: currentCard?.cardNumber || 'Недоступно',
                  balance: currentCard?.balance || 'Недоступно',
                  status: cardStatus === 'BLOCK' || cardStatus === 'PERMANENTBLOCK' ? 'Заблокирована' : 'Активна',
                  credentials: cardCredentials?.data ? {
                    pan: cardCredentials.data.encryptedPan ? (() => {
                      try {
                        return atob(cardCredentials.data.encryptedPan);
                      } catch (e) {
                        return cardCredentials.data.encryptedPan.substring(0, 20) + '...';
                      }
                    })() : 'Недоступно',
                    expiry: cardCredentials.data.cardExpiry || 'Недоступно',
                    holder: cardCredentials.data.embossingName || 'Недоступно'
                  } : null,
                  tokens: cardTokens?.data?.tokens || []
                };

                // Формируем текст выписки
                let statementText = `ВЫПИСКА ПО КАРТЕ\n`;
                statementText += `Дата формирования: ${new Date().toLocaleString('ru-RU')}\n\n`;
                statementText += `БАНК: ${cardInfo.bank}\n`;
                statementText += `НОМЕР КАРТЫ: ${cardInfo.cardNumber}\n`;
                statementText += `БАЛАНС: ${cardInfo.balance}\n`;
                statementText += `СТАТУС: ${cardInfo.status}\n\n`;

                if (cardInfo.credentials) {
                  statementText += `РЕКВИЗИТЫ КАРТЫ:\n`;
                  statementText += `Номер карты: ${cardInfo.credentials.pan}\n`;
                  statementText += `Срок действия: ${cardInfo.credentials.expiry}\n`;
                  statementText += `Держатель: ${cardInfo.credentials.holder}\n\n`;
                }

                if (cardInfo.tokens.length > 0) {
                  statementText += `ТОКЕНЫ КОШЕЛЬКОВ:\n`;
                  cardInfo.tokens.forEach((token, index) => {
                    statementText += `${index + 1}. ${token.name || `Токен ${index + 1}`}: ${token.value}\n`;
                  });
                  statementText += `\n`;
                }

                statementText += `\n---\n`;
                statementText += `Сгенерировано в MultiBank\n`;

                // Создаем Blob и скачиваем файл
                const blob = new Blob([statementText], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const fileName = `Выписка_${cardInfo.bank}_${new Date().toISOString().split('T')[0]}.txt`;
                
                // Вспомогательная функция для скачивания файла
                const downloadFile = (fileUrl, fileFileName) => {
                  const link = document.createElement('a');
                  link.href = fileUrl;
                  link.download = fileFileName;
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  
                  // Используем setTimeout для надежности на мобильных
                  setTimeout(() => {
                    link.click();
                    setTimeout(() => {
                      document.body.removeChild(link);
                      URL.revokeObjectURL(fileUrl);
                    }, 100);
                  }, 0);
                };
                
                // Проверяем, является ли устройство мобильным
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                
                if (isMobile && isIOS && navigator.share) {
                  // Для iOS используем Web Share API, если доступен
                  const file = new File([blob], fileName, { type: 'text/plain' });
                  if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    navigator.share({
                      files: [file],
                      title: fileName,
                      text: 'Выписка по карте'
                    }).catch(() => {
                      // Fallback: используем download
                      downloadFile(url, fileName);
                    });
                    // Освобождаем URL после share
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  } else {
                    // Fallback: используем download
                    downloadFile(url, fileName);
                  }
                } else {
                  // Для Android, десктопа и других устройств используем download
                  downloadFile(url, fileName);
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 text-white rounded-[27px] hover:opacity-90 transition-opacity font-ibm text-sm font-medium"
              style={{ backgroundColor: cards[currentCardIndex]?.color || '#3C82F6' }}
            >
              <Download className="w-4 h-4" />
              <span>Скачать выписку</span>
            </button>
          </div>
          
          {/* Credentials Section */}
          <div className="mb-4">
            <button
              onClick={() => {
                setShowCredentials(!showCredentials);
                if (!showCredentials && !cardCredentials) {
                  refetchCredentials();
                }
              }}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-700 font-ibm font-medium">Реквизиты карты</span>
              {showCredentials ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
            </button>
            
            {showCredentials && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                {isLoadingCredentials ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="md" />
                  </div>
                ) : cardCredentials?.data ? (
                  <div className="space-y-3 font-ibm">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Номер карты: </span>
                      <span className="text-sm text-gray-900 font-mono">
                        {cardCredentials.data.encryptedPan ? 
                          (() => {
                            try {
                              const decoded = atob(cardCredentials.data.encryptedPan);
                              return decoded.replace(/(.{4})/g, '$1 ').trim();
                            } catch (e) {
                              return cardCredentials.data.encryptedPan.substring(0, 20) + '...';
                            }
                          })() : 
                          'Недоступно'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Срок действия: </span>
                      <span className="text-sm text-gray-900">{cardCredentials.data.cardExpiry || 'Недоступно'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Держатель: </span>
                      <span className="text-sm text-gray-900">{cardCredentials.data.embossingName || 'Недоступно'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm font-ibm">Нажмите, чтобы загрузить реквизиты</p>
                )}
              </div>
            )}
          </div>

          {/* CVV Section */}
          <div className="mb-4">
            <button
              onClick={() => {
                setShowCvv(!showCvv);
                if (!showCvv && !cardCvv) {
                  refetchCvv();
                }
              }}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-700 font-ibm font-medium flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                CVV код
              </span>
              {showCvv ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
            </button>
            
            {showCvv && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                {isLoadingCvv ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="md" />
                  </div>
                ) : cardCvv?.data?.Cvv ? (
                  <div className="font-ibm">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-gray-900 font-mono">
                        {(() => {
                          try {
                            return atob(cardCvv.data.Cvv);
                          } catch (e) {
                            return cardCvv.data.Cvv;
                          }
                        })()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">Храните в безопасности</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm font-ibm text-center">Нажмите, чтобы загрузить CVV</p>
                )}
              </div>
            )}
          </div>

          {/* Tokens Section */}
          {cardTokens?.data?.tokens && cardTokens.data.tokens.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-ibm font-medium flex items-center">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Токены кошельков
                </span>
                <span className="text-xs text-gray-500 font-ibm">
                  {cardTokens.data.tokens.length} токен(ов)
                </span>
              </div>
              
              <div className="mt-3 space-y-2">
                {cardTokens.data.tokens.map((token, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 font-ibm mb-1">
                      {token.name || `Токен ${index + 1}`}
                    </div>
                    <div className="text-xs text-gray-500 font-mono font-ibm break-all">
                      {token.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card Operations Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3 font-ibm">Управление картой</h3>
            
            <div className="space-y-2">
              {/* Block/Unblock Card Button */}
              <button
                onClick={() => setShowBlockModal(true)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors font-ibm ${
                  cardStatus === 'BLOCK' || cardStatus === 'PERMANENTBLOCK'
                    ? 'bg-green-50 hover:bg-green-100 text-green-700'
                    : 'bg-red-50 hover:bg-red-100 text-red-700'
                }`}
              >
                <span className="font-medium flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  {cardStatus === 'BLOCK' || cardStatus === 'PERMANENTBLOCK' ? 'Разблокировать карту' : 'Заблокировать карту'}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  cardStatus === 'BLOCK' || cardStatus === 'PERMANENTBLOCK'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {cardStatus === 'BLOCK' || cardStatus === 'PERMANENTBLOCK' ? 'Заблокирована' : 'Активна'}
                </span>
              </button>

              {/* Change PIN Button */}
              <button
                onClick={() => setShowPinModal(true)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors font-ibm"
              >
                <span className="text-gray-700 font-medium flex items-center">
                  <Key className="w-4 h-4 mr-2" />
                  Изменить PIN-код
                </span>
              </button>

              {/* Close Card Button */}
              <button
                onClick={() => setShowCloseModal(true)}
                className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-ibm text-red-700"
              >
                <span className="font-medium flex items-center">
                  <XCircle className="w-4 h-4 mr-2" />
                  Закрыть карту
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Block/Unblock Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-ibm">
              {cardStatus === 'BLOCK' || cardStatus === 'PERMANENTBLOCK' ? 'Разблокировать карту?' : 'Заблокировать карту?'}
            </h3>
            <p className="text-gray-600 mb-6 font-ibm text-sm">
              {cardStatus === 'BLOCK' || cardStatus === 'PERMANENTBLOCK'
                ? 'Вы уверены, что хотите разблокировать карту?'
                : 'Вы уверены, что хотите заблокировать карту? Вы сможете разблокировать ее позже.'}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-ibm"
              >
                Отмена
              </button>
              <button
                onClick={cardStatus === 'BLOCK' || cardStatus === 'PERMANENTBLOCK' ? handleUnblockCard : handleBlockCard}
                disabled={blockCardMutation.isLoading || unblockCardMutation.isLoading}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors font-ibm ${
                  cardStatus === 'BLOCK' || cardStatus === 'PERMANENTBLOCK'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:opacity-50`}
              >
                {blockCardMutation.isLoading || unblockCardMutation.isLoading ? 'Обработка...' : 'Подтвердить'}
              </button>
            </div>
            {(blockCardMutation.isError || unblockCardMutation.isError) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-ibm">
                  {blockCardMutation.error?.response?.data?.message || unblockCardMutation.error?.response?.data?.message || 'Ошибка при изменении статуса карты'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Close Card Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-ibm">Закрыть карту?</h3>
            <p className="text-gray-600 mb-6 font-ibm text-sm">
              Внимание! Закрытие карты возможно только при нулевом балансе. Это действие необратимо.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCloseModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-ibm"
              >
                Отмена
              </button>
              <button
                onClick={handleCloseCard}
                disabled={closeCardMutation.isLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-ibm disabled:opacity-50"
              >
                {closeCardMutation.isLoading ? 'Закрытие...' : 'Закрыть карту'}
              </button>
            </div>
            {closeCardMutation.isError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-ibm">
                  {closeCardMutation.error?.response?.data?.message || 'Ошибка при закрытии карты'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-ibm">Изменить PIN-код</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                  Зашифрованный PIN-код
                </label>
                <input
                  type="password"
                  value={pinData.pin}
                  onChange={(e) => setPinData({ ...pinData, pin: e.target.value })}
                  placeholder="Введите PIN"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-ibm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                  ID публичного ключа
                </label>
                <input
                  type="text"
                  value={pinData.publicKeyId}
                  onChange={(e) => setPinData({ ...pinData, publicKeyId: e.target.value })}
                  placeholder="Введите ID ключа"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-ibm"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPinData({ pin: '', publicKeyId: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-ibm"
              >
                Отмена
              </button>
              <button
                onClick={handleChangePin}
                disabled={changePinMutation.isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-ibm disabled:opacity-50"
              >
                {changePinMutation.isLoading ? 'Изменение...' : 'Изменить'}
              </button>
            </div>
            {changePinMutation.isError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-ibm">
                  {changePinMutation.error?.response?.data?.message || 'Ошибка при изменении PIN-кода'}
                </p>
              </div>
            )}
            {changePinMutation.isSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-ibm">PIN-код успешно изменен!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Operations Section */}
      <div key={`operations-${animationKey}`} className="px-4 min-[360px]:px-6 min-[375px]:px-8 sm:px-10 md:px-12 py-2 min-[360px]:py-3 min-[375px]:py-4 sm:py-4 md:py-5 ">
        <div className="flex items-center justify-between mb-3 min-[360px]:mb-4 min-[375px]:mb-4 sm:mb-5 md:mb-6">
          <div className="text-black font-ibm text-base min-[360px]:text-lg sm:text-xl md:text-2xl font-medium leading-[110%]">
            Операции
          </div>
          <div className="text-gray-500 font-ibm text-xs min-[360px]:text-sm sm:text-base md:text-lg font-normal leading-[110%]">
            Посмотреть все
          </div>
        </div>
        <div className="text-gray-500 font-ibm text-sm min-[360px]:text-base sm:text-lg md:text-xl font-medium leading-[110%] mb-3 min-[360px]:mb-4 min-[375px]:mb-4 sm:mb-5 md:mb-6">
          Сегодня
        </div>
        
        {/* Operations List */}
        <div className="space-y-3">
          {currentCard?.isUnconfirmed ? (
            <div className="text-center py-8">
              <div className="text-gray-500 font-ibm text-lg mb-4">Подтвердите карту в банке</div>
              <button 
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-ibm font-medium rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => alert('Переход в банк для подтверждения карты')}
              >
                Перейти в банк
              </button>
            </div>
          ) : (
            currentCard?.operations?.map((operation, index) => (
            <div key={index} className="relative w-full h-[45px] min-[360px]:h-[47px] min-[375px]:h-[49px] sm:h-[55px] md:h-[60px] bg-gray-100 rounded-[32px] flex items-center px-4 min-[360px]:px-5 min-[375px]:px-5">
              <div className={`w-[35px] h-[35px] min-[360px]:w-[38px] min-[360px]:h-[38px] min-[375px]:w-[42px] min-[375px]:h-[42px] sm:w-[60px] sm:h-[55px] md:w-[65px] md:h-[60px] ${operation.iconColor} rounded-[30px] flex items-center justify-center mr-3 min-[360px]:mr-4`}>
                <div className={`${operation.textColor} font-bold text-xs min-[360px]:text-sm`}>
                  {operation.icon}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-base font-medium leading-[110%]">{operation.name}</div>
                <div className="text-gray-500 font-ibm text-xs font-normal leading-[110%]">{operation.category}</div>
              </div>
              <div className="text-black font-ibm text-sm min-[360px]:text-base min-[375px]:text-base font-medium leading-[110%]">{operation.amount}</div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-20"></div>

      {/* Other Bank Modal */}
      {showOtherBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-200 rounded-2xl p-6 mx-4 max-w-sm w-full">
            <div className="text-center">
              <div className="text-lg font-semibold font-ibm text-gray-800 mb-4">
                Здесь будут отображены банки
              </div>
              <button
                onClick={() => setShowOtherBankModal(false)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium font-ibm hover:bg-blue-600 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

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

export default CardAnalyticsPage;
