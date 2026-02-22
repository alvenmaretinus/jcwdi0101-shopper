import { apiFetch } from "@/lib/apiFetch";
import { HttpMethod } from "@/lib/apiFetch";
import { Discount } from "@/types/Discount";

export interface GetDiscountsParams {
  name?: string;
  type?: string;
  productId?: string;
  storeId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedDiscountsResponse {
  data: Discount[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getDiscounts = async (params?: GetDiscountsParams): Promise<PaginatedDiscountsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.name) {
    queryParams.append('name', params.name);
  }
  if (params?.type && params.type !== 'all') {
    queryParams.append('type', params.type);
  }
  if (params?.productId) {
    queryParams.append('productId', params.productId);
  }
  if (params?.storeId) {
    queryParams.append('storeId', params.storeId);
  }
  if (params?.isActive !== undefined && params.isActive) {
    // Backend expects activeOnDate, so we send current date to filter active discounts
    queryParams.append('activeOnDate', new Date().toISOString());
  }
  if (params?.page) {
    queryParams.append('page', String(params.page));
  }
  if (params?.limit) {
    queryParams.append('limit', String(params.limit));
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/discounts?${queryString}` : '/discounts';

  const res = await apiFetch<PaginatedDiscountsResponse>(url, {
    method: HttpMethod.GET,
  });

  return res;
};
