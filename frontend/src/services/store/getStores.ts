import { apiFetch } from "@/lib/apiFetch";
import { Store } from "@/types/Store";

export const getStores = async () => {
  const res = await apiFetch<(Store & { employeeCount: number })[]>(
    "/stores/",
    { method: "GET" }
  );
  return res;
};
