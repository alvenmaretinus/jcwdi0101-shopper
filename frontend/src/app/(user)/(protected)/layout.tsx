"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/authClient";
import { apiFetch } from "@/lib/apiFetch";
import { User } from "@/types/User";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function UserProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  useEffect(() => {
    const checkAuth = async () => {
      if (!data && !isPending) {
        router.replace(`/login?redirectTo=${window.location.pathname}`);
      } else if (data && !isPending) {
        const userId = data.user.id;
        const user = await apiFetch<User>(`/user/${userId}`, { method: "GET" });
        if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
          router.replace("/admin");
        }
      }
    };

    checkAuth();
  }, [isPending]);

  if (isPending || !data) return <LoadingScreen />;

  return <>{children}</>;
}
