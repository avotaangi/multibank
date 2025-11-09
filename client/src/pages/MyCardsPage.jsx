import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import { useQuery } from "react-query";
import { useTelegramUser } from "../hooks/useTelegramUser";
import InfoPanel from "../components/InfoPanel";
import { usePageInfo } from "../hooks/usePageInfo";
import { cardManagementAPI } from "../services/api";

// 🔗 Укажи публичный адрес своего FastAPI (через cloudflared/ngrok)
const API_BASE = import.meta.env.VITE_API_BASE; // 🔗 твой FastAPI endpoint
const CLIENT_ID_ID = import.meta.env.VITE_CLIENT_ID_ID; // Какой сейчас пользователь

const MyCardsPage = () => {
  const navigate = useNavigate();
  const pageInfo = usePageInfo();
  const telegramUser = useTelegramUser();

  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [banks, setBanks] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);

  // 🧩 Загружаем список банков
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axios.get(`${API_BASE}/${CLIENT_ID_ID}/bank_names`);
        setBanks(res.data);
        console.log("✅ Банки загружены:", res.data);
      } catch (err) {
        console.error("❌ Ошибка при загрузке списка банков:", err);
      }
    };
    fetchBanks();
  }, []);

  // 💰 Загружаем балансы после получения банков
  useEffect(() => {
    if (banks.length === 0) return;

    const fetchBalances = async () => {
      try {
        const results = {};
        for (const bank of banks) {
          console.log(`🔹 Запрашиваю баланс для ${bank}...`);
          const res = await axios.get(`${API_BASE}/available_balance/${bank}/${CLIENT_ID_ID}`);
          console.log(`✅ Ответ от ${bank}:`, res.data);
          results[bank] = res.data?.balance || "0 ₽";
        }
        setBalances(results);
      } catch (err) {
        console.error("❌ Ошибка при загрузке балансов:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [banks]);

  // Функция для форматирования номера карты из API
  const formatCardNumber = (encryptedPan) => {
    if (!encryptedPan) return null;
    try {
      const decoded = atob(encryptedPan);
      // Форматируем как XXXX **** **** XXXX
      if (decoded.length >= 16) {
        const first4 = decoded.substring(0, 4);
        const last4 = decoded.substring(decoded.length - 4);
        return `${first4} **** **** ${last4}`;
      }
      return decoded;
    } catch (e) {
      // Если не base64, пробуем использовать как есть
      if (encryptedPan.length >= 16) {
        const first4 = encryptedPan.substring(0, 4);
        const last4 = encryptedPan.substring(encryptedPan.length - 4);
        return `${first4} **** **** ${last4}`;
      }
      return encryptedPan;
    }
  };

  // Загружаем credentials для каждого банка отдельно
  const { data: vbankCredentials } = useQuery(
    ['cardCredentials', 'vbank'],
    () => cardManagementAPI.getCredentials('vbank'),
    {
      enabled: banks.includes('vbank'),
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    }
  );

  const { data: abankCredentials } = useQuery(
    ['cardCredentials', 'abank'],
    () => cardManagementAPI.getCredentials('abank'),
    {
      enabled: banks.includes('abank'),
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    }
  );

  const { data: sbankCredentials } = useQuery(
    ['cardCredentials', 'sbank'],
    () => cardManagementAPI.getCredentials('sbank'),
    {
      enabled: banks.includes('sbank'),
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    }
  );

  if (loading) return <div className="p-6 text-center">Загрузка данных...</div>;

  // 🏦 Генерация карточек с реальными данными из API
  const cards = useMemo(() => {
    return banks.map((bank) => {
      let credentials = null;
      if (bank === 'vbank') credentials = vbankCredentials;
      else if (bank === 'abank') credentials = abankCredentials;
      else if (bank === 'sbank') credentials = sbankCredentials;
      
      const realCardNumber = credentials?.data?.encryptedPan 
        ? formatCardNumber(credentials.data.encryptedPan)
        : null;
      
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
  }, [banks, balances, vbankCredentials, abankCredentials, sbankCredentials, telegramUser.displayName]);

  const handleCardClick = (card) => {
    navigate(`/card-analytics/${card.id}`);
  };

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
