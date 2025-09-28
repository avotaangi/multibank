import { create } from 'zustand';

const useBalanceStore = create((set, get) => ({
  bankBalances: {
    vtb: 2876.87,
    tbank: 4983.43,
    alfa: 10544.40
  },

  // Обновить баланс карты
  updateBalance: (bankId, amount, operation = 'subtract') => {
    set((state) => {
      const newBalances = {
        ...state.bankBalances,
        [bankId]: operation === 'subtract' 
          ? state.bankBalances[bankId] - amount 
          : state.bankBalances[bankId] + amount
      };
      
      console.log('updateBalance:', {
        bankId,
        amount,
        operation,
        beforeBalance: state.bankBalances[bankId],
        afterBalance: newBalances[bankId],
        newBalances
      });
      
      return { bankBalances: newBalances };
    });
  },

  // Перевести деньги между картами
  transferMoney: (fromBankId, toBankId, amount) => {
    set((state) => {
      const newBalances = { ...state.bankBalances };
      
      console.log('Transfer Money:', {
        fromBankId,
        toBankId,
        amount,
        beforeBalances: { ...state.bankBalances }
      });
      
      // Списываем с карты отправителя
      if (fromBankId !== 'other' && newBalances.hasOwnProperty(fromBankId)) {
        newBalances[fromBankId] -= amount;
        console.log(`Списали с ${fromBankId}: ${amount}, новый баланс: ${newBalances[fromBankId]}`);
      }
      
      // Зачисляем на карту получателя (только если это карта пользователя)
      if (toBankId !== 'other' && newBalances.hasOwnProperty(toBankId)) {
        newBalances[toBankId] += amount;
        console.log(`✅ Зачислили на ${toBankId}: ${amount}, новый баланс: ${newBalances[toBankId]}`);
        console.log(`✅ Это внутренний перевод - карта пользователя`);
      } else if (toBankId !== 'other') {
        console.log(`❌ Карта получателя ${toBankId} не найдена в балансах пользователя - это внешний перевод`);
        console.log(`❌ Деньги НЕ зачисляются на внешнюю карту (например, Евгений Б.)`);
      }
      
      console.log('After transfer balances:', newBalances);
      
      // Пересчитываем общий бюджет после изменения балансов
      const newTotal = Object.values(newBalances).reduce((sum, balance) => sum + balance, 0);
      const oldTotal = Object.values(state.bankBalances).reduce((sum, balance) => sum + balance, 0);
      
      console.log('💰 Budget calculation:');
      console.log(`   Old total: ${oldTotal.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`);
      console.log(`   New total: ${newTotal.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`);
      console.log(`   Difference: ${(newTotal - oldTotal).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`);
      
      if (toBankId !== 'other' && !newBalances.hasOwnProperty(toBankId)) {
        console.log('📤 External transfer - money sent outside, total budget decreased');
      } else if (toBankId !== 'other' && newBalances.hasOwnProperty(toBankId)) {
        console.log('🔄 Internal transfer - money moved between user cards, total budget unchanged');
      }
      
      console.log('✅ Общий бюджет будет пересчитан на всех страницах!');
      console.log('🔄 Zustand уведомит DashboardPage и CardAnalyticsPage об изменениях');
      
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

  // Получить общий бюджет (сумма всех карт)
  getTotalBudget: () => {
    const balances = get().bankBalances;
    const total = Object.values(balances).reduce((sum, balance) => sum + balance, 0);
    console.log('getTotalBudget - balances:', balances, 'total:', total);
    return total;
  },

  // Получить отформатированный общий бюджет
  getFormattedTotalBudget: () => {
    const total = get().getTotalBudget();
    const formatted = `${total.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;
    console.log('🔄 getFormattedTotalBudget - total:', total, 'formatted:', formatted);
    console.log('📊 Общий бюджет пересчитан и обновлен на всех страницах!');
    return formatted;
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
