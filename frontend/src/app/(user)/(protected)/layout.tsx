"use client";
import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = authClient.useSession();
      if (!data?.session || !data?.user) {
        router.replace(`/login?redirectTo=${window.location.pathname}`);
        return;
      }
      const userId = data.session.userId;
      const user = await apiFetch<User>(`/users/${userId}`, { method: "GET" });
      if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
        router.replace("/admin");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) return <p>Please wait...</p>;

  return <>{children}</>;
}
