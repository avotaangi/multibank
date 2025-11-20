import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import useBalanceStore from '../stores/balanceStore';
import useAuthStore from '../stores/authStore';
import { getTelegramWebApp } from '../utils/telegram';
import InfoPanel from '../components/InfoPanel';
import PremiumBlock from '../components/PremiumBlock';
import { usePageInfo } from '../hooks/usePageInfo';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { Info } from 'lucide-react';
import axios from 'axios';
import { cardManagementAPI } from '../services/api';

const BudgetPlanningPage = () => {
  const navigate = useNavigate();
  const { bankBalances, transferMoney, virtualCardBalance, setVirtualCardBalance, updateVirtualCardBalance } = useBalanceStore();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  
  // Прокрутка наверх при монтировании
  useScrollToTop();
  const [showTopUpVirtualCardModal, setShowTopUpVirtualCardModal] = useState(false);
  const [selectedSourceCard, setSelectedSourceCard] = useState(null);
  const [selectedCardInfo, setSelectedCardInfo] = useState(null);
  const [topUpVirtualAmount, setTopUpVirtualAmount] = useState('');
  const [topUpVirtualError, setTopUpVirtualError] = useState('');
  const [topUpVirtualLoading, setTopUpVirtualLoading] = useState(false);
  const [connectedBanks, setConnectedBanks] = useState([]);
  
  const getClientIdId = useAuthStore((state) => state.getClientIdId);
  // Функция для нормализации id: если id === 0, возвращаем 1
  const normalizeId = (id) => {
    if (id === 0) return 1;
    return id;
  };
  const CLIENT_ID_ID = normalizeId(getClientIdId());
  
  const API_BASE = import.meta.env.VITE_API_BASE;
  
  // Загружаем список подключенных банков из API
  useEffect(() => {
    const fetchConnectedBanks = async () => {
      try {
        const res = await axios.get(`${API_BASE}/${CLIENT_ID_ID}/bank_names`);
        setConnectedBanks(res.data || []);
        console.log('✅ Подключенные банки:', res.data);
      } catch (err) {
        console.error('❌ Ошибка при загрузке списка банков:', err);
        setConnectedBanks([]);
      }
    };
    fetchConnectedBanks();
  }, [API_BASE, CLIENT_ID_ID]);
  const [showLifestyleTip, setShowLifestyleTip] = useState(false);
  const [showDreamTip, setShowDreamTip] = useState(false);
  const [showGoalsTip, setShowGoalsTip] = useState(false);
  const [showJointGoalsTip, setShowJointGoalsTip] = useState(false);
  const [showAddJointGoalModal, setShowAddJointGoalModal] = useState(false);
  const [showEditJointGoalModal, setShowEditJointGoalModal] = useState(false);
  const [showDeleteJointGoalModal, setShowDeleteJointGoalModal] = useState(false);
  const [showTopUpJointGoalModal, setShowTopUpJointGoalModal] = useState(false);
  const [selectedJointGoal, setSelectedJointGoal] = useState(null);
  const [editJointGoalData, setEditJointGoalData] = useState({ name: '', targetAmount: '', targetDate: '' });
  const [topUpJointAmount, setTopUpJointAmount] = useState('');
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editPlanData, setEditPlanData] = useState({
    name: '',
    amount: '',
    category: ''
  });
  const [editCategoryData, setEditCategoryData] = useState({
    name: '',
    color: ''
  });
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCongratulationsModal, setShowCongratulationsModal] = useState(false);
  const [completedPlan, setCompletedPlan] = useState(null);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goals, setGoals] = useState([
    { id: 1, name: 'Купить квартиру', amount: 5000000, current: 1200000, targetDate: '2025-12-31' },
    { id: 2, name: 'Накопить на машину', amount: 1500000, current: 450000, targetDate: '2024-06-15' },
    { id: 3, name: 'Путешествие в Японию', amount: 300000, current: 180000, targetDate: '2024-03-20' }
  ]);
  const [newGoalData, setNewGoalData] = useState({
    name: '',
    amount: '',
    targetDate: ''
  });
  const [newPlanData, setNewPlanData] = useState({
    name: '',
    amount: '',
    category: ''
  });
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    color: ''
  });
  const [jointGoals, setJointGoals] = useState([
    {
      id: 1,
      name: 'Свадьба',
      targetAmount: 500000,
      currentAmount: 150000,
      targetDate: '2024-08-15',
      participants: 2,
      avatars: []
    },
    {
      id: 2,
      name: 'Путешествие в Европу',
      targetAmount: 300000,
      currentAmount: 80000,
      targetDate: '2024-06-01',
      participants: 4,
      avatars: []
    }
  ]);
  const [newJointGoalData, setNewJointGoalData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    description: ''
  });
  const [copiedGoalId, setCopiedGoalId] = useState(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedGoalParticipants, setSelectedGoalParticipants] = useState(null);
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryPlans, setCategoryPlans] = useState({});
  
  // Существующие категории с планами
  const [lifestylePlans, setLifestylePlans] = useState([
    { id: 1, name: "Спортивный зал", currentAmount: 0, targetAmount: 2000 }
  ]);
  const [dreamPlans, setDreamPlans] = useState([
    { id: 2, name: "Путешествие", currentAmount: 10000, targetAmount: 60000 }
  ]);
  const [goalsPlans, setGoalsPlans] = useState([
    { id: 3, name: "Покупка ноутбука", currentAmount: 60000, targetAmount: 60000, completed: true, targetDate: '2024-01-15' },
    { id: 4, name: "Покупка собаки", currentAmount: 65000, targetAmount: 100000, targetDate: '2024-06-15' },
    { id: 5, name: "Путешествие", currentAmount: 20000, targetAmount: 100000, targetDate: '2024-03-20' },
    { id: 6, name: "Переезд в новую квартиру", currentAmount: 5000, targetAmount: 200000, targetDate: '2025-12-31' }
  ]);

  // Бюджет на планирование - отдельное поле
  const planningBudget = "110 000 ₽";
  
  // Данные для кольцевой диаграммы - показываем распределение средств на накопительном счету
  const budgetData = useMemo(() => {
    const lifestyleTotal = lifestylePlans.reduce((sum, plan) => sum + (plan.currentAmount || 0), 0);
    const dreamTotal = dreamPlans.reduce((sum, plan) => sum + (plan.currentAmount || 0), 0);
    const goalsTotal = goalsPlans.reduce((sum, plan) => sum + (plan.currentAmount || 0), 0);
    const jointTotal = jointGoals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
    
    const lifestyleTargetTotal = lifestylePlans.reduce((sum, plan) => sum + (plan.targetAmount || 0), 0);
    const dreamTargetTotal = dreamPlans.reduce((sum, plan) => sum + (plan.targetAmount || 0), 0);
    const goalsTargetTotal = goalsPlans.reduce((sum, plan) => sum + (plan.targetAmount || 0), 0);
    const jointTargetTotal = jointGoals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
    
    // Распределение средств на накопительном счету по категориям
    return [
      { name: "Планы", amount: lifestyleTotal + dreamTotal, targetAmount: lifestyleTargetTotal + dreamTargetTotal, color: "#3C82F6" },
      { name: "Цели", amount: goalsTotal, targetAmount: goalsTargetTotal, color: "#EF4444" },
      { name: "Совместные цели", amount: jointTotal, targetAmount: jointTargetTotal, color: "#F59E0C" }
    ];
  }, [lifestylePlans, dreamPlans, goalsPlans, jointGoals]);
  
  // Общая сумма на накопительном счету (баланс виртуальной карты)
  const totalAmount = virtualCardBalance;
  
  const formatCurrency = (value) => `${Math.round(value).toLocaleString('ru-RU')} ₽`;
  
  // Функция для получения цвета банка
  const getBankColor = (bankName) => {
    switch (bankName) {
      case 'ABank':
        return 'bg-red-600'; // Красный цвет для ABank (как на картах)
      case 'VBank':
        return 'bg-blue-600'; // Синий цвет для VBank (как на картах)
      case 'SBank':
        return 'bg-green-500'; // Зеленый цвет для SBank (как на картах)
      case 'Сбербанк':
        return 'bg-green-600'; // Зеленый для Сбербанка (как на картах)
      default:
        return 'bg-gray-500'; // Серый для неизвестных банков
    }
  };
  
  // Сколько уже накоплено по всем планам/категориям (используется для отображения распределения)
  const accumulatedSaved = useMemo(() => {
    const sumLifestyle = lifestylePlans.reduce((s, p) => s + (p.currentAmount || 0), 0);
    const sumDream = dreamPlans.reduce((s, p) => s + (p.currentAmount || 0), 0);
    const sumGoals = goalsPlans.reduce((s, p) => s + (p.currentAmount || 0), 0);
    const sumJoint = jointGoals.reduce((s, g) => s + (g.currentAmount || 0), 0);
    const sumCategories = Object.values(categoryPlans).reduce((sum, plans) => {
      const list = Array.isArray(plans) ? plans : [];
      return sum + list.reduce((s, p) => s + (p.currentAmount || 0), 0);
    }, 0);
    return sumLifestyle + sumDream + sumGoals + sumJoint + sumCategories;
  }, [lifestylePlans, dreamPlans, goalsPlans, jointGoals, categoryPlans]);

  // Общая сумма, которая должна собираться (целевые суммы)
  const totalTargetAmount = useMemo(() => {
    const sumLifestyle = lifestylePlans.reduce((s, p) => s + (p.targetAmount || 0), 0);
    const sumDream = dreamPlans.reduce((s, p) => s + (p.targetAmount || 0), 0);
    const sumGoals = goalsPlans.reduce((s, p) => s + (p.targetAmount || 0), 0);
    const sumJoint = jointGoals.reduce((s, g) => s + (g.targetAmount || 0), 0);
    const sumCategories = Object.values(categoryPlans).reduce((sum, plans) => {
      const list = Array.isArray(plans) ? plans : [];
      return sum + list.reduce((s, p) => s + (p.targetAmount || 0), 0);
    }, 0);
    return sumLifestyle + sumDream + sumGoals + sumJoint + sumCategories;
  }, [lifestylePlans, dreamPlans, goalsPlans, jointGoals, categoryPlans]);
  
  // Создаем conic-gradient на основе процентного соотношения
  const getConicGradient = () => {
    if (totalAmount === 0) {
      // Если на счету нет средств, показываем серый круг
      return 'conic-gradient(from 0deg, #E5E7EB 0deg 360deg)';
    }
    
    let currentAngle = 0;
    const gradients = budgetData
      .filter(item => item.amount > 0) // Показываем только категории с ненулевыми суммами
      .map(item => {
        const percentage = (item.amount / totalAmount) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle += angle;
        
        return `${item.color} ${startAngle}deg ${endAngle}deg`;
      }).join(', ');
    
    // Если есть нераспределенные средства, добавляем серый сегмент
    const distributedAmount = budgetData.reduce((sum, item) => sum + item.amount, 0);
    const undistributedAmount = totalAmount - distributedAmount;
    if (undistributedAmount > 0 && gradients) {
      const undistributedPercentage = (undistributedAmount / totalAmount) * 100;
      const undistributedAngle = (undistributedPercentage / 100) * 360;
      return `conic-gradient(from 0deg, ${gradients}, #E5E7EB ${currentAngle}deg ${currentAngle + undistributedAngle}deg)`;
    }
    
    return gradients ? `conic-gradient(from 0deg, ${gradients})` : 'conic-gradient(from 0deg, #E5E7EB 0deg 360deg)';
  };


  const handleAddPlan = () => {
    setShowAddPlanModal(true);
  };

  const handleCloseModal = () => {
    setShowAddPlanModal(false);
    setNewPlanData({ name: '', amount: '', category: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlanData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPlan = () => {
    if (newPlanData.name && newPlanData.amount && newPlanData.category) {
      const newPlan = {
        id: Date.now(),
        name: newPlanData.name,
        currentAmount: 0,
        targetAmount: parseInt(newPlanData.amount)
      };
      
      // Добавляем план в соответствующую категорию
      if (newPlanData.category === 'lifestyle') {
        setLifestylePlans(prev => [...prev, newPlan]);
      } else if (newPlanData.category === 'dream') {
        setDreamPlans(prev => [...prev, newPlan]);
      } else {
        // Для пользовательских категорий добавляем в categoryPlans
        setCategoryPlans(prev => ({
          ...prev,
          [newPlanData.category]: [...(prev[newPlanData.category] || []), newPlan]
        }));
      }
      
      console.log('Новый план добавлен в категорию:', newPlanData.category, newPlan);
      handleCloseModal();
    }
  };

  const handleAddCategory = () => {
    setShowAddCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowAddCategoryModal(false);
    setNewCategoryData({ name: '', color: '' });
  };

  const handleTopUpPlan = (plan, category = null) => {
    setSelectedPlan({ ...plan, category });
    setShowTopUpModal(true);
  };

  const handleCloseTopUpModal = () => {
    setShowTopUpModal(false);
    setSelectedPlan(null);
    setSelectedCard(null);
    setTopUpAmount('');
  };

  const handleAddGoal = () => {
    setShowAddGoalModal(true);
  };

  const handleCloseAddGoalModal = () => {
    setShowAddGoalModal(false);
    setNewGoalData({ name: '', amount: '', targetDate: '' });
  };

  // Joint Goals Functions
  const handleAddJointGoal = () => {
    setShowAddJointGoalModal(true);
  };

  const handleCloseAddJointGoalModal = () => {
    setShowAddJointGoalModal(false);
    setNewJointGoalData({ name: '', targetAmount: '', targetDate: '', description: '' });
  };

  const handleShowParticipants = (goal) => {
    setSelectedGoalParticipants(goal);
    setShowParticipantsModal(true);
  };

  const handleCloseParticipantsModal = () => {
    setShowParticipantsModal(false);
    setSelectedGoalParticipants(null);
  };

  const handleRemoveParticipant = (goalId, participantIndex) => {
    setJointGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const newAvatars = [...goal.avatars];
        newAvatars.splice(participantIndex, 1);
        return {
          ...goal,
          participants: Math.max(1, goal.participants - 1),
          avatars: newAvatars
        };
      }
      return goal;
    }));
    
    // Обновляем модальное окно если оно открыто
    if (selectedGoalParticipants && selectedGoalParticipants.id === goalId) {
      const updatedGoal = jointGoals.find(g => g.id === goalId);
      if (updatedGoal) {
        setSelectedGoalParticipants(updatedGoal);
      }
    }
  };

  const handleCreateJointGoal = () => {
    if (newJointGoalData.name && newJointGoalData.targetAmount && newJointGoalData.targetDate) {
      const newGoal = {
        id: Date.now(),
        name: newJointGoalData.name,
        targetAmount: parseInt(newJointGoalData.targetAmount),
        currentAmount: 0,
        targetDate: newJointGoalData.targetDate,
        participants: 1,
        avatars: []
      };
      setJointGoals([...jointGoals, newGoal]);
      handleCloseAddJointGoalModal();
    }
  };


  // Referral link helpers
  const appBaseUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin + window.location.pathname;
    }
    return '';
  }, []);

  const buildReferralLink = (goalId) => {
    // Telegram deep-link via t.me is usually formed outside WebApp; for WebApp we can share current URL with param
    const url = new URL(appBaseUrl);
    url.searchParams.set('join_goal', String(goalId));
    return url.toString();
  };

  const handleInviteByLink = async (goalId) => {
    const link = buildReferralLink(goalId);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedGoalId(goalId);
      setTimeout(() => setCopiedGoalId(null), 1500);
    } catch (_e) {
      // Fallback: open share dialog if available
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Приглашение в совместную цель', text: 'Присоединяйся к цели в МультиБанк', url: link });
        } catch (_) {}
      }
    }
  };

  // Auto-join by start param (join_goal) when Mini App opens
  useEffect(() => {
    try {
      const webApp = getTelegramWebApp();
      // Try URL first
      const params = new URLSearchParams(window.location.search);
      const joinParam = params.get('join_goal');
      if (joinParam) {
        const joinId = Number(joinParam);
        const goal = jointGoals.find(g => g.id === joinId);
        if (goal) {
          // simulate join: increment participants and add placeholder avatar once
          setJointGoals(prev => prev.map(g => g.id === joinId ? {
            ...g,
            participants: g.participants + 1,
            avatars: g.avatars.length < 6 ? [...g.avatars, ''] : g.avatars
          } : g));
          // clean param from URL (no reload)
          const clean = new URL(window.location.href);
          clean.searchParams.delete('join_goal');
          window.history.replaceState({}, document.title, clean.toString());
        }
        return;
      }
      // Also try Telegram initDataUnsafe.start_param if present
      const startParam = webApp?.initDataUnsafe?.start_param;
      if (startParam && startParam.startsWith('join_goal_')) {
        const joinId = Number(startParam.replace('join_goal_', ''));
        const goal = jointGoals.find(g => g.id === joinId);
        if (goal) {
          setJointGoals(prev => prev.map(g => g.id === joinId ? {
            ...g,
            participants: g.participants + 1,
            avatars: g.avatars.length < 6 ? [...g.avatars, ''] : g.avatars
          } : g));
        }
      }
    } catch (_e) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitGoal = (e) => {
    e.preventDefault();
    if (newGoalData.name && newGoalData.amount && newGoalData.targetDate) {
      const newGoal = {
        id: Date.now(),
        name: newGoalData.name,
        currentAmount: 0, // Начинаем с 0
        targetAmount: parseFloat(newGoalData.amount),
        targetDate: newGoalData.targetDate,
        completed: false
      };
      setGoalsPlans([...goalsPlans, newGoal]);
      handleCloseAddGoalModal();
    }
  };

  const handleSelectCard = (card) => {
    setSelectedCard(card);
  };

  // Функция для проверки, просрочена ли цель
  const isGoalOverdue = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    return target < today;
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleTopUpAmountChange = (e) => {
    const value = e.target.value;
    // Разрешаем только цифры
    if (value === '' || /^\d+$/.test(value)) {
      setTopUpAmount(value);
    }
  };

  const getMaxTopUpAmount = () => {
    if (!selectedPlan) return 0;
    return selectedPlan.targetAmount - selectedPlan.currentAmount;
  };

  const isTopUpAmountValid = () => {
    if (!topUpAmount || !selectedPlan) return false;
    const amount = parseInt(topUpAmount);
    const maxAmount = getMaxTopUpAmount();
    return amount > 0 && amount <= maxAmount;
  };

  const handleTopUpSubmit = async () => {
    if (!selectedPlan || !selectedCard || !isTopUpAmountValid()) return;
    
    const amount = parseInt(topUpAmount);
    
    // Переводим средства с выбранной карты на виртуальную карту через API
    try {
      await axios.post(`${API_BASE}/payments/make_transfer/`, {
        user_id_id: CLIENT_ID_ID,
        to_user_id_id: CLIENT_ID_ID,
        from_bank: selectedCard.id === 1 ? 'vbank' : selectedCard.id === 2 ? 'abank' : 'sbank',
        to_bank: 'vbank_savings',
        amount: amount,
      });
      
      // Обновляем балансы локально
      const fromBankId = selectedCard.id === 1 ? 'vbank' : selectedCard.id === 2 ? 'abank' : 'sbank';
      transferMoney(fromBankId, 'vbank_savings', amount);
      
      // Увеличиваем баланс виртуальной карты (средства пополняют счет)
      updateVirtualCardBalance(amount, 'add');
      
      // Обновляем план в соответствующем состоянии (средства распределяются по плану)
      if (selectedPlan.category === 'lifestyle') {
        setLifestylePlans(prev => 
          prev.map(plan => {
            if (plan.id === selectedPlan.id) {
              const updatedPlan = { ...plan, currentAmount: plan.currentAmount + amount };
              // Проверяем завершение плана
              setTimeout(() => checkPlanCompletion(updatedPlan, 'lifestyle'), 100);
              return updatedPlan;
            }
            return plan;
          })
        );
      } else if (selectedPlan.category === 'dream') {
        setDreamPlans(prev => 
          prev.map(plan => {
            if (plan.id === selectedPlan.id) {
              const updatedPlan = { ...plan, currentAmount: plan.currentAmount + amount };
              // Проверяем завершение плана
              setTimeout(() => checkPlanCompletion(updatedPlan, 'dream'), 100);
              return updatedPlan;
            }
            return plan;
          })
        );
      } else {
        // Для пользовательских категорий
        setCategoryPlans(prev => {
          const categoryId = selectedPlan.category;
          return {
            ...prev,
            [categoryId]: prev[categoryId]?.map(plan => {
              if (plan.id === selectedPlan.id) {
                const updatedPlan = { ...plan, currentAmount: plan.currentAmount + amount };
                // Проверяем завершение плана
                setTimeout(() => checkPlanCompletion(updatedPlan, categoryId), 100);
                return updatedPlan;
              }
              return plan;
            }) || []
          };
        });
      }
    } catch (err) {
      console.error('Ошибка при пополнении плана:', err);
      // Можно показать ошибку пользователю
    }
    
    // Закрываем модальное окно
    handleCloseTopUpModal();
  };

  // Функции для работы с виртуальной картой VBank
  const handleTopUpVirtualCard = () => {
    setShowTopUpVirtualCardModal(true);
    setTopUpVirtualError('');
    setTopUpVirtualAmount('');
    setSelectedSourceCard(null);
    setSelectedCardInfo(null);
  };

  const handleCloseTopUpVirtualCardModal = () => {
    setShowTopUpVirtualCardModal(false);
    setTopUpVirtualError('');
    setTopUpVirtualAmount('');
    setSelectedSourceCard(null);
    setSelectedCardInfo(null);
  };

  const handleTopUpVirtualCardSubmit = async () => {
    setTopUpVirtualError('');
    
    if (!selectedSourceCard) {
      setTopUpVirtualError('Выберите карту для пополнения');
      return;
    }
    
    if (!topUpVirtualAmount || parseFloat(topUpVirtualAmount) <= 0) {
      setTopUpVirtualError('Введите корректную сумму');
      return;
    }
    
    const amount = parseFloat(topUpVirtualAmount);
    const availableBalance = bankBalances?.[selectedSourceCard] || 0;
    
    if (amount > availableBalance) {
      setTopUpVirtualError('Недостаточно средств на карте');
      return;
    }
    
    try {
      setTopUpVirtualLoading(true);
      
      // Переводим средства через API
      await axios.post(`${API_BASE}/payments/make_transfer/`, {
        user_id_id: CLIENT_ID_ID,
        to_user_id_id: CLIENT_ID_ID,
        from_bank: selectedSourceCard,
        to_bank: 'vbank_savings', // Виртуальная карта накопительного счета
        amount: amount,
      });
      
      // Обновляем балансы локально
      transferMoney(selectedSourceCard, 'vbank_savings', amount);
      
      // Обновляем баланс виртуальной карты
      updateVirtualCardBalance(amount, 'add');
      
      // Закрываем модальное окно
      handleCloseTopUpVirtualCardModal();
    } catch (err) {
      console.error('Ошибка при пополнении виртуальной карты:', err);
      setTopUpVirtualError('Ошибка при пополнении карты. Попробуйте еще раз.');
    } finally {
      setTopUpVirtualLoading(false);
    }
  };

  // Загружаем карты из бэкенда для всех подключенных банков
  const { data: cardsData, isLoading: isLoadingCards } = useQuery(
    ['cardsForTopUp', connectedBanks, CLIENT_ID_ID],
    async () => {
      if (!CLIENT_ID_ID || connectedBanks.length === 0) return [];
      
      const allCards = [];
      
      for (const bank of connectedBanks) {
        const bankId = bank.toLowerCase();
        try {
          const response = await cardManagementAPI.getCards(bankId, CLIENT_ID_ID);
          const cards = response?.data?.data?.cards || response?.data?.cards || [];
          
          // Получаем баланс для каждой карты
          const cardsWithBalance = await Promise.all(
            cards.map(async (card) => {
              const cardId = card.cardId || card.id;
              const balance = bankBalances?.[bankId] || 0;
              
              // Маппинг названий банков
              const bankNames = {
                'vbank': 'VBank',
                'abank': 'ABank',
                'sbank': 'SBank'
              };
              
              const bankName = bankNames[bankId] || bank.toUpperCase();
              
              // Получаем последние 4 цифры карты
              const cardNumber = card.maskedPan?.slice(-4) || 
                               card.pan?.slice(-4) || 
                               card.cardNumber?.slice(-4) || 
                               '0000';
              
              return {
                id: cardId,
                cardId: cardId,
                bankId: bankId,
                bankName: bankName,
                name: `${bankName} ••••${cardNumber}`,
                balance: balance,
                cardNumber: cardNumber,
                maskedPan: card.maskedPan || card.pan || `••••${cardNumber}`,
                card: card
              };
            })
          );
          
          allCards.push(...cardsWithBalance);
        } catch (error) {
          console.error(`Ошибка при загрузке карт для ${bankId}:`, error);
          // Fallback: добавляем банк без карт, если есть баланс
          if (bankBalances?.[bankId] > 0) {
            const bankNames = {
              'vbank': 'VBank',
              'abank': 'ABank',
              'sbank': 'SBank'
            };
            const bankName = bankNames[bankId] || bank.toUpperCase();
            allCards.push({
              id: bankId,
              bankId: bankId,
              bankName: bankName,
              name: bankName,
              balance: bankBalances[bankId],
              cardNumber: '0000',
              maskedPan: '••••0000',
              isBankFallback: true
            });
          }
        }
      }
      
      return allCards;
    },
    {
      enabled: !!CLIENT_ID_ID && connectedBanks.length > 0 && showTopUpVirtualCardModal,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 секунд
    }
  );
  
  // Получаем доступные карты для пополнения
  const availableCards = useMemo(() => {
    return cardsData || [];
  }, [cardsData]);

  // Функции для редактирования планов
  const handleEditPlan = (plan, category) => {
    setEditingPlan({ ...plan, category });
    setEditPlanData({
      name: plan.name,
      amount: plan.targetAmount.toString(),
      category: category
    });
    setShowEditPlanModal(true);
  };

  const handleCloseEditPlanModal = () => {
    setShowEditPlanModal(false);
    setEditingPlan(null);
    setEditPlanData({ name: '', amount: '', category: '' });
  };

  const handleEditPlanInputChange = (e) => {
    const { name, value } = e.target;
    setEditPlanData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEditPlan = () => {
    if (!editPlanData.name || !editPlanData.amount || !editingPlan) return;
    
    const updatedPlan = {
      ...editingPlan,
      name: editPlanData.name,
      targetAmount: parseInt(editPlanData.amount)
    };

    if (editingPlan.category === 'lifestyle') {
      setLifestylePlans(prev => 
        prev.map(plan => plan.id === editingPlan.id ? updatedPlan : plan)
      );
    } else if (editingPlan.category === 'dream') {
      setDreamPlans(prev => 
        prev.map(plan => plan.id === editingPlan.id ? updatedPlan : plan)
      );
    } else {
      setCategoryPlans(prev => ({
        ...prev,
        [editingPlan.category]: prev[editingPlan.category]?.map(plan => 
          plan.id === editingPlan.id ? updatedPlan : plan
        ) || []
      }));
    }
    
    handleCloseEditPlanModal();
  };

  const handleDeletePlan = (planId, category) => {
    setDeleteTarget({ type: 'plan', id: planId, category });
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteCategory = (categoryId) => {
    setDeleteTarget({ type: 'category', id: categoryId });
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'plan') {
      const { id: planId, category } = deleteTarget;
      if (category === 'lifestyle') {
        setLifestylePlans(prev => prev.filter(plan => plan.id !== planId));
      } else if (category === 'dream') {
        setDreamPlans(prev => prev.filter(plan => plan.id !== planId));
      } else {
        setCategoryPlans(prev => ({
          ...prev,
          [category]: prev[category]?.filter(plan => plan.id !== planId) || []
        }));
      }
    } else if (deleteTarget.type === 'category') {
      const { id: categoryId } = deleteTarget;
      setCategories(prev => prev.filter(category => category.id !== categoryId));
      setCategoryPlans(prev => {
        const newCategoryPlans = { ...prev };
        delete newCategoryPlans[categoryId];
        return newCategoryPlans;
      });
    }

    setShowDeleteConfirmModal(false);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setDeleteTarget(null);
  };

  const checkPlanCompletion = (plan, category) => {
    if (plan.currentAmount >= plan.targetAmount) {
      setCompletedPlan({ ...plan, category });
      setShowCongratulationsModal(true);
      return true;
    }
    return false;
  };

  const handleCloseCongratulations = () => {
    setShowCongratulationsModal(false);
    setCompletedPlan(null);
  };

  // Функции для управления целями
  const handleOpenGoalsModal = () => {
    setShowGoalsModal(true);
  };

  const handleCloseGoalsModal = () => {
    setShowGoalsModal(false);
  };


  const handleDeleteGoal = (goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const handleUpdateGoal = (goalId, field, value) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, [field]: value } : goal
    ));
  };

  // Функции для редактирования категорий
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryData({
      name: category.name,
      color: category.color
    });
    setShowEditCategoryModal(true);
  };

  const handleCloseEditCategoryModal = () => {
    setShowEditCategoryModal(false);
    setEditingCategory(null);
    setEditCategoryData({ name: '', color: '' });
  };

  const handleEditCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setEditCategoryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEditCategory = () => {
    if (!editCategoryData.name || !editCategoryData.color || !editingCategory) return;
    
    const updatedCategory = {
      ...editingCategory,
      name: editCategoryData.name,
      color: editCategoryData.color
    };

    setCategories(prev => 
      prev.map(category => category.id === editingCategory.id ? updatedCategory : category)
    );
    
    handleCloseEditCategoryModal();
  };


  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategoryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitCategory = () => {
    if (newCategoryData.name && newCategoryData.color) {
      const newCategory = {
        id: Date.now(),
        name: newCategoryData.name,
        color: newCategoryData.color,
        createdAt: new Date().toISOString()
      };
      setCategories(prev => [...prev, newCategory]);
      console.log('Новая категория добавлена:', newCategory);
      handleCloseCategoryModal();
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Планирование бюджета
          </div>
          <button
            onClick={() => setShowInfoPanel(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </div>

      <PremiumBlock featureName="AI-планирование бюджета">
      {/* Main Content */}
      <div className="px-0">
        {/* Virtual Card VBank - Накопительный счет */}
        <div className="px-4 mb-4">
          <div className="rounded-[27px] border border-gray-200 overflow-hidden" style={{ backgroundColor: '#0055BC' }}>
            <div className="p-4" style={{ backgroundColor: '#0055BC' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-ibm text-lg font-medium leading-[110%]">VBank</div>
                    <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%]">Накопительный счет</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-ibm text-2xl font-semibold leading-[110%]">
                    {formatCurrency(virtualCardBalance)}
                  </div>
                </div>
              </div>
              <button
                onClick={handleTopUpVirtualCard}
                className="w-full bg-white text-[#0055BC] font-ibm text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors mt-3"
              >
                Пополнить
              </button>
            </div>
          </div>
        </div>

        {/* Budget Overview Section */}
        <div className="flex items-center justify-between mb-8 px-4">
          {/* Donut Chart */}
          <div className="relative w-[150px] h-[150px] flex items-center justify-center animate-donut-entrance">
            {/* Chart segments */}
            <div 
              className="absolute inset-0 rounded-full" 
              style={{ 
                background: getConicGradient()
              }}
            ></div>
            <div className="absolute inset-4 bg-white rounded-full"></div>
          </div>

          {/* Text Information */}
          <div className="flex-1 pl-6">
            <div className="text-black font-ibm text-sm font-normal leading-[110%] mb-2">
              На накопительном счету
            </div>
            <div className="text-black font-ibm text-2xl font-medium leading-[110%] mb-2 whitespace-nowrap">
              {formatCurrency(totalAmount)}
            </div>
            <div className="text-black font-ibm text-sm font-normal leading-[110%]">
              Распределено: {formatCurrency(accumulatedSaved)}
            </div>
        </div>
      </div>

        {/* Budget Categories */}
        <div className="space-y-4 mb-4 px-4">
          {budgetData
            .filter(item => item.amount > 0) // Показываем только категории с ненулевыми суммами
            .map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-6 h-6 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-black font-ibm text-base font-normal leading-[110%]">{item.name}</span>
                </div>
                <span className="text-black font-ibm text-xs min-[360px]:text-sm font-normal leading-[110%] whitespace-nowrap">
                  `${Math.round(item.amount).toLocaleString('ru-RU')} ₽ из ${Math.round(item.targetAmount || 0).toLocaleString('ru-RU')} ₽`
                </span>
              </div>
            ))}
          {/* Нераспределенные средства */}
          {totalAmount > accumulatedSaved && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: '#E5E7EB' }}
                ></div>
                <span className="text-black font-ibm text-base font-normal leading-[110%]">Нераспределено</span>
              </div>
              <span className="text-black font-ibm text-xs min-[360px]:text-sm font-normal leading-[110%] whitespace-nowrap">
                {formatCurrency(totalAmount - accumulatedSaved)}
              </span>
            </div>
          )}
        </div>

        {/* My Planning Categories Container */}
        <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden" style={{ backgroundColor: '#3C82F6' }}>
          <div className="p-4" style={{ backgroundColor: '#3C82F6' }}>
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 11h14M7 15h10" />
                </svg>
              </div>
              <div className="text-white font-ibm text-lg font-medium leading-[110%]">Мои категории планирования</div>
            </div>
            <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
              Добавляйте категории и распределяйте бюджет по направлениям
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddPlan}
                className="bg-white text-[#3C82F6] font-ibm text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Добавить план
              </button>
              <button
                onClick={handleAddCategory}
                className="bg-white text-[#3C82F6] font-ibm text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Добавить категорию
              </button>
            </div>
            <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
          </div>
          <div className="px-4 pb-4 pt-0">

        {/* Lifestyle Section */}
        <div className="bg-gray-100 rounded-[27px] mb-4">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-black font-ibm text-lg font-medium leading-[110%]">Образ жизни</h3>
              <button 
                onClick={() => setShowLifestyleTip(!showLifestyleTip)}
                className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
              >
                <span className="text-black font-ibm text-sm font-medium">i</span>
              </button>
            </div>
            <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-2">
              {lifestylePlans.reduce((sum, plan) => sum + plan.currentAmount, 0).toLocaleString('ru-RU')} ₽ / {lifestylePlans.reduce((sum, plan) => sum + plan.targetAmount, 0).toLocaleString('ru-RU')} ₽
            </div>
            {showLifestyleTip && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <div className="text-gray-700 font-ibm text-sm leading-[110%]">
                  В среднем вы тратите 3 000₽ в месяц на кофе. Если сократить потребление до 1 чашки в день вместо 2, вы будете здоровее и сэкономите 1 500₽ в месяц. Это поддержит ваш образ жизни и поможет быстрее достичь целей
                </div>
                <div className="text-gray-500 font-ibm text-xs mt-1">
                  ИИ-совет от МультиБанка
                </div>
              </div>
            )}
          </div>
          <div className="bg-white border-t border-gray-200 rounded-b-[27px] p-4">
            {lifestylePlans.map((plan) => {
              const isCompleted = plan.currentAmount >= plan.targetAmount;
              return (
                <div key={plan.id} className={`mb-4 last:mb-0 ${isCompleted ? 'opacity-75' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full ${isCompleted ? 'bg-green-200' : 'bg-pink-200'}`}>
                        {isCompleted && (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className={`font-ibm text-lg font-medium leading-[110%] ${isCompleted ? 'text-green-700 line-through' : 'text-black'}`}>
                        {plan.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 min-[360px]:space-x-2 mb-3">
                    <button 
                      onClick={() => handleEditPlan(plan, 'lifestyle')}
                      className="flex-1 px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 rounded-lg bg-gray-100 text-gray-800 font-ibm text-xs min-[360px]:text-sm hover:bg-gray-200 transition-colors"
                    >
                      Изменить
                    </button>
                    <button 
                      onClick={() => handleDeletePlan(plan.id, 'lifestyle')}
                      className="flex-1 px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 rounded-lg bg-red-100 text-red-700 font-ibm text-xs min-[360px]:text-sm hover:bg-red-200 transition-colors"
                    >
                      Удалить
                    </button>
                    {!isCompleted && (
                      <button 
                        onClick={() => handleTopUpPlan(plan, 'lifestyle')}
                        className="flex-1 px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 rounded-lg bg-green-100 text-green-700 font-ibm text-xs min-[360px]:text-sm hover:bg-green-200 transition-colors"
                      >
                        Пополнить
                      </button>
                    )}
                  </div>
                <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-3">
                  {Math.round(plan.currentAmount).toLocaleString('ru-RU')} ₽ из {Math.round(plan.targetAmount).toLocaleString('ru-RU')} ₽
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-pink-500'}`}
                    style={{ width: `${Math.min((plan.currentAmount / plan.targetAmount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              );
            })}
        </div>
      </div>

        {/* Dream Section */}
        <div className="bg-gray-100 rounded-[27px] mb-4">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-black font-ibm text-lg font-medium leading-[110%]">Мечта</h3>
          <button 
                onClick={() => setShowDreamTip(!showDreamTip)}
                className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
              >
                <span className="text-black font-ibm text-sm font-medium">i</span>
              </button>
            </div>
            <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-2">
              {dreamPlans.reduce((sum, plan) => sum + plan.currentAmount, 0).toLocaleString('ru-RU')} ₽ / {dreamPlans.reduce((sum, plan) => sum + plan.targetAmount, 0).toLocaleString('ru-RU')} ₽
            </div>
            {showDreamTip && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <div className="text-gray-700 font-ibm text-sm leading-[110%]">
                  В среднем вы тратите 4 500₽ в месяц на доставку еды. Если готовить дома 3 раза в неделю вместо заказа, вы будете здоровее и сэкономите 2 700₽ в месяц. Это ускорит накопление на путешествие на 3 месяца
                </div>
                <div className="text-gray-500 font-ibm text-xs mt-1">
                  ИИ-совет от МультиБанка
                </div>
              </div>
            )}
          </div>
          <div className="bg-white border-t border-gray-200 rounded-b-[27px] p-4">
            {/* Пример с учетом страховки для отпуска */}
            {dreamPlans.some(plan => plan.name?.toLowerCase().includes('отпуск')) && (
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-black font-ibm text-sm font-medium mb-1">
                  Отпуск: 150 000 ₽ + страховка путешественника (2 100 ₽)
                </div>
                <div className="text-gray-600 font-ibm text-xs">
                  Общая сумма: 152 100 ₽
                </div>
              </div>
            )}

            {/* AI подсказка по страховкам */}
            <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <div className="text-black font-ibm text-xs font-medium mb-1">
                    AI-подсказка
                  </div>
                  <div className="text-gray-700 font-ibm text-xs leading-relaxed">
                    Сократите ДМС до базового — сэкономите 1 800 ₽/мес
                  </div>
                </div>
              </div>
            </div>

            {dreamPlans.map((plan) => {
              const isCompleted = plan.currentAmount >= plan.targetAmount;
              return (
                <div key={plan.id} className={`mb-4 last:mb-0 ${isCompleted ? 'opacity-75' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full ${isCompleted ? 'bg-green-200' : 'bg-green-500'}`}>
                        {isCompleted && (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className={`font-ibm text-lg font-medium leading-[110%] ${isCompleted ? 'text-green-700 line-through' : 'text-black'}`}>
                        {plan.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 min-[360px]:space-x-2 mb-3">
                    <button 
                      onClick={() => handleEditPlan(plan, 'dream')}
                      className="flex-1 px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 rounded-lg bg-gray-100 text-gray-800 font-ibm text-xs min-[360px]:text-sm hover:bg-gray-200 transition-colors"
                    >
                      Изменить
                    </button>
                    <button 
                      onClick={() => handleDeletePlan(plan.id, 'dream')}
                      className="flex-1 px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 rounded-lg bg-red-100 text-red-700 font-ibm text-xs min-[360px]:text-sm hover:bg-red-200 transition-colors"
                    >
                      Удалить
                    </button>
                    {!isCompleted && (
                      <button 
                        onClick={() => handleTopUpPlan(plan, 'dream')}
                        className="flex-1 px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 rounded-lg bg-green-100 text-green-700 font-ibm text-xs min-[360px]:text-sm hover:bg-green-200 transition-colors"
                      >
                        Пополнить
                      </button>
                    )}
                  </div>
                <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-3">
                  {Math.round(plan.currentAmount).toLocaleString('ru-RU')} ₽ из {Math.round(plan.targetAmount).toLocaleString('ru-RU')} ₽
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min((plan.currentAmount / plan.targetAmount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Added Categories Section */}
        {categories.map((category) => {
          const categoryPlansList = categoryPlans[category.id] || [];
          const totalCurrent = categoryPlansList.reduce((sum, plan) => sum + plan.currentAmount, 0);
          const totalTarget = categoryPlansList.reduce((sum, plan) => sum + plan.targetAmount, 0);
          
          return (
            <div key={category.id} className="bg-gray-100 rounded-[27px] mb-4">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                    <h3 className="text-black font-ibm text-lg font-medium leading-[110%]">{category.name}</h3>
                    <div 
                      className="w-6 h-6 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-2">
                  {Math.round(totalCurrent).toLocaleString('ru-RU')} ₽ из {Math.round(totalTarget).toLocaleString('ru-RU')} ₽
                </div>
              </div>
              <div className="bg-white border-t border-gray-200 rounded-b-[27px] p-4">
                {categoryPlansList.length > 0 ? (
                  <div className="space-y-3">
                    {categoryPlansList.map((plan) => {
                      const isCompleted = plan.currentAmount >= plan.targetAmount;
                      return (
                        <div key={plan.id} className={`mb-4 last:mb-0 ${isCompleted ? 'opacity-75' : ''}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div 
                                className={`w-8 h-8 rounded-full ${isCompleted ? 'bg-green-200' : ''}`}
                                style={{ backgroundColor: isCompleted ? undefined : category.color }}
                              >
                                {isCompleted && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <span className={`font-ibm text-lg font-medium leading-[110%] ${isCompleted ? 'text-green-700 line-through' : 'text-black'}`}>
                                {plan.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 min-[360px]:space-x-2 mb-3">
                            <button 
                              onClick={() => handleEditPlan(plan, category.id)}
                              className="flex-1 px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 rounded-lg bg-gray-100 text-gray-800 font-ibm text-xs min-[360px]:text-sm hover:bg-gray-200 transition-colors"
                            >
                              Изменить
                            </button>
                            <button 
                              onClick={() => handleDeletePlan(plan.id, category.id)}
                              className="flex-1 px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 rounded-lg bg-red-100 text-red-700 font-ibm text-xs min-[360px]:text-sm hover:bg-red-200 transition-colors"
                            >
                              Удалить
                            </button>
                            {!isCompleted && (
                              <button 
                                onClick={() => handleTopUpPlan(plan, category.id)}
                                className="flex-1 px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 rounded-lg bg-green-100 text-green-700 font-ibm text-xs min-[360px]:text-sm hover:bg-green-200 transition-colors"
                              >
                                Пополнить
                              </button>
                            )}
                          </div>
                        <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-3">
                          {Math.round(plan.currentAmount).toLocaleString('ru-RU')} ₽ из {Math.round(plan.targetAmount).toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full ${isCompleted ? 'bg-green-500' : ''}`}
                            style={{ 
                              width: `${Math.min((plan.currentAmount / plan.targetAmount) * 100, 100)}%`,
                              backgroundColor: isCompleted ? undefined : category.color
                            }}
                          ></div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 font-ibm text-sm text-center py-4">
                    Пока нет планов в этой категории
            </div>
          )}
        </div>
            </div>
          );
        })}

          </div>
        </div>

        


        {/* My Goals Container */}
        <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden" style={{ backgroundColor: '#EF4444' }}>
          <div className="p-4" style={{ backgroundColor: '#EF4444' }}>
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4m8 0a4 4 0 01-4 4m0-12v2m0 8v2m-4-6H6m12 0h-2" />
                </svg>
              </div>
              <div className="text-white font-ibm text-lg font-medium leading-[110%]">Мои цели</div>
            </div>
            <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
              Создавайте финансовые цели и отслеживайте прогресс накоплений
            </div>
            <button
              onClick={handleAddGoal}
              className="bg-white text-[#EF4444] font-ibm text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Создать цель
            </button>
            <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
          </div>
          <div className="px-4 pb-4 pt-0">
            <div className="bg-white rounded-[27px] p-4">
              {/* Completed Goal */}
              <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 border-2 border-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
              <div className="flex-1">
                <div className="text-black font-ibm text-lg font-medium leading-[110%] mb-1">Покупка ноутбука</div>
                <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-1">
                  60 000 ₽ / 60 000 ₽
                </div>
                <div className="text-gray-600 font-ibm text-sm font-light leading-[110%]">
                  до 01.10.2025
                </div>
              </div>
            </div>

            {/* Incomplete Goals */}
            <div className="space-y-4">
              {goalsPlans.filter(plan => !plan.completed).map((plan) => (
                <div key={plan.id} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 border-2 rounded-full flex items-center justify-center ${
                    isGoalOverdue(plan.targetDate) 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isGoalOverdue(plan.targetDate) && (
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-black font-ibm text-lg font-medium leading-[110%] mb-1">{plan.name}</div>
                    <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-1">
                      {Math.round(plan.currentAmount).toLocaleString('ru-RU')} ₽ из {Math.round(plan.targetAmount).toLocaleString('ru-RU')} ₽
                    </div>
                    <div className={`font-ibm text-sm font-light leading-[110%] ${
                      isGoalOverdue(plan.targetDate) ? 'text-red-500' : 'text-gray-600'
                    }`}>
                      до {formatDate(plan.targetDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>

      </div>

      {/* Joint Goals Container */}
      <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden" style={{ backgroundColor: '#F59E0C' }}>
        {/* Header removed per request */}

        {/* New Joint Goal Section */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                  Совместные цели
                </div>
              </div>
              <div className="text-white/90 font-ibm text-sm font-normal leading-[110%] mb-4">
                Настройте новую цель с указанием суммы, срока и участников
              </div>
              <button 
                onClick={handleAddJointGoal}
                className="bg-white text-orange-600 font-ibm text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/90 transition-colors"
              >
                Создать цель
              </button>
            </div>
          </div>
        </div>

        {/* Joint Goals List */}
        <div className="space-y-3 p-4 border-t border-white/20">
          {jointGoals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-black font-ibm text-base font-medium leading-[110%]">
                      {goal.name}
                    </div>
                    <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                      {goal.participants} участника • до {formatDate(goal.targetDate)}
                    </div>
                  </div>
                </div>
                {/* Убрали правый блок с суммами; суммы перенесены в блок ниже */}
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                  <span>
                    {Math.round(goal.currentAmount).toLocaleString('ru-RU')} ₽ из {Math.round(goal.targetAmount).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Participants / Actions / Invite */}
              <div className="space-y-3">
                {/* 1-я строка: участники */}
                <div className="flex items-center">
                  <button 
                    onClick={() => handleShowParticipants(goal)}
                    className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    <div className="flex -space-x-2">
                      {goal.avatars.slice(0, 3).map((avatar, index) => (
                        <div key={index} className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center">
                          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      ))}
                      {goal.avatars.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{goal.avatars.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-gray-600 font-ibm text-sm">
                      {goal.participants} участника
                    </span>
                  </button>
                </div>

                {/* 2-я строка: действия */}
                <div className="flex items-center space-x-1 min-[360px]:space-x-2">
                  <button className="flex-1 px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 rounded-lg bg-gray-100 text-gray-800 font-ibm text-xs min-[360px]:text-sm hover:bg-gray-200 transition-colors" onClick={() => { setSelectedJointGoal(goal); setEditJointGoalData({ name: goal.name, targetAmount: String(goal.targetAmount), targetDate: goal.targetDate }); setShowEditJointGoalModal(true); }}>
                    Изменить
                  </button>
                  <button className="flex-1 px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 rounded-lg bg-red-100 text-red-700 font-ibm text-xs min-[360px]:text-sm hover:bg-red-200 transition-colors" onClick={() => { setSelectedJointGoal(goal); setShowDeleteJointGoalModal(true); }}>
                    Удалить
                  </button>
                  <button className="flex-1 px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 rounded-lg bg-green-100 text-green-700 font-ibm text-xs min-[360px]:text-sm hover:bg-green-200 transition-colors" onClick={() => { setSelectedJointGoal(goal); setTopUpJointAmount(''); setShowTopUpJointGoalModal(true); }}>
                    Пополнить
                  </button>
                </div>

                {/* 3-я строка: пригласить по ссылке */}
                <div className="w-full">
                  <button 
                    onClick={() => handleInviteByLink(goal.id)}
                    className="w-full bg-white border border-blue-500 text-blue-600 font-ibm text-xs min-[360px]:text-sm font-medium px-2 min-[360px]:px-3 py-1.5 min-[360px]:py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    {copiedGoalId === goal.id ? 'Скопировано' : 'Пригласить по ссылке'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Add Plan Modal */}
      {showAddPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 mx-4 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
                Добавить план
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
            </div>

            <div className="space-y-4">
              {/* Plan Name */}
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Название плана
                </label>
                <input
                  type="text"
                  name="name"
                  value={newPlanData.name}
                  onChange={handleInputChange}
                  placeholder="Например: Покупка велосипеда"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Сумма (₽)
                </label>
                <input
                  type="text"
                  name="amount"
                  value={newPlanData.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Разрешаем только цифры
                    if (value === '' || /^\d+$/.test(value)) {
                      handleInputChange(e);
                    }
                  }}
                  placeholder="50000"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Категория
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={newPlanData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition-all appearance-none cursor-pointer pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '12px'
                    }}
                  >
                    <option value="" className="bg-white py-2">Выберите категорию</option>
                    <option value="lifestyle" className="bg-white py-2">Образ жизни</option>
                    <option value="dream" className="bg-white py-2">Мечта</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-white py-2">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-2xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-200 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmitPlan}
                className="flex-1 px-4 py-3 bg-red-500 border-0 rounded-2xl text-white font-ibm text-base font-medium hover:bg-red-600 transition-all"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 mx-4 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
                Добавить категорию
              </h2>
              <button 
                onClick={handleCloseCategoryModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Название категории
                </label>
                <input
                  type="text"
                  name="name"
                  value={newCategoryData.name}
                  onChange={handleCategoryInputChange}
                  placeholder="Например: Образование"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Цвет
                </label>
                <div className="relative">
                  <select
                    name="color"
                    value={newCategoryData.color}
                    onChange={handleCategoryInputChange}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition-all appearance-none cursor-pointer pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '12px'
                    }}
                  >
                    <option value="" className="bg-white py-2">Выберите цвет</option>
                    <option value="#3C82F6" className="bg-white py-2">Синий</option>
                    <option value="#EF4444" className="bg-white py-2">Красный</option>
                    <option value="#F59E0C" className="bg-white py-2">Оранжевый</option>
                    <option value="#10B981" className="bg-white py-2">Зеленый</option>
                    <option value="#8B5CF6" className="bg-white py-2">Фиолетовый</option>
                    <option value="#F43F5E" className="bg-white py-2">Розовый</option>
                    <option value="#06B6D4" className="bg-white py-2">Голубой</option>
                    <option value="#84CC16" className="bg-white py-2">Лайм</option>
                  </select>
                </div>
        </div>
      </div>

            {/* Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCloseCategoryModal}
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-2xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-200 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmitCategory}
                className="flex-1 px-4 py-3 bg-red-500 border-0 rounded-2xl text-white font-ibm text-base font-medium hover:bg-red-600 transition-all"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {showTopUpModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-3xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
                Пополнить план
              </h2>
              <button 
                onClick={handleCloseTopUpModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-gray-100 rounded-2xl p-3 mb-3">
                <h3 className="text-black font-ibm text-lg font-medium mb-2">{selectedPlan.name}</h3>
                <div className="text-gray-600 font-ibm text-base">
                  {selectedPlan.currentAmount.toLocaleString('ru-RU')} ₽ / {selectedPlan.targetAmount.toLocaleString('ru-RU')} ₽
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((selectedPlan.currentAmount / selectedPlan.targetAmount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Amount Input */}
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-1.5">
                  Сумма пополнения (₽)
                </label>
                <input
                  type="text"
                  value={topUpAmount}
                  onChange={handleTopUpAmountChange}
                  placeholder="Введите сумму"
                  className={`w-full px-3 py-2.5 border-0 rounded-xl text-black font-ibm text-sm focus:outline-none focus:ring-2 transition-all ${
                    topUpAmount && !isTopUpAmountValid() 
                      ? 'bg-red-50 focus:ring-red-500 border border-red-200' 
                      : 'bg-gray-100 focus:ring-red-500'
                  }`}
                />
                {topUpAmount && !isTopUpAmountValid() && (
                  <div className="text-red-500 font-ibm text-xs mt-1">
                    Максимальная сумма: {getMaxTopUpAmount().toLocaleString('ru-RU')} ₽
                  </div>
                )}
                {selectedPlan && (
                  <div className="text-gray-500 font-ibm text-xs mt-1">
                    Осталось до цели: {getMaxTopUpAmount().toLocaleString('ru-RU')} ₽
                  </div>
                )}
              </div>

              <h4 className="text-black font-ibm text-sm font-medium">Выберите карту для пополнения:</h4>
              
              {/* Bank Cards */}
              <div className="space-y-2">
                <div 
                  onClick={() => handleSelectCard({ id: 1, name: 'VBank', number: '**** 3923', balance: bankBalances.vbank, color: 'bg-blue-500' })}
                  className={`rounded-2xl p-4 cursor-pointer transition-colors ${
                    selectedCard?.id === 1 
                      ? 'bg-blue-100 border-2 border-blue-500' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="text-black font-ibm text-base font-medium">VBank</div>
                        <div className="text-gray-600 font-ibm text-sm">**** 3923</div>
                      </div>
                    </div>
                    <div className="text-black font-ibm text-base font-medium">{bankBalances.vbank.toLocaleString('ru-RU')} ₽</div>
                  </div>
                </div>

                <div 
                  onClick={() => handleSelectCard({ id: 2, name: 'ABank', number: '**** 5678', balance: bankBalances.abank, color: 'bg-red-500' })}
                  className={`rounded-2xl p-4 cursor-pointer transition-colors ${
                    selectedCard?.id === 2 
                      ? 'bg-red-100 border-2 border-red-500' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                      <div>
                        <div className="text-black font-ibm text-base font-medium">ABank</div>
                        <div className="text-gray-600 font-ibm text-sm">**** 5678</div>
                      </div>
                    </div>
                    <div className="text-black font-ibm text-base font-medium">{bankBalances.abank.toLocaleString('ru-RU')} ₽</div>
                  </div>
                </div>

                <div 
                  onClick={() => handleSelectCard({ id: 3, name: 'SBank', number: '**** 9012', balance: bankBalances.sbank, color: 'bg-green-500' })}
                  className={`rounded-2xl p-4 cursor-pointer transition-colors ${
                    selectedCard?.id === 3 
                      ? 'bg-green-100 border-2 border-green-500' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="text-black font-ibm text-base font-medium">SBank</div>
                        <div className="text-gray-600 font-ibm text-sm">**** 9012</div>
                      </div>
                    </div>
                    <div className="text-black font-ibm text-base font-medium">{bankBalances.sbank.toLocaleString('ru-RU')} ₽</div>
                  </div>
                </div>
        </div>
      </div>

            {/* Buttons */}
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleCloseTopUpModal}
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-2xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-200 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleTopUpSubmit}
                disabled={!selectedCard || !isTopUpAmountValid()}
                className={`flex-1 px-4 py-3 border-0 rounded-2xl text-white font-ibm text-base font-medium transition-all ${
                  selectedCard && isTopUpAmountValid()
                    ? 'bg-red-500 hover:bg-red-600 cursor-pointer' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Пополнить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditPlanModal && editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 mx-4 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
                Редактировать план
              </h2>
              <button 
                onClick={handleCloseEditPlanModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Plan Name */}
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Название плана
                </label>
                <input
                  type="text"
                  name="name"
                  value={editPlanData.name}
                  onChange={handleEditPlanInputChange}
                  placeholder="Например: Покупка велосипеда"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Сумма (₽)
                </label>
                <input
                  type="text"
                  name="amount"
                  value={editPlanData.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Разрешаем только цифры
                    if (value === '' || /^\d+$/.test(value)) {
                      handleEditPlanInputChange(e);
                    }
                  }}
                  placeholder="50000"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCloseEditPlanModal}
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-2xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-200 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmitEditPlan}
                className="flex-1 px-4 py-3 bg-red-500 border-0 rounded-2xl text-white font-ibm text-base font-medium hover:bg-red-600 transition-all"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 mx-4 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
                Редактировать категорию
              </h2>
              <button 
                onClick={handleCloseEditCategoryModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Название категории
                </label>
                <input
                  type="text"
                  name="name"
                  value={editCategoryData.name}
                  onChange={handleEditCategoryInputChange}
                  placeholder="Например: Образование"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Цвет
                </label>
                <div className="relative">
                  <select
                    name="color"
                    value={editCategoryData.color}
                    onChange={handleEditCategoryInputChange}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition-all appearance-none cursor-pointer pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '12px'
                    }}
                  >
                    <option value="" className="bg-white py-2">Выберите цвет</option>
                    <option value="#3C82F6" className="bg-white py-2">Синий</option>
                    <option value="#EF4444" className="bg-white py-2">Красный</option>
                    <option value="#F59E0C" className="bg-white py-2">Оранжевый</option>
                    <option value="#10B981" className="bg-white py-2">Зеленый</option>
                    <option value="#8B5CF6" className="bg-white py-2">Фиолетовый</option>
                    <option value="#F43F5E" className="bg-white py-2">Розовый</option>
                    <option value="#06B6D4" className="bg-white py-2">Голубой</option>
                    <option value="#84CC16" className="bg-white py-2">Лайм</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCloseEditCategoryModal}
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-2xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-200 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmitEditCategory}
                className="flex-1 px-4 py-3 bg-red-500 border-0 rounded-2xl text-white font-ibm text-base font-medium hover:bg-red-600 transition-all"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 mx-4 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
                Подтверждение удаления
              </h2>
              <button 
                onClick={handleCancelDelete}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-red-800 font-ibm text-base font-medium">
                      {deleteTarget.type === 'plan' ? 'Удалить план?' : 'Удалить категорию?'}
                    </div>
                    <div className="text-red-600 font-ibm text-sm mt-1">
                      При удалении все деньги вернутся на карты, с которых переводили
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-2xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-200 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-red-500 border-0 rounded-2xl text-white font-ibm text-base font-medium hover:bg-red-600 transition-all"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Congratulations Modal */}
      {showCongratulationsModal && completedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 mx-4 w-full max-w-md shadow-2xl">
            <div className="text-center">
              {/* Celebration Icon */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>

              {/* Congratulations Text */}
              <h2 className="text-black font-ibm text-2xl font-bold leading-[110%] mb-2">
                Поздравляем! 🎉
              </h2>
              <p className="text-gray-700 font-ibm text-lg font-medium mb-1">
                План "{completedPlan.name}" выполнен!
              </p>
              <p className="text-gray-600 font-ibm text-base mb-6">
                Вы накопили {completedPlan.targetAmount.toLocaleString('ru-RU')} ₽
              </p>

              {/* Achievement Badge */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <span className="text-green-800 font-ibm text-base font-medium">
                    Достижение разблокировано!
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleCloseCongratulations}
                className="w-full px-6 py-3 bg-green-500 border-0 rounded-2xl text-white font-ibm text-base font-medium hover:bg-green-600 transition-all"
              >
                Продолжить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
                Добавить цель
              </h2>
              <button 
                onClick={handleCloseAddGoalModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitGoal} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Название цели
                </label>
                <input
                  type="text"
                  value={newGoalData.name}
                  onChange={(e) => setNewGoalData({...newGoalData, name: e.target.value})}
                  placeholder="Например: Купить машину"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Сумма цели (₽)
                </label>
                <input
                  type="text"
                  value={newGoalData.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Разрешаем только цифры
                    if (value === '' || /^\d+$/.test(value)) {
                      setNewGoalData({...newGoalData, amount: value});
                    }
                  }}
                  placeholder="1000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Дата реализации
                </label>
                <input
                  type="date"
                  value={newGoalData.targetDate}
                  onChange={(e) => setNewGoalData({...newGoalData, targetDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseAddGoalModal}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-ibm text-base font-medium hover:bg-blue-600 transition-colors"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Joint Goal Modal */}
      {showAddJointGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
                Создать совместную цель
              </h2>
              <button 
                onClick={handleCloseAddJointGoalModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateJointGoal(); }} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Название цели
                </label>
                <input
                  type="text"
                  value={newJointGoalData.name}
                  onChange={(e) => setNewJointGoalData({...newJointGoalData, name: e.target.value})}
                  placeholder="Например: Свадьба"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Целевая сумма (₽)
                </label>
                <input
                  type="text"
                  value={newJointGoalData.targetAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      setNewJointGoalData({...newJointGoalData, targetAmount: value});
                    }
                  }}
                  placeholder="500000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Дата достижения
                </label>
                <input
                  type="date"
                  value={newJointGoalData.targetDate}
                  onChange={(e) => setNewJointGoalData({...newJointGoalData, targetDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Описание (необязательно)
                </label>
                <textarea
                  value={newJointGoalData.description}
                  onChange={(e) => setNewJointGoalData({...newJointGoalData, description: e.target.value})}
                  placeholder="Расскажите о вашей цели..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseAddJointGoalModal}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-ibm text-base font-medium hover:bg-blue-600 transition-colors"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {showParticipantsModal && selectedGoalParticipants && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
                Участники цели
              </h2>
              <button 
                onClick={handleCloseParticipantsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-black font-ibm text-lg font-medium leading-[110%] mb-2">
                {selectedGoalParticipants.name}
              </h3>
              <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                {selectedGoalParticipants.participants} участника
              </div>
            </div>

            <div className="space-y-3">
              {selectedGoalParticipants.avatars.map((avatar, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-black font-ibm text-base font-medium leading-[110%]">
                      Участник {index + 1}
                    </div>
                    <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                      Присоединился к цели
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-green-500 font-ibm text-sm font-medium">
                      Активен
                    </div>
                    <button
                      onClick={() => handleRemoveParticipant(selectedGoalParticipants.id, index)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                      title="Удалить участника"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleCloseParticipantsModal}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-xl font-ibm text-base font-medium hover:bg-blue-600 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Joint Goal Modal */}
      {showEditJointGoalModal && selectedJointGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => {setShowEditJointGoalModal(false); setSelectedJointGoal(null);}}>
          <div className="bg-white rounded-3xl p-6 mx-4 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
                Редактировать совместную цель
              </h2>
              <button 
                onClick={() => {setShowEditJointGoalModal(false); setSelectedJointGoal(null);}}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Goal Name */}
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Название цели
                </label>
                <input
                  type="text"
                  value={editJointGoalData.name}
                  onChange={(e) => setEditJointGoalData({...editJointGoalData, name: e.target.value})}
                  placeholder="Например: Свадьба"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Сумма (₽)
                </label>
                <input
                  type="text"
                  value={editJointGoalData.targetAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      setEditJointGoalData({...editJointGoalData, targetAmount: value});
                    }
                  }}
                  placeholder="500000"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Срок
                </label>
                <input
                  type="text"
                  value={editJointGoalData.targetDate}
                  onChange={(e) => setEditJointGoalData({...editJointGoalData, targetDate: e.target.value})}
                  placeholder="2024-08-15"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {setShowEditJointGoalModal(false); setSelectedJointGoal(null);}}
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-2xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-200 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setJointGoals(prev => prev.map(g => g.id === selectedJointGoal.id ? {
                    ...g,
                    name: editJointGoalData.name || g.name,
                    targetAmount: Number(editJointGoalData.targetAmount) || g.targetAmount,
                    targetDate: editJointGoalData.targetDate || g.targetDate
                  } : g));
                  setShowEditJointGoalModal(false);
                  setSelectedJointGoal(null);
                }}
                className="flex-1 px-4 py-3 bg-orange-500 border-0 rounded-2xl text-white font-ibm text-base font-medium hover:bg-orange-600 transition-all"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

  {/* Delete Joint Goal Modal */}
  {showDeleteJointGoalModal && selectedJointGoal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => {setShowDeleteJointGoalModal(false); setSelectedJointGoal(null);}}>
      <div className="bg-white rounded-3xl p-6 mx-4 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
            Удалить совместную цель
          </h2>
          <button 
            onClick={() => {setShowDeleteJointGoalModal(false); setSelectedJointGoal(null);}}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-gray-600 font-ibm text-base mb-6">
          Вы уверены, что хотите удалить "{selectedJointGoal.name}"? Это действие нельзя отменить.
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => {setShowDeleteJointGoalModal(false); setSelectedJointGoal(null);}}
            className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-2xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-200 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              setJointGoals(prev => prev.filter(g => g.id !== selectedJointGoal.id));
              setShowDeleteJointGoalModal(false);
              setSelectedJointGoal(null);
            }}
            className="flex-1 px-4 py-3 bg-red-500 border-0 rounded-2xl text-white font-ibm text-base font-medium hover:bg-red-600 transition-all"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Top Up Joint Goal Modal */}
  {showTopUpJointGoalModal && selectedJointGoal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => {setShowTopUpJointGoalModal(false); setSelectedJointGoal(null); setTopUpJointAmount(''); setSelectedCard(null);}}>
      <div className="bg-white rounded-3xl p-6 mx-4 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
            Пополнить совместную цель
          </h2>
          <button 
            onClick={() => {setShowTopUpJointGoalModal(false); setSelectedJointGoal(null); setTopUpJointAmount(''); setSelectedCard(null);}}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
              Сумма пополнения (₽)
            </label>
            <input
              type="text"
              value={topUpJointAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d+$/.test(value)) {
                  setTopUpJointAmount(value);
                }
              }}
              placeholder="10000"
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
              Выберите карту для пополнения
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCard('VBank')}
                className={`w-full p-3 rounded-xl border-2 transition-all ${
                  selectedCard === 'VBank' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">А</span>
                    </div>
                    <div className="text-left">
                      <div className="text-black font-ibm text-sm font-medium">VBank</div>
                      <div className="text-gray-500 font-ibm text-xs">**** 3923</div>
                    </div>
                  </div>
                  <div className="text-black font-ibm text-sm font-medium">
                    {bankBalances.vbank?.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedCard('ABank')}
                className={`w-full p-3 rounded-xl border-2 transition-all ${
                  selectedCard === 'ABank' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">В</span>
                    </div>
                    <div className="text-left">
                      <div className="text-black font-ibm text-sm font-medium">ABank</div>
                      <div className="text-gray-500 font-ibm text-xs">**** 5678</div>
                    </div>
                  </div>
                  <div className="text-black font-ibm text-sm font-medium">
                    {bankBalances.abank?.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedCard('SBank')}
                className={`w-full p-3 rounded-xl border-2 transition-all ${
                  selectedCard === 'SBank' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <div className="text-left">
                      <div className="text-black font-ibm text-sm font-medium">SBank</div>
                      <div className="text-gray-500 font-ibm text-xs">**** 9012</div>
                    </div>
                  </div>
                  <div className="text-black font-ibm text-sm font-medium">
                    {bankBalances.sbank?.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => {setShowTopUpJointGoalModal(false); setSelectedJointGoal(null); setTopUpJointAmount(''); setSelectedCard(null);}}
            className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-2xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-200 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              const add = Number(topUpJointAmount) || 0;
              setJointGoals(prev => prev.map(g => g.id === selectedJointGoal.id ? {
                ...g,
                currentAmount: Math.min(g.targetAmount, g.currentAmount + add)
              } : g));
              setShowTopUpJointGoalModal(false);
              setSelectedJointGoal(null);
              setTopUpJointAmount('');
              setSelectedCard(null);
            }}
            disabled={!selectedCard || !topUpJointAmount || Number(topUpJointAmount) <= 0}
            className={`flex-1 px-4 py-3 border-0 rounded-2xl text-white font-ibm text-base font-medium transition-all ${
              selectedCard && topUpJointAmount && Number(topUpJointAmount) > 0
                ? 'bg-orange-500 hover:bg-orange-600 cursor-pointer' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Пополнить
          </button>
        </div>
      </div>
    </div>
  )}

      {/* Top Up Virtual Card Modal */}
      {showTopUpVirtualCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white rounded-3xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
                Пополнить накопительный счет VBank
              </h2>
              <button 
                onClick={handleCloseTopUpVirtualCardModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-blue-50 rounded-2xl p-3 mb-3">
                <h3 className="text-black font-ibm text-lg font-medium mb-2">VBank Накопительный счет</h3>
                <div className="text-gray-600 font-ibm text-base">
                  Текущий баланс: {formatCurrency(virtualCardBalance)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Amount Input */}
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-1.5">
                  Сумма пополнения (₽)
                </label>
                <input
                  type="number"
                  value={topUpVirtualAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+\.?\d*$/.test(value)) {
                      setTopUpVirtualAmount(value);
                      setTopUpVirtualError('');
                    }
                  }}
                  placeholder="Введите сумму"
                  className={`w-full px-3 py-2.5 border-0 rounded-xl text-black font-ibm text-sm focus:outline-none focus:ring-2 transition-all ${
                    topUpVirtualError 
                      ? 'bg-red-50 focus:ring-red-500 border border-red-200' 
                      : 'bg-gray-100 focus:ring-blue-500'
                  }`}
                />
                {topUpVirtualError && (
                  <div className="text-red-500 font-ibm text-xs mt-1">
                    {topUpVirtualError}
                  </div>
                )}
              </div>

              <h4 className="text-black font-ibm text-sm font-medium">Выберите карту для пополнения:</h4>
              
              {/* Bank Cards */}
              <div className="space-y-2">
                {isLoadingCards ? (
                  <div className="text-gray-500 font-ibm text-sm text-center py-4">
                    Загрузка карт...
                  </div>
                ) : availableCards.length === 0 ? (
                  <div className="text-gray-500 font-ibm text-sm text-center py-4">
                    Нет доступных карт для пополнения
                  </div>
                ) : (
                  availableCards.map((card) => (
                    <div 
                      key={card.id}
                      onClick={() => {
                        setSelectedSourceCard(card.bankId || card.id);
                        setSelectedCardInfo(card);
                      }}
                      className={`rounded-2xl p-4 cursor-pointer transition-colors ${
                        selectedSourceCard === (card.bankId || card.id)
                          ? `${getBankColor(card.bankName || card.name)} bg-opacity-20 border-2 ${getBankColor(card.bankName || card.name)}` 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full ${getBankColor(card.bankName || card.name)}`}></div>
                          <div>
                            <div className="text-black font-ibm text-base font-medium">
                              {card.name || card.bankName}
                            </div>
                            <div className="text-gray-600 font-ibm text-sm">
                              Доступно: {formatCurrency(card.balance || 0)}
                            </div>
                          </div>
                        </div>
                        {selectedSourceCard === (card.bankId || card.id) && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleCloseTopUpVirtualCardModal}
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-2xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-200 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleTopUpVirtualCardSubmit}
                disabled={!selectedSourceCard || !topUpVirtualAmount || parseFloat(topUpVirtualAmount) <= 0 || topUpVirtualLoading}
                className={`flex-1 px-4 py-3 border-0 rounded-2xl text-white font-ibm text-base font-medium transition-all ${
                  selectedSourceCard && topUpVirtualAmount && parseFloat(topUpVirtualAmount) > 0 && !topUpVirtualLoading
                    ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {topUpVirtualLoading ? 'Пополнение...' : 'Пополнить'}
              </button>
            </div>
          </div>
        </div>
      )}
      </PremiumBlock>

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

export default BudgetPlanningPage;