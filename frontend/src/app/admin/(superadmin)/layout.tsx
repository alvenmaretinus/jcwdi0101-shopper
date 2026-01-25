import { headers } from "next/headers";
import { authClient } from "@/lib/authClient";
import { notFound, redirect } from "next/navigation";
import { getUserByEmail } from "@/services/user/getUserByEmail";

const SuperAdminLayoutPage = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
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
  const isSuperAdmin = user.role === "SUPERADMIN";
  if (!isSuperAdmin) {
    return notFound();
  }

  return children;
};

export default SuperAdminLayoutPage;
