import { Store } from "@/types/Store";

import { useInitialFetch } from "../generic/useInitialFetch";

export function useStores() {
  const {
    data: stores,
    setData: setStores,
    isLoading,
  } = useInitialFetch<(Store & { employeeCount: number })[]>("/store");

  return { stores, setStores, isLoading };
}
