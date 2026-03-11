"use client";

import { ProductWithDetails } from "@/services/product/getProducts";
import { PaginationMeta } from "./ProductsList.types";
import { useUserProductsStore } from "@/store/user";
import { useEffect } from "react";

interface ProductsStoreHydratorProps {
  selectedCategoryId?: string;
  selectedCategoryName: string;
  showInStock: boolean;
  currentSearch?: string;
  currentSort?: string;
  page?: number;
  limit?: number;
  categoryPage?: number;
  categoryLimit?: number;
  products: ProductWithDetails[];
  pagination: PaginationMeta;
}

export function ProductsStoreHydrator({
  selectedCategoryId,
  selectedCategoryName,
  showInStock,
  currentSearch,
  currentSort,
  page,
  limit,
  categoryPage,
  categoryLimit,
  products,
  pagination,
}: ProductsStoreHydratorProps) {
  const hydrateFromServer = useUserProductsStore((state) => state.hydrateFromServer);

  useEffect(() => {
    hydrateFromServer({
      params: {
        categoryId: selectedCategoryId,
        categoryName: selectedCategoryName,
        inStockOnly: showInStock,
        search: currentSearch,
        sort: currentSort,
        page,
        limit,
        categoryPage,
        categoryLimit,
      },
      products,
      pagination,
    });
  }, [selectedCategoryId, selectedCategoryName, showInStock, currentSearch, currentSort, page, limit, categoryPage, categoryLimit, products, pagination, hydrateFromServer]);

  return null;
}
