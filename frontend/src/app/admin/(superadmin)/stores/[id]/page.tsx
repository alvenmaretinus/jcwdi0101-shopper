import { getStoreByIdWithEmployees } from "@/services/store/getStoreByIdWithEmployees";
import { StoreDetail } from "./_components/StoreDetail";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storeWithEmployee = await getStoreByIdWithEmployees({ id });
  if (!storeWithEmployee) return <p>Store not found</p>;

  return <StoreDetail initialStore={storeWithEmployee} />;
}
