"use client";

import { AdminLayout } from "./_components/AdminLayout";

const AdminLayoutPage = ({ children }: { children: React.ReactNode }) => {
  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminLayoutPage;
