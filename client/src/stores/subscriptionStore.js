import { create } from "zustand";

// Store для управления подпиской VBank Plus
const useSubscriptionStore = create((set, get) => ({
  // Статус подписки
  hasSubscription: false,
  subscriptionType: null, // 'trial' | 'paid' | null
  trialEndDate: null,
  
  // Установить подписку
  setSubscription: (type, endDate = null) => {
    set({
      hasSubscription: true,
      subscriptionType: type,
      trialEndDate: endDate
    });
  },
  
  // Отменить подписку
  cancelSubscription: () => {
    set({
      hasSubscription: false,
      subscriptionType: null,
      trialEndDate: null
    });
  },
  
  // Проверить, есть ли активная подписка
  isSubscribed: () => {
    const state = get();
    if (!state.hasSubscription) return false;
    
    // Если есть дата окончания пробного периода, проверяем её
    if (state.trialEndDate) {
      const endDate = new Date(state.trialEndDate);
      const now = new Date();
      if (now > endDate) {
        // Пробный период истек
        set({
          hasSubscription: false,
          subscriptionType: null,
          trialEndDate: null
        });
        return false;
      }
    }
    
    return true;
  },
  
  // Получить информацию о подписке
  getSubscriptionInfo: () => {
    const state = get();
    return {
      hasSubscription: state.hasSubscription,
      type: state.subscriptionType,
      trialEndDate: state.trialEndDate
    };
  }
}));

export default useSubscriptionStore;

