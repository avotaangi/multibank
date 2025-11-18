import { create } from 'zustand';

const useTestCardsStore = create((set, get) => ({
  testCards: [],
  
  addTestCard: (card) => {
    set((state) => ({
      testCards: [...state.testCards, card]
    }));
  },
  
  removeTestCard: (cardId) => {
    set((state) => ({
      testCards: state.testCards.filter(card => card.id !== cardId)
    }));
  },
  
  getAllCards: () => {
    const { testCards } = get();
    return testCards;
  },
  
  clearTestCards: () => {
    set({ testCards: [] });
  }
}));

export default useTestCardsStore;
