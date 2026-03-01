"use client";
import SelectionModal from '@/components/Dialog/SelectionModal';
import { ProductWithDetails } from '@/services/product/getProducts';

interface InventoryModalsProps {
  isProductModalOpen: boolean;
  onProductModalOpenChange: (open: boolean) => void;
  onProductSelect: (product: ProductWithDetails | null) => void;
  selectedProductId: string;
  getProducts: any;
  
  isStoreFilterModalOpen: boolean;
  onStoreFilterModalOpenChange: (open: boolean) => void;
  onStoreFilterSelect: (store: { id: string; name: string } | null) => void;
  selectedStoreId: string;
  getStoresForSelection: any;
}

export default function InventoryModals({
  isProductModalOpen,
  onProductModalOpenChange,
  onProductSelect,
  selectedProductId,
  getProducts,
  
  isStoreFilterModalOpen,
  onStoreFilterModalOpenChange,
  onStoreFilterSelect,
  selectedStoreId,
  getStoresForSelection,
}: InventoryModalsProps) {
  return (
    <>
      {/* Product Selection Modal */}
      <SelectionModal
        open={isProductModalOpen}
        onOpenChange={onProductModalOpenChange}
        onSelect={onProductSelect}
        selectedSelectionId={selectedProductId}
        title="Select Product"
        description="Search and select a product to view its detailed inventory history"
        getType={getProducts}
      />

      {/* Store Selection Modal */}
      <SelectionModal
        open={isStoreFilterModalOpen}
        onOpenChange={onStoreFilterModalOpenChange}
        onSelect={onStoreFilterSelect}
        selectedSelectionId={selectedStoreId === 'all' ? undefined : selectedStoreId}
        title="Select Store"
        description="Choose a store to filter the inventory"
        getType={getStoresForSelection}
      />
    </>
  );
}
