import { Voucher } from '@/types/Voucher';
import { create } from 'zustand';
import { getVouchers } from "@/services/voucher";
import { getDiscounts, getProductsWithDiscounts, type ProductWithDiscount } from "@/services/discount";
import { DEALS_STOREWIDE_PER_PAGE, DEALS_PROMO_PER_PAGE, DEALS_REFERRAL_PER_PAGE, DEALS_ITEMS_PER_PAGE } from "@/constants/pagination";

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface UserDealsState {
    // Data
    promoVouchers: Voucher[];
    referralVouchers: Voucher[];
    storeWideDiscounts: any[];
    flashDeals: ProductWithDiscount[];
    bogoProducts: ProductWithDiscount[];
    
    // Pagination meta
    promoMeta: PaginationMeta;
    storewideDiscountsMeta: PaginationMeta;
    referralMeta: PaginationMeta;
    dealsMeta: PaginationMeta;
    
    // Loading states
    loading: boolean;
    promoLoading: boolean;
    storewideLoading: boolean;
    referralLoading: boolean;
    dealsLoading: boolean;
    
    // Actions
    setVouchers: (vouchers: Voucher[]) => void;
    setStoreWideDiscounts: (discounts: any[]) => void;
    setFlashDeals: (deals: ProductWithDiscount[]) => void;
    setBogoProducts: (products: ProductWithDiscount[]) => void;
    setLoading: (loading: boolean) => void;
    
    // Fetch functions with pagination
    initialize: () => Promise<void>;
    fetchPromos: (page: number) => Promise<void>;
    fetchStorewideDiscounts: (page: number) => Promise<void>;
    fetchReferralVouchers: (page: number) => Promise<void>;
    fetchDeals: (page: number) => Promise<void>;
}

const initialMeta: PaginationMeta = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
};

const initialState = {
    promoVouchers: [],
    referralVouchers: [],
    storeWideDiscounts: [],
    flashDeals: [],
    bogoProducts: [],
    promoMeta: { ...initialMeta, limit: DEALS_PROMO_PER_PAGE },
    storewideDiscountsMeta: { ...initialMeta, limit: DEALS_STOREWIDE_PER_PAGE },
    referralMeta: { ...initialMeta, limit: DEALS_REFERRAL_PER_PAGE },
    dealsMeta: { ...initialMeta, limit: DEALS_ITEMS_PER_PAGE },
    loading: true,
    promoLoading: false,
    storewideLoading: false,
    referralLoading: false,
    dealsLoading: false,
};

export const useUserDealsStore = create<UserDealsState>((set, get) => ({
    ...initialState,
    
    setVouchers: (vouchers: Voucher[]) => set({ promoVouchers: vouchers }),
    setStoreWideDiscounts: (discounts: any[]) => set({ storeWideDiscounts: discounts }),
    setFlashDeals: (deals: ProductWithDiscount[]) => set({ flashDeals: deals }),
    setBogoProducts: (products: ProductWithDiscount[]) => set({ bogoProducts: products }),
    setLoading: (loading: boolean) => set({ loading }),
    
    initialize: async () => {
        set({ loading: true });
        try {
            await Promise.all([
                get().fetchPromos(1),
                get().fetchStorewideDiscounts(1),
                get().fetchReferralVouchers(1),
                get().fetchDeals(1),
            ]);
        } catch (error) {
            console.error("Error initializing deals:", error);
        } finally {
            set({ loading: false });
        }
    },
    
    fetchPromos: async (page: number) => {
        set({ promoLoading: true });
        try {
            const response = await getVouchers({ 
                isRedeemed: false,
                voucherType: ['TRANSACTIONAL', 'FREEDELIVERY'],
                page,
                limit: DEALS_PROMO_PER_PAGE
            });
            set({ 
                promoVouchers: response.data,
                promoMeta: response.meta
            });
        } catch (error) {
            console.error("Error fetching promos:", error);
        } finally {
            set({ promoLoading: false });
        }
    },
    
    fetchStorewideDiscounts: async (page: number) => {
        set({ storewideLoading: true });
        try {
            const response = await getDiscounts({ 
                isActive: true,
                page,
                limit: DEALS_STOREWIDE_PER_PAGE
            });
            const storewide = response.data.filter(
                (discount) => !discount.isTiedToProduct && !discount.isVoucher
            );
            set({ 
                storeWideDiscounts: storewide,
                storewideDiscountsMeta: response.meta
            });
        } catch (error) {
            console.error("Error fetching storewide discounts:", error);
        } finally {
            set({ storewideLoading: false });
        }
    },
    
    fetchReferralVouchers: async (page: number) => {
        set({ referralLoading: true });
        try {
            const response = await getVouchers({ 
                isRedeemed: false,
                voucherType: 'REFERRAL',
                page,
                limit: DEALS_REFERRAL_PER_PAGE
            });
            set({ 
                referralVouchers: response.data,
                referralMeta: response.meta
            });
        } catch (error) {
            console.error("Error fetching referral vouchers:", error);
        } finally {
            set({ referralLoading: false });
        }
    },
    
    fetchDeals: async (page: number) => {
        set({ dealsLoading: true });
        try {
            const [percentageDealsResponse, amountDealsResponse, bogoResponse] = await Promise.all([
                getProductsWithDiscounts({ 
                    isActive: true, 
                    type: "PERCENTAGE",
                    inStock: true,
                    page,
                    limit: Math.ceil(DEALS_ITEMS_PER_PAGE / 2)
                }),
                getProductsWithDiscounts({ 
                    isActive: true, 
                    type: "FIXED_AMOUNT",
                    inStock: true,
                    page,
                    limit: Math.ceil(DEALS_ITEMS_PER_PAGE / 2)
                }),
                getProductsWithDiscounts({ 
                    isActive: true, 
                    type: "QUANTITY",
                    inStock: true,
                    page,
                    limit: Math.ceil(DEALS_ITEMS_PER_PAGE / 2)
                }),
            ]);
            
            const flashDeals = [...percentageDealsResponse.data, ...amountDealsResponse.data];
            const totalFlashDeals = percentageDealsResponse.meta.total + amountDealsResponse.meta.total;
            const totalBogo = bogoResponse.meta.total;
            
            set({ 
                flashDeals,
                bogoProducts: bogoResponse.data,
                dealsMeta: {
                    page,
                    limit: DEALS_ITEMS_PER_PAGE,
                    total: totalFlashDeals + totalBogo,
                    totalPages: Math.ceil((totalFlashDeals + totalBogo) / DEALS_ITEMS_PER_PAGE)
                }
            });
        } catch (error) {
            console.error("Error fetching deals:", error);
        } finally {
            set({ dealsLoading: false });
        }
    },
}));