import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBalanceStore from '../stores/balanceStore';

const TransferPage = () => {
  const navigate = useNavigate();
  const [selectedFromBank, setSelectedFromBank] = useState(null);
  const [selectedToBank, setSelectedToBank] = useState(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [noFromBankSelected, setNoFromBankSelected] = useState(false);
  const [noToBankSelected, setNoToBankSelected] = useState(false);
  const [sameCardSelected, setSameCardSelected] = useState(false);
  const [showOtherBankModal, setShowOtherBankModal] = useState(false);
  const [showRecipientList, setShowRecipientList] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [selectedTransferIndex, setSelectedTransferIndex] = useState(null);
  const { bankBalances, transferMoney, getFormattedBalance } = useBalanceStore();

  const frequentRecipients = [
    { 
      id: 0, 
      name: 'Между банками', 
      avatar: '', 
      type: 'action'
    },
    { 
      id: 1, 
      name: 'Ксения Шанина', 
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', 
      type: 'person'
    },
    { 
      id: 2, 
      name: 'Карина Громенко', 
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', 
      type: 'person'
    }
  ];

  const initialAllRecipients = [
    { 
      id: 0, 
      name: 'Евгений Богатов', 
      phone: '+7 (999) 000-00-00',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      cards: [
        { id: 'vtb', name: 'ВТБ', logo: 'ВТБ', color: '#0055BC', user: 'Евгений Б.', balance: '2 876,87 ₽' },
        { id: 'tbank', name: 'T-Банк', logo: 'T', color: '#2F2F2F', user: 'Евгений Б.', balance: '4 983,43 ₽' },
        { id: 'alfa', name: 'Альфа-Банк', logo: 'A', color: '#EF3124', user: 'Евгений Б.', balance: '10 544,40 ₽' }
      ]
    },
    { 
      id: 1, 
      name: 'Ксения Шанина', 
      phone: '+7 (999) 123-45-67',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      cards: [
        { id: 'vtb', name: 'ВТБ', logo: 'ВТБ', color: '#0055BC', user: 'Ксения Ш.', balance: '15 420,50 ₽' },
        { id: 'alfa', name: 'Альфа-Банк', logo: 'A', color: '#EF3124', user: 'Ксения Ш.', balance: '8 750,30 ₽' }
      ]
    },
    { 
      id: 2, 
      name: 'Карина Громенко', 
      phone: '+7 (999) 234-56-78',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      cards: [
        { id: 'tbank', name: 'T-Банк', logo: 'T', color: '#2F2F2F', user: 'Карина Г.', balance: '12 300,75 ₽' },
        { id: 'vtb', name: 'ВТБ', logo: 'ВТБ', color: '#0055BC', user: 'Карина Г.', balance: '5 600,20 ₽' }
      ]
    },
    { 
      id: 3, 
      name: 'Анна Петрова', 
      phone: '+7 (999) 345-67-89',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      cards: [
        { id: 'alfa', name: 'Альфа-Банк', logo: 'A', color: '#EF3124', user: 'Анна П.', balance: '9 850,40 ₽' },
        { id: 'tbank', name: 'T-Банк', logo: 'T', color: '#2F2F2F', user: 'Анна П.', balance: '3 200,60 ₽' }
      ]
    },
    { 
      id: 4, 
      name: 'Михаил Соколов', 
      phone: '+7 (999) 456-78-90',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      cards: [
        { id: 'vtb', name: 'ВТБ', logo: 'ВТБ', color: '#0055BC', user: 'Михаил С.', balance: '22 100,80 ₽' },
        { id: 'alfa', name: 'Альфа-Банк', logo: 'A', color: '#EF3124', user: 'Михаил С.', balance: '7 500,90 ₽' }
      ]
    },
    { 
      id: 5, 
      name: 'Елена Волкова', 
      phone: '+7 (999) 567-89-01',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      cards: [
        { id: 'tbank', name: 'T-Банк', logo: 'T', color: '#2F2F2F', user: 'Елена В.', balance: '18 750,25 ₽' },
        { id: 'vtb', name: 'ВТБ', logo: 'ВТБ', color: '#0055BC', user: 'Елена В.', balance: '4 300,15 ₽' }
      ]
    },
    { 
      id: 6, 
      name: 'Дмитрий Козлов', 
      phone: '+7 (999) 678-90-12',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      cards: [
        { id: 'alfa', name: 'Альфа-Банк', logo: 'A', color: '#EF3124', user: 'Дмитрий К.', balance: '11 200,45 ₽' },
        { id: 'tbank', name: 'T-Банк', logo: 'T', color: '#2F2F2F', user: 'Дмитрий К.', balance: '6 800,70 ₽' }
      ]
    }
  ];

  // Карты пользователя (откуда переводим)
  const userCards = [
    { 
      id: 'vtb', 
      name: 'ВТБ', 
      logo: 'ВТБ', 
      color: '#0055BC', 
      user: 'Евгений Б.', 
      balance: `${bankBalances.vtb.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽` 
    },
    { 
      id: 'tbank', 
      name: 'T-Банк', 
      logo: 'T', 
      color: '#2F2F2F', 
      user: 'Евгений Б.', 
      balance: `${bankBalances.tbank.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽` 
    },
    { 
      id: 'alfa', 
      name: 'Альфа-Банк', 
      logo: 'A', 
      color: '#EF3124', 
      user: 'Евгений Б.', 
      balance: `${bankBalances.alfa.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽` 
    }
  ];

  // Карты получателя (куда переводим)
  const recipientCards = selectedRecipient ? selectedRecipient.cards : [];
  const banks = [
    ...recipientCards,
    { id: 'other', name: 'Другой банк', logo: '+', color: '#EEEEEE', user: null, balance: null }
  ];

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    // Сбрасываем ошибку при изменении суммы
    if (insufficientFunds) {
      setInsufficientFunds(false);
    }
  };

  // Три последних перевода для каждого получателя
  const getLastTransfers = (recipientName) => {
    const transfers = {
      'Между банками': [150, 300, 450],
      'Ксения Шанина': [200, 350, 500],
      'Карина Громенко': [100, 250, 400]
    };
    return transfers[recipientName] || [100, 200, 300];
  };

  const handleFromBankSelect = (bankId) => {
    if (bankId === 'other') {
      setShowOtherBankModal(true);
      return;
    }
    
    setSelectedFromBank(bankId);
    setNoFromBankSelected(false);
    
    // Проверяем, не выбрана ли та же карта для получателя
    if (bankId === selectedToBank && bankId !== 'other' && selectedRecipient) {
      const recipientHasSameBank = selectedRecipient.cards.some(card => card.id === bankId);
      if (recipientHasSameBank) {
        // Дополнительная проверка: это должна быть одна и та же карта (один владелец)
        const fromCard = userCards.find(card => card.id === bankId);
        const toCard = selectedRecipient.cards.find(card => card.id === bankId);
        
        if (fromCard && toCard && fromCard.user === toCard.user) {
          setSameCardSelected(true);
        } else {
          setSameCardSelected(false);
        }
      } else {
        setSameCardSelected(false);
      }
    } else {
      setSameCardSelected(false);
    }
  };

  const handleToBankSelect = (bankId) => {
    if (bankId === 'other') {
      setShowOtherBankModal(true);
      return;
    }
    
    setSelectedToBank(bankId);
    setNoToBankSelected(false);
    
    // Проверяем, не выбрана ли та же карта для отправителя
    if (bankId === selectedFromBank && bankId !== 'other' && selectedRecipient) {
      const recipientHasSameBank = selectedRecipient.cards.some(card => card.id === bankId);
      if (recipientHasSameBank) {
        // Дополнительная проверка: это должна быть одна и та же карта (один владелец)
        const fromCard = userCards.find(card => card.id === bankId);
        const toCard = selectedRecipient.cards.find(card => card.id === bankId);
        
        if (fromCard && toCard && fromCard.user === toCard.user) {
          setSameCardSelected(true);
        } else {
          setSameCardSelected(false);
        }
      } else {
        setSameCardSelected(false);
      }
    } else {
      setSameCardSelected(false);
    }
  };

  const handleSelectRecipient = () => {
    setShowRecipientList(true);
  };

  const handleRecipientSelect = (recipient) => {
    setSelectedRecipient(recipient);
    setShowRecipientList(false);
    
    // Проверяем конфликт карт после выбора получателя
    if (selectedFromBank && selectedToBank && selectedFromBank === selectedToBank && selectedFromBank !== 'other') {
      const recipientHasSameBank = recipient.cards.some(card => card.id === selectedFromBank);
      if (recipientHasSameBank) {
        // Дополнительная проверка: это должна быть одна и та же карта (один владелец)
        const fromCard = userCards.find(card => card.id === selectedFromBank);
        const toCard = recipient.cards.find(card => card.id === selectedToBank);
        
        if (fromCard && toCard && fromCard.user === toCard.user) {
          setSameCardSelected(true);
        } else {
          setSameCardSelected(false);
        }
      } else {
        setSameCardSelected(false);
      }
    } else {
      setSameCardSelected(false);
    }
  };

  const handleTransfer = () => {
    // Сбрасываем все ошибки
    setInsufficientFunds(false);
    setNoFromBankSelected(false);
    setNoToBankSelected(false);
    setSameCardSelected(false);
    
    // Проверяем выбор банка отправителя
    if (!selectedFromBank) {
      setNoFromBankSelected(true);
      return;
    }
    
    // Проверяем выбор получателя
    if (!selectedToBank) {
      setNoToBankSelected(true);
      return;
    }
    
    // Проверяем, не выбраны ли одинаковые карты (один банк, один получатель, одна карта)
    if (selectedFromBank === selectedToBank && selectedFromBank !== 'other' && selectedRecipient) {
      // Проверяем, есть ли у выбранного получателя карта того же банка
      const recipientHasSameBank = selectedRecipient.cards.some(card => card.id === selectedFromBank);
      if (recipientHasSameBank) {
        // Дополнительная проверка: это должна быть одна и та же карта (один владелец)
        const fromCard = userCards.find(card => card.id === selectedFromBank);
        const toCard = selectedRecipient.cards.find(card => card.id === selectedToBank);
        
        // Если это одна и та же карта (один владелец), то запрещаем
        if (fromCard && toCard && fromCard.user === toCard.user) {
          setSameCardSelected(true);
          return;
        }
      }
    }
    
    // Проверяем ввод суммы
    if (!amount) {
      return;
    }
    
    const transferAmount = parseFloat(amount);
    
    // Проверяем достаточность средств
    if (selectedFromBank !== 'other' && bankBalances[selectedFromBank] < transferAmount) {
      setInsufficientFunds(true);
      return;
    }
    
    // Обновляем балансы через глобальный store
    transferMoney(selectedFromBank, selectedToBank, transferAmount);

    // Обновляем балансы в данных получателя
    if (selectedRecipient && selectedToBank !== 'other') {
      const updatedRecipient = {
        ...selectedRecipient,
        cards: selectedRecipient.cards.map(card => {
          if (card.id === selectedToBank) {
            const currentBalance = parseFloat(card.balance.replace(/[^\d,]/g, '').replace(',', '.'));
            const newBalance = currentBalance + transferAmount;
            return {
              ...card,
              balance: `${newBalance.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`
            };
          }
          return card;
        })
      };
      setSelectedRecipient(updatedRecipient);
    }
    
    // Показываем модальное окно успеха
    setShowSuccessModal(true);
    
    // Очищаем только сумму и сообщение, оставляем выбранные банки
    setAmount('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-white w-full max-w-[375px] mx-auto overflow-visible">
      {/* Header */}
      <div className="relative z-20 px-5 pt-6 pb-4 animate-slide-in-down">
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
            Платежи
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Frequent Recipients */}
      <div className="relative z-30 px-4 py-2 animate-slide-in-down">
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide py-2 pl-1">
          {frequentRecipients.map((recipient) => (
            <div
              key={recipient.id}
              className="flex-shrink-0 w-[80px] h-[100px] bg-gray-200 rounded-[16px] shadow-lg flex flex-col items-center justify-center p-3 cursor-pointer hover:scale-105 transition-transform"
              style={{
                border: recipient.id === 0 ? '1px solid #6C727F' :
                        recipient.id === 1 ? '1px solid #0055BC' : 
                        '1px solid #EF3124',
                boxShadow: recipient.id === 0 ? '0px 0px 4px 0.5px #6C727F' :
                           recipient.id === 1 ? '0px 0px 4px 0.5px #0055BC' : 
                           '0px 0px 4px 0.5px #EF3124'
              }}
              onClick={() => {
                // Сбрасываем выделение кнопок
                setSelectedTransferIndex(null);
                
                if (recipient.type === 'action') {
                  // Для "Между банками" - показываем свои карты
                  setSelectedRecipient({
                    id: 'self',
                    name: 'Между банками',
                    avatar: '',
                    cards: [
                      { id: 'alfa', name: 'Альфа-Банк', balance: '10 544,40 ₽', color: '#EF3124', logo: 'A', cardNumber: '5294 **** **** 2498' },
                      { id: 'vtb', name: 'ВТБ', balance: '45 230 ₽', color: '#0055BC', logo: 'ВТБ', cardNumber: '3568 **** **** 8362' },
                      { id: 'tbank', name: 'T-Банк', balance: '67 890 ₽', color: '#2F2F2F', logo: 'T', cardNumber: '6352 **** **** 9837' }
                    ]
                  });
                } else {
                  // Для конкретных людей - показываем их карты
                  const recipientCards = recipient.name === 'Ксения Шанина' ? [
                    { id: 'ksenia_sber', name: 'Сбербанк', balance: '15 230 ₽', color: '#21A038', logo: 'С', cardNumber: '1234 **** **** 5678', cardholderName: 'Ксения Ш.' },
                    { id: 'ksenia_vtb', name: 'ВТБ', balance: '8 450 ₽', color: '#0055BC', logo: 'ВТБ', cardNumber: '9876 **** **** 4321', cardholderName: 'Ксения Ш.' }
                  ] : [
                    { id: 'karina_alfa', name: 'Альфа-Банк', balance: '22 100 ₽', color: '#EF3124', logo: 'A', cardNumber: '5555 **** **** 9999', cardholderName: 'Карина Г.' },
                    { id: 'karina_tinkoff', name: 'Тинькофф', balance: '12 800 ₽', color: '#FFDD2D', logo: 'Т', cardNumber: '7777 **** **** 1111', cardholderName: 'Карина Г.' }
                  ];
                  
                  setSelectedRecipient({
                    ...recipient,
                    cards: recipientCards
                  });
                }
              }}
            >
              {recipient.type === 'action' ? (
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200 mb-2">
                  <img 
                    src={recipient.avatar} 
                    alt={recipient.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="text-black font-ibm text-xs font-normal leading-[110%] text-center">
                {recipient.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Transfer Section */}
      <div className="relative z-20 px-4 py-1 animate-slide-in-down">
        <div className="mb-3">
          <div className="text-black font-ibm text-base font-medium leading-[110%]">
            Новый перевод
          </div>
        </div>
        <div className="text-black font-ibm text-sm font-medium leading-[110%] mb-3">
          Банк, из которого хотите перевести
        </div>
        
        {/* From Bank Cards */}
        <div className="flex space-x-2 mb-4">
          {userCards.map((bank) => (
            <div
              key={`from-${bank.id}`}
              className={`w-[75px] h-[80px] rounded-[18px] cursor-pointer transition-all duration-300 flex flex-col items-center justify-center p-2 ${
                selectedFromBank === bank.id ? (bank.id === 'alfa' ? 'ring-2 ring-black shadow-lg' : 'ring-2 ring-red-500 shadow-lg') : ''
              }`}
              style={{ backgroundColor: bank.color }}
                onClick={() => handleFromBankSelect(bank.id)}
            >
              {bank.id === 'other' ? (
                <div className="text-black font-ibm text-xs font-normal leading-[110%] text-center">
                  {bank.name}
                </div>
              ) : (
                <>
                  <div className="text-white font-ibm text-sm font-bold leading-[110%] mb-1">
                    {bank.logo}
                  </div>
                  <div className="text-white font-ibm text-xs font-normal leading-[110%]">
                    {bank.user}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
      </div>

      {/* Recipient Section */}
      <div className="relative z-20 px-4 py-1 animate-slide-in-down">
        <div className="flex items-center justify-between mb-3">
          <div className="text-black font-ibm text-sm font-medium leading-[110%]">
            Получатель
          </div>
          <button 
            onClick={handleSelectRecipient}
            className="flex items-center text-black font-ibm text-xs font-normal leading-[110%] hover:text-gray-600 transition-colors"
          >
            {selectedRecipient ? 'Изменить получателя' : 'Выбрать получателя'}
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Selected Recipient Display */}
        {selectedRecipient && (
          <div className="mb-3 p-3 bg-white rounded-xl flex items-center space-x-3">
            <img
              src={selectedRecipient.avatar}
              alt={selectedRecipient.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{selectedRecipient.name}</div>
              <div className="text-xs text-gray-500">{selectedRecipient.phone}</div>
            </div>
            <button
              onClick={() => setSelectedRecipient(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* To Bank Cards */}
        <div className="flex space-x-2 mb-4">
          {selectedRecipient && selectedRecipient.cards ? selectedRecipient.cards.map((card) => (
            <div
              key={`to-${card.id}`}
              className={`w-[75px] h-[80px] rounded-[18px] cursor-pointer transition-all duration-300 flex flex-col items-center justify-center p-2 ${
                selectedToBank === card.id ? (card.id === 'alfa' ? 'ring-2 ring-black shadow-lg' : 'ring-2 ring-red-500 shadow-lg') : ''
              }`}
              style={{ backgroundColor: card.color }}
              onClick={() => handleToBankSelect(card.id)}
            >
              <div className="text-white font-ibm text-sm font-bold leading-[110%] mb-1">
                {card.logo}
              </div>
              <div className="text-white font-ibm text-xs font-normal leading-[110%] text-center">
                {card.cardholderName || card.name}
              </div>
            </div>
          )) : (
            <div className="text-gray-500 text-sm">Выберите получателя</div>
          )}
        </div>
        
      </div>

      {/* Input Fields */}
      <div className="relative z-20 px-4 py-1 space-y-3 animate-slide-in-down">
        {/* Selected Bank Balance Display */}
        {selectedFromBank && selectedFromBank !== 'other' && (
          <div className="mb-4">
            <div className="text-black font-ibm text-sm font-normal leading-[110%] mb-2">
              Доступно на карте:
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-200 rounded-[20px]">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: userCards.find(b => b.id === selectedFromBank)?.color }}
                >
                  <div className="text-white font-ibm text-sm font-bold">
                    {userCards.find(b => b.id === selectedFromBank)?.logo}
                  </div>
                </div>
                <div>
                  <div className="text-black font-ibm text-sm font-medium leading-[110%]">
                    {userCards.find(b => b.id === selectedFromBank)?.name}
                  </div>
                  <div className="text-gray-600 font-ibm text-xs leading-[110%]">
                    {userCards.find(b => b.id === selectedFromBank)?.user}
                  </div>
                </div>
              </div>
              <div className="text-black font-ibm text-lg font-bold leading-[110%]">
                {userCards.find(b => b.id === selectedFromBank)?.balance}
              </div>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Введите сумму"
            value={amount}
            onChange={handleAmountChange}
            className="w-full h-9 bg-gray-200 rounded-[27px] px-4 text-gray-500 font-ibm text-sm leading-[110%]"
            style={{ backgroundColor: 'rgba(217, 217, 217, 0.45)' }}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {selectedRecipient && getLastTransfers(selectedRecipient.name).map((transferAmount, index) => (
              <button 
                key={index}
                onClick={() => {
                  setAmount(transferAmount.toString());
                  setSelectedTransferIndex(index);
                }}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  selectedTransferIndex === index 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-400 hover:bg-gray-500'
                }`}
                title={`Перевод ${index + 1}: ${transferAmount} ₽`}
              >
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </button>
            ))}
          </div>
        </div>


        {/* Message Input */}
        <input 
          type="text" 
          placeholder="Сообщение получателю"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-9 bg-gray-200 rounded-[27px] px-4 text-gray-500 font-ibm text-sm leading-[110%]"
          style={{ backgroundColor: 'rgba(217, 217, 217, 0.45)' }}
        />
      </div>

      {/* Validation Errors */}
      <div className="relative z-20 px-4 py-1">
        {noFromBankSelected && (
          <div className="text-red-500 text-sm font-ibm text-center mb-2">
            Выберите банк, с которого хотите перевести
          </div>
        )}
        {noToBankSelected && (
          <div className="text-red-500 text-sm font-ibm text-center mb-2">
            Выберите получателя
          </div>
        )}
        {insufficientFunds && (
          <div className="text-red-500 text-sm font-ibm text-center mb-2">
            Недостаточно средств
          </div>
        )}
        {sameCardSelected && (
          <div className="text-red-500 text-sm font-ibm text-center mb-2">
            Выберите другую карту
          </div>
        )}
      </div>

      {/* Transfer Button */}
      <div className="relative z-20 px-4 py-1 animate-slide-in-down">
        <button 
          onClick={handleTransfer}
          className="w-full h-9 bg-red-500 hover:bg-red-600 text-white rounded-[27px] font-ibm text-sm font-medium leading-[110%] transition-colors"
        >
          Перевести
        </button>
      </div>


      {/* Recipient List Modal */}
      {showRecipientList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Выберите получателя</h3>
              <button
                onClick={() => setShowRecipientList(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {initialAllRecipients.map((recipient) => (
                <button
                  key={recipient.id}
                  onClick={() => handleRecipientSelect(recipient)}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <img
                    src={recipient.avatar}
                    alt={recipient.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">{recipient.name}</div>
                    <div className="text-xs text-gray-500">{recipient.phone}</div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other Bank Modal */}
      {showOtherBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Другой банк</h3>
              <p className="text-gray-600 mb-6">Здесь будет список банков</p>
              <button
                onClick={() => setShowOtherBankModal(false)}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Перевод осуществлен успешно</h3>
              <p className="text-gray-600 mb-4">Средства переведены на выбранную карту</p>
              <div className="space-y-2">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                >
                  Закрыть
                </button>
                <button
                  onClick={() => {
                    setBankBalances({
                      vtb: 2876.87,
                      tbank: 4983.43,
                      alfa: 10544.40
                    });
                    setSelectedFromBank(null);
                    setSelectedToBank(null);
                    setShowSuccessModal(false);
                  }}
                  className="w-full bg-white0 hover:bg-gray-600 text-white py-2 px-4 rounded-xl font-medium transition-colors text-sm"
                >
                  Сбросить балансы
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferPage;