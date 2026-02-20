import { apiFetch, HttpMethod } from '@/lib/apiFetch';
import { Voucher } from '@/types/Voucher';

interface GetVouchersParams {
  voucherType?: string;
  isRedeemed?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedVouchersResponse {
  data: Voucher[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getVouchers(params?: GetVouchersParams): Promise<PaginatedVouchersResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.voucherType && params.voucherType !== 'all') {
    searchParams.append('voucherType', params.voucherType);
  }
  
  if (params?.isRedeemed !== undefined) {
    searchParams.append('isRedeemed', params.isRedeemed.toString());
  }

  if (params?.page) {
    searchParams.append('page', String(params.page));
  }
  
  if (params?.limit) {
    searchParams.append('limit', String(params.limit));
  }

  const path = `/vouchers${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  return await apiFetch<PaginatedVouchersResponse>(path, {
    method: HttpMethod.GET,
  });
}
