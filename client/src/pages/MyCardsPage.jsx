import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import { useQuery } from "react-query";
import { useTelegramUser } from "../hooks/useTelegramUser";
import InfoPanel from "../components/InfoPanel";
import { usePageInfo } from "../hooks/usePageInfo";
import { cardManagementAPI } from "../services/api";
import axios from "axios";
import useAuthStore from "../stores/authStore";

// Создаем axios instance с правильным baseURL
const apiBase = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || 'http://localhost:8000'
const apiClient = axios.create({
  baseURL: apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 🔗 Укажи публичный адрес своего FastAPI (через cloudflared/ngrok)
const API_BASE = import.meta.env.VITE_API_BASE; // 🔗 твой FastAPI endpoint

const MyCardsPage = () => {
  const navigate = useNavigate();
  const pageInfo = usePageInfo();
  const telegramUser = useTelegramUser();
  const getClientIdId = useAuthStore((state) => state.getClientIdId);
  // Функция для нормализации id: если id === 0, возвращаем 1
  const normalizeId = (id) => {
    if (id === 0) return 1;
    return id;
  };
  const CLIENT_ID_ID = normalizeId(getClientIdId());

  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [banks, setBanks] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const banksRef = useRef([]);

  // Синхронизируем banksRef с banks
  useEffect(() => {
    banksRef.current = banks;
  }, [banks]);

  // Очистка при размонтировании
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 🧩 Загружаем список банков
  useEffect(() => {
    let cancelled = false;
    
    const fetchBanks = async () => {
      try {
        const res = await apiClient.get(`/${CLIENT_ID_ID}/bank_names`);
        // Используем requestAnimationFrame для гарантии, что обновление произойдет после рендеринга
        if (!cancelled && isMountedRef.current) {
          requestAnimationFrame(() => {
            if (isMountedRef.current && !cancelled) {
              banksRef.current = res.data;
              setBanks(res.data);
            }
          });
        }
      } catch (err) {
        // Игнорируем ошибки, чтобы не вызывать обновления состояния
      }
    };
    
    fetchBanks();
    
    return () => {
      cancelled = true;
    };
  }, []);

  // 💰 Загружаем балансы после получения банков
  useEffect(() => {
    if (banks.length === 0) {
      // Используем requestAnimationFrame для гарантии, что обновление произойдет после рендеринга
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          setLoading(false);
        }
      });
      return;
    }

    let cancelled = false;

    const fetchBalances = async () => {
      if (!isMountedRef.current || cancelled) return;
      
      try {
        const results = {};
        for (const bank of banks) {
          if (cancelled || !isMountedRef.current) break;
          
          try {
            const res = await apiClient.get(`/available_balance/${bank}/${CLIENT_ID_ID}`);
            if (!cancelled && isMountedRef.current) {
              results[bank] = res.data?.balance || "0 ₽";
            }
          } catch (err) {
            if (!cancelled && isMountedRef.current) {
              results[bank] = "0 ₽";
            }
          }
        }
        
        // Используем requestAnimationFrame для гарантии, что обновление произойдет после рендеринга
        if (!cancelled && isMountedRef.current) {
          requestAnimationFrame(() => {
            if (isMountedRef.current && !cancelled) {
              setBalances(results);
              setLoading(false);
            }
          });
        }
      } catch (err) {
        if (!cancelled && isMountedRef.current) {
          requestAnimationFrame(() => {
            if (isMountedRef.current && !cancelled) {
              setLoading(false);
            }
          });
        }
      }
    };

    // Используем requestAnimationFrame для отложенного запуска
    requestAnimationFrame(() => {
      fetchBalances();
    });
    
    return () => {
      cancelled = true;
    };
  }, [banks]);

  // Функция для форматирования номера карты из API
  const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return null;
    
    // Убираем пробелы и дефисы
    const cleaned = cardNumber.replace(/\s|-/g, '');
    
    // Если номер карты в формате XXXX **** **** XXXX или уже отформатирован
    if (cleaned.includes('*')) {
      return cardNumber;
    }
    
    // Если номер карты полный (16+ цифр), маскируем средние цифры
    if (cleaned.length >= 16) {
      const first4 = cleaned.substring(0, 4);
      const last4 = cleaned.substring(cleaned.length - 4);
      return `${first4} **** **** ${last4}`;
    }
    
    // Если номер короткий, возвращаем как есть
    return cardNumber;
  };

  // Загружаем карты для каждого банка отдельно
  // ВСЕГДА вызываем useQuery (всегда одинаковое количество хуков)
  // Используем стабильные значения enabled через useMemo
  const hasVbank = useMemo(() => banks.includes('vbank'), [banks]);
  const hasAbank = useMemo(() => banks.includes('abank'), [banks]);
  const hasSbank = useMemo(() => banks.includes('sbank'), [banks]);
  
  const { data: vbankCards, isLoading: vbankLoading, error: vbankError } = useQuery(
    ['cards', 'vbank', CLIENT_ID_ID],
    async () => {
      const cardsList = await cardManagementAPI.getCards('vbank', CLIENT_ID_ID);
      
      // Если есть карты, получаем детали первой карты с полным номером
      const cards = cardsList?.data?.data?.cards || cardsList?.data?.cards || cardsList?.cards || cardsList?.data || [];
      
      if (cards.length > 0 && cards[0].cardId) {
        try {
          const cardDetails = await cardManagementAPI.getCardDetails('vbank', cards[0].cardId, CLIENT_ID_ID, true);
          return { ...cardsList, cards, cardDetails };
        } catch (e) {
          return { ...cardsList, cards };
        }
      }
      return { ...cardsList, cards: [] };
    },
    {
      enabled: hasVbank && !!CLIENT_ID_ID,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000
    }
  );

  const { data: abankCards, isLoading: abankLoading, error: abankError } = useQuery(
    ['cards', 'abank', CLIENT_ID_ID],
    async () => {
      const cardsList = await cardManagementAPI.getCards('abank', CLIENT_ID_ID);
      
      const cards = cardsList?.data?.data?.cards || cardsList?.data?.cards || cardsList?.cards || cardsList?.data || [];
      
      if (cards.length > 0 && cards[0].cardId) {
        try {
          const cardDetails = await cardManagementAPI.getCardDetails('abank', cards[0].cardId, CLIENT_ID_ID, true);
          return { ...cardsList, cards, cardDetails };
        } catch (e) {
          return { ...cardsList, cards };
        }
      }
      return { ...cardsList, cards: [] };
    },
    {
      enabled: hasAbank && !!CLIENT_ID_ID,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000
    }
  );

  const { data: sbankCards, isLoading: sbankLoading, error: sbankError } = useQuery(
    ['cards', 'sbank', CLIENT_ID_ID],
    async () => {
      const cardsList = await cardManagementAPI.getCards('sbank', CLIENT_ID_ID);
      
      const cards = cardsList?.data?.data?.cards || cardsList?.data?.cards || cardsList?.cards || cardsList?.data || [];
      
      if (cards.length > 0 && cards[0].cardId) {
        try {
          const cardDetails = await cardManagementAPI.getCardDetails('sbank', cards[0].cardId, CLIENT_ID_ID, true);
          return { ...cardsList, cards, cardDetails };
        } catch (e) {
          return { ...cardsList, cards };
        }
      }
      return { ...cardsList, cards: [] };
    },
    {
      enabled: hasSbank && !!CLIENT_ID_ID,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000
    }
  );

  // 🏦 Генерация карточек с реальными данными из API
  const cards = useMemo(() => {
    return banks.map((bank) => {
      let cardsData = null;
      if (bank === 'vbank') cardsData = vbankCards;
      else if (bank === 'abank') cardsData = abankCards;
      else if (bank === 'sbank') cardsData = sbankCards;
      
      // Получаем первую карту из списка (если есть)
      // Извлекаем карты из разных возможных структур
      let cardsList = [];
      if (cardsData?.cards && Array.isArray(cardsData.cards)) {
        cardsList = cardsData.cards;
      } else if (cardsData?.data?.data?.cards && Array.isArray(cardsData.data.data.cards)) {
        cardsList = cardsData.data.data.cards;
      } else if (cardsData?.data?.cards && Array.isArray(cardsData.data.cards)) {
        cardsList = cardsData.data.cards;
      } else if (Array.isArray(cardsData?.data)) {
        cardsList = cardsData.data;
      }
      const firstCard = cardsList[0] || null;
      
      // Пробуем получить номер из деталей карты (с show_full_number=true)
      const cardDetails = cardsData?.cardDetails?.data || cardsData?.cardDetails;
      
      // Извлекаем номер карты
      let realCardNumber = null;
      
      // Сначала пробуем получить из деталей карты (полный номер)
      if (cardDetails) {
        const fullNumber = cardDetails.cardNumberFull || cardDetails.cardNumber || cardDetails.number || cardDetails.pan || cardDetails.fullPan;
        if (fullNumber) {
          // Если номер уже маскирован, используем как есть
          if (fullNumber.includes('*')) {
            realCardNumber = fullNumber;
          } else {
            realCardNumber = formatCardNumber(fullNumber);
          }
        }
      }
      
      // Если не получили из деталей, пробуем из списка карт
      if (!realCardNumber && firstCard) {
        // Пробуем разные поля, где может быть номер карты
        // cardNumber уже маскирован в формате "**** **** **** 7564"
        const cardNumber = firstCard.cardNumberFull || firstCard.cardNumber || firstCard.number || firstCard.pan || firstCard.maskedPan || firstCard.identification;
        
        if (cardNumber) {
          // Если номер уже в формате "**** **** **** XXXX", используем как есть
          if (cardNumber.includes('*')) {
            realCardNumber = cardNumber;
          } else {
            realCardNumber = formatCardNumber(cardNumber);
          }
        }
      }
      
      return {
        id: bank,
        name: bank.toUpperCase(),
        balance: balances[bank] || "—",
        color:
          bank === "vbank"
            ? "#0055BC"
            : bank === "abank"
            ? "#EF3124"
            : bank === "sbank"
            ? "#00A859"
            : "#333333",
        logo:
          bank === "vbank"
            ? "VBank"
            : bank === "abank"
            ? "ABank"
            : bank === "sbank"
            ? "SBank"
            : bank.toUpperCase(),
        cardNumber: realCardNumber || "**** **** **** 1234",
        cardholderName: telegramUser.displayName || "Клиент",
      };
    });
  }, [banks, balances, vbankCards, abankCards, sbankCards, telegramUser.displayName]);

  const handleCardClick = (card) => {
    navigate(`/card-analytics/${card.id}`);
  };

  if (loading) {
    return <div className="p-6 text-center">Загрузка данных...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4 flex justify-between items-center">
        <div className="w-10"></div>
        <div className="text-black font-ibm text-2xl font-medium">Мои карты</div>
        <button
          onClick={() => setShowInfoPanel(true)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Info className="w-6 h-6" />
        </button>
      </div>

      {/* Cards */}
      <div className="px-5 py-2 space-y-4">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card)}
            className="relative w-full h-[189px] rounded-[27px] cursor-pointer transition-all hover:scale-105"
            style={{
              backgroundColor: card.color,
              boxShadow: "0px 4px 3.8px 1px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="p-6 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="text-white text-2xl font-bold">{card.logo}</div>
                <div className="text-white text-lg">{card.balance}</div>
              </div>
              <div>
                <div className="text-white text-sm mb-1">{card.cardholderName}</div>
                <div className="text-white text-sm">{card.cardNumber}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

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


