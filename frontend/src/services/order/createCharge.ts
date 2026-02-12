import { apiFetch } from "@/lib/apiFetch";

export interface CreateChargeResponse {
  orderId: string;
  transactionId: string;
  redirectUrl?: string;
  token?: string;
  amount: number;
}

type ApiWrapper<T> = { success?: boolean; data?: T };

function isApiWrapper<T>(v: unknown): v is ApiWrapper<T> {
  return typeof v === "object" && v !== null && "data" in (v as object);
}

export const createCharge = async (
  orderId: string
): Promise<CreateChargeResponse | null> => {
  const response = await apiFetch<
    ApiWrapper<CreateChargeResponse> | CreateChargeResponse
  >(`/order/${orderId}/create-charge`, {
    method: "POST",
  });

  if (isApiWrapper<CreateChargeResponse>(response)) {
    return response.data ?? null;
  }

  return response as CreateChargeResponse;
};
