import { apiFetch } from "@/lib/apiFetch";

export const confirmOrder = async (orderId: string) => {
  const res = await apiFetch(`/order/${orderId}/confirm`, {
    method: "POST",
  });
  return res;
};

export default confirmOrder;
