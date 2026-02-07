import { getStores } from "@/services/store/getStores";
import { Stores } from "./_components/Stores";
import { headers } from "next/headers";

export default async function StoresPage() {
  const nextHeaders = await headers();
  const stores = await getStores(nextHeaders);

  return <Stores stores={stores} />;
}
