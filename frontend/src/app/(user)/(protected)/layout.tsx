"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/services/auth/getSession";

export default function UserProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getSession();
      if (!user) {
        router.replace(`/login?redirectTo=${window.location.pathname}`);
        return;
      }

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
