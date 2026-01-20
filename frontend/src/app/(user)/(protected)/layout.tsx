import { getSession } from "@/services/auth/getSession";
import { redirect } from "next/navigation";
import React from "react";

export default async function UserProtectedLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const user = await getSession();

    const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";

    if (isAdmin) redirect("/admin");
  } catch (error) {
    redirect("/");
  }
  return children;
}
