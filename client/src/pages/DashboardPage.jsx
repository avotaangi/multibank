import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useBalanceStore from '../stores/balanceStore';
import useTestCardsStore from '../stores/testCardsStore';
import BankCardStack from '../components/BankCardStack';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { getFormattedBalance, bankBalances } = useBalanceStore();
  const { addTestCard } = useTestCardsStore();
  const navigate = useNavigate();

  // Вычисляем общий бюджет динамически с реактивным обновлением
  const totalBudget = useMemo(() => {
    const total = Object.values(bankBalances).reduce((sum, balance) => sum + balance, 0);
    return `${total.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;
  }, [bankBalances]);

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
    { id: 'vtb', name: 'ВТБ', color: 'bg-blue-500' },
    { id: 'alfa', name: 'Альфа-Банк', color: 'bg-red-500' },
    { id: 'tbank', name: 'Т-Банк', color: 'bg-black' }
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





  return (
    <div className="min-h-screen bg-white relative overflow-hidden" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 100px)' }}>

      {/* Top Header with Profile */}
      <div className="relative z-10 bg-gray-100 px-5 pt-6 pb-4 rounded-[40px] animate-slide-in-down">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative rounded-full">
              <div className="w-14 h-14 bg-red-500 rounded-full overflow-hidden">
                 <img 
                   src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" 
                   alt="Евгений Богатов" 
                   className="w-full h-full object-cover"
                 />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
            </div>
            <div>
              <div className="text-gray-600 font-ibm text-sm font-medium leading-[110%] tracking-wide">
                Мультибанк
              </div>
              <div className="text-gray-900 font-ibm text-lg font-semibold leading-[110%]">
                Евгений Богатов
              </div>
            </div>
          </div>
          <div className="relative">
            <button className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Total Budget */}
      <div className="relative z-10 text-center px-5 py-3 animate-slide-in-down">
        <div className="text-black font-ibm text-base font-medium leading-[110%] mb-3">
          Общий бюджет
        </div>
        <div className="text-black font-ibm text-3xl font-medium leading-[110%] tracking-[-0.02em]">
          {totalBudget}
        </div>
      </div>

      {/* Bank Cards Stack */}
      <div className="relative z-10 py-1 animate-scale-in">
        <BankCardStack />
      </div>

      {/* Add Bank Button */}
      <div className="relative z-10 text-center py-2 animate-slide-in-down">
        <button 
          onClick={handleAddBank}
          className="w-full h-12 bg-white rounded-2xl flex items-center justify-center text-gray-700 font-ibm text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          + Добавить банк
        </button>
      </div>

      {/* Requested Banks Section */}
      {showRequestedBanks && requestedBanks.length > 0 && (
        <div className="relative z-10 px-5 py-2 animate-slide-in-down">
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
      <div className="relative z-10 px-5 py-2 animate-slide-in-down">
        <div className="grid grid-cols-3 gap-2">
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
            onClick={() => navigate('/transfer')}
            className="h-28 bg-gray-100 rounded-2xl flex flex-col items-center justify-center"
          >
            <div className="mb-1">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-black font-ibm text-xs min-[375px]:text-sm font-normal leading-[110%] text-center">
              <div>Перевести</div>
              <div>по телефону</div>
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
      </div>

      {/* Analytics Section */}
      <div className="relative z-10 px-5 py-2 animate-slide-in-down">
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
      <div className="relative z-10 px-5 py-2 animate-slide-in-down">
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
      <div className="relative z-10 px-5 py-2 animate-slide-in-down">
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
      <div className="relative z-10 px-5 py-2 animate-slide-in-down">
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

    </div>
  );
};

export default DashboardPage;