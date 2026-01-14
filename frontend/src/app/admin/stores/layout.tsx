import { notFound } from "next/navigation";

const StoresLayoutPage = ({ children }: { children: React.ReactNode }) => {
  const user = { role: "SUPER_ADMIN" };
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  if (!isSuperAdmin) return notFound();

  return <>{children}</>;
};

export default StoresLayoutPage;
