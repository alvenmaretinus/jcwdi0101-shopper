import { getUserAddressById } from "@/services/user-address/getUserAddressById";
import { headers } from "next/headers";
import { EditAddress } from "./_components/EditAddress";

export default async function EditAddressPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const nextHeaders = await headers();
  const address = await getUserAddressById({ id, headers: nextHeaders });

  return <EditAddress address={address} />;
}
