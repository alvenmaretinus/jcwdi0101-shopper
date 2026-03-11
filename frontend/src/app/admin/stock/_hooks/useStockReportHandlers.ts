import { useStockReportStore } from '@/store/admin';
import { fetchProductsForSelect } from '@/lib/reportSelectors';
import { SelectableItem } from '@/types/common';

/**
 * Provides event handlers and async fetchers for the stock report UI,
 * wired directly to the stock report Zustand store.
 */
export function useStockReportHandlers() {
  const activeTab = useStockReportStore((s) => s.activeTab);
  const selectedStoreId = useStockReportStore((s) => s.selectedStoreId);
  const setStoreSelection = useStockReportStore((s) => s.setStoreSelection);
  const setProductForDetail = useStockReportStore((s) => s.setProductForDetail);

  const handleStoreSelect = (store: SelectableItem | null) => {
    if (!store) {
      if (activeTab === 'summary') {
        setStoreSelection('all', 'All Stores');
      } else {
        setStoreSelection('', '');
      }
      return;
    }

    setStoreSelection(store.id, store.name);
  };

  const handleProductSelect = (product: SelectableItem | null) => {
    if (!product) {
      setProductForDetail('', '');
      return;
    }

    setProductForDetail(product.id, product.name);
  };

  const fetchProductsForDetailedTab = async ({
    name,
    page,
    limit,
  }: {
    name: string | undefined;
    page: number;
    limit: number;
  }) => {
    return fetchProductsForSelect(name || '', page, limit, selectedStoreId);
  };

  return { handleStoreSelect, handleProductSelect, fetchProductsForDetailedTab };
}
