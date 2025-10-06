import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBalanceStore from '../stores/balanceStore';
import { getTelegramWebApp } from '../utils/telegram';

const BudgetPlanningPage = () => {
  const navigate = useNavigate();
  const { bankBalances } = useBalanceStore();
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
  const [showAddAutopayModal, setShowAddAutopayModal] = useState(false);
  const [showAutopayConfirmModal, setShowAutopayConfirmModal] = useState(false);
  const [autopayToToggle, setAutopayToToggle] = useState(null);
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
      avatars: [
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      ]
    },
    {
      id: 2,
      name: 'Путешествие в Европу',
      targetAmount: 300000,
      currentAmount: 80000,
      targetDate: '2024-06-01',
      participants: 4,
      avatars: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face'
      ]
    }
  ]);
  const [newJointGoalData, setNewJointGoalData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    description: ''
  });
  const [autopays, setAutopays] = useState([
    {
      id: 1,
      name: 'ЖКХ - УК "Дом"',
      category: 'ЖКХ',
      amount: 8500,
      frequency: 'monthly',
      nextDate: '2024-02-15',
      card: 'Альфа-Банк',
      status: 'active'
    },
    {
      id: 2,
      name: 'Кредит - Сбербанк',
      category: 'Кредиты',
      amount: 25000,
      frequency: 'monthly',
      nextDate: '2024-02-20',
      card: 'ВТБ',
      status: 'active'
    }
  ]);
  const [newAutopayData, setNewAutopayData] = useState({
    name: '',
    category: 'ЖКХ',
    amount: '',
    frequency: 'monthly',
    card: '',
    recipient: '',
    notifications: true
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
  
  // Данные для кольцевой диаграммы - динамически вычисляемые на основе реальных данных
  const budgetData = useMemo(() => {
    const lifestyleTotal = lifestylePlans.reduce((sum, plan) => sum + (plan.currentAmount || 0), 0);
    const dreamTotal = dreamPlans.reduce((sum, plan) => sum + (plan.currentAmount || 0), 0);
    const goalsTotal = goalsPlans.reduce((sum, plan) => sum + (plan.currentAmount || 0), 0);
    const jointTotal = jointGoals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
    
    const lifestyleTargetTotal = lifestylePlans.reduce((sum, plan) => sum + (plan.targetAmount || 0), 0);
    const dreamTargetTotal = dreamPlans.reduce((sum, plan) => sum + (plan.targetAmount || 0), 0);
    const goalsTargetTotal = goalsPlans.reduce((sum, plan) => sum + (plan.targetAmount || 0), 0);
    const jointTargetTotal = jointGoals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
    
    // Сумма ежемесячных автоплатежей
    const autopayMonthlyTotal = autopays
      .filter(autopay => autopay.status === 'active' && autopay.frequency === 'monthly')
      .reduce((sum, autopay) => sum + (autopay.amount || 0), 0);
    
    return [
      { name: "Планы", amount: lifestyleTotal + dreamTotal, targetAmount: lifestyleTargetTotal + dreamTargetTotal, color: "#3C82F6" },
      { name: "Цели", amount: goalsTotal, targetAmount: goalsTargetTotal, color: "#EF4444" },
      { name: "Совместные цели", amount: jointTotal, targetAmount: jointTargetTotal, color: "#F59E0C" },
      { name: "Автоплатежи", amount: autopayMonthlyTotal, targetAmount: autopayMonthlyTotal, color: "#844FD9" }
    ];
  }, [lifestylePlans, dreamPlans, goalsPlans, jointGoals, autopays]);
  
  const totalAmount = budgetData.reduce((sum, item) => sum + item.amount, 0);
  
  const formatCurrency = (value) => `${Math.round(value).toLocaleString('ru-RU')} ₽`;
  
  // Функция для получения цвета банка
  const getBankColor = (bankName) => {
    switch (bankName) {
      case 'Альфа-Банк':
        return 'bg-red-600'; // Красный цвет для Альфа-Банка (как на картах)
      case 'ВТБ':
        return 'bg-blue-600'; // Синий цвет для ВТБ (как на картах)
      case 'Т-Банк':
        return 'bg-yellow-500'; // Желтый цвет для Т-Банка (как на картах)
      case 'Сбербанк':
        return 'bg-green-600'; // Зеленый для Сбербанка (как на картах)
      default:
        return 'bg-gray-500'; // Серый для неизвестных банков
    }
  };
  
  // Сколько уже накоплено по всем планам/категориям
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
    let currentAngle = 0;
    const gradients = budgetData.map(item => {
      const percentage = (item.amount / totalAmount) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;
      
      return `${item.color} ${startAngle}deg ${endAngle}deg`;
    }).join(', ');
    
    return `conic-gradient(from 0deg, ${gradients})`;
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
        avatars: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face']
      };
      setJointGoals([...jointGoals, newGoal]);
      handleCloseAddJointGoalModal();
    }
  };

  // Autopay Functions
  const handleAddAutopay = () => {
    setShowAddAutopayModal(true);
  };

  const handleCloseAddAutopayModal = () => {
    setShowAddAutopayModal(false);
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
      const newAutopay = {
        id: Date.now(),
        name: newAutopayData.name,
        category: newAutopayData.category,
        amount: parseInt(newAutopayData.amount),
        frequency: newAutopayData.frequency,
        nextDate: '2024-03-15', // Примерная дата
        card: newAutopayData.card,
        status: 'active'
      };
      setAutopays([...autopays, newAutopay]);
      handleCloseAddAutopayModal();
    }
  };

  const handleToggleAutopay = (autopayId) => {
    const autopay = autopays.find(a => a.id === autopayId);
    setAutopayToToggle(autopay);
    setShowAutopayConfirmModal(true);
  };

  const handleConfirmToggleAutopay = () => {
    if (autopayToToggle) {
      setAutopays(prev => prev.map(autopay => 
        autopay.id === autopayToToggle.id 
          ? { ...autopay, status: autopay.status === 'active' ? 'paused' : 'active' }
          : autopay
      ));
    }
    setShowAutopayConfirmModal(false);
    setAutopayToToggle(null);
  };

  const handleCancelToggleAutopay = () => {
    setShowAutopayConfirmModal(false);
    setAutopayToToggle(null);
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
            avatars: g.avatars.length < 6 ? [...g.avatars, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'] : g.avatars
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
            avatars: g.avatars.length < 6 ? [...g.avatars, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'] : g.avatars
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
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  const handleTopUpSubmit = () => {
    if (!selectedPlan || !selectedCard || !isTopUpAmountValid()) return;
    
    const amount = parseInt(topUpAmount);
    
    // Обновляем план в соответствующем состоянии
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
    
    // Закрываем модальное окно
    handleCloseTopUpModal();
  };

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
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Планирование бюджета
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-0">
        {/* Budget Overview Section */}
        <div className="flex items-center justify-between mb-8 px-4 animate-slide-in-down">
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
          <div className="flex-1 pl-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-black font-ibm text-sm font-normal leading-[110%] mb-2">
              Бюджет на планирование
            </div>
            <div className="text-black font-ibm text-2xl font-medium leading-[110%] mb-2 whitespace-nowrap">
              {formatCurrency(accumulatedSaved)}
            </div>
            <div className="text-black font-ibm text-sm font-normal leading-[110%]">
              из {formatCurrency(totalTargetAmount)}
            </div>
        </div>
      </div>

        {/* Budget Categories */}
        <div className="space-y-4 mb-4 px-4">
          {budgetData.map((item, index) => (
            <div key={index} className="flex items-center justify-between animate-slide-in-down" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-black font-ibm text-base font-normal leading-[110%]">{item.name}</span>
              </div>
              <span className="text-black font-ibm text-xs min-[360px]:text-sm font-normal leading-[110%] whitespace-nowrap">
                {item.name === "Автоплатежи" 
                  ? `${Math.round(item.amount).toLocaleString('ru-RU')} ₽`
                  : `${Math.round(item.amount).toLocaleString('ru-RU')} ₽ из ${Math.round(item.targetAmount || 0).toLocaleString('ru-RU')} ₽`
                }
              </span>
            </div>
          ))}
        </div>

        {/* My Planning Categories Container */}
        <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden animate-slide-in-down" style={{ backgroundColor: '#3C82F6', animationDelay: '0.9s' }}>
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
        <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden animate-slide-in-down" style={{ backgroundColor: '#EF4444', animationDelay: '1.1s' }}>
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
      <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden animate-slide-in-down" style={{ backgroundColor: '#F59E0C', animationDelay: '1.3s' }}>
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
                        <div key={index} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden">
                          <img src={avatar} alt={`Participant ${index + 1}`} className="w-full h-full object-cover" />
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

      {/* Autopay Section */}
      <div className="rounded-[27px] border border-gray-200 mb-8 overflow-hidden animate-slide-in-down" style={{ backgroundColor: '#844FD9', animationDelay: '1.5s' }}>
        {/* New Autopay Section - unified background */}
        <div className="p-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="text-white font-ibm text-lg font-medium leading-[110%]">
              Автоплатежи
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
            <div key={autopay.id} className="bg-white rounded-2xl p-4 border border-gray-200">
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
                    {autopay.amount.toLocaleString()} ₽
                  </div>
                  <div className="text-gray-600 font-ibm text-sm leading-[110%]">
                    {autopay.frequency === 'monthly' ? 'Ежемесячно' : 'Ежеквартально'}
                  </div>
                </div>
              </div>
                
              <div className="flex items-center justify-between">
                <div className="text-gray-600 font-ibm text-sm">
                  Следующий платёж: {autopay.nextDate}
                </div>
                <button
                  onClick={() => handleToggleAutopay(autopay.id)}
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
                <select
                  name="category"
                  value={newPlanData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                >
                  <option value="">Выберите категорию</option>
                  <option value="lifestyle">Образ жизни</option>
                  <option value="dream">Мечта</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
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
                <select
                  name="color"
                  value={newCategoryData.color}
                  onChange={handleCategoryInputChange}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                >
                  <option value="">Выберите цвет</option>
                  <option value="#3C82F6">Синий</option>
                  <option value="#EF4444">Красный</option>
                  <option value="#F59E0C">Оранжевый</option>
                  <option value="#10B981">Зеленый</option>
                  <option value="#8B5CF6">Фиолетовый</option>
                  <option value="#F43F5E">Розовый</option>
                  <option value="#06B6D4">Голубой</option>
                  <option value="#84CC16">Лайм</option>
                </select>
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
                  onClick={() => handleSelectCard({ id: 1, name: 'Альфа-Банк', number: '**** 1234', balance: bankBalances.alfa, color: 'bg-blue-500' })}
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
                        <div className="text-black font-ibm text-base font-medium">Альфа-Банк</div>
                        <div className="text-gray-600 font-ibm text-sm">**** 1234</div>
                      </div>
                    </div>
                    <div className="text-black font-ibm text-base font-medium">{bankBalances.alfa.toLocaleString('ru-RU')} ₽</div>
                  </div>
                </div>

                <div 
                  onClick={() => handleSelectCard({ id: 2, name: 'ВТБ', number: '**** 5678', balance: bankBalances.vtb, color: 'bg-red-500' })}
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
                        <div className="text-black font-ibm text-base font-medium">ВТБ</div>
                        <div className="text-gray-600 font-ibm text-sm">**** 5678</div>
                      </div>
                    </div>
                    <div className="text-black font-ibm text-base font-medium">{bankBalances.vtb.toLocaleString('ru-RU')} ₽</div>
                  </div>
                </div>

                <div 
                  onClick={() => handleSelectCard({ id: 3, name: 'Т-Банк', number: '**** 9012', balance: bankBalances.tbank, color: 'bg-green-500' })}
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
                        <div className="text-black font-ibm text-base font-medium">Т-Банк</div>
                        <div className="text-gray-600 font-ibm text-sm">**** 9012</div>
                      </div>
                    </div>
                    <div className="text-black font-ibm text-base font-medium">{bankBalances.tbank.toLocaleString('ru-RU')} ₽</div>
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
                <select
                  name="color"
                  value={editCategoryData.color}
                  onChange={handleEditCategoryInputChange}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                >
                  <option value="">Выберите цвет</option>
                  <option value="#3C82F6">Синий</option>
                  <option value="#EF4444">Красный</option>
                  <option value="#F59E0C">Оранжевый</option>
                  <option value="#10B981">Зеленый</option>
                  <option value="#8B5CF6">Фиолетовый</option>
                  <option value="#F43F5E">Розовый</option>
                  <option value="#06B6D4">Голубой</option>
                  <option value="#84CC16">Лайм</option>
                </select>
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
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img src={avatar} alt={`Participant ${index + 1}`} className="w-full h-full object-cover" />
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
                onClick={() => setSelectedCard('Альфа-Банк')}
                className={`w-full p-3 rounded-xl border-2 transition-all ${
                  selectedCard === 'Альфа-Банк' 
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
                      <div className="text-black font-ibm text-sm font-medium">Альфа-Банк</div>
                      <div className="text-gray-500 font-ibm text-xs">**** 1234</div>
                    </div>
                  </div>
                  <div className="text-black font-ibm text-sm font-medium">
                    {bankBalances['Альфа-Банк']?.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedCard('ВТБ')}
                className={`w-full p-3 rounded-xl border-2 transition-all ${
                  selectedCard === 'ВТБ' 
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
                      <div className="text-black font-ibm text-sm font-medium">ВТБ</div>
                      <div className="text-gray-500 font-ibm text-xs">**** 5678</div>
                    </div>
                  </div>
                  <div className="text-black font-ibm text-sm font-medium">
                    {bankBalances['ВТБ']?.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedCard('Т-Банк')}
                className={`w-full p-3 rounded-xl border-2 transition-all ${
                  selectedCard === 'Т-Банк' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <span className="text-black font-bold text-sm">Т</span>
                    </div>
                    <div className="text-left">
                      <div className="text-black font-ibm text-sm font-medium">Т-Банк</div>
                      <div className="text-gray-500 font-ibm text-xs">**** 9012</div>
                    </div>
                  </div>
                  <div className="text-black font-ibm text-sm font-medium">
                    {bankBalances['Т-Банк']?.toLocaleString('ru-RU')} ₽
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

      {/* Add Autopay Modal */}
      {showAddAutopayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-black font-ibm text-xl font-medium leading-[110%]">
                Создать автоплатёж
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Категория
                </label>
                <select
                  value={newAutopayData.category}
                  onChange={(e) => setNewAutopayData({...newAutopayData, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ЖКХ">ЖКХ</option>
                  <option value="Кредиты">Кредиты</option>
                  <option value="Прочие">Прочие регулярные платежи</option>
                </select>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Периодичность
                </label>
                <select
                  value={newAutopayData.frequency}
                  onChange={(e) => setNewAutopayData({...newAutopayData, frequency: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="monthly">Ежемесячно</option>
                  <option value="quarterly">Ежеквартально</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Карта для списания
                </label>
                <select
                  value={newAutopayData.card}
                  onChange={(e) => setNewAutopayData({...newAutopayData, card: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Выберите карту</option>
                  <option value="Альфа-Банк">Альфа-Банк</option>
                  <option value="ВТБ">ВТБ</option>
                  <option value="Т-Банк">Т-Банк</option>
                </select>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={newAutopayData.notifications}
                  onChange={(e) => setNewAutopayData({...newAutopayData, notifications: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="notifications" className="text-gray-700 font-ibm text-sm">
                  Уведомления за 1-2 дня до списания
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseAddAutopayModal}
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

      {/* Autopay Toggle Confirmation Modal */}
      {showAutopayConfirmModal && autopayToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                  {autopayToToggle.amount.toLocaleString()} ₽
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
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmToggleAutopay}
                className={`flex-1 py-3 px-4 rounded-xl font-ibm text-base font-medium transition-colors ${
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
    </div>
  );
};

export default BudgetPlanningPage;