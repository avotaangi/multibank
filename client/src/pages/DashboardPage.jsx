import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from 'react-query';

import useAuthStore from '../stores/authStore';
import useBalanceStore from '../stores/balanceStore';
import useTestCardsStore from '../stores/testCardsStore';
import { bankingAPI, transactionAPI, productsAPI } from '../services/api';
import { useScrollToTop } from '../hooks/useScrollToTop';

import BankCardStack from '../components/BankCardStack';
import InfoPanel from '../components/InfoPanel';
import InsuranceCard from '../components/InsuranceCard';
import PremiumBlock from '../components/PremiumBlock';
import LoadingOverlay from '../components/LoadingOverlay';

import { usePageInfo } from '../hooks/usePageInfo';
import { useTelegramUser } from '../hooks/useTelegramUser';
import { useAndroidAdaptation } from '../hooks/useAndroidAdaptation';

import AndroidTestPanel from '../components/AndroidTestPanel';
import { Info, ChevronRight } from 'lucide-react';
import { getDepositsData } from '../data/depositsData';

// =========================
// ENV / API
// =========================
const API_BASE = import.meta.env.VITE_API_BASE;

// =========================
// Утилиты
// =========================
function parseAmount(numLike) {
  // сервер отдаёт строку вида "92086.46" -> число
  if (numLike == null) return 0;
  const n = Number(numLike);
  return Number.isFinite(n) ? n : 0;
}

function formatRub(valueNumber) {
  return valueNumber.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' ₽';
}

