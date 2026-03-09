"use client";

import { ProductsGrid } from "./ProductsGrid";
import { ProductsPagination } from "./ProductsPagination";
import { useUserProductsStore } from "@/store/user";

export function ProductsDisplay() {
  const products = useUserProductsStore((state) => state.products);
  const pagination = useUserProductsStore((state) => state.pagination);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <>
      <ProductsGrid products={products} />
      <ProductsPagination />
    </>
  );
}
