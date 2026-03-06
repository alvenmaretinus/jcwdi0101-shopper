import { create } from 'zustand';
import { apiFetch, ApiInit, HttpMethod } from '@/lib/apiFetch';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AdminProductsState {
  products: any[];
  categories: any[];
  loading: boolean;
  isDialogOpen: boolean;
  editingProduct: any | null;
  searchQuery: string;
  categoryFilter: string;
  currentPage: number;
  pagination: PaginationMeta;
  fetchProducts: (options?: {
    categoryFilter?: string;
    searchQuery?: string;
    page?: number;
  }) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (categoryId: string) => void;
  setCurrentPage: (page: number) => void;
  openCreateDialog: () => void;
  openEditDialog: (product: any) => void;
  closeDialog: () => void;
  deleteProduct: (id: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  products: [],
  categories: [],
  loading: false,
  isDialogOpen: false,
  editingProduct: null,
  searchQuery: '',
  categoryFilter: 'all',
  currentPage: 1,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
};

export const useAdminProductsStore = create<AdminProductsState>((set, get) => ({
  ...initialState,

  fetchProducts: async (options) => {
    const state = get();
    const categoryFilter = options?.categoryFilter ?? state.categoryFilter;
    const searchQuery = options?.searchQuery ?? state.searchQuery;
    const page = options?.page ?? state.currentPage;

    set({ loading: true });
    try {
      const apiInit: ApiInit = { method: HttpMethod.GET };

      const filterStrings = ['withStock=true', `page=${page}`, 'limit=20'];
      if (categoryFilter !== undefined && categoryFilter !== 'all') {
        filterStrings.push(`categoryId=${categoryFilter}`);
      }
      if (searchQuery !== undefined && searchQuery.trim() !== '') {
        filterStrings.push(`name=${searchQuery}`);
      }

      const filterQuery = filterStrings.length > 0 ? `?${filterStrings.join('&')}` : '';
      const response = await apiFetch<any>(`/product${filterQuery}`, apiInit);

      if (response && 'data' in response && 'meta' in response) {
        set({
          products: response.data,
          pagination: response.meta,
          loading: false,
        });
      } else {
        set({
          products: Array.isArray(response) ? response : [],
          loading: false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      set({ products: [], loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const apiInit: ApiInit = { method: HttpMethod.GET };
      const data = await apiFetch<any>(`/product-category?page=1&limit=100`, apiInit);
      const categoriesArray = Array.isArray(data) ? data : data?.data || [];
      set({ categories: categoriesArray });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      set({ categories: [] });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
    get().fetchProducts({ searchQuery: query, page: 1 });
  },

  setCategoryFilter: (categoryId: string) => {
    set({ categoryFilter: categoryId, currentPage: 1 });
    get().fetchProducts({ categoryFilter: categoryId, page: 1 });
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().fetchProducts({ page });
  },

  openCreateDialog: () => {
    set({ isDialogOpen: true, editingProduct: null });
  },

  openEditDialog: (product: any) => {
    set({ isDialogOpen: true, editingProduct: product });
  },

  closeDialog: () => {
    set({ isDialogOpen: false, editingProduct: null });
  },

  deleteProduct: async (id: string) => {
    try {
      const apiInit: ApiInit = { method: HttpMethod.DELETE };
      await apiFetch(`/product/${id}`, apiInit);
      await get().fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  },

  reset: () => set(initialState),
}));
