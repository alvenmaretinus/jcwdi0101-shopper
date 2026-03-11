"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useUserProductsStore } from "@/store/user";
import { useRouter } from "next/navigation";

export function ProductsActiveFilters() {
  const router = useRouter();
  const selectedCategoryId = useUserProductsStore((state) => state.selectedCategoryId);
  const selectedCategoryName = useUserProductsStore((state) => state.selectedCategoryName);
  const showInStock = useUserProductsStore((state) => state.showInStock);
  const setSelectedCategoryId = useUserProductsStore((state) => state.setSelectedCategoryId);
  const setShowInStock = useUserProductsStore((state) => state.setShowInStock);
  const syncWithUrl = useUserProductsStore((state) => state.syncWithUrl);

  if (selectedCategoryId === "all" && !showInStock) {
    return null;
  }

  const effectiveSelectedCategoryId = selectedCategoryId ?? "all";
  const effectiveShowInStock = showInStock ?? false;

  const handleRemoveCategory = () => {
    setSelectedCategoryId("all");
    const url = syncWithUrl();
    router.push(url);
  };

  const handleRemoveStockFilter = () => {
    setShowInStock(false);
    const url = syncWithUrl();
    router.push(url);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {effectiveSelectedCategoryId !== "all" && (
        <Button
          onClick={handleRemoveCategory}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80"
        >
          {selectedCategoryName || "Category"}
          <X className="ml-1 h-3 w-3" />
        </Button>
      )}
      {effectiveShowInStock && (
        <Button
          onClick={handleRemoveStockFilter}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80"
        >
          In Stock
          <X className="ml-1 h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
