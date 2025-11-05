import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { CreditCard, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { accountAPI, paymentAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import InfoPanel from '../components/InfoPanel';
import CustomSelect from '../components/CustomSelect';
import { usePageInfo } from '../hooks/usePageInfo';
import useAuthStore from '../stores/authStore';
import useBalanceStore from '../stores/balanceStore';
import useTestCardsStore from '../stores/testCardsStore';
import { useTelegramUser } from '../hooks/useTelegramUser';

const TransferByAccountPage = () => {
  const navigate = useNavigate();
  const { getClientId } = useAuthStore();
  const { bankBalances, getFormattedBalance } = useBalanceStore();
  const { getAllCards } = useTestCardsStore();
  const telegramUser = useTelegramUser();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [recipientAccountNumber, setRecipientAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(null);
  
  // Получаем все карты пользователя
  const userCards = useMemo(() => {
    // Базовые карты
    const baseCards = [
      {
        id: 'vbank',
        name: 'VBank',
        bankName: 'VBank',
        balance: bankBalances.vbank || 0,
        cardNumber: '5294',
        currency: 'RUB'
      },
      {
        id: 'abank',
        name: 'ABank',
        bankName: 'ABank',
        balance: bankBalances.abank || 0,
        cardNumber: '3568',
        currency: 'RUB'
      },
      {
        id: 'sbank',
        name: 'SBank',
        bankName: 'SBank',
        balance: bankBalances.sbank || 0,
        cardNumber: '6352',
        currency: 'RUB'
      }
    ];
    
    // Тестовые карты из стора
    const testCards = getAllCards() || [];
    const testCardsWithBalance = testCards.map(card => ({
      id: card.id || `test-${card.bankId}`,
      name: card.name || card.bankId,
      bankName: card.bankId === 'sberbank' ? 'Сбербанк' : 
                card.bankId === 'vbank' ? 'VBank' : 
                card.bankId === 'abank' ? 'ABank' : 
                card.bankId === 'sbank' ? 'SBank' : card.bankId,
      balance: bankBalances[card.bankId] || card.balance || 0,
      cardNumber: card.cardNumber?.replace(/\s/g, '').slice(-4) || '0000',
      currency: 'RUB'
    }));
    
    return [...baseCards, ...testCardsWithBalance];
  }, [bankBalances, getAllCards]);

  // Загрузка счетов клиента со всех банков (для совместимости с API)
  const { data: accountsData, isLoading: isLoadingAccounts } = useQuery(
    ['banking-accounts', getClientId()],
    () => {
      const consentId = localStorage.getItem('consent_id');
      if (!consentId) {
        return Promise.resolve({ data: { accounts: [] } });
      }
      return accountAPI.getBankingAccounts({ 
        consent_id: consentId,
        client_id: getClientId() 
      });
    },
    {
      enabled: !!getClientId(),
      refetchOnWindowFocus: false,
    }
  );

  // Объединяем карты пользователя и счета из API
  const accounts = useMemo(() => {
    const apiAccounts = accountsData?.data?.accounts || accountsData?.data || [];
    
    // Если есть карты пользователя, используем их, иначе используем счета из API
    if (userCards.length > 0) {
      return userCards.map(card => ({
        id: card.id,
        resourceId: card.id,
        bankName: card.bankName || card.name,
        accountNumber: card.cardNumber,
        balance: card.balance,
        availableBalance: card.balance,
        currency: card.currency || 'RUB'
      }));
    }
    
    return apiAccounts;
  }, [userCards, accountsData]);

  // Формируем опции для CustomSelect
  const selectOptions = useMemo(() => {
    return accounts.map((account) => {
      const bankName = account.bankName || account.bank || account.resourceId?.split('_')[0] || 'Неизвестный банк';
      const accountNumber = account.accountNumber || account.identification || account.cardNumber || 'Неизвестный';
      const balance = account.availableBalance || account.balance || 0;
      const currency = account.currency || 'RUB';
      const isBalanceInKopecks = balance > 1000000 || (account.id && !['vbank', 'abank', 'sbank'].includes(account.id));
      const displayBalance = isBalanceInKopecks ? balance / 100 : balance;
      
      return {
        value: account.id || account.resourceId,
        label: `${bankName} ••••${String(accountNumber).slice(-4)} - ${new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: currency,
        }).format(displayBalance)}`
      };
    });
  }, [accounts]);

  // Мутация для создания перевода
  const transferMutation = useMutation(
    (data) => paymentAPI.createPayment(data, { client_id: getClientId() }),
    {
      onSuccess: () => {
        setShowSuccessModal(true);
        setError(null);
        // Очищаем форму
        setRecipientAccountNumber('');
        setAmount('');
        setMessage('');
      },
      onError: (error) => {
        console.error('Transfer error:', error);
        setError(error.response?.data?.message || 'Ошибка при переводе. Попробуйте еще раз.');
      },
    }
  );

  const handleTransfer = (e) => {
    e.preventDefault();
    setError(null);

    // Валидация
    if (!selectedAccountId) {
      setError('Выберите счет отправителя');
      return;
    }

    if (!recipientAccountNumber || recipientAccountNumber.trim().length < 10) {
      setError('Введите корректный номер счета получателя');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Введите корректную сумму');
      return;
    }

    const selectedAccount = accounts.find(acc => (acc.id || acc.resourceId) === selectedAccountId);
    if (!selectedAccount) {
      setError('Выбранный счет не найден');
      return;
    }

    // Проверка достаточности средств
    const transferAmount = parseFloat(amount);
    const balance = selectedAccount.availableBalance || selectedAccount.balance || 0;
    // Проверяем, нужно ли делить на 100 (для счетов из API баланс в копейках)
    const isBalanceInKopecks = balance > 1000000 || (selectedAccount.id && !['vbank', 'abank', 'sbank'].includes(selectedAccount.id));
    const availableBalance = isBalanceInKopecks ? balance / 100 : balance;
    if (transferAmount > availableBalance) {
      setError('Недостаточно средств на счете');
      return;
    }

    // Создаем перевод
    const paymentData = {
      fromAccountId: selectedAccountId,
      fromResourceId: selectedAccount.resourceId || selectedAccountId,
      toAccountNumber: recipientAccountNumber.trim(),
      amount: transferAmount,
      currency: selectedAccount.currency || 'RUB',
      description: message || 'Перевод по номеру счета',
    };

    transferMutation.mutate(paymentData);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate(-1);
  };

  if (isLoadingAccounts) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4 ">
        <div className="flex items-center justify-between">
          <div className="w-10"></div>
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Перевод по номеру счета
          </div>
          <button
            onClick={() => setShowInfoPanel(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4">
        {/* Form Card */}
        <div className="bg-blue-500 rounded-[27px] p-6 mb-4 ">
          <form onSubmit={handleTransfer} className="space-y-4">
            {/* Select Sender Account */}
            <div>
              <label className="block text-white font-ibm text-sm font-medium mb-2">
                Выберите банк и счет
              </label>
              <CustomSelect
                value={selectedAccountId}
                onChange={(value) => setSelectedAccountId(value)}
                options={selectOptions}
                placeholder="Выберите банк и счет"
                className="w-full"
              />
            </div>

            {/* Recipient Account Number */}
            <div>
              <label className="block text-white font-ibm text-sm font-medium mb-2">
                Номер счета получателя
              </label>
              <input
                type="text"
                value={recipientAccountNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Только цифры
                  setRecipientAccountNumber(value);
                }}
                placeholder="Введите номер счета"
                className="w-full bg-white rounded-[27px] px-4 py-3 text-gray-900 font-ibm text-sm border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500"
                required
                minLength={10}
                maxLength={20}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-white font-ibm text-sm font-medium mb-2">
                Сумма перевода
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
                    setAmount(value);
                  }
                }}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="w-full bg-white rounded-[27px] px-4 py-3 text-gray-900 font-ibm text-sm border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500"
                required
              />
              {selectedAccountId && amount && (
                <div className="mt-2 text-white/80 font-ibm text-xs">
                  {(() => {
                    const account = accounts.find(acc => (acc.id || acc.resourceId) === selectedAccountId);
                    if (!account) return '';
                    const transferAmount = parseFloat(amount);
                    const balance = account.availableBalance || account.balance || 0;
                    const currency = account.currency || 'RUB';
                    // Проверяем, нужно ли делить на 100 (для счетов из API баланс в копейках)
                    const isBalanceInKopecks = balance > 1000000 || (account.id && !['vbank', 'abank', 'sbank'].includes(account.id));
                    const availableBalance = isBalanceInKopecks ? balance / 100 : balance;
                    const remaining = availableBalance - transferAmount;
                    return remaining >= 0 
                      ? `Останется: ${new Intl.NumberFormat('ru-RU', { style: 'currency', currency: currency }).format(remaining)}`
                      : 'Недостаточно средств';
                  })()}
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-white font-ibm text-sm font-medium mb-2">
                Комментарий (необязательно)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Назначение платежа"
                rows={3}
                maxLength={500}
                className="w-full bg-white rounded-[27px] px-4 py-3 text-gray-900 font-ibm text-sm border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500 resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-[27px] p-3 flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-white font-ibm text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={transferMutation.isLoading}
              className="w-full bg-white text-blue-600 rounded-[27px] px-6 py-4 font-ibm text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {transferMutation.isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Выполняется перевод...</span>
                </div>
              ) : (
                'Перевести'
              )}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="bg-gray-100 rounded-[27px] p-4 ">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="text-gray-700 font-ibm text-xs leading-relaxed">
              <p className="font-medium mb-1">Важная информация:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Перевод выполняется мгновенно</li>
                <li>Проверьте правильность номера счета получателя</li>
                <li>Комиссия может быть списана дополнительно</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[27px] p-6 max-w-sm w-full ">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-black font-ibm text-xl font-semibold mb-2">
                  Перевод выполнен успешно
                </h3>
                <p className="text-gray-600 font-ibm text-sm">
                  Деньги успешно переведены на счет получателя
                </p>
              </div>
              <button
                onClick={handleCloseSuccessModal}
                className="w-full bg-blue-600 text-white rounded-[27px] px-6 py-3 font-ibm text-sm font-medium hover:bg-blue-700 transition-colors"
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

export default TransferByAccountPage;

