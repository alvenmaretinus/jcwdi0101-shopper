import { apiFetch, HttpMethod } from "@/lib/apiFetch";
import { Discount } from "@/types/Discount";

export interface GetProductsWithDiscountsParams {
  type?: string;
  productId?: string;
  storeId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductWithDiscount extends Discount {
  product?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    weight: number;
    categoryId: string;
    category?: {
      id: string;
      name: string;
    };
    productImages?: Array<{
      id: string;
      url: string;
    }>;
    productStores?: Array<{
      id: string;
      quantity: number;
      storeId: string;
      productId: string;
      store: {
        id: string;
        name: string;
      };
    }>;
    discountedPricing?: {
      discountedPrice: number;
      totalDiscount: number;
      appliedCount: number;
      appliedDiscounts: Array<{
        id: string;
        name: string;
        label: string;
        savedAmount: number;
        endsAt?: string | Date | null;
      }>;
      earliestEndsAt?: string | Date | null;
      quantityDiscounts?: Array<{
        id: string;
        name: string;
        buyQuantity: number;
        freeQuantity: number;
        endsAt?: string | Date | null;
      }>;
    };
  };
}

export interface PaginatedProductsWithDiscountsResponse {
  data: ProductWithDiscount[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getProductsWithDiscounts = async (params?: GetProductsWithDiscountsParams): Promise<PaginatedProductsWithDiscountsResponse> => {
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
  const url = queryString ? `/discounts/products?${queryString}` : '/discounts/products';

  const res = await apiFetch<PaginatedProductsWithDiscountsResponse>(url, {
    method: HttpMethod.GET,
  });

  return res;
};
