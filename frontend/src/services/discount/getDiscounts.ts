import { apiFetch } from "@/lib/apiFetch";
import { HttpMethod } from "@/lib/apiFetch";
import { Discount } from "@/types/Discount";

export interface GetDiscountsParams {
  type?: string;
  productId?: string;
  storeId?: string;
  isActive?: boolean;
}

export const getDiscounts = async (params?: GetDiscountsParams): Promise<Discount[]> => {
  const queryParams = new URLSearchParams();
  
  if (params?.type && params.type !== 'all') {
    queryParams.append('type', params.type);
  }
  if (params?.productId) {
    queryParams.append('productId', params.productId);
  }
  if (params?.storeId) {
    queryParams.append('storeId', params.storeId);
  }
  if (params?.isActive !== undefined) {
    queryParams.append('isActive', String(params.isActive));
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/discounts?${queryString}` : '/discounts';

  const res = await apiFetch<Discount[]>(url, {
    method: HttpMethod.GET,
  });

  return res;
};
