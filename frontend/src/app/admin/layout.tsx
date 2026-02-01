import { headers } from "next/headers";
import { AdminLayout } from "./_components/AdminLayout";
import { authClient } from "@/lib/authClient";
import { notFound, redirect } from "next/navigation";
import { getUserByEmail } from "@/services/user/getUserByEmail";

const AdminLayoutPage = async ({ children }: { children: React.ReactNode }) => {
  const nextHeaders = await headers();
  const { data } = await authClient.getSession({
    fetchOptions: {
      headers: nextHeaders,
    },
  });

  if (!data) {
    return redirect("/login");
  }

  const user = await getUserByEmail(data.user.email, nextHeaders);
  if (!user) {
    return redirect("/login");
  }
  const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";
  if (!isAdmin) {
    return notFound();
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminLayoutPage;
