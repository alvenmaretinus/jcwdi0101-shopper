import { apiFetch, HttpMethod } from '@/lib/apiFetch';
import { toast } from 'sonner';

export async function deleteVoucher(id: string): Promise<void> {
  await apiFetch(`/vouchers/${id}`, {
    method: HttpMethod.DELETE,
  });

  if (typeof window !== 'undefined') {
    toast.success('Voucher deleted successfully');
  }
}
