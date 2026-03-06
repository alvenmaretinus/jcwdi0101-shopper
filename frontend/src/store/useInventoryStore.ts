import { create } from 'zustand';
import { apiFetch, ApiInit, HttpMethod } from '@/lib/apiFetch';
import { getStores } from '@/services/store/getStores';
import { Product } from '@/types/Product';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface InventoryState {
  // Data
  stockRecords: Product[];
  stores: any[];
  productsForDropdown: Product[];
  
  // Store Selection
  selectedStoreId: string;
  selectedStoreName: string;
  
  // UI State
  loading: boolean;
  isAddDialogOpen: boolean;
  isStoreFilterModalOpen: boolean;
  isProductModalOpen: boolean;
  
  // Add Stock Dialog
  selectedAddProduct: string;
  selectedAddProductName: string;
  selectedAddStore: string;
  addQuantity: number;
  
  // Edit State
  editingId: string | null;
  editingStoreId: string;
  editQuantity: number;
  originalQuantity: number;
  editMovementMessage: string;
  editMovementType: string;
  
  // Reallocation
  isReallocationMode: boolean;
  targetStoreId: string;
  storesForReallocation: any[];
  
  // Filters & Pagination
  searchQuery: string;
  currentPage: number;
  pagination: PaginationMeta;
  
  // Actions
  fetchStockRecords: () => Promise<void>;
  fetchStores: () => Promise<void>;
  setSelectedStore: (storeId: string, storeName: string) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  
  // Add Dialog Actions
  openAddDialog: () => void;
  closeAddDialog: () => void;
  setAddProduct: (productId: string, productName: string) => void;
  setAddStore: (storeId: string) => void;
  setAddQuantity: (quantity: number) => void;
  
  // Edit Actions
  startEditing: (productStoreId: string, quantity: number, storeId: string) => void;
  cancelEditing: () => void;
  setEditQuantity: (quantity: number) => void;
  setEditMovementMessage: (message: string) => void;
  setEditMovementType: (type: string) => void;
  
  // Reallocation Actions
  toggleReallocationMode: () => void;
  setTargetStoreId: (storeId: string) => void;
  fetchStoresForReallocation: () => Promise<void>;
  
  reset: () => void;
}

const initialState = {
  stockRecords: [],
  stores: [],
  productsForDropdown: [],
  selectedStoreId: '',
  selectedStoreName: '',
  loading: false,
  isAddDialogOpen: false,
  isStoreFilterModalOpen: false,
  isProductModalOpen: false,
  selectedAddProduct: '',
  selectedAddProductName: '',
  selectedAddStore: '',
  addQuantity: 0,
  editingId: null,
  editingStoreId: '',
  editQuantity: 0,
  originalQuantity: 0,
  editMovementMessage: '',
  editMovementType: 'ADJUSTMENT',
  isReallocationMode: false,
  targetStoreId: '',
  storesForReallocation: [],
  searchQuery: '',
  currentPage: 1,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
};

/**
 * Inventory store - manages stock records, store selection, and inventory operations
 */
export const useInventoryStore = create<InventoryState>((set, get) => ({
  ...initialState,

  fetchStockRecords: async () => {
    const state = get();
    
    if (state.selectedStoreId === '') {
      return;
    }

    set({ loading: true });
    try {
      const apiInit: ApiInit = { method: HttpMethod.GET };
      
      let url = `/product?withStock=true&page=${state.currentPage}&limit=20`;
      if (state.selectedStoreId !== 'all') {
        url += `&storeId=${state.selectedStoreId}`;
      }
      if (state.searchQuery.trim() !== '') {
        url += `&name=${state.searchQuery}`;
      }
      
      const response = await apiFetch<any>(url, apiInit);
      
      if (response && 'data' in response && 'meta' in response) {
        set({
          stockRecords: Array.isArray(response.data) ? response.data : [],
          pagination: response.meta,
          loading: false,
        });
      } else {
        set({
          stockRecords: Array.isArray(response) ? response : [],
          loading: false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stock records:', error);
      set({ stockRecords: [], loading: false });
    }
  },

  fetchStores: async () => {
    try {
      const response = await getStores();
      const storesData = Array.isArray(response) ? response : response?.data || [];
      set({ stores: storesData });
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      set({ stores: [] });
    }
  },

  setSelectedStore: (storeId: string, storeName: string) => {
    set({ selectedStoreId: storeId, selectedStoreName: storeName, currentPage: 1 });
    get().fetchStockRecords();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
    get().fetchStockRecords();
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().fetchStockRecords();
  },

  // Add Dialog Actions
  openAddDialog: () => {
    set({ isAddDialogOpen: true });
  },

  closeAddDialog: () => {
    set({
      isAddDialogOpen: false,
      selectedAddProduct: '',
      selectedAddProductName: '',
      selectedAddStore: '',
      addQuantity: 0,
    });
  },

  setAddProduct: (productId: string, productName: string) => {
    set({ selectedAddProduct: productId, selectedAddProductName: productName });
  },

  setAddStore: (storeId: string) => {
    set({ selectedAddStore: storeId });
  },

  setAddQuantity: (quantity: number) => {
    set({ addQuantity: quantity });
  },

  // Edit Actions
  startEditing: (productStoreId: string, quantity: number, storeId: string) => {
    set({
      editingId: productStoreId,
      editingStoreId: storeId,
      editQuantity: quantity,
      originalQuantity: quantity,
      editMovementMessage: '',
      editMovementType: 'ADJUSTMENT',
      isReallocationMode: false,
      targetStoreId: '',
    });
  },

  cancelEditing: () => {
    set({
      editingId: null,
      editingStoreId: '',
      editQuantity: 0,
      originalQuantity: 0,
      editMovementMessage: '',
      editMovementType: 'ADJUSTMENT',
      isReallocationMode: false,
      targetStoreId: '',
    });
  },

  setEditQuantity: (quantity: number) => {
    set({ editQuantity: quantity });
  },

  setEditMovementMessage: (message: string) => {
    set({ editMovementMessage: message });
  },

  setEditMovementType: (type: string) => {
    set({ editMovementType: type });
  },

  // Reallocation Actions
  toggleReallocationMode: () => {
    const state = get();
    const newMode = !state.isReallocationMode;
    set({ isReallocationMode: newMode });
    
    if (newMode) {
      get().fetchStoresForReallocation();
    } else {
      set({ targetStoreId: '' });
    }
  },

  setTargetStoreId: (storeId: string) => {
    set({ targetStoreId: storeId });
  },

  fetchStoresForReallocation: async () => {
    try {
      const response = await getStores();
      const storesData = Array.isArray(response) ? response : response?.data || [];
      set({ storesForReallocation: storesData });
    } catch (error) {
      console.error('Failed to fetch stores for reallocation:', error);
      set({ storesForReallocation: [] });
    }
  },

  reset: () => set(initialState),
}));
