import { ReactNode } from "react";
import { ProductsSearchBar } from "./ProductsSearchBar";
import { ProductsFilterBar } from "./ProductsFilterBar";
import { ProductsActiveFilters } from "./ProductsActiveFilters";
import { ProductsDisplay } from "./ProductsDisplay";

interface ProductsMainContentProps {
  filterContent: ReactNode;
}

export function ProductsMainContent({
  filterContent,
}: ProductsMainContentProps) {
  return (
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <ProductsSearchBar />
        <ProductsFilterBar filterContent={filterContent} />
      </div>

      <ProductsActiveFilters />

      <ProductsDisplay />
    </div>
  );
}