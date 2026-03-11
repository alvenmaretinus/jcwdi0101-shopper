import { create } from 'zustand';
import { apiFetch, HttpMethod } from '@/lib/apiFetch';

interface SalesReportEntity {
  number: number;
  completion_date: string;
  order_id: string;
  product_name: string;
  category_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
  voucher_codes: string[];
  discount_names: string[];
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SalesReportState {
  // Data
  allSalesRecords: SalesReportEntity[];
  
  // Store & Category Selection
  selectedStoreId: string;
  selectedStoreName: string;
  selectedCategoryId: string;
  selectedCategoryName: string;
  
  // Date Filters
  selectedMonth: string;
  selectedYear: string;
  
  // Search
  productSearch: string;
  
  // Pagination
  currentPage: number;
  pagination: PaginationMeta;
  
  // Actions
  fetchSalesRecords: () => Promise<void>;
  setStoreSelection: (storeId: string, storeName: string) => void;
  setCategorySelection: (categoryId: string, categoryName: string) => void;
  setMonth: (month: string) => void;
  setYear: (year: string) => void;
  setProductSearch: (search: string) => void;
  setCurrentPage: (page: number) => void;
  reset: () => void;
}

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

const initialState = {
  allSalesRecords: [],
  selectedStoreId: 'all',
  selectedStoreName: 'All Stores',
  selectedCategoryId: '',
  selectedCategoryName: '',
  selectedMonth: String(currentMonth),
  selectedYear: String(currentYear),
  productSearch: '',
  currentPage: 1,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
};

/**
 * Sales Report store - manages sales records filtering and pagination
 */
export const useSalesReportStore = create<SalesReportState>((set, get) => ({
  ...initialState,

  fetchSalesRecords: async () => {
    const state = get();
    const limit = 20;
    const skip = (state.currentPage - 1) * limit;
    
    let query = `skip=${skip}&take=${limit}`;
    if (state.selectedCategoryId !== '') {
      query += `&categoryId=${state.selectedCategoryId}`;
    }
    if (state.selectedStoreId !== 'all') {
      query += `&storeId=${state.selectedStoreId}`;
    }
    if (state.productSearch.trim() !== '') {
      query += `&productName=${encodeURIComponent(state.productSearch.trim())}`;
    }
    query += `&monthAndYear=${state.selectedYear}-${String(Number(state.selectedMonth) + 1).padStart(2, '0')}`;

    try {
      const response = await apiFetch<
        | { data?: SalesReportEntity[]; count?: number; page?: number }
        | SalesReportEntity[]
      >(`/sales-report?${query}`, { method: HttpMethod.GET });

      if (response && typeof response === 'object' && 'data' in response) {
        const total = response.count || 0;
        const totalPages = Math.ceil(total / limit);
        set({
          allSalesRecords: response.data || [],
          pagination: {
            page: response.page || 1,
            limit,
            total,
            totalPages,
          },
        });
      } else {
        set({ 
          allSalesRecords: Array.isArray(response) ? response : [] 
        });
      }
    } catch (error) {
      console.error('Failed to fetch sales records:', error);
      set({ allSalesRecords: [] });
    }
  },

  setStoreSelection: (storeId: string, storeName: string) => {
    set({ selectedStoreId: storeId, selectedStoreName: storeName, currentPage: 1 });
    get().fetchSalesRecords();
  },

  setCategorySelection: (categoryId: string, categoryName: string) => {
    set({ selectedCategoryId: categoryId, selectedCategoryName: categoryName, currentPage: 1 });
    get().fetchSalesRecords();
  },

  setMonth: (month: string) => {
    set({ selectedMonth: month, currentPage: 1 });
    get().fetchSalesRecords();
  },

  setYear: (year: string) => {
    set({ selectedYear: year, currentPage: 1 });
    get().fetchSalesRecords();
  },

  setProductSearch: (search: string) => {
    set({ productSearch: search, currentPage: 1 });
    get().fetchSalesRecords();
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().fetchSalesRecords();
  },

  reset: () => set(initialState),
}));
