import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { CreditCard, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { accountAPI, paymentAPI, cardManagementAPI } from '../services/api';
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
  const { getClientId, getClientIdId } = useAuthStore();
  // Функция для нормализации id: если id === 0, возвращаем 1
  const normalizeId = (id) => {
    if (id === 0) return 1;
    return id;
  };
  const CLIENT_ID_ID = normalizeId(getClientIdId());
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
  
  // Получаем список карт для каждого банка (accountNumber уже есть в списке карт)
  const vbankCardsQuery = useQuery(
    ['cards', 'vbank', CLIENT_ID_ID],
    () => cardManagementAPI.getCards('vbank', CLIENT_ID_ID),
    {
      enabled: !!getClientId() && !!CLIENT_ID_ID,
      refetchOnWindowFocus: false,
    }
  );
  
  const abankCardsQuery = useQuery(
    ['cards', 'abank', CLIENT_ID_ID],
    () => cardManagementAPI.getCards('abank', CLIENT_ID_ID),
    {
      enabled: !!getClientId() && !!CLIENT_ID_ID,
      refetchOnWindowFocus: false,
    }
  );
  
  const sbankCardsQuery = useQuery(
    ['cards', 'sbank', CLIENT_ID_ID],
    () => cardManagementAPI.getCards('sbank', CLIENT_ID_ID),
    {
      enabled: !!getClientId() && !!CLIENT_ID_ID,
      refetchOnWindowFocus: false,
    }
  );

  const isLoadingAccounts = vbankCardsQuery.isLoading || abankCardsQuery.isLoading || sbankCardsQuery.isLoading;

  // Объединяем счета из всех банков (из карт)
  const accounts = useMemo(() => {
    console.log('🔍 [TransferByAccount] Начало обработки счетов из карт');
    console.log('🔍 [TransferByAccount] vbankCardsQuery.data:', JSON.stringify(vbankCardsQuery.data, null, 2));
    console.log('🔍 [TransferByAccount] abankCardsQuery.data:', JSON.stringify(abankCardsQuery.data, null, 2));
    console.log('🔍 [TransferByAccount] sbankCardsQuery.data:', JSON.stringify(sbankCardsQuery.data, null, 2));
    
    const allAccounts = [];
    
    // Функция для извлечения массива карт из ответа
    const extractCards = (data) => {
      if (!data) return [];
      
      // Пробуем разные структуры ответа
      if (Array.isArray(data)) {
        return data;
      }
      if (data.cards && Array.isArray(data.cards)) {
        return data.cards;
      }
      if (data.data?.data?.cards && Array.isArray(data.data.data.cards)) {
        return data.data.data.cards;
      }
      if (data.data?.cards && Array.isArray(data.data.cards)) {
        return data.data.cards;
      }
      return [];
    };
    
    // Извлекаем карты из каждого банка
    const vbankCards = extractCards(vbankCardsQuery.data);
    const abankCards = extractCards(abankCardsQuery.data);
    const sbankCards = extractCards(sbankCardsQuery.data);
    
    console.log(`📊 [TransferByAccount] Карт получено: vbank=${vbankCards.length}, abank=${abankCards.length}, sbank=${sbankCards.length}`);
    
    // Преобразуем карты в счета
    const allCards = [...vbankCards, ...abankCards, ...sbankCards];
    
    allCards.forEach((card, index) => {
      // accountNumber уже есть в карте из списка
      const accountNumber = card.accountNumber;
      
      if (accountNumber) {
        // Определяем банк по cardId или по порядку
        let bank = 'vbank';
        let bankName = 'VBank';
        if (card.cardId) {
          if (card.cardId.includes('abank')) {
            bank = 'abank';
            bankName = 'ABank';
          } else if (card.cardId.includes('sbank')) {
            bank = 'sbank';
            bankName = 'SBank';
          }
        } else {
          // Определяем банк по индексу в общем массиве
          if (index >= vbankCards.length + abankCards.length) {
            bank = 'sbank';
            bankName = 'SBank';
          } else if (index >= vbankCards.length) {
            bank = 'abank';
            bankName = 'ABank';
          }
        }
        
        const account = {
          id: card.cardId || `card-${bank}-${index}`,
          resourceId: card.cardId || `card-${bank}-${index}`,
          bank: bank,
          bankName: bankName,
          identification: accountNumber,
          accountNumber: accountNumber,
          balance: parseFloat(card.accountBalance || 0),
          availableBalance: parseFloat(card.accountBalance || 0),
          currency: 'RUB',
          cardName: card.cardName,
          cardId: card.cardId,
          cardNumber: card.cardNumber || '' // Номер карты (не accountNumber!)
        };
        
        console.log(`✅ [TransferByAccount] Обработанный счет из карты #${index}:`, {
          id: account.id,
          bank: account.bank,
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          accountNumberLength: account.accountNumber ? String(account.accountNumber).replace(/\s|-/g, '').length : 0,
          balance: account.balance
        });
        
        allAccounts.push(account);
      } else {
        console.warn(`⚠️ [TransferByAccount] Карта #${index} не содержит accountNumber:`, card);
      }
    });
    
    console.log(`✅ [TransferByAccount] Итого обработано счетов: ${allAccounts.length}`);
    
    // Если нет счетов из карт, возвращаем пустой массив (не используем базовые карты, т.к. у них нет полных номеров счетов)
    if (allAccounts.length === 0) {
      console.log(`⚠️ [TransferByAccount] Нет счетов из карт`);
    }
    
    return allAccounts;
  }, [vbankCardsQuery.data, abankCardsQuery.data, sbankCardsQuery.data]);

  // Формируем опции для CustomSelect
  const selectOptions = useMemo(() => {
    return accounts.map((account) => {
      const bankName = account.bankName || account.bank || 'Неизвестный банк';
      const balance = account.availableBalance || account.balance || 0;
      const currency = account.currency || 'RUB';
      
      // Получаем номер карты (не accountNumber!)
      // cardNumber может быть в формате "**** **** **** 7564" или просто "7564"
      let cardNumber = account.cardNumber || '';
      
      // Если номер карты в формате "**** **** **** 7564", извлекаем последние 4 цифры
      if (cardNumber.includes('****')) {
        // Ищем последние 4 цифры после последнего пробела
        const parts = cardNumber.trim().split(/\s+/);
        cardNumber = parts[parts.length - 1] || '';
      } else if (cardNumber.length > 4) {
        // Если это полный номер, берем последние 4 цифры
        cardNumber = cardNumber.replace(/\s|-/g, '').slice(-4);
      }
      
      // Если номера карты нет, используем последние 4 цифры из cardId как fallback
      if (!cardNumber && account.cardId) {
        const cardIdParts = account.cardId.split('-');
        if (cardIdParts.length > 0) {
          const lastPart = cardIdParts[cardIdParts.length - 1];
          // Извлекаем цифры из последней части
          const digits = lastPart.match(/\d+/g);
          if (digits && digits.length > 0) {
            cardNumber = digits[digits.length - 1].slice(-4);
          }
        }
      }
      
      // Если все еще нет номера карты, используем последние 4 цифры accountNumber как fallback
      if (!cardNumber) {
        const accountNumber = account.accountNumber || account.identification || '';
        cardNumber = String(accountNumber).replace(/\s|-/g, '').slice(-4);
      }
      
      return {
        value: account.id || account.resourceId,
        label: `${bankName} • ${cardNumber} • ${new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: currency,
        }).format(balance)}`
      };
    });
  }, [accounts]);

  // Мутация для создания перевода
  const transferMutation = useMutation(
    ({ paymentData, bank }) => paymentAPI.createPayment(paymentData, { client_id: getClientId(), bank }),
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
        const errorMessage = error.response?.data?.detail || 
                            error.response?.data?.message || 
                            error.message ||
                            'Ошибка при переводе. Попробуйте еще раз.';
        setError(errorMessage);
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

    console.log('🔍 [TransferByAccount] handleTransfer вызван');
    console.log('🔍 [TransferByAccount] selectedAccountId:', selectedAccountId);
    console.log('🔍 [TransferByAccount] Все доступные счета:', JSON.stringify(accounts, null, 2));

    const selectedAccount = accounts.find(acc => (acc.id || acc.resourceId) === selectedAccountId);
    
    console.log('🔍 [TransferByAccount] Найденный selectedAccount:', JSON.stringify(selectedAccount, null, 2));
    
    if (!selectedAccount) {
      console.error('❌ [TransferByAccount] Выбранный счет не найден');
      setError('Выбранный счет не найден');
      return;
    }

    // Проверка достаточности средств
    const transferAmount = parseFloat(amount);
    const balance = selectedAccount.availableBalance || selectedAccount.balance || 0;
    // Баланс из карт уже в правильном формате (не в копейках)
    const availableBalance = balance;
    
    console.log('🔍 [TransferByAccount] Проверка баланса:', {
      balance,
      availableBalance,
      transferAmount
    });
    
    if (transferAmount > availableBalance) {
      console.error('❌ [TransferByAccount] Недостаточно средств');
      setError('Недостаточно средств на счете');
      return;
    }

    // Определяем банк отправителя
    const bankName = selectedAccount.bankName || selectedAccount.bank || '';
    const bankCode = bankName.toLowerCase().replace('bank', '').replace('сбербанк', 'sberbank');
    // Маппинг названий банков на коды
    const bankMap = {
      'vbank': 'vbank',
      'abank': 'abank',
      'sbank': 'sbank',
      'sberbank': 'sberbank',
      'v': 'vbank',
      'a': 'abank',
      's': 'sbank'
    };
    const bank = bankMap[bankCode] || bankCode || 'vbank';
    
    console.log('🔍 [TransferByAccount] Определение банка:', {
      bankName,
      bankCode,
      bank
    });
    
    // Получаем номер счета отправителя
    // Пробуем разные поля, где может быть номер счета
    // В ответе API поле identification содержит полный номер счета
    const debtorAccountNumber = selectedAccount.identification || 
                                selectedAccount.accountNumber || 
                                selectedAccount.resourceId || 
                                selectedAccount.id ||
                                selectedAccountId;
    
    console.log('🔍 [TransferByAccount] Извлечение номера счета:', {
      'selectedAccount.identification': selectedAccount.identification,
      'selectedAccount.accountNumber': selectedAccount.accountNumber,
      'selectedAccount.resourceId': selectedAccount.resourceId,
      'selectedAccount.id': selectedAccount.id,
      'selectedAccountId': selectedAccountId,
      'debtorAccountNumber (результат)': debtorAccountNumber
    });
    
    // Очищаем номер счета от пробелов и дефисов для проверки
    const cleanDebtorAccountNumber = debtorAccountNumber ? String(debtorAccountNumber).replace(/\s|-/g, '') : '';
    
    console.log('🔍 [TransferByAccount] Очищенный номер счета:', {
      'debtorAccountNumber (исходный)': debtorAccountNumber,
      'cleanDebtorAccountNumber': cleanDebtorAccountNumber,
      'длина (только цифры)': cleanDebtorAccountNumber.replace(/\D/g, '').length
    });
    
    // Если номер счета слишком короткий (меньше 10 символов), это не полный номер
    // В этом случае нужно получить реальный номер счета из API
    const cleanLength = cleanDebtorAccountNumber.replace(/\D/g, '').length;
    if (!cleanDebtorAccountNumber || cleanLength < 10) {
      console.error('❌ [TransferByAccount] Номер счета слишком короткий:', {
        cleanDebtorAccountNumber,
        cleanLength,
        'требуется минимум': 10,
        'selectedAccount (полный объект)': JSON.stringify(selectedAccount, null, 2)
      });
      setError('Не удалось определить полный номер счета. Пожалуйста, используйте счет из списка банковских счетов.');
      return;
    }
    
    // Формируем данные платежа согласно документации OpenBanking API
    const paymentData = {
      data: {
        initiation: {
          instructedAmount: {
            amount: transferAmount.toFixed(2),
            currency: selectedAccount.currency || 'RUB'
          },
          debtorAccount: {
            schemeName: "RU.CBR.PAN",
            identification: cleanDebtorAccountNumber
          },
          creditorAccount: {
            schemeName: "RU.CBR.PAN",
            identification: recipientAccountNumber.trim()
          },
          comment: message || 'Перевод по номеру счета'
        }
      }
    };

    console.log('✅ [TransferByAccount] Данные платежа сформированы:', JSON.stringify(paymentData, null, 2));
    console.log('✅ [TransferByAccount] Параметры запроса:', { bank, client_id: getClientId() });

    // Передаем параметр bank в paymentAPI.createPayment
    transferMutation.mutate({ paymentData, bank });
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
                           // Баланс из карт уже в правильном формате (не в копейках)
                           const availableBalance = balance;
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

