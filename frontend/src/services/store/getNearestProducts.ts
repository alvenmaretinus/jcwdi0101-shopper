import { apiFetch } from "@/lib/apiFetch";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { StoreProduct } from "@/types/StoreProduct";

export const getNearestProducts = async (
  headers?: ReadonlyHeaders,
  coords?: { latitude?: number; longitude?: number }
) => {
  const params = new URLSearchParams();
  if (coords?.latitude) params.append("latitude", coords.latitude.toString());
  if (coords?.longitude)
    params.append("longitude", coords.longitude.toString());

  const queryString = params.toString() ? `?${params.toString()}` : "";

  const res = await apiFetch<StoreProduct[]>(
    `/stores/nearest-products${queryString}`,
    { method: "GET", headers }
  );
  return res;
};
