import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Calendar, DollarSign, FileText, ChevronRight, X, Info, Repeat, User, Edit2, Save } from 'lucide-react';
import useBalanceStore from '../stores/balanceStore';
import useTestCardsStore from '../stores/testCardsStore';
import InfoPanel from '../components/InfoPanel';
import { usePageInfo } from '../hooks/usePageInfo';
import { useScrollToTop } from '../hooks/useScrollToTop';
import axios from 'axios';
import useAuthStore from '../stores/authStore';

const AutopayDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const autopay = location.state?.autopay;
  const { bankBalances } = useBalanceStore();
  const { getAllCards } = useTestCardsStore();
  const [selectedCardId, setSelectedCardId] = useState(autopay?.card || 'vbank');
  const [showCardSelection, setShowCardSelection] = useState(false);
  const [isAutopayEnabled, setIsAutopayEnabled] = useState(autopay?.status === 'active');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: autopay?.name || '',
    category: autopay?.category || 'ЖКХ',
    amount: autopay?.amount?.toString() || '',
    frequency: autopay?.frequency || 'monthly',
    recipient: autopay?.recipient || ''
  });
  const [connectedBanks, setConnectedBanks] = useState([]);
  const [cardsWithBalances, setCardsWithBalances] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);

  const API_BASE = import.meta.env.VITE_LOCAL_API_BASE || 'http://localhost:8000';
  const getClientIdId = useAuthStore((state) => state.getClientIdId);
  const CLIENT_ID_ID = getClientIdId() === 0 ? 1 : getClientIdId();

  useScrollToTop();

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

  // Загружаем балансы карт через API
  useEffect(() => {
    const fetchCardBalances = async () => {
      if (connectedBanks.length === 0) {
        setLoadingCards(false);
        return;
      }

      setLoadingCards(true);
      try {
        const baseCards = [
          { id: 'vbank', name: 'VBank', bankName: 'VBank', cardNumber: '5294', color: '#0055BC' },
          { id: 'abank', name: 'ABank', bankName: 'ABank', cardNumber: '5678', color: '#DC2626' },
          { id: 'sbank', name: 'SBank', bankName: 'SBank', cardNumber: '9012', color: '#10B981' }
        ];

        // Фильтруем только подключенные банки
        const connectedCards = baseCards.filter(card => 
          connectedBanks.some(bank => bank.toLowerCase() === card.id)
        );

        const cardsWithBal = await Promise.all(
          connectedCards.map(async (card) => {
            try {
              const res = await axios.get(`${API_BASE}/available_balance/${card.id}/${CLIENT_ID_ID}`);
              const balance = parseFloat(res.data?.balance || 0);
              return { ...card, balance };
            } catch (err) {
              console.error(`Ошибка при загрузке баланса для ${card.id}:`, err);
              // Используем баланс из стора, если API не доступен
              const balance = bankBalances?.[card.id] || 0;
              return { ...card, balance };
            }
          })
        );

        setCardsWithBalances(cardsWithBal);
      } catch (err) {
        console.error('Ошибка при загрузке балансов карт:', err);
      } finally {
        setLoadingCards(false);
      }
    };

    fetchCardBalances();
  }, [connectedBanks, API_BASE, CLIENT_ID_ID, bankBalances]);

  if (!autopay) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Автоплатёж не найден</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

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

  // Получаем все карты пользователя из API
  const userCards = useMemo(() => {
    // Используем карты с балансами, полученные через API
    return cardsWithBalances;
  }, [cardsWithBalances]);

  const selectedCard = userCards.find(card => {
    const cardId = card.id?.toLowerCase();
    const selectedId = selectedCardId?.toLowerCase();
    const autopayCard = autopay?.card?.toLowerCase();
    return cardId === selectedId || cardId === autopayCard || card.bankName?.toLowerCase() === selectedId || card.bankName?.toLowerCase() === autopayCard;
  }) || userCards[0];

  const handleCardSelect = (cardId) => {
    setSelectedCardId(cardId);
    setShowCardSelection(false);
    // Если в режиме редактирования, карта будет сохранена при нажатии "Сохранить"
  };

  const handleToggleAutopay = () => {
    setIsAutopayEnabled(!isAutopayEnabled);
    // Обновляем статус в localStorage
    const savedAutopays = JSON.parse(localStorage.getItem('autopays') || '[]');
    const updatedAutopays = savedAutopays.map(ap => 
      ap.id === autopay.id 
        ? { ...ap, status: !isAutopayEnabled ? 'active' : 'paused' }
        : ap
    );
    localStorage.setItem('autopays', JSON.stringify(updatedAutopays));
  };

  const handleSave = () => {
    // Обновляем автоплатеж в localStorage
    const savedAutopays = JSON.parse(localStorage.getItem('autopays') || '[]');
    // Получаем название карты из выбранной карты
    const selectedCardData = userCards.find(card => card.id === selectedCardId);
    const cardName = selectedCardData?.bankName || selectedCardData?.name || (selectedCardId === 'vbank' ? 'VBank' : selectedCardId === 'abank' ? 'ABank' : selectedCardId === 'sbank' ? 'SBank' : selectedCardId);
    const updatedAutopays = savedAutopays.map(ap => 
      ap.id === autopay.id 
        ? {
            ...ap,
            name: editData.name,
            category: editData.category,
            amount: parseInt(editData.amount),
            frequency: editData.frequency,
            recipient: editData.recipient,
            card: cardName
          }
        : ap
    );
    localStorage.setItem('autopays', JSON.stringify(updatedAutopays));
    setIsEditing(false);
    // Обновляем страницу, чтобы отобразить изменения
    navigate('/dashboard', { replace: true });
  };

  const handleCancel = () => {
    setEditData({
      name: autopay?.name || '',
      category: autopay?.category || 'ЖКХ',
      amount: autopay?.amount?.toString() || '',
      frequency: autopay?.frequency || 'monthly',
      recipient: autopay?.recipient || ''
    });
    setIsEditing(false);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'ЖКХ':
        return '🏠';
      case 'Кредиты':
        return '💳';
      case 'Прочие':
        return '📋';
      default:
        return '💼';
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 text-black font-ibm text-2xl font-medium leading-[110%] text-left ml-2">
            Детали автоплатежа
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Edit2 className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Save className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={() => setShowInfoPanel(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Info className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 pt-4">
        {/* Autopay Header */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`${getBankColor(selectedCard?.bankName || selectedCard?.name || autopay.card)} rounded-xl p-3`}>
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-100 border-0 rounded-xl text-black font-ibm text-xl font-semibold mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Название платежа"
                />
              ) : (
                <div className="text-black font-ibm text-xl font-semibold mb-1">
                  {editData.name || autopay.name}
                </div>
              )}
              {isEditing ? (
                <div className="relative">
                  <select
                    value={editData.category}
                    onChange={(e) => setEditData({...editData, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-100 border-0 rounded-xl text-gray-600 font-ibm text-sm focus:outline-none focus:ring-2 focus:ring-[#844FD9] appearance-none cursor-pointer pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '12px'
                    }}
                  >
                    <option value="ЖКХ">ЖКХ</option>
                    <option value="Кредиты">Кредиты</option>
                    <option value="Прочие">Прочие регулярные платежи</option>
                  </select>
                </div>
              ) : (
                <div className="text-gray-600 font-ibm text-sm">
                  {editData.category || autopay.category} • {selectedCard?.bankName || selectedCard?.name || autopay.card}
                </div>
              )}
            </div>
            <div className={`px-3 py-1 rounded-lg font-ibm text-sm font-medium ${
              isAutopayEnabled
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {isAutopayEnabled ? 'Активен' : 'Приостановлен'}
            </div>
          </div>
          {isEditing && (
            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleCancel}
                className="flex-1 py-2 px-4 bg-gray-100 rounded-xl text-gray-700 font-ibm text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
            </div>
          )}
        </div>

        {/* Autopay Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-gray-500 font-ibm text-xs mb-1">Сумма платежа</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        setEditData({...editData, amount: value});
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-100 border-0 rounded-xl text-black font-ibm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Сумма"
                  />
                ) : (
                  <div className="text-black font-ibm text-sm font-medium">
                    {(editData.amount || autopay.amount).toLocaleString('ru-RU')} ₽
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex items-start space-x-3">
              <Repeat className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-gray-500 font-ibm text-xs mb-1">Периодичность</div>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={editData.frequency}
                      onChange={(e) => setEditData({...editData, frequency: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-100 border-0 rounded-xl text-black font-ibm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#844FD9] appearance-none cursor-pointer pr-10"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '12px'
                      }}
                    >
                      <option value="monthly">Ежемесячно</option>
                      <option value="quarterly">Ежеквартально</option>
                    </select>
                  </div>
                ) : (
                  <div className="text-black font-ibm text-sm font-medium">
                    {editData.frequency === 'monthly' || autopay.frequency === 'monthly' ? 'Ежемесячно' : 'Ежеквартально'}
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-gray-500 font-ibm text-xs mb-1">Следующий платёж</div>
                <div className="text-black font-ibm text-sm font-medium">
                  {formatDate(autopay.nextDate)}
                </div>
              </div>
            </div>

            {(editData.recipient || autopay.recipient) && (
              <>
                <div className="h-px bg-gray-200"></div>
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-gray-500 font-ibm text-xs mb-1">Получатель</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.recipient}
                        onChange={(e) => setEditData({...editData, recipient: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-100 border-0 rounded-xl text-black font-ibm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="ИНН, ЕЛС или реквизиты"
                      />
                    ) : (
                      <div className="text-black font-ibm text-sm font-medium">
                        {editData.recipient || autopay.recipient}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {isEditing && !editData.recipient && !autopay.recipient && (
              <>
                <div className="h-px bg-gray-200"></div>
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-gray-500 font-ibm text-xs mb-1">Получатель</div>
                    <input
                      type="text"
                      value={editData.recipient}
                      onChange={(e) => setEditData({...editData, recipient: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-100 border-0 rounded-xl text-black font-ibm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="ИНН, ЕЛС или реквизиты"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment Card Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-black font-ibm text-base font-semibold leading-[110%]">
              Карта для списания
            </div>
            {isAutopayEnabled && (
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-ibm text-xs font-medium">Автоплатеж активен</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Current Card */}
          {isAutopayEnabled ? (
            <div className="space-y-3">
              <div 
                className="p-4 rounded-xl border-2 border-gray-200 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors"
                onClick={() => setShowCardSelection(true)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div 
                    className="w-12 h-8 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: selectedCard?.color || '#0055BC' }}
                  ></div>
                  <div className="flex-1">
                    <div className="text-black font-ibm text-sm font-medium">
                      {selectedCard?.bankName || 'VBank'} ••••{selectedCard?.cardNumber || '5294'}
                    </div>
                    <div className="text-gray-500 font-ibm text-xs">
                      {selectedCard?.balance?.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} ₽
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCardSelection(true)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 rounded-xl text-gray-700 font-ibm text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Изменить карту
                </button>
                <button
                  onClick={handleToggleAutopay}
                  className="flex-1 py-2.5 px-4 bg-red-50 rounded-xl text-red-600 font-ibm text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Приостановить
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 text-center">
                <div className="text-gray-500 font-ibm text-sm mb-2">
                  Автоплатёж приостановлен
                </div>
                <button
                  onClick={handleToggleAutopay}
                  className="py-2.5 px-6 bg-[#844FD9] rounded-xl text-white font-ibm text-sm font-medium hover:opacity-90 transition-colors"
                >
                  Активировать автоплатёж
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Card Selection Modal */}
        {showCardSelection && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCardSelection(false)}
            ></div>
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[27px] max-h-[80vh] overflow-y-auto z-50">
              <div className="px-5 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-black font-ibm text-xl font-semibold">
                    Выберите карту
                  </div>
                  <button
                    onClick={() => setShowCardSelection(false)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="px-5 py-4 space-y-3">
                {userCards.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 font-ibm text-sm">
                    Нет доступных карт
                  </div>
                ) : (
                  userCards.map((card, index) => (
                    <div
                      key={card.id || `card-${index}`}
                      onClick={() => handleCardSelect(card.id)}
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
          </>
        )}

        {/* Payment History Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
          <div className="text-black font-ibm text-base font-semibold leading-[110%] mb-4">
            История платежей
          </div>
          <div className="space-y-3">
            {/* Пример истории - можно загружать из API */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <div className="text-black font-ibm text-sm font-medium">
                  {formatDate(autopay.nextDate)}
                </div>
                <div className="text-gray-500 font-ibm text-xs">
                  Запланирован
                </div>
              </div>
              <div className="text-black font-ibm text-sm font-medium">
                {autopay.amount.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <div className="text-center text-gray-500 font-ibm text-xs py-2">
              Пока нет выполненных платежей
            </div>
          </div>
        </div>
      </div>

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

export default AutopayDetailsPage;
