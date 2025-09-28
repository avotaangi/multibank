import { create } from 'zustand';

const useTransfersStore = create((set, get) => ({
  recentTransfers: [],

  // Добавить новый перевод
  addTransfer: (transfer) => {
    const newTransfer = {
      id: Date.now(),
      timestamp: new Date(),
      ...transfer
    };
    
    set((state) => ({
      recentTransfers: [newTransfer, ...state.recentTransfers].slice(0, 10) // Храним только 10 последних
    }));
    
    console.log('Transfer added:', newTransfer);
  },

  // Получить все переводы
  getAllTransfers: () => {
    return get().recentTransfers;
  },

  // Очистить все переводы
  clearTransfers: () => {
    set({ recentTransfers: [] });
  }
}));

export default useTransfersStore;
