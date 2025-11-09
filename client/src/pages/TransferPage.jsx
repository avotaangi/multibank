// src/pages/TransferPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { usePageInfo } from '../hooks/usePageInfo';
import InfoPanel from '../components/InfoPanel';
import { Info } from 'lucide-react';
import useBalanceStore from '../stores/balanceStore';
import useTransfersStore from '../stores/transfersStore';
import { useTelegramUser } from '../hooks/useTelegramUser';

const API_BASE = import.meta.env.VITE_API_BASE; // 🔗 твой FastAPI endpoint
const CLIENT_ID_ID = import.meta.env.VITE_CLIENT_ID_ID; // 👤 текущий пользователь

const TransferPage = () => {
  const pageInfo = usePageInfo();
  const telegramUser = useTelegramUser();
  const { addTransfer } = useTransfersStore();
  const { bankBalances, transferMoney } = useBalanceStore();

  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [selectedFromBank, setSelectedFromBank] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [selectedToBank, setSelectedToBank] = useState(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [showRecipientList, setShowRecipientList] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 🎨 Стили банков
  const bankStyles = {
    vbank: { color: '#0055BC', logo: 'VBank' },
    abank: { color: '#EF3124', logo: 'ABank' },
    sbank: { color: '#00A859', logo: 'SBank' },
  };

  // 📊 Формат баланса
  const fmtBalance = (val) =>
    `${Number(val ?? 0).toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ₽`;

  // 💳 Карты текущего пользователя
  const userCards = Object.entries(bankBalances || {}).map(([bankId, balance]) => {
    const style = bankStyles[bankId] || { color: '#777', logo: bankId.toUpperCase() };
    return {
      id: bankId,
      name: bankId.toUpperCase(),
      logo: style.logo,
      color: style.color,
      balance: fmtBalance(balance),
    };
  });

  // 👥 Получение списка пользователей
  const openRecipientPicker = async () => {
    setShowRecipientList(true);
    if (loadingUsers || usersList.length > 0) return;
    try {
      setLoadingUsers(true);
      const res = await axios.get(`${API_BASE}/get_global_users`);
      const global_users = res.data || {};
      const usersArr = [
        {
          id: 'self',
          name: telegramUser.displayName || '@me',
          bank_names: Object.keys(bankBalances || {}),
        },
        ...Object.entries(global_users)
          .filter(([uid]) => uid !== CLIENT_ID_ID)
          .map(([uid, v]) => ({
            id: uid,
            name: `@${uid}`,
            bank_names: v.bank_names || [],
          })),
      ];
      setUsersList(usersArr);
    } catch (err) {
      console.error(err);
      setFormError('Ошибка при получении списка пользователей');
    } finally {
      setLoadingUsers(false);
    }
  };

  // 🧩 Выбор получателя
  const handleRecipientSelect = (recipient) => {
    setSelectedRecipient(recipient);
    setShowRecipientList(false);
    setSelectedToBank(null);
  };

  // 💸 Проверка и отправка перевода
  const handleTransfer = async () => {
    setFormError('');

    if (!selectedFromBank) return setFormError('Выберите банк, с которого хотите перевести');
    if (!selectedRecipient) return setFormError('Выберите получателя');
    if (!selectedToBank) return setFormError('Выберите банк получателя');

    const transferAmount = Number(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) return setFormError('Введите корректную сумму');

    const available = bankBalances?.[selectedFromBank] ?? 0;
    if (transferAmount > available) return setFormError('Недостаточно средств');

    if (selectedRecipient.id === 'self' && selectedFromBank === selectedToBank)
      return setFormError('Нельзя перевести на тот же банк');

    try {
      setSubmitLoading(true);
      await axios.post(`${API_BASE}/payments/make_transfer/`, {
        user_id_id: CLIENT_ID_ID,
        to_user_id_id: selectedRecipient.id === 'self' ? CLIENT_ID_ID : selectedRecipient.id,
        from_bank: selectedFromBank,
        to_bank: selectedToBank,
        amount: transferAmount,
      });

      transferMoney(selectedFromBank, selectedToBank, transferAmount);
      addTransfer({
        fromBank: selectedFromBank,
        toBank: selectedToBank,
        amount: transferAmount,
        recipient: selectedRecipient.name,
        message,
      });

      setShowSuccessModal(true);
      setAmount('');
      setMessage('');
    } catch (err) {
      console.error(err);
      setFormError('Ошибка при выполнении перевода');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white w-full pb-20">
      {/* Header */}
      <div className="relative z-20 px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="w-10"></div>
          <div className="text-black text-2xl font-medium flex-1 text-center">Между банками</div>
          <button
            onClick={() => setShowInfoPanel(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* From bank */}
      <div className="px-4">
        <div className="text-black text-sm font-medium mb-3">Банк, из которого хотите перевести</div>
        <div className="flex space-x-2 mb-4">
          {userCards.map((bank) => (
            <div
              key={bank.id}
              className={`w-[95px] h-[100px] rounded-[18px] cursor-pointer flex flex-col items-center justify-center p-3 transition-all ${
                selectedFromBank === bank.id ? 'ring-2 ring-red-500 shadow-lg' : ''
              }`}
              style={{ backgroundColor: bank.color }}
              onClick={() => setSelectedFromBank(bank.id)}
            >
              <div className="text-white font-bold text-lg mb-1">{bank.logo}</div>
              <div className="text-white text-sm">{telegramUser.shortName}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 💰 Баланс выбранного банка */}
      {selectedFromBank && (
        <div className="px-4 mb-4">
          <div className="text-black text-sm font-medium mb-1">
            Доступно на карте:
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-200 rounded-[20px]">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: userCards.find(b => b.id === selectedFromBank)?.color,
                }}
              >
                <div className="text-white text-sm font-bold">
                  {userCards.find(b => b.id === selectedFromBank)?.logo}
                </div>
              </div>
              <div>
                <div className="text-black text-sm font-medium">
                  {userCards.find(b => b.id === selectedFromBank)?.name}
                </div>
              </div>
            </div>
            <div className="text-black text-lg font-bold">
              {userCards.find(b => b.id === selectedFromBank)?.balance}
            </div>
          </div>
        </div>
      )}


      {/* Recipient */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-black text-sm font-medium">Получатель</div>
          <button
            onClick={openRecipientPicker}
            className="text-xs text-black hover:text-gray-600 transition-colors"
          >
            {selectedRecipient ? 'Изменить получателя' : 'Выбрать получателя'} →
          </button>
        </div>

        {selectedRecipient && (
          <div className="mb-3 p-3 bg-gray-100 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{selectedRecipient.name}</div>
            </div>
            <button onClick={() => setSelectedRecipient(null)} className="text-gray-500">
              ✕
            </button>
          </div>
        )}

        {/* Banks of recipient */}
        <div className="flex space-x-2 mb-4">
          {selectedRecipient &&
            selectedRecipient.bank_names
              .filter((b) => !(selectedRecipient.id === 'self' && b === selectedFromBank))
              .map((bank) => {
                const style = bankStyles[bank] || { color: '#777', logo: bank.toUpperCase() };
                return (
                  <div
                    key={bank}
                    className={`w-[95px] h-[100px] rounded-[18px] cursor-pointer flex flex-col items-center justify-center p-3 transition-all ${
                      selectedToBank === bank ? 'ring-2 ring-red-500 shadow-lg' : ''
                    }`}
                    style={{ backgroundColor: style.color }}
                    onClick={() => setSelectedToBank(bank)}
                  >
                    <div className="text-white font-bold text-lg mb-1">{style.logo}</div>
                    <div className="text-white text-sm">{bank.toUpperCase()}</div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Amount + message */}
      <div className="px-4 space-y-3">
        <input
          type="number"
          placeholder="Сумма"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full h-10 bg-gray-200 rounded-[27px] px-4 text-gray-700 text-sm"
        />
        <input
          type="text"
          placeholder="Сообщение получателю"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-10 bg-gray-200 rounded-[27px] px-4 text-gray-700 text-sm"
        />
      </div>

      {/* Ошибки */}
      {formError && (
        <div className="px-4 py-2 text-red-500 text-center text-sm">{formError}</div>
      )}

      {/* Кнопка перевода */}
      <div className="px-4 mt-3">
        <button
          onClick={handleTransfer}
          disabled={submitLoading}
          className={`w-full h-10 bg-red-500 text-white rounded-[25px] font-medium ${
            submitLoading ? 'opacity-60' : 'hover:bg-red-600'
          }`}
        >
          {submitLoading ? 'Перевод...' : 'Перевести'}
        </button>
      </div>

      {/* Модалка выбора получателя */}
      {showRecipientList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-4 mx-4 w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Выберите получателя</h3>
              <button
                onClick={() => setShowRecipientList(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            {loadingUsers ? (
              <div className="text-center text-gray-500 py-6">Загрузка...</div>
            ) : (
              usersList.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleRecipientSelect(u)}
                  className="w-full text-left px-3 py-3 mb-1 rounded-xl hover:bg-gray-200"
                >
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">
                    Банки: {u.bank_names.join(', ') || 'Нет подключённых'}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Модалка успеха */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 mx-4 text-center">
            <div className="text-green-600 text-4xl mb-2">✔</div>
            <h3 className="text-lg font-semibold mb-2">Перевод выполнен</h3>
            <p className="text-gray-600 mb-4">Средства успешно переведены</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-[20px]"
            >
              Закрыть
            </button>
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

export default TransferPage;
