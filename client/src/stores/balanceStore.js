import { create } from 'zustand';

const useBalanceStore = create((set, get) => ({
  bankBalances: {
    vtb: 2876.87,
    tbank: 4983.43,
    alfa: 10544.40
  },

  // Обновить баланс карты
  updateBalance: (bankId, amount, operation = 'subtract') => {
    set((state) => ({
      bankBalances: {
        ...state.bankBalances,
        [bankId]: operation === 'subtract' 
          ? state.bankBalances[bankId] - amount 
          : state.bankBalances[bankId] + amount
      }
    }));
  },

  // Перевести деньги между картами
  transferMoney: (fromBankId, toBankId, amount) => {
    set((state) => {
      const newBalances = { ...state.bankBalances };
      
      // Списываем с карты отправителя
      if (fromBankId !== 'other') {
        newBalances[fromBankId] -= amount;
      }
      
      // Зачисляем на карту получателя
      if (toBankId !== 'other') {
        newBalances[toBankId] += amount;
      }
      
      return { bankBalances: newBalances };
    });
  },

  // Получить баланс карты
  getBalance: (bankId) => {
    return get().bankBalances[bankId] || 0;
  },

  // Получить отформатированный баланс
  getFormattedBalance: (bankId) => {
    const balance = get().bankBalances[bankId] || 0;
    return `${balance.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;
  },

  // Сбросить балансы к начальным значениям
  resetBalances: () => {
    set({
      bankBalances: {
        vtb: 2876.87,
        tbank: 4983.43,
        alfa: 10544.40
      }
    });
  }
}));

export default useBalanceStore;
