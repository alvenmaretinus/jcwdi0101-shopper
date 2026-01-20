import { getSession } from "@/services/auth/getSession";
import { redirect } from "next/navigation";
import * as React from "react";

export default async function AuthLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (user) {
    const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";
    if (isAdmin) redirect("/admin");

    redirect("/");
  }

  return children;
}
