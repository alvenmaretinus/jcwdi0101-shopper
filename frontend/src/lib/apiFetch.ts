import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { toast } from "sonner";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiInit = {
  method: HttpMethod;
  body?: any | undefined;
  headers?: ReadonlyHeaders;
};

class InvalidTokenError extends Error {
  constructor() {
    super("Invalid Token");
  }
}

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch<T>(
  url: string,
  input: ApiInit,
  isRetrying = false
): Promise<T> {
  const jsonHeader = input.body ? { "Content-Type": "application/json" } : {};
  const nextHeaders = input.headers ? Object.fromEntries(input.headers) : {};
  const headers = { ...jsonHeader, ...nextHeaders } as any;

  const res = await fetch(`${apiUrl}/api${url}`, {
    method: input.method,
    headers,
    body: input.body ? JSON.stringify(input.body) : undefined,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type") || "";
  let data: any;
  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => ({}));
  } else {
    data = await res.text();
  }

  if (res.ok) return data as T;

  //   if (res.status === 401 && data?.error === "Invalid Token" && !isRetrying) {
  //     const refreshRes = await fetch(`/api/auth/refresh`, {
  //       method: "POST",
  //       credentials: "include",
  //     });
  //     if (refreshRes.ok) return apiFetchCb<T>(url, input, true);
  //     throw new InvalidTokenError();
  //   }
  if (typeof window !== "undefined") {
    toast.error(data?.error || "Internal Server Error");
  }

  throw new Error(data?.error || "Request failed");
}
