import { create } from "zustand";

const useBalanceStore = create((set, get) => ({
  // 🏦 Локальный стартовый контур, синхронизирован с backend seed
  bankBalances: {
    vbank: 185430.55,
    abank: 92340.10,
    sbank: 148220.87,
    vbank_savings: 264500.0,
  },
  
  // 💰 Виртуальная карта VBank (накопительный счет) - синхронизируется со страницей планирования
  virtualCardBalance: 264500.0,

  // 🔹 Установить баланс одного банка
  setBalance: (bankId, amount) => {
    set((state) => ({
      bankBalances: {
        ...state.bankBalances,
        [bankId]: amount,
      },
    }));
  },

  // 🔹 Массово установить все балансы (используется при загрузке с API)
  setAllBalances: (balances) => {
    set({ bankBalances: balances });
  },

  // 🔹 Обновить баланс (операция add/subtract)
  updateBalance: (bankId, amount, operation = "set") => {
    set((state) => {
      const current = state.bankBalances[bankId] || 0;
      const newAmount =
        operation === "subtract"
          ? current - amount
          : operation === "add"
          ? current + amount
          : amount;
      return {
        bankBalances: { ...state.bankBalances, [bankId]: newAmount },
      };
    });
  },

  // 🔹 Перевести деньги между картами
  transferMoney: (fromBankId, toBankId, amount) => {
    set((state) => {
      const balances = { ...state.bankBalances };

      if (balances[fromBankId] !== undefined) {
        balances[fromBankId] = Math.max(0, balances[fromBankId] - amount);
      }
      if (balances[toBankId] !== undefined) {
        balances[toBankId] = balances[toBankId] + amount;
      }

      console.log("💸 Transfer completed:", {
        fromBankId,
        toBankId,
        amount,
        newBalances: balances,
      });

      return { bankBalances: balances };
    });
  },

  // 🔹 Получить баланс одной карты
  getBalance: (bankId) => {
    return get().bankBalances[bankId] || 0;
  },

  // 🔹 Получить отформатированный баланс
  getFormattedBalance: (bankId) => {
    const balance = get().bankBalances?.[bankId] ?? 0;
    return `${Number(balance).toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ₽`;
  },

  // 🔹 Получить сумму всех балансов (для "Общий бюджет")
  getTotalBalance: () => {
    const balances = Object.values(get().bankBalances);
    const total = balances.reduce((sum, b) => sum + (b || 0), 0);
    return `${total.toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ₽`;
  },
  
  // 🔹 Установить баланс виртуальной карты VBank
  setVirtualCardBalance: (amount) => {
    set({ virtualCardBalance: amount });
  },
  
  // 🔹 Обновить баланс виртуальной карты VBank
  updateVirtualCardBalance: (amount, operation = "set") => {
    set((state) => {
      const current = state.virtualCardBalance || 0;
      const newAmount =
        operation === "subtract"
          ? current - amount
          : operation === "add"
          ? current + amount
          : amount;
      return { virtualCardBalance: newAmount };
    });
  },
  
  // 🔹 Получить баланс виртуальной карты VBank
  getVirtualCardBalance: () => {
    return get().virtualCardBalance || 0;
  },
}));

export default useBalanceStore;
