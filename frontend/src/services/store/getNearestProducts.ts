import { apiFetch, HttpMethod } from "@/lib/apiFetch";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { StoreProduct } from "@/types/StoreProduct";

interface GetNearestProductsParams {
  headers?: ReadonlyHeaders;
  coords?: { latitude?: number; longitude?: number };
  limit?: number;
}

export const getNearestProducts = async ({
  headers,
  coords,
  limit,
}: GetNearestProductsParams = {}) => {
  const params = new URLSearchParams();
  if (coords?.latitude) params.append("latitude", coords.latitude.toString());
  if (coords?.longitude)
    params.append("longitude", coords.longitude.toString());
  if (limit) params.append("limit", String(limit));

  const queryString = params.toString() ? `?${params.toString()}` : "";

  const res = await apiFetch<StoreProduct[]>(
    `/stores/nearest-products${queryString}`,
    { method: HttpMethod.GET, headers }
  );
  return res;
};
