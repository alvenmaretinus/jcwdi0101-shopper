import { apiFetch } from "@/lib/apiFetch";
import { HttpMethod } from "@/lib/apiFetch";
import { Discount } from "@/types/Discount";

export const getDiscountById = async (id: string): Promise<Discount> => {
  const res = await apiFetch<Discount>(`/discounts/${id}`, {
    method: HttpMethod.GET,
  });

  return res;
};
