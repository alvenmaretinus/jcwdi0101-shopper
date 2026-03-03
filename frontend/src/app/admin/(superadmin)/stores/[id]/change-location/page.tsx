import { getStoreById } from "@/services/store/getStoreById";
import StoreChangeLocation from "./_components/StoreChangeLocation";
import { headers } from "next/dist/server/request/headers";

export default async function StoreChangeLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const nextHeaders = await headers();
  const store = await getStoreById({ id }, nextHeaders);

  if (!store) return <p> Store Not Found </p>;

  return <StoreChangeLocation store={store} />;
}
