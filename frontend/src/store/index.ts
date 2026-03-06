/**
 * Centralized Zustand Stores
 * 
 * This barrel export provides easy access to all application stores.
 * Import stores individually to avoid unnecessary re-renders.
 */

export { useAuthStore } from './useAuthStore';
export { useProductsStore } from './useProductsStore';
export { useDiscountsStore } from './useDiscountsStore';
export { useInventoryStore } from './useInventoryStore';
export { useSalesReportStore } from './useSalesReportStore';
export { useStockReportStore } from './useStockReportStore';
