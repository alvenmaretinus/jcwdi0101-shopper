import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { toast } from "sonner";

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export type ApiInit = {
  method: HttpMethod;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any | undefined;
  headers?: ReadonlyHeaders;
};

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch<T>(url: string, input: ApiInit): Promise<T> {
  const jsonHeader = input.body ? { "Content-Type": "application/json" } : {};
  const nextHeaders = input.headers ? Object.fromEntries(input.headers) : {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headers = { ...jsonHeader, ...nextHeaders } as any;
  try {
    const res = await fetch(`${apiUrl}/api${url}`, {
      method: input.method,
      headers,
      body: input.body ? JSON.stringify(input.body) : undefined,
      credentials: "include",
    });

    const contentType = res.headers.get("content-type") || "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;
    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      data = await res.text();
    }

    if (res.ok) return data as T;

    if (typeof window !== "undefined") {
      toast.error(data?.error || "Internal Server Error");
    }

    throw new Error(data?.error || "Request failed");
  } catch (error) {
    throw error;
  }
}
