import { apiFetch, HttpMethod } from "@/lib/apiFetch";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export interface ProductCategory {
  id: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export const getProductCategories = async (headers?: ReadonlyHeaders) => {
  const res = await apiFetch<ProductCategory[]>("/product-category", {
    method: HttpMethod.GET,
    headers,
  });
  
  return res;
};
