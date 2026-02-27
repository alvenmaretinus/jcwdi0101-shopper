import { apiFetch, HttpMethod } from "@/lib/apiFetch";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export interface ProductCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategoryPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductCategoryPaginatedResponse {
  data: ProductCategory[];
  meta: ProductCategoryPaginationMeta;
}

export interface GetProductCategoriesParams {
  id?: string;
  name?: string;
  page?: number;
  limit?: number;
}

export const getProductCategories = async (
  params: GetProductCategoriesParams = {},
  headers?: ReadonlyHeaders,
) => {
  const query = new URLSearchParams();

  if (params.id) query.set("id", params.id);
  if (params.name) query.set("name", params.name);
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());

  const suffix = query.toString() ? `?${query.toString()}` : "";

  const res = await apiFetch<ProductCategoryPaginatedResponse>(`/product-category${suffix}`, {
    method: HttpMethod.GET,
    headers,
  });

  return res;
};
