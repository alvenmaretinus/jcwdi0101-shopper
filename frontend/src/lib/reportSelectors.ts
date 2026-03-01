import { apiFetch, HttpMethod } from '@/lib/apiFetch';
import { getStores } from '@/services/store/getStores';
import { SelectableItem } from '@/types/common';

export async function fetchStoresForSelect(
  name: string | undefined,
  page: number,
  limit: number
): Promise<{ data: SelectableItem[]; meta: any }> {
  const response = await getStores({
    query: { page, search: name || '', sortBy: 'createdAt', sortOrder: 'desc' },
  });
  return {
    data: (response.data || []).map((store) => ({ id: store.id, name: store.name })),
    meta: response.meta,
  };
}

export async function fetchProductsForSelect(
  name: string | undefined,
  page: number,
  limit: number,
  storeId?: string | null | undefined
): Promise<{ data: SelectableItem[]; meta: any }> {
  let url = `/product?withStock=true&page=${page}&limit=${limit}`;
  if (storeId && storeId !== 'all') url += `&storeId=${storeId}`;
  if (name) url += `&name=${encodeURIComponent(name)}`;

  const response = await apiFetch<any>(url, { method: HttpMethod.GET });
  if (response && 'data' in response) {
    return {
      data: (response.data || []).map((product: any) => ({ id: product.id, name: product.name })),
      meta: response.meta,
    };
  }
  return { data: [], meta: { page: 1, limit, total: 0, totalPages: 0 } };
}
