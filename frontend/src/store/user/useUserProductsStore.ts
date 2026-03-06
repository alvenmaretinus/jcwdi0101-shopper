import { create } from 'zustand';

interface UserProductsState {
  searchQuery: string;
  initializeSearchQuery: (query: string) => void;
  setSearchQuery: (query: string) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (categoryId: string | null) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  showInStock: boolean;
  setShowInStock: (show: boolean) => void;
  reset: () => void;
}

const initialState = {
  searchQuery: '',
  selectedCategoryId: 'all',
  sortBy: "featured",
  showInStock: false,
};

export const useUserProductsStore = create<UserProductsState>((set) => ({
  ...initialState,

  initializeSearchQuery: (query: string) => {
    if (!query) {
      return;
    }
    set((state) => (state.searchQuery ? state : { searchQuery: query }));
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setSelectedCategoryId: (categoryId: string | null) => {
    set({ selectedCategoryId: categoryId });
  },

  setSortBy: (sortBy: string) => {
    set({ sortBy });
  },

  setShowInStock: (show: boolean) => {
    set({ showInStock: show });
  },

  reset: () => set(initialState),
}));
