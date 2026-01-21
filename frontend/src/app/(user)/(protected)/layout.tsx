import { getSession } from "@/services/auth/getSession";
import { redirect } from "next/navigation";
import React from "react";

export default async function UserProtectedLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  console.log(user);
  if (!user) redirect("/login");

  const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";
  if (isAdmin) redirect("/admin");

  return children;
}
