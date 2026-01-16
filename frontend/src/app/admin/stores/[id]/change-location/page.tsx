import { getStoreById } from "@/services/store/getStoreById";
import StoreChangeLocation from "./_components/StoreChangeLocation";

export default async function StoreChangeLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await getStoreById({ id });

  return <StoreChangeLocation store={store} />;
}
