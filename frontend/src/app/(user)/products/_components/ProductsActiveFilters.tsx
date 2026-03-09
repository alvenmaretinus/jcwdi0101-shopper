import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useUserProductsStore } from "@/store/user";

export function ProductsActiveFilters() {
  const selectedCategoryId = useUserProductsStore((state) => state.selectedCategoryId);
  const selectedCategoryName = useUserProductsStore((state) => state.selectedCategoryName);
  const showInStock = useUserProductsStore((state) => state.showInStock);
  if (selectedCategoryId === "all" && !showInStock) {
    return null;
  }

  const effectiveSelectedCategoryId = selectedCategoryId ?? "all";
  const effectiveShowInStock = showInStock ?? false;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {effectiveSelectedCategoryId !== "all" && (
        <form method="GET" action="/products" className="inline">
          {effectiveShowInStock && (
            <input type="hidden" name="inStockOnly" value="true" />
          )}
          <Button
            type="submit"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {selectedCategoryName || "Category"}
            <X className="ml-1 h-3 w-3" />
          </Button>
        </form>
      )}
      {effectiveShowInStock && (
        <form method="GET" action="/products" className="inline">
          {effectiveSelectedCategoryId !== "all" && (
            <input
              type="hidden"
              name="categoryId"
              value={effectiveSelectedCategoryId}
            />
          )}
          <Button
            type="submit"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            In Stock
            <X className="ml-1 h-3 w-3" />
          </Button>
        </form>
      )}
    </div>
  );
}
