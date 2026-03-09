"use client";

import { ProductWithDetails } from "@/services/product/getProducts";
import { PaginationMeta } from "./ProductsList.types";
import { useUserProductsStore } from "@/store/user";

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
  const current = useUserProductsStore.getState();
  const nextCategoryId = selectedCategoryId ?? "all";
  const nextSort = currentSort ?? "featured";
  const nextSearch = currentSearch ?? "";
  const nextPage = page ?? 1;
  const nextLimit = limit ?? 20;
  const nextCategoryPage = categoryPage ?? 1;
  const nextCategoryLimit = categoryLimit ?? 8;

  const shouldHydrate =
    current.selectedCategoryId !== nextCategoryId ||
    current.selectedCategoryName !== selectedCategoryName ||
    current.showInStock !== showInStock ||
    current.searchQuery !== nextSearch ||
    current.sortBy !== nextSort ||
    current.page !== nextPage ||
    current.limit !== nextLimit ||
    current.categoryPage !== nextCategoryPage ||
    current.categoryLimit !== nextCategoryLimit ||
    current.products !== products ||
    current.pagination !== pagination;

  if (shouldHydrate) {
    current.hydrateFromServer({
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
  }

  return null;
}
