"use client";

import { authClient } from "@/lib/authClient";
import { getUserByEmail } from "@/services/user/getUserByEmail";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminRedirect() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();
  const user = data?.user;
  useEffect(() => {
    if (isPending) return;

    const initialFetch = async () => {
      if (user) {
        const dbUser = await getUserByEmail(data?.user.email);
        const isAdmin =
          dbUser?.role === "ADMIN" || dbUser?.role === "SUPERADMIN";
        if (isAdmin) {
          router.push("/admin/orders");
        }
      }
    };

    initialFetch();
  }, [data, isPending]);

  return null;
}
