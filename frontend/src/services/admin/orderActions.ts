import { apiFetch } from "@/lib/apiFetch";

export const approveOrder = async (orderId: string) => {
  return apiFetch(`/order/${orderId}/approve`, { method: "POST" });
};

export const shipOrder = async (orderId: string) => {
  return apiFetch(`/order/${orderId}/ship`, { method: "POST" });
};

export const adminCancelOrder = async (orderId: string, reason?: string) => {
  return apiFetch(`/order/${orderId}/admin-cancel`, {
    method: "POST",
    body: { reason },
  });
};

export const rejectPaymentProof = async (orderId: string, reason?: string) => {
  return apiFetch(`/order/payment-proof/${orderId}/reject-proof`, {
    method: "POST",
    body: { reason },
  });
};
