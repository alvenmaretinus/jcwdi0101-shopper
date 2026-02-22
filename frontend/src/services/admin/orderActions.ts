import { apiFetch } from "@/lib/apiFetch";

type AutoDeliverResult = {
  count: number;
};

type AutoCompleteResult = {
  count: number;
  rewardGrantedCount: number;
};

type ApiWrapper<T> = {
  success: boolean;
  data: T;
  message?: string;
};

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

export const triggerAutoDeliver = async () => {
  return apiFetch<ApiWrapper<AutoDeliverResult>>("/order/admin/auto-deliver", {
    method: "POST",
  });
};

export const triggerAutoComplete = async () => {
  return apiFetch<ApiWrapper<AutoCompleteResult>>("/order/admin/auto-complete", {
    method: "POST",
  });
};
