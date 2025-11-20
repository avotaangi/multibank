import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InfoPanel from '../components/InfoPanel';
import { usePageInfo } from '../hooks/usePageInfo';
import { Info, X, ChevronRight } from 'lucide-react';
import { getDepositsData, getTotalDeposits, getAverageRate } from '../data/depositsData';
import useBalanceStore from '../stores/balanceStore';
import useTestCardsStore from '../stores/testCardsStore';

const API_BASE = import.meta.env.VITE_API_BASE;
const CLIENT_ID_ID = import.meta.env.VITE_CLIENT_ID_ID;

const DepositsPage = () => {
  const navigate = useNavigate();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const { virtualCardBalance, bankBalances } = useBalanceStore();
  const { getAllCards } = useTestCardsStore();
  const [showAutoTransferModal, setShowAutoTransferModal] = useState(false);
  const [selectedDepositId, setSelectedDepositId] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedFrequency, setSelectedFrequency] = useState('monthly');
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [autoTransferSettings, setAutoTransferSettings] = useState({}); // Объект: depositId -> settings
  const [cardsWithBalances, setCardsWithBalances] = useState([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  
  // Используем общие данные о вкладах, синхронизированные с виртуальной картой VBank
  const deposits = useMemo(() => getDepositsData(virtualCardBalance), [virtualCardBalance]);
  const totalDeposits = useMemo(() => getTotalDeposits(virtualCardBalance), [virtualCardBalance]);
  const averageRate = useMemo(() => getAverageRate(virtualCardBalance), [virtualCardBalance]);
  
  // Загружаем настройки автоперевода из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('depositAutoTransfer');
    if (saved) {
      try {
        setAutoTransferSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Ошибка при загрузке настроек автоперевода:', e);
      }
    }
  }, []);
  
  // Загружаем балансы карт через API
  useEffect(() => {
    const fetchCardBalances = async () => {
      setLoadingBalances(true);
      try {
        const baseCards = [
          { id: 'vbank', name: 'VBank', bankName: 'VBank', cardNumber: '5294', color: '#0055BC' },
          { id: 'abank', name: 'ABank', bankName: 'ABank', cardNumber: '5678', color: '#DC2626' },
          { id: 'sbank', name: 'SBank', bankName: 'SBank', cardNumber: '9012', color: '#10B981' }
        ];
        
        const cardsWithBal = await Promise.all(
          baseCards.map(async (card) => {
            try {
              const res = await axios.get(`${API_BASE}/available_balance/${card.id}/${CLIENT_ID_ID}`);
              const balance = parseFloat(res.data?.balance || 0);
              return { ...card, balance };
            } catch (err) {
              console.error(`Ошибка при загрузке баланса для ${card.id}:`, err);
              return { ...card, balance: 0 };
            }
          })
        );
        
        const testCards = getAllCards();
        const testCardsWithBalance = testCards.map(card => {
          const bankKey = card.bankName?.toLowerCase() || card.name?.toLowerCase() || '';
          const balance = bankBalances?.[bankKey] || card.balance || 0;
          return {
            ...card,
            balance
          };
        });
        
        setCardsWithBalances([...cardsWithBal, ...testCardsWithBalance]);
      } catch (err) {
        console.error('Ошибка при загрузке балансов карт:', err);
      } finally {
        setLoadingBalances(false);
      }
    };
    
    fetchCardBalances();
  }, [getAllCards, bankBalances]);
  
  const handleOpenAutoTransferModal = (depositId) => {
    setSelectedDepositId(depositId);
    const settings = autoTransferSettings[depositId];
    if (settings) {
      setSelectedCardId(settings.cardId);
      setSelectedFrequency(settings.frequency);
      setSelectedStartDate(settings.startDate || '');
    } else {
      setSelectedCardId(null);
      setSelectedFrequency('monthly');
      // Устанавливаем дату по умолчанию - сегодня
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      setSelectedStartDate(dateString);
    }
    setShowAutoTransferModal(true);
  };
  
  const handleCloseAutoTransferModal = () => {
    setShowAutoTransferModal(false);
    setSelectedDepositId(null);
  };
  
  const handleSaveAutoTransfer = () => {
    if (!selectedCardId || !selectedDepositId) {
      alert('Выберите карту для пополнения');
      return;
    }
    
    if (!selectedStartDate) {
      alert('Выберите дату начала автопополнения');
      return;
    }
    
    const newSettings = {
      ...autoTransferSettings,
      [selectedDepositId]: {
        cardId: selectedCardId,
        frequency: selectedFrequency,
        startDate: selectedStartDate,
        createdAt: new Date().toISOString()
      }
    };
    
    setAutoTransferSettings(newSettings);
    localStorage.setItem('depositAutoTransfer', JSON.stringify(newSettings));
    setShowAutoTransferModal(false);
    setSelectedDepositId(null);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  
  const handleDeleteAutoTransfer = () => {
    if (!selectedDepositId) return;
    
    const newSettings = { ...autoTransferSettings };
    delete newSettings[selectedDepositId];
    setAutoTransferSettings(newSettings);
    localStorage.setItem('depositAutoTransfer', JSON.stringify(newSettings));
    setShowAutoTransferModal(false);
    setSelectedDepositId(null);
  };
  
  const getDepositSettings = (depositId) => {
    return autoTransferSettings[depositId] || null;
  };
  
  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case 'weekly':
        return 'Еженедельно';
      case 'monthly':
        return 'Ежемесячно';
      case 'quarterly':
        return 'Ежеквартально';
      default:
        return frequency;
    }
  };


  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Вклады
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
      <div className="px-5 pb-4">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 mb-6  shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-gray-600 font-ibm text-sm font-normal leading-[110%] mb-2">
              Сумма вкладов
            </div>
            <div className="text-black font-ibm text-3xl font-medium leading-[110%] mb-4">
              {totalDeposits.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
            </div>
            <div className="text-gray-600 font-ibm text-sm font-normal leading-[110%]">
              Средняя доходность: {averageRate}% годовых
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="">
          {/* Status Message */}
          <div className="text-center mb-8 ">
            <div className="text-black font-ibm text-sm font-normal leading-[110%]">
              Статус: сейчас ты управляешь своими деньгами, а не они тобой
            </div>
          </div>

          {/* Deposit Cards */}
          <div className="space-y-3 mb-6 ">
            {deposits.map((deposit) => {
              const depositSettings = getDepositSettings(deposit.id);
              const card = cardsWithBalances.find(c => c.id === depositSettings?.cardId);
              
              return (
                <div key={deposit.id} className={`${deposit.bgColor} rounded-2xl p-4 hover:shadow-md transition-shadow`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-white font-ibm text-xl font-medium leading-[110%] mb-1">
                        {deposit.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                      </div>
                      <div className="text-white font-ibm text-sm font-normal leading-[110%]">
                        {deposit.name}
                      </div>
                    </div>
                    <div className="text-white font-ibm text-sm font-medium leading-[110%]">
                      {deposit.rate}% годовых
                    </div>
                  </div>
                  
                  {depositSettings ? (
                    <div className="bg-white bg-opacity-20 rounded-xl p-3 mb-2">
                      <div className="text-white font-ibm text-xs mb-1">
                        Автопополнение: {card?.bankName || 'Неизвестно'} ••••{card?.cardNumber || '0000'}
                      </div>
                      <div className="text-white font-ibm text-xs mb-1">
                        {getFrequencyText(depositSettings.frequency)}
                      </div>
                      {depositSettings.startDate && (
                        <div className="text-white font-ibm text-xs">
                          С {formatDate(depositSettings.startDate)}
                        </div>
                      )}
                    </div>
                  ) : null}
                  
                  <button
                    onClick={() => handleOpenAutoTransferModal(deposit.id)}
                    className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-ibm text-sm font-medium py-2 rounded-xl transition-colors"
                  >
                    {depositSettings ? 'Изменить автопополнение' : 'Настроить автопополнение'}
                  </button>
                </div>
              );
            })}
          </div>


        </div>
      </div>

      {/* Info text at bottom */}
      <div className="px-5 py-6 text-center">
        <div className="text-gray-600 font-ibm text-sm font-normal leading-[140%] max-w-md mx-auto">
          На этой странице отображаются ваши вклады и доступна настройка автопополнения. Для полного управления накопительными счетами используйте приложение вашего банка.
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-20"></div>

      {/* Auto Transfer Modal */}
      {showAutoTransferModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-[9999]"
            onClick={handleCloseAutoTransferModal}
          ></div>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[27px] max-h-[90vh] overflow-y-auto z-[9999]">
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-black font-ibm text-xl font-semibold">
                  Настройка автоперевода
                </div>
                <button
                  onClick={handleCloseAutoTransferModal}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="px-5 py-4 space-y-6">
              {/* Deposit Selection Info */}
              {selectedDepositId && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-blue-700 font-ibm text-sm font-medium mb-1">
                    Настройка автопополнения для:
                  </div>
                  <div className="text-blue-900 font-ibm text-base font-semibold">
                    {deposits.find(d => d.id === selectedDepositId)?.name || 'Вклад'}
                  </div>
                </div>
              )}
              
              {/* Card Selection */}
              <div>
                <div className="text-black font-ibm text-base font-semibold mb-3">
                  Выберите карту для пополнения
                </div>
                <div className="space-y-3">
                  {loadingBalances ? (
                    <div className="text-center py-8 text-gray-500 font-ibm text-sm">
                      Загрузка карт...
                    </div>
                  ) : cardsWithBalances.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 font-ibm text-sm">
                      Нет доступных карт
                    </div>
                  ) : (
                    cardsWithBalances.map((card, index) => (
                      <div
                        key={card.id || `card-${index}`}
                        onClick={() => setSelectedCardId(card.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedCardId === card.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-12 h-8 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: card.color || '#6366F1' }}
                          ></div>
                          <div className="flex-1">
                            <div className="text-black font-ibm text-sm font-medium">
                              {card.bankName || card.name || 'Неизвестный банк'} ••••{card.cardNumber || '0000'}
                            </div>
                            <div className="text-gray-500 font-ibm text-xs">
                              {(card.balance || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                            </div>
                          </div>
                          {selectedCardId === card.id && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Frequency Selection */}
              <div>
                <div className="text-black font-ibm text-base font-semibold mb-3">
                  Частота пополнения
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'weekly', label: 'Еженедельно', desc: 'Каждую неделю' },
                    { value: 'monthly', label: 'Ежемесячно', desc: 'Каждый месяц' },
                    { value: 'quarterly', label: 'Ежеквартально', desc: 'Каждый квартал' }
                  ].map((freq) => (
                    <div
                      key={freq.value}
                      onClick={() => setSelectedFrequency(freq.value)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedFrequency === freq.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-black font-ibm text-sm font-medium">
                            {freq.label}
                          </div>
                          <div className="text-gray-500 font-ibm text-xs">
                            {freq.desc}
                          </div>
                        </div>
                        {selectedFrequency === freq.value && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Start Date Selection */}
              <div>
                <div className="text-black font-ibm text-base font-semibold mb-3">
                  Дата начала автопополнения
                </div>
                <input
                  type="date"
                  value={selectedStartDate}
                  onChange={(e) => setSelectedStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl text-black font-ibm text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {selectedStartDate && (
                  <div className="text-gray-500 font-ibm text-xs mt-2">
                    Автопополнение начнется с {formatDate(selectedStartDate)}
                  </div>
                )}
              </div>
              
              {/* Buttons */}
              <div className="flex space-x-3 pt-4 pb-6">
                {selectedDepositId && getDepositSettings(selectedDepositId) && (
                  <button
                    onClick={handleDeleteAutoTransfer}
                    className="flex-1 py-3 px-4 bg-red-50 border-0 rounded-2xl text-red-600 font-ibm text-base font-medium hover:bg-red-100 transition-all"
                  >
                    Удалить
                  </button>
                )}
                <button
                  onClick={handleCloseAutoTransferModal}
                  className="flex-1 py-3 px-4 bg-gray-100 border-0 rounded-2xl text-gray-700 font-ibm text-base font-medium hover:bg-gray-200 transition-all"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveAutoTransfer}
                  disabled={!selectedCardId || !selectedDepositId || !selectedStartDate}
                  className={`flex-1 py-3 px-4 border-0 rounded-2xl text-white font-ibm text-base font-medium transition-all ${
                    selectedCardId && selectedDepositId && selectedStartDate
                      ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </>
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

export default DepositsPage;
