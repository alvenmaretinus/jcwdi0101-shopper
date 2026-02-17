import { apiFetch, HttpMethod } from '@/lib/apiFetch';
import { Voucher } from '@/types/Voucher';

interface GetVouchersParams {
  voucherType?: string;
  isRedeemed?: boolean;
}

export async function getVouchers(params?: GetVouchersParams): Promise<Voucher[]> {
  const searchParams = new URLSearchParams();
  
  if (params?.voucherType && params.voucherType !== 'all') {
    searchParams.append('voucherType', params.voucherType);
  }
  
  if (params?.isRedeemed !== undefined) {
    searchParams.append('isRedeemed', params.isRedeemed.toString());
  }

  const path = `/vouchers${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  return await apiFetch<Voucher[]>(path, {
    method: HttpMethod.GET,
  });
}
