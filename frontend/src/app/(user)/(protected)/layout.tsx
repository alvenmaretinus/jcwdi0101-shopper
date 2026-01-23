"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/authClient";
import { apiFetch } from "@/lib/apiFetch";
import { User } from "@/types/User";

export default function UserProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data } = authClient.useSession();

  useEffect(() => {
    const checkAuth = async () => {
      if (!data) {
        router.replace(`/login?redirectTo=${window.location.pathname}`);
      } else {
        const userId = data.user.id;
        const user = await apiFetch<User>(`/user/${userId}`, { method: "GET" });
        if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
          router.replace("/admin");
        }
      }
    };

    checkAuth();
  }, []);

  return <>{children}</>;
}
