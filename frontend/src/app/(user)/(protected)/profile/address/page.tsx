import { Button } from "@/components/ui/button";
import { getUserAddresses } from "@/services/user-address/getUserAddresses";
import { Plus } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { DefaultBadge } from "@/components/Badge/DefaultBadge";

export default async function AddressPage() {
  const nextHeaders = await headers();
  const userAddresses = await getUserAddresses(nextHeaders);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Saved Addresses</h2>
        <Button
          asChild
          className="text-primary-foreground rounded-full px-8 py-5"
        >
          <Link href="/address/create">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Link>
        </Button>
      </div>

      <div className="space-y-4 flex flex-col overflow-y-auto max-h-[45vh] sm:max-h-[55vh] md:max-h-[60vh] lg:max-h-[65vh]">
        {userAddresses.length > 0 ? (
          userAddresses.map((address) => (
            <Link key={address.id} href={`/address/${address.id}`}>
              <div className="p-4 rounded-xl border border-border hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{address.addressType}</span>
                    {address.isDefault && <DefaultBadge />}
                  </div>
                </div>
                <p className="text-muted-foreground">{address.addressName}</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground text-lg">
              No addresses saved yet
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Click "Add New" to create your first address
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
