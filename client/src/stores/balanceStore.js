import { create } from 'zustand';

const useBalanceStore = create((set, get) => ({
  bankBalances: {
    vtb: 10000,
    tbank: 20000,
    alfa: 30000
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
      
      console.log('🔄 Transfer Money:', {
        fromBankId,
        toBankId,
        amount,
        beforeBalances: { ...state.bankBalances }
      });
      
      // Списываем с карты отправителя
      if (fromBankId !== 'other') {
        newBalances[fromBankId] -= amount;
        console.log(`✅ Списали с ${fromBankId}: ${amount}, новый баланс: ${newBalances[fromBankId]}`);
      }
      
      // Зачисляем на карту получателя только если это карта пользователя
      if (toBankId !== 'other' && newBalances.hasOwnProperty(toBankId)) {
        newBalances[toBankId] += amount;
        console.log(`✅ Зачислили на ${toBankId}: ${amount}, новый баланс: ${newBalances[toBankId]}`);
      } else if (toBankId !== 'other') {
        console.log(`❌ Карта ${toBankId} не найдена в балансах пользователя`);
      } else {
        console.log(`❌ Внешний перевод - деньги не зачисляются`);
      }
      
      console.log('After transfer balances:', newBalances);
      
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
        vtb: 10000,
        tbank: 20000,
        alfa: 30000
      }
    });
  }
}));

export default useBalanceStore;
