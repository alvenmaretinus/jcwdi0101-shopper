import { apiFetch } from "@/lib/apiFetch";
import { UserAddress } from "@/types/UserAddress";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export const getDefaultAddressByUserId = async (headers?: ReadonlyHeaders) => {
    const result = await apiFetch<UserAddress | null>(`/user-address/default`, {
        method: "GET",
        headers,
    });
    return result;
}
      