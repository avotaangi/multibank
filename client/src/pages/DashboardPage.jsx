import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useBalanceStore from '../stores/balanceStore';
import useTestCardsStore from '../stores/testCardsStore';
import BankCardStack from '../components/BankCardStack';
import InfoPanel from '../components/InfoPanel';
import InsuranceCard from '../components/InsuranceCard';
import { usePageInfo } from '../hooks/usePageInfo';
import { useTelegramUser } from '../hooks/useTelegramUser';
import { useAndroidAdaptation } from '../hooks/useAndroidAdaptation';
import AndroidTestPanel from '../components/AndroidTestPanel';
import { Info, ChevronRight } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { getFormattedBalance, bankBalances } = useBalanceStore();
  const { addTestCard } = useTestCardsStore();
  const navigate = useNavigate();
  const telegramUser = useTelegramUser();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  // Вычисляем общий бюджет динамически с реактивным обновлением
  const totalBudget = useMemo(() => {
    const total = Object.values(bankBalances).reduce((sum, balance) => sum + balance, 0);
    return `${total.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;
  }, [bankBalances]);

  // Данные о страховых полисах
  const insurancePolicies = useMemo(() => [
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
  ], []);

  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showRequestedBanks, setShowRequestedBanks] = useState(false);
  const [requestedBanks, setRequestedBanks] = useState([]);
  const [newBankData, setNewBankData] = useState({
    bank: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  // Банки, которые уже используются в приложении
  const usedBanks = [
    { id: 'vbank', name: 'VBank', color: 'bg-blue-500' },
    { id: 'abank', name: 'ABank', color: 'bg-red-500' },
    { id: 'sbank', name: 'SBank', color: 'bg-green-500' }
  ];

  // Банки, которые можно добавить
  const availableBanks = [
    { id: 'sberbank', name: 'Сбербанк', color: 'bg-green-500' },
    { id: 'gazprombank', name: 'Газпромбанк', color: 'bg-orange-500' },
    { id: 'raiffeisen', name: 'Райффайзенбанк', color: 'bg-purple-500' },
    { id: 'rosbank', name: 'Росбанк', color: 'bg-indigo-500' }
  ];

  const handleAddBank = () => {
    setShowAddBankModal(true);
  };

  const handleCloseModal = () => {
    setShowAddBankModal(false);
    setNewBankData({
      bank: '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    });
  };

  const handleCancelRequest = (bankId) => {
    setRequestedBanks(prev => prev.filter(bank => bank.id !== bankId));
    if (requestedBanks.length === 1) {
      setShowRequestedBanks(false);
    }
  };

  const handleBankSelect = (bankId) => {
    setNewBankData(prev => ({ ...prev, bank: bankId }));
  };

  const handleInputChange = (field, value) => {
    if (field === 'expiryDate') {
      // Валидация для срока действия - только цифры, максимум 4 символа
      const formatted = value.replace(/\D/g, '').slice(0, 4);
      if (formatted.length <= 4) {
        setNewBankData(prev => ({ ...prev, [field]: formatted }));
      }
    } else if (field === 'cvv') {
      // Валидация для CVV - только цифры, максимум 3 символа
      const formatted = value.replace(/\D/g, '').slice(0, 3);
      if (formatted.length <= 3) {
        setNewBankData(prev => ({ ...prev, [field]: formatted }));
      }
    } else {
      setNewBankData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCardNumberChange = (value) => {
    // Только цифры и пробелы каждые 4 цифры
    const formatted = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    if (formatted.length <= 19) { // 16 цифр + 3 пробела
      setNewBankData(prev => ({ ...prev, cardNumber: formatted }));
    }
  };

  const handleConfirmWithBank = () => {
    if (newBankData.bank) {
      const selectedBank = availableBanks.find(bank => bank.id === newBankData.bank);
      if (selectedBank) {
        setRequestedBanks(prev => [...prev, selectedBank]);
        setShowRequestedBanks(true);
      }
      handleCloseModal();
    }
  };

  const handleConfirmWithoutBank = () => {
    if (newBankData.bank && newBankData.cardNumber && newBankData.expiryDate && newBankData.cvv) {
      // Создаем тестовую карту
      const testCard = {
        id: `test-card-${Date.now()}`,
        name: availableBanks.find(bank => bank.id === newBankData.bank)?.name || 'Тестовая карта',
        bankId: newBankData.bank,
        cardNumber: newBankData.cardNumber,
        balance: 10000, // Начальный баланс 10,000 ₽
        isTest: true
      };
      
      // Добавляем баланс в глобальный стор
      const { updateBalance } = useBalanceStore.getState();
      updateBalance(newBankData.bank, 10000, 'set');
      
      addTestCard(testCard);
      handleCloseModal();
    }
  };





  const { styles, classes } = useAndroidAdaptation();
  
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
              <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center">
                 <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                 </svg>
              </div>
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
          {totalBudget}
        </div>
      </div>

      {/* Bank Cards Stack */}
      <div className="relative z-10 py-1 ">
        <BankCardStack />
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
      <div className="relative z-10 px-5 py-2 ">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-black font-ibm font-medium text-base leading-[110%]">
              Страхование
            </div>
          </div>
          
          <div className="space-y-2 mb-3">
            {insurancePolicies.map((policy) => (
              <InsuranceCard
                key={policy.id}
                policy={policy}
                onClick={() => navigate(`/insurance-details/${policy.id}`, { state: { policy } })}
              />
            ))}
          </div>

          <button
            onClick={() => navigate('/insurance-casco')}
            className="w-full bg-gray-50 rounded-xl py-3 px-4 text-gray-700 font-ibm text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Оформить КАСКО</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="relative z-10 px-5 py-2 ">
        <button 
          onClick={() => navigate('/analytics')}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="text-black font-ibm font-medium text-sm leading-[110%]">
              Аналитика | Октябрь
            </div>
            <div className="text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Income */}
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="h-4 bg-green-400 rounded-full" style={{width: '80%'}}></div>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14l5-5 5 5z"/>
                </svg>
                <div className="text-black font-ibm font-medium text-sm leading-[110%]">
                  120 473 ₽
                </div>
              </div>
            </div>
            
            {/* Expenses */}
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="h-4 bg-red-500 rounded-full" style={{width: '50%'}}></div>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
                <div className="text-black font-ibm font-medium text-sm leading-[110%]">
                  54 986 ₽
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Deposits Section */}
      <div className="relative z-10 px-5 py-2 ">
        <button 
          onClick={() => navigate('/deposits')}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="text-black font-ibm font-medium text-sm leading-[110%]">
              Вклады
            </div>
            <div className="text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Deposit 1 */}
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="h-4 bg-green-400 rounded-full" style={{width: '75%'}}></div>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14l5-5 5 5z"/>
                </svg>
                <div className="text-black font-ibm font-medium text-sm leading-[110%]">
                  100 000,00 ₽
                </div>
              </div>
            </div>
            
            {/* Deposit 2 */}
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="h-4 bg-red-500 rounded-full" style={{width: '45%'}}></div>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
                <div className="text-black font-ibm font-medium text-sm leading-[110%]">
                  55 000,00 ₽
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Credits Section */}
      <div className="relative z-10 px-5 py-2 ">
        <button 
          onClick={() => navigate('/credits')}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="text-black font-ibm font-medium text-sm leading-[110%]">
              Кредиты
            </div>
            <div className="text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-black font-ibm font-normal text-sm leading-[110%] mb-3 text-left">
              Осталось до погашения кредита
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="h-4 bg-yellow-500 rounded-full" style={{width: '65%'}}></div>
              </div>
              <div className="text-black font-ibm font-medium text-sm leading-[110%]">
                80 000,00 ₽
              </div>
            </div>
          </div>
        </button>
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
                {availableBanks.map((bank) => (
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