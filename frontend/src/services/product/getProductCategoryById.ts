import { apiFetch, HttpMethod } from "@/lib/apiFetch";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export interface ProductCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const getProductCategoryById = async (id: string, headers?: ReadonlyHeaders) => {
  const res = await apiFetch<ProductCategory>(`/product-category/${id}`, {
    method: HttpMethod.GET,
    headers,
  });
  
  return res;
};
