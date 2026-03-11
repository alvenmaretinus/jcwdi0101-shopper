import { apiFetch, HttpMethod } from '@/lib/apiFetch';
import { Voucher } from '@/types/Voucher';
import { toast } from 'sonner';

export interface UpdateVoucherInput {
  id: string;
  code?: string;
  name?: string;
  percentage?: number;
  amount?: number;
  buyQuantity?: number;
  freeQuantity?: number;
  type?: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
  voucherType?: 'REFERRAL' | 'TRANSACTIONAL' | 'FREEDELIVERY';
  isWithMinimum?: boolean;
  minimumPrice?: number;
  startsAt?: Date;
  endsAt?: Date;
}

export async function updateVoucher(data: UpdateVoucherInput): Promise<Voucher> {
  const { id, ...body } = data;

  const voucher = await apiFetch<Voucher>(`/vouchers/${id}`, {
    method: HttpMethod.PATCH,
    body,
  });

  if (typeof window !== 'undefined') {
    toast.success('Voucher updated successfully');
  }

  return voucher;
}
