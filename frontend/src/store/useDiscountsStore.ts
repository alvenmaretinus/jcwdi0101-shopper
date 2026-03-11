import { create } from 'zustand';
import { 
  getDiscounts, 
  createDiscount, 
  updateDiscount, 
  deleteDiscount,
  CreateDiscountInput,
} from '@/services/discount';
import type { Discount } from '@/types/Discount';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface DiscountsState {
  // Data
  discounts: Discount[];
  
  // UI State
  isLoading: boolean;
  isSubmitting: boolean;
  isDialogOpen: boolean;
  editingDiscount: Discount | null;
  
  // Filters
  searchQuery: string;
  typeFilter: string;
  currentPage: number;
  pagination: PaginationMeta;
  
  // Actions
  fetchDiscounts: (options?: { 
    searchQuery?: string;
    typeFilter?: string;
    page?: number;
  }) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setTypeFilter: (type: string) => void;
  setCurrentPage: (page: number) => void;
  openCreateDialog: () => void;
  openEditDialog: (discount: Discount) => void;
  closeDialog: () => void;
  createDiscount: (data: CreateDiscountInput) => Promise<void>;
  updateDiscount: (id: string, data: CreateDiscountInput) => Promise<void>;
  deleteDiscount: (id: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  discounts: [],
  isLoading: false,
  isSubmitting: false,
  isDialogOpen: false,
  editingDiscount: null,
  searchQuery: '',
  typeFilter: 'all',
  currentPage: 1,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
};

/**
 * Discounts store - manages discount listing, filtering, and CRUD operations
 */
export const useDiscountsStore = create<DiscountsState>((set, get) => ({
  ...initialState,

  fetchDiscounts: async (options) => {
    const state = get();
    const searchQuery = options?.searchQuery ?? state.searchQuery;
    const typeFilter = options?.typeFilter ?? state.typeFilter;
    const page = options?.page ?? state.currentPage;

    set({ isLoading: true });
    try {
      const response = await getDiscounts({
        name: searchQuery || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        page,
        limit: 20,
      });
      set({ 
        discounts: response.data,
        pagination: response.meta,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
      set({ discounts: [], isLoading: false });
      throw error;
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
    get().fetchDiscounts({ searchQuery: query, page: 1 });
  },

  setTypeFilter: (type: string) => {
    set({ typeFilter: type, currentPage: 1 });
    get().fetchDiscounts({ typeFilter: type, page: 1 });
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().fetchDiscounts({ page });
  },

  openCreateDialog: () => {
    set({ isDialogOpen: true, editingDiscount: null });
  },

  openEditDialog: (discount: Discount) => {
    set({ isDialogOpen: true, editingDiscount: discount });
  },

  closeDialog: () => {
    set({ isDialogOpen: false, editingDiscount: null });
  },

  createDiscount: async (data: CreateDiscountInput) => {
    set({ isSubmitting: true });
    try {
      await createDiscount(data);
      set({ isSubmitting: false, isDialogOpen: false });
      await get().fetchDiscounts();
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  updateDiscount: async (id: string, data: CreateDiscountInput) => {
    set({ isSubmitting: true });
    try {
      await updateDiscount({ id, ...data });
      set({ isSubmitting: false, isDialogOpen: false, editingDiscount: null });
      await get().fetchDiscounts();
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  deleteDiscount: async (id: string) => {
    try {
      await deleteDiscount(id);
      await get().fetchDiscounts();
    } catch (error) {
      console.error('Failed to delete discount:', error);
      throw error;
    }
  },

  reset: () => set(initialState),
}));
