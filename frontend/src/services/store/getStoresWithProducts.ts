import { apiFetch } from "@/lib/apiFetch";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { StoreProduct } from "@/types/StoreProduct";
import { Store } from "@/types/Store";

export const getStoresWithProducts = async (headers?: ReadonlyHeaders) => {
  const res = await apiFetch<(Store&{products:StoreProduct[]})[]>(
    "/stores/products",
    { method: "GET", headers }
  );
  return res
};

 
