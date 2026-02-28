import { redirect } from "next/navigation";

const AdminPage = () => {
  redirect("/admin/orders");
};

export default AdminPage;
