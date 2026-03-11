import { create } from 'zustand';
import {
  createVoucher,
  deleteVoucher,
  getVouchers,
  updateVoucher,
  type CreateVoucherInput,
  type UpdateVoucherInput,
} from '@/services/voucher';
import type { Voucher } from '@/types/Voucher';
import {
  DEFAULT_VOUCHER_DISCOUNT_TYPE,
  DEFAULT_VOUCHER_TYPE,
  type DiscountType,
  type VoucherType,
  type VoucherTypeFilter,
} from '@/app/admin/discounts/_components/shared/promoOptions';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AdminVouchersState {
  vouchers: Voucher[];
  isLoading: boolean;
  isSubmitting: boolean;
  isDialogOpen: boolean;
  editingVoucher: Voucher | null;
  voucherSearch: string;
  voucherTypeFilter: VoucherTypeFilter;
  selectedVoucherDiscountType: DiscountType;
  selectedVoucherType: VoucherType;
  currentPage: number;
  pagination: PaginationMeta;
  fetchVouchers: (options?: {
    voucherTypeFilter?: VoucherTypeFilter;
    page?: number;
  }) => Promise<void>;
  setVoucherSearch: (query: string) => void;
  setVoucherTypeFilter: (type: VoucherTypeFilter) => void;
  setSelectedVoucherDiscountType: (type: DiscountType) => void;
  setSelectedVoucherType: (type: VoucherType) => void;
  setCurrentPage: (page: number) => void;
  openCreateDialog: () => void;
  openEditDialog: (voucher: Voucher) => void;
  closeDialog: () => void;
  createVoucher: (data: CreateVoucherInput) => Promise<void>;
  updateVoucher: (id: string, data: Omit<UpdateVoucherInput, 'id'>) => Promise<void>;
  deleteVoucher: (id: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  vouchers: [],
  isLoading: false,
  isSubmitting: false,
  isDialogOpen: false,
  editingVoucher: null,
  voucherSearch: '',
  voucherTypeFilter: 'all' as VoucherTypeFilter,
  selectedVoucherDiscountType: DEFAULT_VOUCHER_DISCOUNT_TYPE,
  selectedVoucherType: DEFAULT_VOUCHER_TYPE,
  currentPage: 1,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
};

export const useAdminVouchersStore = create<AdminVouchersState>((set, get) => ({
  ...initialState,

  fetchVouchers: async (options) => {
    const state = get();
    const voucherTypeFilter = options?.voucherTypeFilter ?? state.voucherTypeFilter;
    const page = options?.page ?? state.currentPage;

    set({ isLoading: true });
    try {
      const response = await getVouchers({
        voucherType: voucherTypeFilter !== 'all' ? voucherTypeFilter : undefined,
        page,
        limit: 20,
      });

      set({
        vouchers: response.data,
        pagination: response.meta,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
      set({ vouchers: [], isLoading: false });
      throw error;
    }
  },

  setVoucherSearch: (query: string) => {
    set({ voucherSearch: query, currentPage: 1 });
  },

  setVoucherTypeFilter: (type: VoucherTypeFilter) => {
    set({ voucherTypeFilter: type, currentPage: 1 });
    get().fetchVouchers({ voucherTypeFilter: type, page: 1 });
  },

  setSelectedVoucherDiscountType: (type) => {
    set({ selectedVoucherDiscountType: type });
  },

  setSelectedVoucherType: (type) => {
    set({ selectedVoucherType: type });
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().fetchVouchers({ page });
  },

  openCreateDialog: () => {
    set({
      isDialogOpen: true,
      editingVoucher: null,
      selectedVoucherDiscountType: DEFAULT_VOUCHER_DISCOUNT_TYPE,
      selectedVoucherType: DEFAULT_VOUCHER_TYPE,
    });
  },

  openEditDialog: (voucher: Voucher) => {
    set({
      isDialogOpen: true,
      editingVoucher: voucher,
      selectedVoucherDiscountType: voucher.discount.type,
      selectedVoucherType: voucher.voucherType,
    });
  },

  closeDialog: () => {
    set({
      isDialogOpen: false,
      editingVoucher: null,
      selectedVoucherDiscountType: DEFAULT_VOUCHER_DISCOUNT_TYPE,
      selectedVoucherType: DEFAULT_VOUCHER_TYPE,
    });
  },

  createVoucher: async (data: CreateVoucherInput) => {
    set({ isSubmitting: true });
    try {
      await createVoucher(data);
      set({
        isSubmitting: false,
        isDialogOpen: false,
        editingVoucher: null,
        selectedVoucherDiscountType: DEFAULT_VOUCHER_DISCOUNT_TYPE,
        selectedVoucherType: DEFAULT_VOUCHER_TYPE,
      });
      await get().fetchVouchers();
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  updateVoucher: async (id: string, data: Omit<UpdateVoucherInput, 'id'>) => {
    set({ isSubmitting: true });
    try {
      await updateVoucher({ id, ...data });
      set({
        isSubmitting: false,
        isDialogOpen: false,
        editingVoucher: null,
        selectedVoucherDiscountType: DEFAULT_VOUCHER_DISCOUNT_TYPE,
        selectedVoucherType: DEFAULT_VOUCHER_TYPE,
      });
      await get().fetchVouchers();
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  deleteVoucher: async (id: string) => {
    try {
      await deleteVoucher(id);
      await get().fetchVouchers();
    } catch (error) {
      console.error('Failed to delete voucher:', error);
      throw error;
    }
  },

  reset: () => set(initialState),
}));
