// Use direct fetch for multipart upload to avoid apiFetch JSON handling
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const uploadPaymentProof = async (orderId: string, file: File) => {
  const formData = new FormData();
  formData.append("proof", file);

  const res = await fetch(
    `${apiUrl}/api/order/payment-proof/${orderId}/upload-proof`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  );

  const contentType = res.headers.get("content-type") || "";
  let data: unknown = null;
  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => ({}) as unknown);
  } else {
    data = await res.text();
  }

  const getErrorMessage = (d: unknown) => {
    if (typeof d === "string") return d;
    if (typeof d === "object" && d !== null) {
      const m = (d as { message?: unknown }).message;
      if (typeof m === "string") return m;
      const e = (d as { error?: unknown }).error;
      if (typeof e === "string") return e;
    }
    return "Upload failed";
  };

  if (!res.ok) throw new Error(getErrorMessage(data));

  type ApiWrapper<T> = { success?: boolean; data?: T };
  const isApiWrapper = <T>(v: unknown): v is ApiWrapper<T> =>
    typeof v === "object" && v !== null && "data" in (v as object);

  if (isApiWrapper<unknown>(data)) return data.data ?? null;
  return data;
};
