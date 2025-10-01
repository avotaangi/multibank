import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBalanceStore from '../stores/balanceStore';

const BudgetPlanningPage = () => {
  const navigate = useNavigate();
  const { bankBalances } = useBalanceStore();
  const [showLifestyleTip, setShowLifestyleTip] = useState(false);
  const [showDreamTip, setShowDreamTip] = useState(false);
  const [showGoalsTip, setShowGoalsTip] = useState(false);
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
  
  // Данные для кольцевой диаграммы
  const budgetData = [
    { name: "Дом", amount: 60000, color: "#3C82F6" },
    { name: "Еда", amount: 20000, color: "#EF4444" },
    { name: "Накопления", amount: 15000, color: "#F59E0C" },
    { name: "Жизнь", amount: 15000, color: "#844FD9" }
  ];
  
  const totalAmount = budgetData.reduce((sum, item) => sum + item.amount, 0);
  
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

  const handleBackToDashboard = () => {
    navigate('/dashboard');
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
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBackToDashboard}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Планирование бюджета
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 pb-20">
        {/* Budget Overview Section */}
        <div className="flex items-center justify-between mb-8">
          {/* Donut Chart */}
          <div className="relative w-[150px] h-[150px] flex items-center justify-center">
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
              Бюджет на планирование
            </div>
            <div className="text-black font-ibm text-2xl font-medium leading-[110%] mb-2">
              {planningBudget}
            </div>
            <div className="text-black font-ibm text-sm font-normal leading-[110%]">
              29 000 ₽ осталось из бюджета
            </div>
        </div>
      </div>

        {/* Budget Categories */}
        <div className="space-y-4 mb-8">
          {budgetData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-black font-ibm text-base font-normal leading-[110%]">{item.name}</span>
              </div>
              <span className="text-black font-ibm text-base font-normal leading-[110%]">
                {item.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
              </span>
            </div>
          ))}
        </div>

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
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditPlan(plan, 'lifestyle')}
                      className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id, 'lifestyle')}
                      className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    {!isCompleted && (
                      <button
                        onClick={() => handleTopUpPlan(plan, 'lifestyle')}
                        className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center hover:bg-yellow-200 transition-colors"
                      >
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-3">
                  {plan.currentAmount.toLocaleString('ru-RU')} ₽ / {plan.targetAmount.toLocaleString('ru-RU')} ₽
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
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditPlan(plan, 'dream')}
                      className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id, 'dream')}
                      className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    {!isCompleted && (
                      <button
                        onClick={() => handleTopUpPlan(plan, 'dream')}
                        className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center hover:bg-yellow-200 transition-colors"
                      >
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-3">
                  {plan.currentAmount.toLocaleString('ru-RU')} ₽ / {plan.targetAmount.toLocaleString('ru-RU')} ₽
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
                  {totalCurrent.toLocaleString('ru-RU')} ₽ / {totalTarget.toLocaleString('ru-RU')} ₽
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
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditPlan(plan, category.id)}
                              className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                            >
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeletePlan(plan.id, category.id)}
                              className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                            >
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            {!isCompleted && (
                              <button
                                onClick={() => handleTopUpPlan(plan, category.id)}
                                className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center hover:bg-yellow-200 transition-colors"
                              >
                                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            )}
              </div>
                        </div>
                        <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-3">
                          {plan.currentAmount.toLocaleString('ru-RU')} ₽ / {plan.targetAmount.toLocaleString('ru-RU')} ₽
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

        {/* Add Plan and Category Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <button 
            onClick={handleAddPlan}
            className="flex items-center space-x-2 text-black font-ibm text-base font-medium leading-[110%] hover:text-gray-600 transition-colors"
          >
            <span className="text-lg">+</span>
            <span>Добавить план</span>
          </button>
          <button 
            onClick={handleAddCategory}
            className="flex items-center space-x-2 text-black font-ibm text-base font-medium leading-[110%] hover:text-gray-600 transition-colors"
          >
            <span className="text-lg">+</span>
            <span>Добавить категорию</span>
          </button>
        </div>

        {/* My Goals Section */}
        <div className="bg-gray-100 rounded-[27px] mb-4">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-black font-ibm text-lg font-medium leading-[110%]">Мои цели</h3>
              <button 
                onClick={() => setShowGoalsTip(!showGoalsTip)}
                className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
              >
                <span className="text-black font-ibm text-sm font-medium">i</span>
              </button>
            </div>
            {showGoalsTip && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <div className="text-gray-700 font-ibm text-sm leading-[110%]">
                  В среднем вы тратите 2 500₽ в месяц на такси. Если использовать общественный транспорт 2 раза в неделю, вы будете больше двигаться и сэкономите 1 000₽ в месяц. Это поможет быстрее накопить на собаку - цель будет достигнута на 4 месяца раньше
                </div>
                <div className="text-gray-500 font-ibm text-xs mt-1">
                  ИИ-совет от МультиБанка
                </div>
              </div>
            )}
          </div>
          <div className="bg-white border-t border-gray-200 rounded-b-[27px] p-4">
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
                      {plan.currentAmount.toLocaleString('ru-RU')} ₽ / {plan.targetAmount.toLocaleString('ru-RU')} ₽
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

        {/* Add Goal Button */}
        <div className="flex justify-center">
          <button 
            onClick={handleAddGoal}
            className="flex items-center space-x-2 text-black font-ibm text-base font-medium leading-[110%] hover:text-blue-600 transition-colors"
          >
            <span className="text-lg">+</span>
            <span>Добавить цель</span>
          </button>
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
    </div>
  );
};

export default BudgetPlanningPage;