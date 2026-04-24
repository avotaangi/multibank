import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import useBalanceStore from '../stores/balanceStore';
import useTestCardsStore from '../stores/testCardsStore';
import { useTelegramUser } from '../hooks/useTelegramUser';
import { cardManagementAPI } from '../services/api';
import useAuthStore from '../stores/authStore';

const BankCardStack = ({ onLoadingChange, availableBanks = [] }) => {
  console.log('🚀 [BankCardStack] Компонент загружен');
  
  const navigate = useNavigate();
  const getFormattedBalance = useBalanceStore((state) => state.getFormattedBalance);
  const { getAllCards } = useTestCardsStore();
  const telegramUser = useTelegramUser();
  const getClientIdId = useAuthStore((state) => state.getClientIdId);
  // Функция для нормализации id: если id === 0, возвращаем 1
  const normalizeId = (id) => {
    if (id === 0) return 1;
    return id;
  };
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  
  const CLIENT_ID_ID = normalizeId(getClientIdId());
  console.log('👤 [BankCardStack] CLIENT_ID_ID:', CLIENT_ID_ID);
  console.log('👤 [BankCardStack] import.meta.env:', import.meta.env);
  console.log('👤 [BankCardStack] VITE_CLIENT_ID_ID из env:', import.meta.env.VITE_CLIENT_ID_ID);

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

  // Функция для форматирования номера карты из API
  const formatCardNumber = (encryptedPan) => {
    if (!encryptedPan) return null;
    const rawValue = String(encryptedPan).trim();
    if (rawValue.includes('*')) return rawValue;

    const digitsOnly = rawValue.replace(/[^\d]/g, '');
    if (digitsOnly.length >= 16) {
      const first4 = digitsOnly.substring(0, 4);
      const last4 = digitsOnly.substring(digitsOnly.length - 4);
      return `${first4} **** **** ${last4}`;
    }

    try {
      const decoded = atob(rawValue);
      const decodedDigits = decoded.replace(/[^\d]/g, '');
      if (decodedDigits.length >= 16) {
        const first4 = decodedDigits.substring(0, 4);
        const last4 = decodedDigits.substring(decodedDigits.length - 4);
        return `${first4} **** **** ${last4}`;
      }
      return decoded;
    } catch (e) {
      return rawValue;
    }
  };

  const preferredCardIds = {
    vbank: 'vbank-card-1',
    abank: 'abank-card-1',
    sbank: 'sbank-card-1',
  };

  // Загружаем карты для каждого банка из API
  console.log('🔍 [BankCardStack] Создаю useQuery для карт, CLIENT_ID_ID:', CLIENT_ID_ID);
  console.log('🔍 [BankCardStack] !!CLIENT_ID_ID:', !!CLIENT_ID_ID);
  console.log('🔍 [BankCardStack] enabled будет:', !!CLIENT_ID_ID);
  
  const { data: vbankCards, isLoading: vbankLoading, error: vbankError } = useQuery(
    ['cards', 'vbank', CLIENT_ID_ID],
    async () => {
      console.log('🔍 [BankCardStack-VBANK] ⚡ ФУНКЦИЯ ЗАПРОСА ВЫЗВАНА! CLIENT_ID_ID:', CLIENT_ID_ID);
      const cardsList = await cardManagementAPI.getCards('vbank', CLIENT_ID_ID);
      console.log('📦 [BankCardStack-VBANK] Список карт получен:', JSON.stringify(cardsList, null, 2));
      
      // Извлекаем карты из ответа - структура может быть разной
      // cardsList - это axios response: { data: { data: { cards: [...] } }, status: 200, ... }
      let cards = [];
      
      // Проверяем структуру ответа
      console.log('🔍 [BankCardStack-VBANK] Структура cardsList:', {
        hasData: !!cardsList?.data,
        hasDataData: !!cardsList?.data?.data,
        hasDataDataCards: !!cardsList?.data?.data?.cards,
        isArray: Array.isArray(cardsList?.data?.data?.cards)
      });
      
      if (cardsList?.data?.data?.cards && Array.isArray(cardsList.data.data.cards)) {
        cards = cardsList.data.data.cards;
        console.log('✅ [BankCardStack-VBANK] Извлечено из cardsList.data.data.cards');
      } else if (cardsList?.data?.cards && Array.isArray(cardsList.data.cards)) {
        cards = cardsList.data.cards;
        console.log('✅ [BankCardStack-VBANK] Извлечено из cardsList.data.cards');
      } else if (cardsList?.cards && Array.isArray(cardsList.cards)) {
        cards = cardsList.cards;
        console.log('✅ [BankCardStack-VBANK] Извлечено из cardsList.cards');
      } else if (Array.isArray(cardsList?.data)) {
        cards = cardsList.data;
        console.log('✅ [BankCardStack-VBANK] Используем cardsList.data как массив');
      }
      
      console.log('📋 [BankCardStack-VBANK] Извлеченные карты (массив):', cards);
      console.log('📋 [BankCardStack-VBANK] Количество карт:', cards.length);
      console.log('📋 [BankCardStack-VBANK] Тип cards:', Array.isArray(cards) ? 'массив' : typeof cards);
      if (cards.length > 0 && Array.isArray(cards)) {
        console.log('📋 [BankCardStack-VBANK] Первая карта из массива:', cards[0]);
        console.log('📋 [BankCardStack-VBANK] cardNumber первой карты:', cards[0]?.cardNumber);
      }
      
      if (cards.length > 0 && cards[0].cardId) {
        console.log('🔍 [BankCardStack-VBANK] Первая карта:', cards[0]);
        console.log('🔍 [BankCardStack-VBANK] cardNumber из списка:', cards[0].cardNumber);
        console.log('🔍 [BankCardStack-VBANK] cardNumberFull из списка:', cards[0].cardNumberFull);
        
        // Пробуем получить детали карты с полным номером
        try {
          const cardDetails = await cardManagementAPI.getCardDetails('vbank', cards[0].cardId, CLIENT_ID_ID, true);
          console.log('✅ [BankCardStack-VBANK] Детали карты получены:', JSON.stringify(cardDetails, null, 2));
          return { ...cardsList, cards, cardDetails };
        } catch (e) {
          console.warn('⚠️ [BankCardStack-VBANK] Не удалось получить детали карты, используем маскированный номер из списка:', e);
          // Возвращаем список с извлеченными картами
          return { ...cardsList, cards };
        }
      }
      return { ...cardsList, cards: [] };
    },
    {
      enabled: !!CLIENT_ID_ID,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.warn('❌ [BankCardStack-VBANK] Не удалось загрузить карты:', error);
      },
      onSuccess: (data) => {
        console.log('✅ [BankCardStack-VBANK] Карты успешно загружены:', data);
      }
    }
  );
  
  console.log('🔍 [BankCardStack] После useQuery vbank - vbankLoading:', vbankLoading, 'vbankError:', vbankError, 'vbankCards:', vbankCards);

  const { data: abankCards, isLoading: abankLoading, error: abankError } = useQuery(
    ['cards', 'abank', CLIENT_ID_ID],
    async () => {
      console.log('🔍 [BankCardStack-ABANK] ⚡ ФУНКЦИЯ ЗАПРОСА ВЫЗВАНА! CLIENT_ID_ID:', CLIENT_ID_ID);
      const cardsList = await cardManagementAPI.getCards('abank', CLIENT_ID_ID);
      console.log('📦 [BankCardStack-ABANK] Список карт получен:', JSON.stringify(cardsList, null, 2));
      
      // Извлекаем карты из ответа - структура может быть разной
      // cardsList - это axios response: { data: { data: { cards: [...] } }, status: 200, ... }
      let cards = [];
      
      // Проверяем структуру ответа
      console.log('🔍 [BankCardStack-ABANK] Структура cardsList:', {
        hasData: !!cardsList?.data,
        hasDataData: !!cardsList?.data?.data,
        hasDataDataCards: !!cardsList?.data?.data?.cards,
        isArray: Array.isArray(cardsList?.data?.data?.cards)
      });
      
      if (cardsList?.data?.data?.cards && Array.isArray(cardsList.data.data.cards)) {
        cards = cardsList.data.data.cards;
        console.log('✅ [BankCardStack-ABANK] Извлечено из cardsList.data.data.cards');
      } else if (cardsList?.data?.cards && Array.isArray(cardsList.data.cards)) {
        cards = cardsList.data.cards;
        console.log('✅ [BankCardStack-ABANK] Извлечено из cardsList.data.cards');
      } else if (cardsList?.cards && Array.isArray(cardsList.cards)) {
        cards = cardsList.cards;
        console.log('✅ [BankCardStack-ABANK] Извлечено из cardsList.cards');
      } else if (Array.isArray(cardsList?.data)) {
        cards = cardsList.data;
        console.log('✅ [BankCardStack-ABANK] Используем cardsList.data как массив');
      }
      
      console.log('📋 [BankCardStack-ABANK] Извлеченные карты (массив):', cards);
      console.log('📋 [BankCardStack-ABANK] Количество карт:', cards.length);
      console.log('📋 [BankCardStack-ABANK] Тип cards:', Array.isArray(cards) ? 'массив' : typeof cards);
      if (cards.length > 0 && Array.isArray(cards)) {
        console.log('📋 [BankCardStack-ABANK] Первая карта из массива:', cards[0]);
        console.log('📋 [BankCardStack-ABANK] cardNumber первой карты:', cards[0]?.cardNumber);
      }
      
      if (cards.length > 0 && cards[0].cardId) {
        console.log('🔍 [BankCardStack-ABANK] Первая карта:', cards[0]);
        console.log('🔍 [BankCardStack-ABANK] cardNumber из списка:', cards[0].cardNumber);
        console.log('🔍 [BankCardStack-ABANK] cardNumberFull из списка:', cards[0].cardNumberFull);
        
        // Пробуем получить детали карты с полным номером
        try {
          const cardDetails = await cardManagementAPI.getCardDetails('abank', cards[0].cardId, CLIENT_ID_ID, true);
          console.log('✅ [BankCardStack-ABANK] Детали карты получены:', JSON.stringify(cardDetails, null, 2));
          return { ...cardsList, cards, cardDetails };
        } catch (e) {
          console.warn('⚠️ [BankCardStack-ABANK] Не удалось получить детали карты, используем маскированный номер из списка:', e);
          // Возвращаем список с извлеченными картами
          return { ...cardsList, cards };
        }
      }
      // Если карт нет, возвращаем структуру с пустым массивом и метаданными
      console.log('⚠️ [BankCardStack-ABANK] Карты не найдены, возвращаем пустой массив');
      return { ...cardsList, cards: [], meta: cardsList?.meta || cardsList?.data?.meta };
    },
    {
      enabled: !!CLIENT_ID_ID,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.warn('❌ [BankCardStack-ABANK] Не удалось загрузить карты:', error);
      },
      onSuccess: (data) => {
        console.log('✅ [BankCardStack-ABANK] Карты успешно загружены:', data);
      }
    }
  );

  const { data: sbankCards, isLoading: sbankLoading, error: sbankError } = useQuery(
    ['cards', 'sbank', CLIENT_ID_ID],
    async () => {
      console.log('🔍 [BankCardStack-SBANK] ⚡ ФУНКЦИЯ ЗАПРОСА ВЫЗВАНА! CLIENT_ID_ID:', CLIENT_ID_ID);
      const cardsList = await cardManagementAPI.getCards('sbank', CLIENT_ID_ID);
      console.log('📦 [BankCardStack-SBANK] Список карт получен:', JSON.stringify(cardsList, null, 2));
      
      // Извлекаем карты из ответа - структура может быть разной
      // cardsList - это axios response: { data: { data: { cards: [...] } }, status: 200, ... }
      let cards = [];
      
      // Проверяем структуру ответа
      console.log('🔍 [BankCardStack-SBANK] Структура cardsList:', {
        hasData: !!cardsList?.data,
        hasDataData: !!cardsList?.data?.data,
        hasDataDataCards: !!cardsList?.data?.data?.cards,
        isArray: Array.isArray(cardsList?.data?.data?.cards)
      });
      
      if (cardsList?.data?.data?.cards && Array.isArray(cardsList.data.data.cards)) {
        cards = cardsList.data.data.cards;
        console.log('✅ [BankCardStack-SBANK] Извлечено из cardsList.data.data.cards');
      } else if (cardsList?.data?.cards && Array.isArray(cardsList.data.cards)) {
        cards = cardsList.data.cards;
        console.log('✅ [BankCardStack-SBANK] Извлечено из cardsList.data.cards');
      } else if (cardsList?.cards && Array.isArray(cardsList.cards)) {
        cards = cardsList.cards;
        console.log('✅ [BankCardStack-SBANK] Извлечено из cardsList.cards');
      } else if (Array.isArray(cardsList?.data)) {
        cards = cardsList.data;
        console.log('✅ [BankCardStack-SBANK] Используем cardsList.data как массив');
      }
      
      console.log('📋 [BankCardStack-SBANK] Извлеченные карты (массив):', cards);
      console.log('📋 [BankCardStack-SBANK] Количество карт:', cards.length);
      console.log('📋 [BankCardStack-SBANK] Тип cards:', Array.isArray(cards) ? 'массив' : typeof cards);
      if (cards.length > 0 && Array.isArray(cards)) {
        console.log('📋 [BankCardStack-SBANK] Первая карта из массива:', cards[0]);
        console.log('📋 [BankCardStack-SBANK] cardNumber первой карты:', cards[0]?.cardNumber);
      }
      
      if (cards.length > 0 && cards[0].cardId) {
        console.log('🔍 [BankCardStack-SBANK] Первая карта:', cards[0]);
        console.log('🔍 [BankCardStack-SBANK] cardNumber из списка:', cards[0].cardNumber);
        console.log('🔍 [BankCardStack-SBANK] cardNumberFull из списка:', cards[0].cardNumberFull);
        
        // Пробуем получить детали карты с полным номером
        try {
          const cardDetails = await cardManagementAPI.getCardDetails('sbank', cards[0].cardId, CLIENT_ID_ID, true);
          console.log('✅ [BankCardStack-SBANK] Детали карты получены:', JSON.stringify(cardDetails, null, 2));
          return { ...cardsList, cards, cardDetails };
        } catch (e) {
          console.warn('⚠️ [BankCardStack-SBANK] Не удалось получить детали карты, используем маскированный номер из списка:', e);
          // Возвращаем список с извлеченными картами
          return { ...cardsList, cards };
        }
      }
      // Если карт нет, возвращаем структуру с пустым массивом и метаданными
      console.log('⚠️ [BankCardStack-SBANK] Карты не найдены, возвращаем пустой массив');
      return { ...cardsList, cards: [], meta: cardsList?.meta || cardsList?.data?.meta };
    },
    {
      enabled: !!CLIENT_ID_ID,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.warn('❌ [BankCardStack-SBANK] Не удалось загрузить карты:', error);
      },
      onSuccess: (data) => {
        console.log('✅ [BankCardStack-SBANK] Карты успешно загружены:', data);
      }
    }
  );
  
  console.log('🔍 [BankCardStack] vbankCards:', vbankCards, 'vbankLoading:', vbankLoading);
  console.log('🔍 [BankCardStack] abankCards:', abankCards, 'abankLoading:', abankLoading);
  console.log('🔍 [BankCardStack] sbankCards:', sbankCards, 'sbankLoading:', sbankLoading);

  const baseCardsData = [
    {
      id: 'vbank',
      name: 'ВТБ',
      balance: (() => {
        const balance = getFormattedBalance('vbank');
        console.log('🔄 BankCardStack - VBank баланс:', balance);
        return balance;
      })(),
      color: '#0055BC',
      logo: 'ВТБ',
      cardNumber: '5294 **** **** 2498',
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
      id: 'abank',
      name: 'Альфа-Банк',
      balance: (() => {
        const balance = getFormattedBalance('abank');
        console.log('🔄 BankCardStack - ABank баланс:', balance);
        return balance;
      })(),
      color: '#EF3124',
      logo: 'Альфа',
      cardNumber: '3568 **** **** 8362',
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
      id: 'sbank',
      name: 'Сбербанк',
      balance: (() => {
        const balance = getFormattedBalance('sbank');
        console.log('🔄 BankCardStack - SBank баланс:', balance);
        return balance;
      })(),
      color: '#00A859',
      logo: 'Сбер',
      cardNumber: '6352 **** **** 3923',
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

  // Обновляем baseCards с реальными номерами из API
  const baseCards = useMemo(() => {
    console.log('🎴 [BankCardStack] useMemo baseCards вызван');
    console.log('🎴 [BankCardStack] vbankCards:', vbankCards);
    console.log('🎴 [BankCardStack] abankCards:', abankCards);
    console.log('🎴 [BankCardStack] sbankCards:', sbankCards);
    
    return baseCardsData.map((card) => {
      console.log(`🔹 [BankCardStack] Обрабатываю карту ${card.id}`);
      
      // Пробуем получить номер карты из API
      let realCardNumber = null;
      
      // Получаем данные карты из API
      let cardsData = null;
      if (card.id === 'vbank') cardsData = vbankCards;
      else if (card.id === 'abank') cardsData = abankCards;
      else if (card.id === 'sbank') cardsData = sbankCards;
      
      console.log(`🔍 [BankCardStack] Обрабатываю карту ${card.id}, cardsData:`, cardsData);
      
      // Проверяем, есть ли pending_consent в метаданных
      const hasPendingConsent = cardsData?.meta?.pending_consent || cardsData?.data?.meta?.pending_consent;
      if (hasPendingConsent) {
        console.log(`⚠️ [BankCardStack] Для ${card.id} согласие в статусе pending, используем дефолтный номер карты`);
      }
      
      if (cardsData && !hasPendingConsent) {
        // Пробуем получить из деталей карты (полный номер, если доступен)
        const cardDetails = cardsData?.cardDetails?.data || cardsData?.cardDetails;
        if (cardDetails) {
          const fullNumber = cardDetails.cardNumberFull || cardDetails.cardNumber;
          if (fullNumber) {
            realCardNumber = fullNumber.includes('*') ? fullNumber : formatCardNumber(fullNumber);
            console.log(`✅ [BankCardStack] Номер из cardDetails для ${card.id}:`, realCardNumber);
          }
        }
        
        // Если не получили из деталей, пробуем из списка карт
        if (!realCardNumber) {
          // Извлекаем карты из разных возможных структур
          // cardsData - это весь ответ axios, который мы вернули из useQuery
          let cardsList = [];
          
          // Сначала проверяем, есть ли уже извлеченные карты в cardsData.cards (которые мы сохранили)
          if (cardsData?.cards && Array.isArray(cardsData.cards)) {
            cardsList = cardsData.cards;
            console.log(`🔍 [BankCardStack] Используем cardsData.cards для ${card.id}, количество:`, cardsList.length);
          } 
          // Если нет, пробуем извлечь из структуры axios ответа
          else if (cardsData?.data?.data?.data?.cards) {
            cardsList = cardsData.data.data.data.cards;
            console.log(`🔍 [BankCardStack] Извлекаем из cardsData.data.data.data.cards для ${card.id}`);
          } else if (cardsData?.data?.data?.cards) {
            cardsList = cardsData.data.data.cards;
            console.log(`🔍 [BankCardStack] Извлекаем из cardsData.data.data.cards для ${card.id}`);
          } else if (cardsData?.data?.cards) {
            cardsList = cardsData.data.cards;
            console.log(`🔍 [BankCardStack] Извлекаем из cardsData.data.cards для ${card.id}`);
          } else if (Array.isArray(cardsData?.data)) {
            cardsList = cardsData.data;
            console.log(`🔍 [BankCardStack] Используем cardsData.data как массив для ${card.id}`);
          }
          
          console.log(`🔍 [BankCardStack] cardsList для ${card.id}:`, cardsList);
          console.log(`🔍 [BankCardStack] Количество карт в списке для ${card.id}:`, cardsList.length);
          
          // Если список карт пустой, используем дефолтный номер
          if (cardsList.length === 0) {
            console.log(`⚠️ [BankCardStack] Список карт пустой для ${card.id}, используем дефолтный номер`);
          } else {
          const primaryCard =
            cardsList.find((item) => item.cardId === preferredCardIds[card.id] || item.publicId === preferredCardIds[card.id]) ||
            cardsList[0];
          if (primaryCard) {
            console.log(`🔍 [BankCardStack] Основная карта для ${card.id}:`, primaryCard);
            // Используем cardNumber из API (уже маскированный)
            const cardNumber = primaryCard.cardNumberFull || primaryCard.cardNumber;
            console.log(`🔍 [BankCardStack] cardNumber из primaryCard для ${card.id}:`, cardNumber);
            if (cardNumber) {
              // Если номер уже маскирован (содержит *), используем как есть
              realCardNumber = cardNumber.includes('*') ? cardNumber : formatCardNumber(cardNumber);
              console.log(`✅ [BankCardStack] Номер из списка для ${card.id}:`, realCardNumber);
            } else {
              console.warn(`⚠️ [BankCardStack] cardNumber не найден в primaryCard для ${card.id}`);
            }
          } else {
            console.warn(`⚠️ [BankCardStack] primaryCard не найдена для ${card.id}, cardsList.length:`, cardsList.length);
            }
          }
        }
      }
      
      // Fallback на старый метод через credentials (если они еще используются)
      // Примечание: credentials отключены, но оставляем код на случай если понадобится
      
      const finalCardNumber = realCardNumber || card.cardNumber;
      console.log(`✅ [BankCardStack] Итоговый номер карты для ${card.id}:`, finalCardNumber);
      
      return {
        ...card,
        cardNumber: finalCardNumber,
      };
    });
  }, [baseCardsData, vbankCards, abankCards, sbankCards]);

  // Объединяем базовые карты с тестовыми
  const testCards = getAllCards();
  const cards = [...baseCards, ...testCards];

  // Определяем, загружаются ли карты для банков, которые есть в availableBanks
  // Если availableBanks пустой, проверяем все банки
  const isCardsLoading = useMemo(() => {
    if (availableBanks.length === 0) {
      // Если список банков еще не загружен, проверяем все
      return vbankLoading || abankLoading || sbankLoading;
    }
    // Проверяем только те банки, которые есть в availableBanks
    let loading = false;
    if (availableBanks.includes('vbank')) loading = loading || vbankLoading;
    if (availableBanks.includes('abank')) loading = loading || abankLoading;
    if (availableBanks.includes('sbank')) loading = loading || sbankLoading;
    return loading;
  }, [vbankLoading, abankLoading, sbankLoading, availableBanks]);
  
  // Уведомляем родительский компонент об изменении состояния загрузки
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isCardsLoading);
    }
  }, [isCardsLoading, onLoadingChange]);

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
      navigate('/my-cards');
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
    navigate('/my-cards');
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
                  <div className="text-white text-lg min-[320px]:text-xl min-[355px]:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-ibm">{cards[0].logo}</div>
                <div className="text-white text-sm min-[320px]:text-base min-[355px]:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal font-ibm">{cards[0].balance}</div>
              </div>
              
              {/* Bottom section */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <div className="text-white text-xs min-[320px]:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-normal font-ibm mb-1">{telegramUser.displayName}</div>
                  <div className="text-white text-xs min-[320px]:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-normal font-ibm">{cards[0].cardNumber}</div>
                </div>
                <div className="text-white text-sm min-[320px]:text-base min-[355px]:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold">МИР</div>
              </div>
            </div>
          </div>
          
          {/* ABank Card */}
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
                  <div className="text-white text-sm font-normal font-ibm mb-1">{telegramUser.displayName}</div>
                  <div className="text-white text-sm font-normal font-ibm">{cards[1].cardNumber}</div>
                </div>
                <div className="text-white text-sm min-[320px]:text-base min-[355px]:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold">МИР</div>
              </div>
            </div>
          </div>
          
          {/* SBank Card */}
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
                <div className="text-white text-lg min-[320px]:text-xl min-[355px]:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-ibm">{cards[2].logo}</div>
                <div className="text-white text-sm min-[320px]:text-base min-[355px]:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal font-ibm">{cards[2].balance}</div>
              </div>
              
              {/* Bottom section */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <div className="text-white text-sm font-normal font-ibm mb-1">{telegramUser.displayName}</div>
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
