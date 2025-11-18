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
  },
  
  // Получить все переводы
  getAllTransfers: () => {
    return get().recentTransfers;
  },
  
  // Получить последний перевод
  getLastTransfer: () => {
    const transfers = get().recentTransfers;
    return transfers.length > 0 ? transfers[0] : null;
  }
}));

export default useTransfersStore;
