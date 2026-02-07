import { apiFetch } from "@/lib/apiFetch";
import { Store } from "@/types/Store";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export const getStores = async (headers?: ReadonlyHeaders) => {
  const res = await apiFetch<(Store & { employeeCount: number })[]>(
    "/stores/",
    { method: "GET", headers }
  );
  return res;
};
