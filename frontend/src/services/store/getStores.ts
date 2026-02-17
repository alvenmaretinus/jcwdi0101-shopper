import { apiFetch, HttpMethod } from "@/lib/apiFetch";
import { Store } from "@/types/Store";
import {
  GetStoresWithEmployeeCountInput,
  GetStoresWithEmployeeCountSchema,
} from "@/schemas/store/GetStoresWithEmployeeCountSchema";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export interface GetStoresWithEmployeeCountResponse {
  data: (Store & { employeeCount: number })[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getStores = async ({
  query,
  headers,
}: {
  query?: GetStoresWithEmployeeCountInput;
  headers?: ReadonlyHeaders;
} = {}) => {
  const params = GetStoresWithEmployeeCountSchema.parse(query ?? {});
  const { page, sortBy, sortOrder, search } = params;

  const queryParams = new URLSearchParams();
  queryParams.set("page", String(page));
  queryParams.set("sortBy", sortBy);
  queryParams.set("sortOrder", sortOrder);

  if (search && search.trim()) {
    queryParams.set("search", search.trim());
  }

  const res = await apiFetch<GetStoresWithEmployeeCountResponse>(
    `/stores?${queryParams}`,
    {
      method: HttpMethod.GET,
      headers,
    }
  );

  return res;
};
