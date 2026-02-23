import { apiFetch, HttpMethod } from '@/lib/apiFetch';
import { Voucher } from '@/types/Voucher';
import { toast } from 'sonner';

export interface CreateVoucherInput {
  code: string;
  name: string;
  percentage?: number;
  amount?: number;
  buyQuantity?: number;
  freeQuantity?: number;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
  voucherType: 'REFERRAL' | 'TRANSACTIONAL' | 'FREEDELIVERY';
  isWithMinimum: boolean;
  minimumPrice?: number;
  startsAt?: Date;
  endsAt?: Date;
}

export async function createVoucher(data: CreateVoucherInput): Promise<Voucher> {
  const voucher = await apiFetch<Voucher>('/vouchers', {
    method: HttpMethod.POST,
    body: data,
  });

  if (typeof window !== 'undefined') {
    toast.success('Voucher created successfully');
  }

  return voucher;
}
