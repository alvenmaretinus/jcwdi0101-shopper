"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pagination } from "@/components/Pagination/Pagination";
import SelectionModal from "@/components/Dialog/SelectionModal";
import { getProducts, type ProductWithDetails } from "@/services/product/getProducts";
import { useDiscountsStore } from "@/store/admin";
import { toast } from "sonner";
import type { Discount } from "@/types/Discount";
import {
  DEFAULT_DISCOUNT_TYPE,
  type DiscountType,
} from "./shared/promoOptions";
import { resolveDiscountProduct } from "./shared/discountProductResolver";
import { mapDiscountFormData } from "./shared/promoFormMappers";
import {
  DiscountsFilterBar,
  DiscountsFormDialog,
  DiscountsTable,
} from "./discounts";

export function DiscountsTab() {
  const {
    discounts,
    isLoading,
    isSubmitting,
    isDialogOpen,
    editingDiscount,
    searchQuery,
    typeFilter,
    pagination,
    fetchDiscounts,
    setSearchQuery,
    setTypeFilter,
    setCurrentPage,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    createDiscount,
    updateDiscount,
    deleteDiscount,
  } = useDiscountsStore();

  const [selectedDiscountType, setSelectedDiscountType] =
    useState<DiscountType>(DEFAULT_DISCOUNT_TYPE);
  const [isWithMinimumChecked, setIsWithMinimumChecked] = useState(false);
  const [hasDiscountAmountCapChecked, setHasDiscountAmountCapChecked] =
    useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithDetails | null>(null);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleCreate = () => {
    setSelectedDiscountType(DEFAULT_DISCOUNT_TYPE);
    setSelectedProduct(null);
    setIsWithMinimumChecked(false);
    setHasDiscountAmountCapChecked(false);
    openCreateDialog();
  };

  const handleEdit = (discount: Discount) => {
    setSelectedDiscountType(discount.type);
    setIsWithMinimumChecked(discount.isWithMinimum ?? false);
    setHasDiscountAmountCapChecked(discount.hasDiscountAmountCap ?? false);
    openEditDialog(discount);

    void resolveDiscountProduct(discount).then(setSelectedProduct);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      closeDialog();
      setSelectedProduct(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);
      const { data: discountData, error } = mapDiscountFormData(
        formData,
        selectedProduct
      );

      if (error) {
        toast.error(error);
        return;
      }

      if (!discountData) {
        return;
      }

      if (editingDiscount) {
        await updateDiscount(editingDiscount.id, discountData);
      } else {
        await createDiscount(discountData);
      }

      closeDialog();
      setSelectedProduct(null);
    } catch {
      // Error toast is handled in the service/store
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount?")) {
      return;
    }

    try {
      await deleteDiscount(id);
    } catch {
      // Error toast is handled in the service/store
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <DiscountsFilterBar
            searchQuery={searchQuery}
            typeFilter={typeFilter}
            onSearchChange={setSearchQuery}
            onTypeFilterChange={setTypeFilter}
            onCreate={handleCreate}
          />

          <DiscountsFormDialog
            open={isDialogOpen}
            editingDiscount={editingDiscount}
            selectedDiscountType={selectedDiscountType}
            isWithMinimumChecked={isWithMinimumChecked}
            hasDiscountAmountCapChecked={hasDiscountAmountCapChecked}
            selectedProduct={selectedProduct}
            isSubmitting={isSubmitting}
            onOpenChange={handleDialogChange}
            onSubmit={handleSubmit}
            onDiscountTypeChange={setSelectedDiscountType}
            onIsWithMinimumCheckedChange={setIsWithMinimumChecked}
            onHasDiscountAmountCapCheckedChange={setHasDiscountAmountCapChecked}
            onOpenProductModal={() => setIsProductModalOpen(true)}
          />
        </CardHeader>

        <CardContent>
          <DiscountsTable
            discounts={discounts}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onChange={setCurrentPage}
        />
      </Card>

      <SelectionModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        onSelect={(product) => {
          setSelectedProduct(product);
        }}
        getType={getProducts}
        selectedSelectionId={selectedProduct?.id}
        title="Select Product"
        description="Search and select a product to apply the discount"
      />
    </div>
  );
}
