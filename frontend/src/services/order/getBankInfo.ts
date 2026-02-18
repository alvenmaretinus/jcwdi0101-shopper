import { apiFetch } from "@/lib/apiFetch";

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  bankCode?: string;
}

type ApiWrapper<T> = { success?: boolean; data?: T };

function isApiWrapper<T>(v: unknown): v is ApiWrapper<T> {
  return typeof v === "object" && v !== null && "data" in (v as object);
}

export const getBankInfo = async (): Promise<BankInfo | null> => {
  // endpoint is mounted under /order/payment-proof on the backend
  const response = await apiFetch<ApiWrapper<BankInfo> | BankInfo>(
    "/order/payment-proof/bank-info",
    { method: "GET" }
  );

  if (isApiWrapper<BankInfo>(response)) {
    return response.data ?? null;
  }

  return response as BankInfo;
};