const DashboardPage = () => {
  const { user } = useAuthStore();
  const getClientIdId = useAuthStore((state) => state.getClientIdId);
  const getClientId = useAuthStore((state) => state.getClientId);
  // Функция для нормализации id: если id === 0, возвращаем 1
  const normalizeId = (id) => {
    if (id === 0) return 1;
    return id;
  };
  const CLIENT_ID_ID = normalizeId(getClientIdId());
  const { bankBalances, getFormattedBalance, virtualCardBalance } = useBalanceStore();
  const { addTestCard } = useTestCardsStore();

  const navigate = useNavigate();
  const telegramUser = useTelegramUser();
  const pageInfo = usePageInfo();
  const { styles, classes } = useAndroidAdaptation();

  const [showInfoPanel, setShowInfoPanel] = useState(false);
  
  // Загружаем продукты из API
  const clientId = getClientId();
  const { data: productsData, isLoading: isLoadingProducts } = useQuery(
    ['bankProducts', clientId],
    async () => {
      const response = await productsAPI.getBankProducts({ client_id: clientId });
      return response;
    },
    {
      enabled: !!clientId,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 минута
      retry: 2,
    }
  );
  
  // Получаем все продукты из API
  const allProductsFromAPI = useMemo(() => {
    // Проверяем разные возможные структуры ответа
    let allProducts = null;
    
    if (productsData?.data?.data?.products) {
      allProducts = productsData.data.data.products;
    } else if (productsData?.data?.products) {
      allProducts = productsData.data.products;
    } else if (productsData?.products) {
      allProducts = productsData.products;
    }
    
    if (!allProducts || !Array.isArray(allProducts)) {
      return [];
    }
    
    return allProducts;
  }, [productsData]);
  
  // Фильтруем активные депозиты из API
  const apiDeposits = useMemo(() => {
    return allProductsFromAPI.filter(p => p.product_type === 'deposit');
  }, [allProductsFromAPI]);
  
  // Фильтруем кредиты из API
  const apiLoans = useMemo(() => {
    return allProductsFromAPI.filter(p => p.product_type === 'loan');
  }, [allProductsFromAPI]);
  
  // Используем депозиты из API, если они есть, иначе fallback на старые данные
  const fallbackDeposits = useMemo(() => getDepositsData(virtualCardBalance), [virtualCardBalance]);
  const deposits = (Array.isArray(apiDeposits) && apiDeposits.length > 0) ? apiDeposits : fallbackDeposits;
  
  // Прокрутка наверх при монтировании
  useScrollToTop();
  
  // Получаем текущий месяц для фильтрации транзакций
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const monthStart = new Date(currentYear, currentMonth - 1, 1).toISOString();
  const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59).toISOString();
  
  // Загружаем транзакции за текущий месяц
  const { data: transactionsData } = useQuery(
    ['transactions', 'monthly', currentMonth, currentYear, CLIENT_ID_ID],
    () => {
      const teamId = import.meta.env.VITE_CLIENT_ID || 'team096';
      const fullClientId = `${teamId}-${CLIENT_ID_ID}`;
      return transactionAPI.getTransactions({
        client_id: fullClientId,
        startDate: monthStart,
        endDate: monthEnd,
        limit: 1000 // Получаем все транзакции за месяц
      });
    },
    {
      enabled: !!CLIENT_ID_ID, // Запрос выполняется только если есть CLIENT_ID_ID
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 минута
    }
  );
  
  // Вычисляем доходы и расходы из транзакций
  const analyticsData = useMemo(() => {
    const transactions = transactionsData?.data?.transactions || [];
    
    let income = 0; // Доходы (deposit)
    let expenses = 0; // Расходы (withdrawal)
    
    transactions.forEach(transaction => {
      if (transaction.status === 'completed') {
        const amount = transaction.amount / 100; // Конвертируем из копеек
        
        if (transaction.type === 'deposit') {
          income += amount;
        } else if (transaction.type === 'withdrawal' || transaction.type === 'payment') {
          expenses += amount;
        }
      }
    });
    
    return {
      income: Math.round(income),
      expenses: Math.round(expenses),
      isLoading: !transactionsData
    };
  }, [transactionsData]);
  
  // Вычисляем процент изменения (заглушка, можно улучшить)
  const incomeChange = '+15%'; // Можно вычислить на основе предыдущего месяца
  const expensesChange = '-8%'; // Можно вычислить на основе предыдущего месяца
  
  // Функция форматирования даты в формат дд.мм.гггг
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  
  // Автоплатежи
  const [autopays, setAutopays] = useState([
    {
      id: 1,
      name: 'ЖКХ - УК "Дом"',
      category: 'ЖКХ',
      amount: 8500,
      frequency: 'monthly',
      nextDate: '2025-12-01',
      card: 'VBank',
      status: 'active'
    },
    {
      id: 2,
      name: 'Кредит - Сбербанк',
      category: 'Кредиты',
      amount: 25000,
      frequency: 'monthly',
      nextDate: '2025-12-05',
      card: 'ABank',
      status: 'active'
    },
    {
      id: 3,
      name: 'Подписка VBank+',
      category: 'Прочие',
      amount: 299,
      frequency: 'monthly',
      nextDate: '2025-12-01',
      card: 'VBank',
      status: 'active'
    }
  ]);
  
  const [showAddAutopayModal, setShowAddAutopayModal] = useState(false);
  const [showAutopayConfirmModal, setShowAutopayConfirmModal] = useState(false);
  const [autopayToToggle, setAutopayToToggle] = useState(null);
  const [editingAutopay, setEditingAutopay] = useState(null);
  const [newAutopayData, setNewAutopayData] = useState({
    name: '',
    category: 'ЖКХ',
    amount: '',
    frequency: 'monthly',
    card: '',
    recipient: '',
    notifications: true
  });
  
  // Функция для получения цвета банка
  const getBankColor = (bankName) => {
    switch (bankName) {
      case 'ABank':
        return 'bg-red-600';
      case 'VBank':
        return 'bg-blue-600';
      case 'SBank':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Функции для работы с автоплатежами
  const handleAddAutopay = () => {
    setShowAddAutopayModal(true);
  };

  const handleCloseAddAutopayModal = () => {
    setShowAddAutopayModal(false);
    setEditingAutopay(null);
    setNewAutopayData({
      name: '',
      category: 'ЖКХ',
      amount: '',
      frequency: 'monthly',
      card: '',
      recipient: '',
      notifications: true
    });
  };

  const handleCreateAutopay = () => {
    if (newAutopayData.name && newAutopayData.amount && newAutopayData.card) {
      if (editingAutopay) {
        // Редактирование существующего автоплатежа
        setAutopays(prev => {
          const updated = prev.map(ap => 
            ap.id === editingAutopay.id 
              ? {
                  ...ap,
                  name: newAutopayData.name,
                  category: newAutopayData.category,
                  amount: parseInt(newAutopayData.amount),
                  frequency: newAutopayData.frequency,
                  card: newAutopayData.card,
                  recipient: newAutopayData.recipient
                }
              : ap
          );
          // Сохраняем в localStorage
          localStorage.setItem('autopays', JSON.stringify(updated));
          return updated;
        });
      } else {
        // Создание нового автоплатежа
        const newAutopay = {
          id: Date.now(),
          name: newAutopayData.name,
          category: newAutopayData.category,
          amount: parseInt(newAutopayData.amount),
          frequency: newAutopayData.frequency,
          nextDate: '2025-12-01', // Дата после 30 ноября 2025
          card: newAutopayData.card,
          status: 'active'
        };
        const updated = [...autopays, newAutopay];
        setAutopays(updated);
        // Сохраняем в localStorage
        localStorage.setItem('autopays', JSON.stringify(updated));
      }
      handleCloseAddAutopayModal();
    }
  };

  const handleEditAutopay = (autopay) => {
    setEditingAutopay(autopay);
    setNewAutopayData({
      name: autopay.name,
      category: autopay.category,
      amount: autopay.amount.toString(),
      frequency: autopay.frequency,
      card: autopay.card,
      recipient: autopay.recipient || '',
      notifications: autopay.notifications !== false
    });
    setShowAddAutopayModal(true);
  };

  const handleDeleteAutopay = (autopayId) => {
    setAutopays(prev => {
      const updated = prev.filter(ap => ap.id !== autopayId);
      // Сохраняем в localStorage
      localStorage.setItem('autopays', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleAutopay = (autopayId) => {
    const autopay = autopays.find(a => a.id === autopayId);
    setAutopayToToggle(autopay);
    setShowAutopayConfirmModal(true);
  };

  const handleConfirmToggleAutopay = () => {
    if (autopayToToggle) {
      setAutopays(prev => {
        const updated = prev.map(autopay => 
          autopay.id === autopayToToggle.id 
            ? { ...autopay, status: autopay.status === 'active' ? 'paused' : 'active' }
            : autopay
        );
        // Сохраняем в localStorage
        localStorage.setItem('autopays', JSON.stringify(updated));
        return updated;
      });
    }
    setShowAutopayConfirmModal(false);
    setAutopayToToggle(null);
  };

  const handleCancelToggleAutopay = () => {
    setShowAutopayConfirmModal(false);
    setAutopayToToggle(null);
  };

  // Загружаем автоплатежи из localStorage и обновляем даты при монтировании
  useEffect(() => {
    const savedAutopays = localStorage.getItem('autopays');
    if (savedAutopays) {
      try {
        const autopaysArray = JSON.parse(savedAutopays);
        const updatedAutopays = autopaysArray.map(autopay => {
          // Если дата раньше или равна 30 ноября 2025, обновляем на 1 декабря 2025
          if (autopay.nextDate) {
            const currentDate = new Date(autopay.nextDate);
            const cutoffDate = new Date('2025-11-30');
            if (currentDate <= cutoffDate) {
              return {
                ...autopay,
                nextDate: '2025-12-01'
              };
            }
          } else {
            // Если дата не указана, устанавливаем 1 декабря 2025
            return {
              ...autopay,
              nextDate: '2025-12-01'
            };
          }
          return autopay;
        });
        localStorage.setItem('autopays', JSON.stringify(updatedAutopays));
        
        // Загружаем обновленные автоплатежи в состояние
        if (updatedAutopays.length > 0) {
          setAutopays(updatedAutopays);
        }
      } catch (e) {
        console.error('Ошибка при загрузке/обновлении автоплатежей:', e);
      }
    } else {
      // Если в localStorage нет автоплатежей, сохраняем начальные данные
      const initialAutopays = [
        {
          id: 1,
          name: 'ЖКХ - УК "Дом"',
          category: 'ЖКХ',
          amount: 8500,
          frequency: 'monthly',
          nextDate: '2025-12-01',
          card: 'VBank',
          status: 'active'
        },
        {
          id: 2,
          name: 'Кредит - Сбербанк',
          category: 'Кредиты',
          amount: 25000,
          frequency: 'monthly',
          nextDate: '2025-12-05',
          card: 'ABank',
          status: 'active'
        },
        {
          id: 3,
          name: 'Подписка VBank+',
          category: 'Прочие',
          amount: 299,
          frequency: 'monthly',
          nextDate: '2025-12-01',
          card: 'VBank',
          status: 'active'
        }
      ];
      localStorage.setItem('autopays', JSON.stringify(initialAutopays));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Состояние реальных банков/балансов (из API)
  const [availableBanks, setAvailableBanks] = useState([]);   // ['vbank', 'abank', ...] — с API
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [balanceFetchError, setBalanceFetchError] = useState(null);
  const [isCardsLoading, setIsCardsLoading] = useState(false); // Начинаем с false, так как карты не блокируют загрузку

  // Модалка добавления банка (твой прежний UX полностью сохранён)
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showRequestedBanks, setShowRequestedBanks] = useState(false);
  const [requestedBanks, setRequestedBanks] = useState([]);
  const [newBankData, setNewBankData] = useState({
    bank: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

    // 🎨 Цвета и человекочитаемые имена для всех банков
  const allBanksMap = {
    vbank:  { name: 'VBank',        color: 'bg-blue-500'  },
    abank:  { name: 'ABank',        color: 'bg-red-500'   },
    sbank:  { name: 'SBank',        color: 'bg-green-500' },
    gazprombank: { name: 'Газпромбанк', color: 'bg-orange-500' },
    raiffeisen: { name: 'Райффайзенбанк', color: 'bg-purple-500' },
    rosbank: { name: 'Росбанк', color: 'bg-indigo-500' }
  };

  // Банки, которые уже используются в приложении (визуальный блок в модалке — без изменений)
  // const usedBanks = [
  //   { id: 'vbank', name: 'VBank', color: 'bg-blue-500' },
  //   { id: 'abank', name: 'ABank', color: 'bg-red-500' },
  //   { id: 'sbank', name: 'SBank', color: 'bg-green-500' }
  // ];
  // ✅ Банки, которые уже подключены (из availableBanks)
  const usedBanks = useMemo(() => {
    return availableBanks.map(id => ({
      id,
      name: allBanksMap[id]?.name || id.toUpperCase(),
      color: allBanksMap[id]?.color || 'bg-gray-400'
    }));
  }, [availableBanks]);

  // Банки, доступные “для подключения” (визуальный блок в модалке — без изменений)
  // const selectableBanks = [
  //   { id: 'sberbank', name: 'Сбербанк', color: 'bg-green-500' },
  //   { id: 'gazprombank', name: 'Газпромбанк', color: 'bg-orange-500' },
  //   { id: 'raiffeisen', name: 'Райффайзенбанк', color: 'bg-purple-500' },
  //   { id: 'rosbank', name: 'Росбанк', color: 'bg-indigo-500' }
  // ];
    // 💡 Банки, доступные для подключения (все, кроме тех, что уже есть в availableBanks)
  const selectableBanks = useMemo(() => {
    return Object.entries(allBanksMap)
      .filter(([id]) => !availableBanks.includes(id))
      .map(([id, info]) => ({
        id,
        ...info
      }));
  }, [availableBanks]);




  // =========================
  // Загрузка списка банков
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadBanks() {
      setIsLoadingBanks(true);
      setBalanceFetchError(null);
      try {
        const res = await bankingAPI.getBanks();
        if (cancelled) return;

        // Извлекаем массив банков из ответа { banks: [...] }
        const banks = res.data?.banks || res.data || [];
        const names = banks.map(bank => bank.id || bank); // Извлекаем id банков
        
        setAvailableBanks(names);

        // сразу подтянем балансы и пробросим в глобальный стор
        await hydrateBalances(names);
      } catch (err) {
        if (cancelled) return;
        console.error('❌ Ошибка загрузки списка банков:', err);
        setBalanceFetchError('Не удалось получить список банков.');
        setAvailableBanks([]); // пустой список
      } finally {
        if (!cancelled) setIsLoadingBanks(false);
      }
    }

    loadBanks();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // Подтянуть балансы и положить в store
  // =========================
  const hydrateBalances = async (bankList) => {
    if (!Array.isArray(bankList) || bankList.length === 0) return;

    const { setAllBalances } = useBalanceStore.getState();

    try {
      const requests = bankList.map((bank) =>
        axios
          .get(`${API_BASE}/api/available_balance/${bank}/${CLIENT_ID_ID}`)
          .then((r) => ({ bank, ok: true, data: r.data }))
          .catch((e) => ({ bank, ok: false, error: e }))
      );

      const results = await Promise.all(requests);
      const balances = {};

      results.forEach(({ bank, ok, data, error }) => {
        if (!ok) {
          console.warn(`⚠️ Баланс ${bank} не получен:`, error?.message || error);
          balances[bank] = 0;
          return;
        }
        const numeric = parseAmount(data?.balance ?? data);
        balances[bank] = numeric;
      });

      // ✅ Устанавливаем всё одним вызовом
      setAllBalances(balances);
    } catch (e) {
      console.error('❌ Ошибка при сборе балансов:', e);
      setBalanceFetchError('Не удалось получить балансы банков.');
    }
  };



  // =========================
  // Итоговый бюджет (из глобального стора — чтобы всё, вкл. BankCardStack, было согласовано)
  // =========================
  // const totalBudget = useMemo(() => {
  //   const total = Object.values(bankBalances).reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0);
  //   return formatRub(total);
  // }, [bankBalances]);

  const { getTotalBalance } = useBalanceStore();
  const totalBudget = getTotalBalance();

  // =========================
  // Обработчики модалки "Добавить банк"
  // (без изменений визуала и поведения)
  // =========================
  const handleAddBank = () => setShowAddBankModal(true);

  const handleCloseModal = () => {
    setShowAddBankModal(false);
    setNewBankData({ bank: '', cardNumber: '', expiryDate: '', cvv: '' });
  };

  const handleCancelRequest = (bankId) => {
    setRequestedBanks(prev => prev.filter(b => b.id !== bankId));
    if (requestedBanks.length === 1) setShowRequestedBanks(false);
  };

  const handleBankSelect = (bankId) => {
    setNewBankData(prev => ({ ...prev, bank: bankId }));
  };

  const handleInputChange = (field, value) => {
    if (field === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').slice(0, 4);
      setNewBankData(prev => ({ ...prev, [field]: formatted }));
    } else if (field === 'cvv') {
      const formatted = value.replace(/\D/g, '').slice(0, 3);
      setNewBankData(prev => ({ ...prev, [field]: formatted }));
    } else {
      setNewBankData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCardNumberChange = (value) => {
    const formatted = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    if (formatted.length <= 19) {
      setNewBankData(prev => ({ ...prev, cardNumber: formatted }));
    }
  };

  const handleConfirmWithBank = () => {
    if (!newBankData.bank) return;
    const selected = selectableBanks.find(b => b.id === newBankData.bank);
    if (selected) {
      setRequestedBanks(prev => [...prev, selected]);
      setShowRequestedBanks(true);
    }
    handleCloseModal();
  };

  const handleConfirmWithoutBank = () => {
    if (!(newBankData.bank && newBankData.cardNumber && newBankData.expiryDate && newBankData.cvv)) return;

    const selected = selectableBanks.find(b => b.id === newBankData.bank);
    const testCard = {
      id: `test-card-${Date.now()}`,
      name: selected?.name || 'Тестовая карта',
      bankId: newBankData.bank,
      cardNumber: newBankData.cardNumber,
      balance: 10000,
      isTest: true,
    };

    const { updateBalance } = useBalanceStore.getState();
    updateBalance(newBankData.bank, 10000, 'set');

    addTestCard(testCard);
    handleCloseModal();
  };

  // =========================
  // Проверяем, загружаются ли все данные
  // Показываем загрузку только пока загружаются банки
  // Карты загружаются асинхронно в фоне и не блокируют отображение страницы
  const isDataLoading = isLoadingBanks;

  // Рендер
  // =========================
  // Показываем окно загрузки, пока данные не загрузились
  if (isDataLoading) {
    return <LoadingOverlay message="Загрузка данных..." />;
  }

  return (
    <div
      className={`min-h-screen bg-white relative overflow-hidden ${classes.container}`}
      style={styles.container}
    >
      {/* Top Header with Profile */}
      <div className="relative z-10 bg-gray-100 px-5 pt-6 pb-4 rounded-[40px] ">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/rewards')}
          >
            <div className="relative rounded-full">
              {telegramUser.photoUrl ? (
                <img 
                  src={telegramUser.photoUrl} 
                  alt={telegramUser.displayName}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
            </div>
            <div>
              <div className="text-gray-600 font-ibm text-sm font-medium leading-[110%] tracking-wide">
                Мультибанк
              </div>
              <div className="text-gray-900 font-ibm text-lg font-semibold leading-[110%]">
                {telegramUser.displayName}
              </div>
            </div>
          </div>

          <div className="relative flex items-center space-x-2">
            <button
              onClick={() => setShowInfoPanel(true)}
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              <Info className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Total Budget */}
      <div className="relative z-10 text-center px-5 py-3 ">
        <div className="text-black font-ibm text-base font-medium leading-[110%] mb-3">
          Общий бюджет
        </div>
        <div className="text-black font-ibm text-3xl font-medium leading-[110%] tracking-[-0.02em]">
          {/* показываем лоадер, если банки ещё грузятся */}
          {isLoadingBanks ? 'Загрузка…' : totalBudget}
        </div>
        {/* Ошибку покажем строкой ниже, если была */}
        {!isLoadingBanks && balanceFetchError && (
          <div className="text-red-500 text-xs mt-1">{balanceFetchError}</div>
        )}
      </div>

      {/* Bank Cards Stack */}
      <div className="relative z-10 py-1 ">
        <BankCardStack onLoadingChange={setIsCardsLoading} availableBanks={availableBanks} />
      </div>

      {/* Add Bank Button */}
      <div className="relative z-10 text-center py-2 ">
        <button
          onClick={handleAddBank}
          className="w-full h-12 bg-white rounded-2xl flex items-center justify-center text-gray-700 font-ibm text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          + Добавить банк
        </button>
      </div>

      {/* Requested Banks Section */}
      {showRequestedBanks && requestedBanks.length > 0 && (
        <div className="relative z-10 px-5 py-2 ">
          <div className="bg-white rounded-2xl p-4">
            <h3 className="text-black font-ibm font-medium text-sm leading-[110%] mb-3">
              Запросы на подключение
            </h3>
            <div className="space-y-2">
              {requestedBanks.map((bank) => (
                <div key={bank.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 ${bank.color} rounded-lg`}></div>
                    <div className="text-black font-ibm text-sm font-medium">
                      Карты запрошены у {bank.name}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelRequest(bank.id)}
                    className="text-red-500 font-ibm text-sm font-medium hover:text-red-600 transition-colors"
                  >
                    Отменить
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="relative z-10 px-5 py-2 ">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button
            onClick={() => navigate('/transfer')}
            className="h-28 bg-gray-100 rounded-2xl flex flex-col items-center justify-center p-1"
          >
            <div className="mb-1">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </div>
            <div className="text-black font-ibm text-xs min-[375px]:text-sm font-normal leading-[110%] text-center">
              <div>Между</div>
              <div>банками</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/payments')}
            className="h-28 bg-gray-100 rounded-2xl flex flex-col items-center justify-center"
          >
            <div className="mb-1">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="text-black font-ibm text-xs min-[375px]:text-sm font-normal leading-[110%] text-center">
              <div>Универсальные</div>
              <div>платежи</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/budget-planning')}
            className="h-28 bg-gray-100 rounded-2xl flex flex-col items-center justify-center"
          >
            <div className="mb-1">
              <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                <path d="M10 16l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z"/>
              </svg>
            </div>
            <div className="text-black font-ibm text-xs min-[375px]:text-sm font-normal leading-[110%] text-center">
              Планирование бюджета
            </div>
          </button>
        </div>

        {/* Transfer by Account & Leads Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate('/transfer-by-account')}
            className="h-28 bg-gray-100 rounded-2xl flex flex-col items-center justify-center"
          >
            <div className="mb-1">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="text-black font-ibm text-xs min-[375px]:text-sm font-normal leading-[110%] text-center px-1">
              <div>Перевести по</div>
              <div>номеру счета</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/security')}
            className="h-28 bg-gray-100 rounded-2xl flex flex-col items-center justify-center"
          >
            <div className="mb-1">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-black font-ibm text-xs min-[375px]:text-sm font-normal leading-[110%] text-center">
              Безопасность
            </div>
          </button>
        </div>
      </div>

      {/* Insurance Section */}
      <PremiumBlock featureName="Агрегация страховок">
      <div className="relative z-10 px-5 py-2 ">
        <div className="rounded-[27px] border border-gray-200 overflow-hidden" style={{ backgroundColor: '#10B981' }}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                  Страхование
                </div>
              </div>
              <button
                onClick={() => navigate('/insurance-details')}
                className="text-white text-opacity-80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
              Управляйте всеми страховыми полисами в одном месте
            </div>
            <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
          </div>

          {/* Insurance List */}
          <div className="space-y-3 px-4 pb-4 pt-0">
            {[
              {
                id: 'osago-1',
                type: 'OSAGO',
                company: 'Ингосстрах',
                policyNumber: 'ОСА-1234567890',
                expiryDate: '2026-06-15',
                insuredAmount: 500000,
                nextPaymentDate: '2025-06-15',
                monthlyPayment: 4500
              },
              {
                id: 'dms-1',
                type: 'DMS',
                company: 'ВСК',
                policyNumber: 'ДМС-9876543210',
                expiryDate: '2025-12-31',
                insuredAmount: 300000,
                remainingVisits: 3,
                monthlyPayment: 3500
              }
            ].map((policy) => (
              <div 
                key={policy.id} 
                className="bg-white rounded-2xl p-4 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => navigate(`/insurance-details/${policy.id}`, { state: { policy } })}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100">
                      {policy.type === 'OSAGO' || policy.type === 'CASCO' ? (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="text-black font-ibm text-base font-medium leading-[110%]">
                        {policy.type === 'OSAGO' ? 'ОСАГО' : policy.type === 'DMS' ? 'ДМС' : policy.type}
                      </div>
                      <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                        {policy.company} • {policy.policyNumber}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-black font-ibm text-lg font-medium leading-[110%]">
                      {policy.monthlyPayment?.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                      Ежемесячно
                    </div>
                  </div>
                </div>
                  
                <div className="flex items-center justify-between">
                  <div className="text-gray-600 font-ibm text-sm">
                    {policy.nextPaymentDate ? `Следующий платёж: ${formatDate(policy.nextPaymentDate)}` : `Действует до: ${formatDate(policy.expiryDate)}`}
                  </div>
                  <div className="px-3 py-1 rounded-lg font-ibm text-sm font-medium bg-green-100 text-green-700">
                    Активен
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => navigate('/insurance-casco')}
              className="w-full bg-white rounded-2xl p-4 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <span className="text-gray-700 font-ibm text-sm font-medium">Оформить КАСКО</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
      </PremiumBlock>

      {/* Analytics Section */}
      <div className="relative z-10 px-5 py-2 ">
        <div className="rounded-[27px] border border-gray-200 overflow-hidden" style={{ backgroundColor: '#F59E0C' }}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                  Аналитика
                </div>
              </div>
              <button
                onClick={() => navigate('/analytics')}
                className="text-white text-opacity-80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
              Отслеживайте доходы и расходы по всем банкам
            </div>
            <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
          </div>

          {/* Analytics Data */}
          <div className="space-y-3 px-4 pb-4 pt-0">
            {analyticsData.isLoading ? (
              <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
                <div className="text-gray-500 font-ibm text-sm">Загрузка данных...</div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14l5-5 5 5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-black font-ibm text-base font-medium leading-[110%]">
                          Доходы
                        </div>
                        <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                          {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-black font-ibm text-lg font-medium leading-[110%]">
                        {analyticsData.income.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                        {incomeChange}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ 
                        width: `${Math.min((analyticsData.income / Math.max(analyticsData.income + analyticsData.expenses, 1)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 10l5 5 5-5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-black font-ibm text-base font-medium leading-[110%]">
                          Расходы
                        </div>
                        <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                          {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-black font-ibm text-lg font-medium leading-[110%]">
                        {analyticsData.expenses.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                        {expensesChange}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-red-500 rounded-full" 
                      style={{ 
                        width: `${Math.min((analyticsData.expenses / Math.max(analyticsData.income + analyticsData.expenses, 1)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Deposits Section */}
      <div className="relative z-10 px-5 py-2 ">
        <div className="rounded-[27px] border border-gray-200 overflow-hidden" style={{ backgroundColor: '#EC4899' }}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                  Вклады
                </div>
              </div>
              <button
                onClick={() => navigate('/deposits')}
                className="text-white text-opacity-80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
              Накопительные счета и депозиты
            </div>
            <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
          </div>

          {/* Deposits List */}
          <div className="space-y-3 px-4 pb-4 pt-0">
            {isLoadingProducts ? (
              <div className="text-center py-4 text-gray-500 font-ibm text-sm">
                Загрузка вкладов...
              </div>
            ) : !deposits || deposits.length === 0 ? (
              <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
                <div className="text-gray-500 font-ibm text-sm">
                  Нет активных вкладов
                </div>
              </div>
            ) : (
              deposits.map((deposit, index) => {
                // Для API депозитов используем другую структуру
                const isApiDeposit = deposit.product_type === 'deposit';
                const depositId = isApiDeposit ? deposit.agreement_id : deposit.id;
                
                // Получаем данные из agreement_details.data
                const agreementData = deposit.agreement_details?.data;
                
                // Получаем название из agreement_details.data.product_name
                const depositName = isApiDeposit 
                  ? (agreementData?.product_name || deposit.product_name || `Вклад ${deposit.bank?.toUpperCase() || ''}`)
                  : deposit.name;
                
                // Получаем сумму из agreement_details.data.amount
                const depositAmount = isApiDeposit 
                  ? (agreementData?.amount ?? deposit.amount ?? deposit.balance ?? 0)
                  : deposit.amount;
                
                // Получаем процентную ставку из agreement_details.data.interest_rate
                const depositRate = isApiDeposit 
                  ? (agreementData?.interest_rate ?? '8.5')
                  : deposit.rate;
                
                // Получаем статус из agreement_details.data.status
                const depositStatus = isApiDeposit 
                  ? (agreementData?.status || deposit.status || 'active')
                  : deposit.status;
                
                return (
                  <div key={depositId || index} className="bg-white rounded-2xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="text-black font-ibm text-base font-medium leading-[110%]">
                            {depositName}
                          </div>
                          <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                            Ставка {depositRate}% годовых
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-black font-ibm text-lg font-medium leading-[110%]">
                          {typeof depositAmount === 'number' 
                            ? depositAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : parseFloat(depositAmount || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          } ₽
                        </div>
                        <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                          {depositStatus === 'active' ? 'Активен' : 'Неактивен'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Credits Section */}
      <div className="relative z-10 px-5 py-2 ">
        <div className="rounded-[27px] border border-gray-200 overflow-hidden" style={{ backgroundColor: '#EF4444' }}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                  Кредиты
                </div>
              </div>
              <button
                onClick={() => navigate('/credits')}
                className="text-white text-opacity-80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
              Управляйте кредитами и отслеживайте погашение
            </div>
            <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
          </div>

          {/* Credits Data */}
          <div className="space-y-3 px-4 pb-4 pt-0">
            {isLoadingProducts ? (
              <div className="text-center py-4 text-white font-ibm text-sm">
                Загрузка кредитов...
              </div>
            ) : !apiLoans || apiLoans.length === 0 ? (
              <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
                <div className="text-gray-500 font-ibm text-sm">
                  Нет активных кредитов
                </div>
              </div>
            ) : (
              apiLoans.map((loan, index) => {
                // Получаем данные из agreement_details.data
                const agreementData = loan.agreement_details?.data;
                
                // Получаем название из agreement_details.data.product_name
                const loanName = agreementData?.product_name || loan.product_name || `Кредит ${loan.bank?.toUpperCase() || ''}`;
                
                // Получаем остаток по кредиту из outstanding_amount или agreement_details.data
                const outstandingAmount = loan.outstanding_amount ?? agreementData?.account_balance ?? loan.amount ?? 0;
                
                // Получаем процентную ставку из agreement_details.data.interest_rate
                const loanRate = agreementData?.interest_rate ?? '12.9';
                
                // Получаем статус из agreement_details.data.status
                const loanStatus = agreementData?.status || loan.status || 'active';
                
                // Получаем сумму кредита для расчета процента погашения
                const loanAmount = agreementData?.amount ?? loan.amount ?? outstandingAmount;
                
                // Рассчитываем процент погашения
                const repaymentPercent = loanAmount > 0 
                  ? Math.max(0, Math.min(100, ((loanAmount - outstandingAmount) / loanAmount) * 100))
                  : 0;
                
                // Цвет банка
                const bankColor = loan.bank === 'vbank' ? '#0055BC' : loan.bank === 'abank' ? '#EF3124' : loan.bank === 'sbank' ? '#00A859' : '#6366F1';
                
                return (
                  <div key={loan.agreement_id || index} className="bg-white rounded-2xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${bankColor}20` }}
                        >
                          <svg className="w-5 h-5" style={{ color: bankColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-black font-ibm text-base font-medium leading-[110%]">
                            {loanName}
                          </div>
                          <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                            Осталось до погашения
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-black font-ibm text-lg font-medium leading-[110%]">
                          {typeof outstandingAmount === 'number' 
                            ? outstandingAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : parseFloat(outstandingAmount || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          } ₽
                        </div>
                        <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                          {loanStatus === 'active' ? 'Активен' : 'Неактивен'}
                        </div>
                      </div>
                    </div>
                    {loanAmount > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${repaymentPercent}%`,
                            backgroundColor: bankColor
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Autopays Section */}
      <div className="relative z-10 px-5 py-2 ">
        <div className="rounded-[27px] border border-gray-200 overflow-hidden" style={{ backgroundColor: '#844FD9' }}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                  Автоплатежи
                </div>
              </div>
            </div>
            <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
              Настройте автоматические платежи для регулярных трат
            </div>
            <button
              onClick={handleAddAutopay}
              className="bg-white text-[#844FD9] font-ibm text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Создать автоплатеж
            </button>
            <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
          </div>

          {/* Autopay List */}
          <div className="space-y-3 px-4 pb-4 pt-0">
            {autopays.map((autopay) => (
              <div 
                key={autopay.id} 
                className="bg-white rounded-2xl p-4 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => navigate(`/autopay-details/${autopay.id}`, { state: { autopay } })}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getBankColor(autopay.card)}`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-black font-ibm text-base font-medium leading-[110%]">
                        {autopay.name}
                      </div>
                      <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                        {autopay.category} • {autopay.card}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-black font-ibm text-lg font-medium leading-[110%]">
                      {autopay.amount.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                      {autopay.frequency === 'monthly' ? 'Ежемесячно' : 'Ежеквартально'}
                    </div>
                  </div>
                </div>
                  
                <div className="flex items-center justify-between">
                  <div className="text-gray-600 font-ibm text-sm">
                    Следующий платёж: {formatDate(autopay.nextDate)}
                  </div>
                  <div 
                    className="flex items-center space-x-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAutopay(autopay.id);
                      }}
                      className={`px-3 py-1 rounded-lg font-ibm text-sm font-medium transition-colors ${
                        autopay.status === 'active' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {autopay.status === 'active' ? 'Активен' : 'Приостановлен'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {autopays.length === 0 && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
                <div className="text-gray-500 font-ibm text-sm">
                  Нет автоплатежей
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Digital Ruble Section */}
      <div className="relative z-10 px-5 py-2 ">
        <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-left">
              <div className="text-black font-ibm font-medium text-sm leading-[110%] mb-1">
                Цифровой рубль
              </div>
              <div className="text-gray-500 font-ibm font-normal text-xs leading-[110%]">
                В разработке
              </div>
            </div>
            <div className="text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-20"></div>

      {/* Add Bank Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-3xl p-4 sm:p-6 w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-ibm font-semibold text-gray-900">Добавить банк</h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Used Banks Section */}
            <div className="mb-4">
              <label className="block text-sm font-ibm font-medium text-gray-700 mb-2">Уже подключенные банки</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {usedBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 opacity-60"
                  >
                    <div className={`w-4 h-4 ${bank.color} rounded-lg mx-auto mb-1`}></div>
                    <div className="text-xs font-ibm font-medium text-gray-500 text-center leading-tight">
                      {bank.name}
                    </div>
                    <div className="text-xs text-gray-400 text-center leading-tight">
                      Подключен
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Banks Section */}
            <div className="mb-4">
              <label className="block text-sm font-ibm font-medium text-gray-700 mb-2">Доступные для подключения</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectableBanks.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => handleBankSelect(bank.id)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      newBankData.bank === bank.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-4 h-4 ${bank.color} rounded-lg mx-auto mb-1`}></div>
                    <div className="text-xs font-ibm font-medium text-gray-900 text-center leading-tight">
                      {bank.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Поля ввода карты (визуально и по логике — как у тебя)
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Номер карты</label>
                <input
                  type="text"
                  value={newBankData.cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0000 0000 0000 0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Срок (MMYY)</label>
                  <input
                    type="text"
                    value={newBankData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="MMYY"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">CVV</label>
                  <input
                    type="password"
                    value={newBankData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="CVV"
                  />
                </div>
              </div>
            </div> */}

            {/* Action Button */}
            <div className="mt-4">
              <button
                onClick={handleConfirmWithBank}
                className="w-full h-12 bg-red-500 text-white rounded-xl font-ibm text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Запросить доступ к картам
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Android Test Panel - только в development и если включен через localStorage */}
      {import.meta.env.DEV && typeof window !== 'undefined' && localStorage.getItem('showTestPanel') === 'true' && <AndroidTestPanel />}

      {/* Add/Edit Autopay Modal */}
      {showAddAutopayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
                {editingAutopay ? 'Редактировать автоплатёж' : 'Создать автоплатёж'}
              </h2>
              <button 
                onClick={handleCloseAddAutopayModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateAutopay(); }} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Название платежа
                </label>
                <input
                  type="text"
                  value={newAutopayData.name}
                  onChange={(e) => setNewAutopayData({...newAutopayData, name: e.target.value})}
                  placeholder="Например: ЖКХ - УК Дом"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Категория
                </label>
                <div className="relative">
                  <select
                    value={newAutopayData.category}
                    onChange={(e) => setNewAutopayData({...newAutopayData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-[#844FD9] transition-all appearance-none cursor-pointer pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '12px'
                    }}
                  >
                    <option value="ЖКХ" className="bg-white py-2">ЖКХ</option>
                    <option value="Кредиты" className="bg-white py-2">Кредиты</option>
                    <option value="Прочие" className="bg-white py-2">Прочие регулярные платежи</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Сумма (₽)
                </label>
                <input
                  type="text"
                  value={newAutopayData.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      setNewAutopayData({...newAutopayData, amount: value});
                    }
                  }}
                  placeholder="8500"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Периодичность
                </label>
                <div className="relative">
                  <select
                    value={newAutopayData.frequency}
                    onChange={(e) => setNewAutopayData({...newAutopayData, frequency: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-[#844FD9] transition-all appearance-none cursor-pointer pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '12px'
                    }}
                  >
                    <option value="monthly" className="bg-white py-2">Ежемесячно</option>
                    <option value="quarterly" className="bg-white py-2">Ежеквартально</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Карта для списания
                </label>
                <div className="relative">
                  <select
                    value={newAutopayData.card}
                    onChange={(e) => setNewAutopayData({...newAutopayData, card: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-[#844FD9] transition-all appearance-none cursor-pointer pr-10"
                    required
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '12px'
                    }}
                  >
                    <option value="" className="bg-white py-2">Выберите карту</option>
                    <option value="VBank" className="bg-white py-2">VBank</option>
                    <option value="ABank" className="bg-white py-2">ABank</option>
                    <option value="SBank" className="bg-white py-2">SBank</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Получатель
                </label>
                <input
                  type="text"
                  value={newAutopayData.recipient}
                  onChange={(e) => setNewAutopayData({...newAutopayData, recipient: e.target.value})}
                  placeholder="ИНН, ЕЛС или реквизиты"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={newAutopayData.notifications}
                  onChange={(e) => setNewAutopayData({...newAutopayData, notifications: e.target.checked})}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="notifications" className="text-gray-700 font-ibm text-sm">
                  Уведомления за 1-2 дня до списания
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseAddAutopayModal}
                  className="flex-1 py-3 px-4 bg-gray-100 border-0 rounded-2xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-200 transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[#844FD9] text-white rounded-2xl font-ibm text-base font-medium hover:opacity-90 transition-all"
                >
                  {editingAutopay ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Autopay Toggle Confirmation Modal */}
      {showAutopayConfirmModal && autopayToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
                {autopayToToggle.status === 'active' ? 'Приостановить автоплатёж?' : 'Активировать автоплатёж?'}
              </h2>
              <button 
                onClick={handleCancelToggleAutopay}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="text-black font-ibm text-lg font-medium leading-[110%] mb-2">
                  {autopayToToggle.name}
                </div>
                <div className="text-gray-600 font-ibm text-sm leading-[110%] mb-2">
                  {autopayToToggle.category} • {autopayToToggle.card}
                </div>
                <div className="text-black font-ibm text-base font-medium leading-[110%]">
                  {autopayToToggle.amount.toLocaleString('ru-RU')} ₽
                </div>
              </div>
              
              <div className="text-gray-700 font-ibm text-sm leading-[110%]">
                {autopayToToggle.status === 'active' 
                  ? 'Автоплатёж будет приостановлен и не будет выполняться до повторной активации.'
                  : 'Автоплатёж будет активирован и начнёт выполняться согласно расписанию.'
                }
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancelToggleAutopay}
                className="flex-1 py-3 px-4 bg-gray-100 border-0 rounded-2xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-200 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmToggleAutopay}
                className={`flex-1 py-3 px-4 rounded-2xl font-ibm text-base font-medium transition-all ${
                  autopayToToggle.status === 'active'
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {autopayToToggle.status === 'active' ? 'Приостановить' : 'Активировать'}
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

export default DashboardPage;
