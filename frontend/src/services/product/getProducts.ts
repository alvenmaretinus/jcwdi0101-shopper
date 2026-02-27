import { apiFetch, HttpMethod } from "@/lib/apiFetch";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export interface ProductImage {
  id: string;
  url: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithDetails {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  savingsAmount?: number;
  createAt: string;
  updatedAt: string;
  categoryId: string;
  category: ProductCategory;
  productImages: ProductImage[];
  // Available when withStock=true
  productStores?: Array<{
    id: string;
    quantity: number;
    storeId: string;
    productId: string;
    store: {
      id: string;
      name: string;
    };
  }>;
  // Available when withDiscounts=true
  discountedPricing?: {
    discountedPrice: number;
    totalDiscount: number;
    appliedCount: number;
    appliedDiscounts: Array<{
      id: string;
      name: string;
      label: string;
      savedAmount: number;
      endsAt?: string | Date | null;
    }>;
    unmetMinimumDiscounts?: Array<{
      id: string;
      name: string;
      label: string;
      minimumPrice: number;
    }>;
    earliestEndsAt?: string | Date | null;
    quantityDiscounts?: Array<{
      id: string;
      name: string;
      buyQuantity: number;
      freeQuantity: number;
      endsAt?: string | Date | null;
    }>;
  };
}

export interface GetProductsParams {
  id?: string;
  name?: string;
  categoryId?: string;
  storeId?: string;
  inStockOnly?: boolean;
  withStock?: boolean;
  withDiscounts?: boolean;
  sort?: "featured" | "name" | "price-low" | "price-high";
  page?: number;
  limit?: number;
}

export interface GetProductsResponse {
  data: ProductWithDetails[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getProducts = async (
  params?: GetProductsParams,
  headers?: ReadonlyHeaders
) => {
  const queryParams = new URLSearchParams();
  
  if (params?.id) queryParams.append("id", params.id);
  if (params?.name) queryParams.append("name", params.name);
  if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
  if (params?.storeId) queryParams.append("storeId", params.storeId);
  if (params?.inStockOnly !== undefined) {
    queryParams.append("inStockOnly", params.inStockOnly.toString());
  }
  if (params?.withStock !== undefined) {
    queryParams.append("withStock", params.withStock.toString());
  }
  if (params?.withDiscounts !== undefined) {
    queryParams.append("withDiscounts", params.withDiscounts.toString());
  }
  if (params?.page !== undefined) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.limit !== undefined) {
    queryParams.append("limit", params.limit.toString());
  }
  if (params?.sort) {
    queryParams.append("sort", params.sort);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/product?${queryString}` : "/product";

  
  const res = await apiFetch<GetProductsResponse>(url, {
    method: HttpMethod.GET,
    headers,
  });
  
  return res;
};
