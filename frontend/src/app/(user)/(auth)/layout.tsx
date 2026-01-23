"use client";

import { apiFetch } from "@/lib/apiFetch";
import { authClient } from "@/lib/authClient";
import { User } from "@/types/User";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export default function AuthLayoutPage({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await authClient.getSession();

        const isAuthenticated = !!data?.user;
        if (!isAuthenticated) {
          setLoading(false);
          return;
        }

        const userId = data.user.id;
        const user = await apiFetch<User>(`/user/${userId}`, {
          method: "GET",
        });

        const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";
        if (isAdmin) {
          router.replace("/admin");
        } else {
          router.replace("/");
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) return <p>Please wait...</p>;

  return <>{children};</>;
}
