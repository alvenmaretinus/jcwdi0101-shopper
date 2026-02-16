import { getStoreByIdWithEmployees } from "@/services/store/getStoreByIdWithEmployees";
import { StoreDetail } from "./_components/StoreDetail";
import { headers } from "next/headers";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const nextHeaders = await headers();
  const storeWithEmployee = await getStoreByIdWithEmployees(
    { id },
    nextHeaders
  );
  if (!storeWithEmployee) return <p>Store not found</p>;

  return <StoreDetail initialStore={storeWithEmployee} />;
}
