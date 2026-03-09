import { create } from 'zustand';
import type { ProductWithDetails } from '@/services/product/getProducts';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface InitializeProductsParams {
  categoryId?: string;
  categoryName?: string;
  page?: number;
  limit?: number;
  categoryPage?: number;
  categoryLimit?: number;
  search?: string;
  inStockOnly?: boolean;
  sort?: string;
}

const ALLOWED_SORTS = new Set(["featured", "name", "price-low", "price-high"]);

interface UserProductsState {
  searchQuery: string;
  page: number;
  limit: number;
  categoryPage: number;
  categoryLimit: number;
  initializeSearchQuery: (query: string) => void;
  initialize: (params?: InitializeProductsParams) => void;
  setSearchQuery: (query: string) => void;
  selectedCategoryId: string | null;
  selectedCategoryName: string;
  setSelectedCategoryId: (categoryId: string | null) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  showInStock: boolean;
  setShowInStock: (show: boolean) => void;
  setCategoryPage: (page: number) => void;
  setCategoryLimit: (limit: number) => void;
  products: ProductWithDetails[];
  pagination: PaginationMeta;
  hydrateFromServer: (payload: {
    params?: InitializeProductsParams;
    products: ProductWithDetails[];
    pagination: PaginationMeta;
  }) => void;
  reset: () => void;
}

const initialState = {
  searchQuery: '',
  page: 1,
  limit: 20,
  categoryPage: 1,
  categoryLimit: 8,
  selectedCategoryId: 'all',
  selectedCategoryName: 'All Categories',
  sortBy: "featured",
  showInStock: false,
  products: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
};

export const useUserProductsStore = create<UserProductsState>((set) => ({
  ...initialState,
  initializeSearchQuery: (query: string) => {
    if (!query) return;
    set((state) => (state.searchQuery ? state : { searchQuery: query }));
  },
  initialize: (params = {}) => {
    const sortBy = params.sort && ALLOWED_SORTS.has(params.sort)
      ? params.sort
      : initialState.sortBy;

    set({
      searchQuery: params.search ?? initialState.searchQuery,
      selectedCategoryId: params.categoryId ?? initialState.selectedCategoryId,
      selectedCategoryName: params.categoryName ?? initialState.selectedCategoryName,
      page: params.page ?? initialState.page,
      limit: params.limit ?? initialState.limit,
      categoryPage: params.categoryPage ?? initialState.categoryPage,
      categoryLimit: params.categoryLimit ?? initialState.categoryLimit,
      showInStock: params.inStockOnly ?? initialState.showInStock,
      sortBy,
    });
  },
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCategoryId: (categoryId: string | null) => set({ selectedCategoryId: categoryId }),
  setSortBy: (sortBy: string) => set({ sortBy }),
  setShowInStock: (show: boolean) => set({ showInStock: show }),
  setCategoryPage: (page: number) => set({ categoryPage: page }),
  setCategoryLimit: (limit: number) => set({ categoryLimit: limit }),
  hydrateFromServer: ({ params = {}, products, pagination }) => {
    const sortBy = params.sort && ALLOWED_SORTS.has(params.sort)
      ? params.sort
      : initialState.sortBy;

    set({
      searchQuery: params.search ?? initialState.searchQuery,
      selectedCategoryId: params.categoryId ?? initialState.selectedCategoryId,
      selectedCategoryName: params.categoryName ?? initialState.selectedCategoryName,
      page: params.page ?? initialState.page,
      limit: params.limit ?? initialState.limit,
      categoryPage: params.categoryPage ?? initialState.categoryPage,
      categoryLimit: params.categoryLimit ?? initialState.categoryLimit,
      showInStock: params.inStockOnly ?? initialState.showInStock,
      sortBy,
      products,
      pagination,
    });
  },
  reset: () => set(initialState),
}));
