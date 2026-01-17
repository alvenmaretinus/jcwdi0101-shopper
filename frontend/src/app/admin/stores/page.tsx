import { getStores } from "@/services/store/getStores";
import { Stores } from "./_components/Stores";

export default async function StoresPage() {
  const stores = await getStores();

  return <Stores stores={stores} />;
}
