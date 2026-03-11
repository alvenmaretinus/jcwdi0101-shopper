import { create } from 'zustand';
import { 
  getSummaryStockReport, 
  SummaryStockReportItem 
} from '@/services/stock-report/getSummaryStockReport';
import { 
  getDetailedStockReport, 
  DetailedMovementRecord 
} from '@/services/stock-report/getDetailedStockReport';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StockReportState {
  // Active Tab
  activeTab: 'summary' | 'detailed';
  
  // Store Selection
  selectedStoreId: string;
  selectedStoreName: string;
  
  // Date Filters
  reportMonth: number;
  reportYear: number;
  
  // Summary Report
  summaryReports: SummaryStockReportItem[];
  isSummaryLoading: boolean;
  summaryPage: number;
  summaryPagination: PaginationMeta;
  
  // Detailed Report
  selectedProductForDetail: string;
  selectedProductName: string;
  detailedReports: DetailedMovementRecord[];
  detailedStartingStock: number;
  detailedEndingStock: number;
  isDetailedLoading: boolean;
  detailedPage: number;
  detailedPagination: PaginationMeta;
  
  // Actions
  setActiveTab: (tab: 'summary' | 'detailed') => void;
  setStoreSelection: (storeId: string, storeName: string) => void;
  setReportMonth: (month: number) => void;
  setReportYear: (year: number) => void;
  
  // Summary Actions
  fetchSummaryReport: () => Promise<void>;
  setSummaryPage: (page: number) => void;
  
  // Detailed Actions
  setProductForDetail: (productId: string, productName: string) => void;
  fetchDetailedReport: () => Promise<void>;
  setDetailedPage: (page: number) => void;
  
  reset: () => void;
}

const initialState = {
  activeTab: 'summary' as const,
  selectedStoreId: '',
  selectedStoreName: '',
  reportMonth: new Date().getMonth() + 1,
  reportYear: new Date().getFullYear(),
  
  summaryReports: [],
  isSummaryLoading: false,
  summaryPage: 1,
  summaryPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  
  selectedProductForDetail: '',
  selectedProductName: '',
  detailedReports: [],
  detailedStartingStock: 0,
  detailedEndingStock: 0,
  isDetailedLoading: false,
  detailedPage: 1,
  detailedPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
};

/**
 * Stock Report store - manages summary and detailed stock reports
 */
export const useStockReportStore = create<StockReportState>((set, get) => ({
  ...initialState,

  setActiveTab: (tab: 'summary' | 'detailed') => {
    set({ activeTab: tab });
    
    if (tab === 'summary') {
      get().fetchSummaryReport();
    } else if (tab === 'detailed' && get().selectedProductForDetail) {
      get().fetchDetailedReport();
    }
  },

  setStoreSelection: (storeId: string, storeName: string) => {
    set({ selectedStoreId: storeId, selectedStoreName: storeName });
    
    const state = get();
    if (state.activeTab === 'summary') {
      get().fetchSummaryReport();
    } else if (state.selectedProductForDetail) {
      get().fetchDetailedReport();
    }
  },

  setReportMonth: (month: number) => {
    set({ reportMonth: month });
    
    const state = get();
    if (state.activeTab === 'summary') {
      get().fetchSummaryReport();
    } else if (state.selectedProductForDetail) {
      get().fetchDetailedReport();
    }
  },

  setReportYear: (year: number) => {
    set({ reportYear: year });
    
    const state = get();
    if (state.activeTab === 'summary') {
      get().fetchSummaryReport();
    } else if (state.selectedProductForDetail) {
      get().fetchDetailedReport();
    }
  },

  // Summary Actions
  fetchSummaryReport: async () => {
    const state = get();
    
    if (state.selectedStoreId === '') {
      return;
    }

    set({ isSummaryLoading: true });
    try {
      const response = await getSummaryStockReport({
        month: state.reportMonth,
        year: state.reportYear,
        storeId: state.selectedStoreId !== 'all' ? state.selectedStoreId : undefined,
        skip: (state.summaryPage - 1) * 20,
        take: 20,
      });

      set({
        summaryReports: response.data,
        summaryPagination: {
          page: response.page,
          limit: 20,
          total: response.total,
          totalPages: response.totalPages,
        },
        isSummaryLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch summary stock report:', error);
      set({ summaryReports: [], isSummaryLoading: false });
    }
  },

  setSummaryPage: (page: number) => {
    set({ summaryPage: page });
    get().fetchSummaryReport();
  },

  // Detailed Actions
  setProductForDetail: (productId: string, productName: string) => {
    set({ 
      selectedProductForDetail: productId, 
      selectedProductName: productName,
      detailedPage: 1, 
    });
    get().fetchDetailedReport();
  },

  fetchDetailedReport: async () => {
    const state = get();
    
    if (!state.selectedProductForDetail || !state.selectedStoreId) {
      return;
    }

    set({ isDetailedLoading: true });
    try {
      const response = await getDetailedStockReport({
        productId: state.selectedProductForDetail,
        month: state.reportMonth,
        year: state.reportYear,
        storeId: state.selectedStoreId,
        skip: (state.detailedPage - 1) * 20,
        take: 20,
      });

      set({
        detailedReports: response.data,
        detailedStartingStock: response.startingStock,
        detailedEndingStock: response.endingStock,
        detailedPagination: {
          page: response.page,
          limit: 20,
          total: response.total,
          totalPages: response.totalPages,
        },
        isDetailedLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch detailed stock report:', error);
      set({ detailedReports: [], isDetailedLoading: false });
    }
  },

  setDetailedPage: (page: number) => {
    set({ detailedPage: page });
    get().fetchDetailedReport();
  },

  reset: () => set(initialState),
}));
