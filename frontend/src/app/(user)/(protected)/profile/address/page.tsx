import { Button } from "@/components/ui/button";
import { getUserAddresses } from "@/services/user-address/getUserAddresses";
import { Plus, MapPin, Home, Building2 } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { DefaultBadge } from "@/components/Badge/DefaultBadge";
import { cn } from "@/lib/utils";

const AddressTypeIcon = ({ type }: { type: string }) => {
  const isHome = type === "HOME";
  return (
    <div
      className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
        isHome ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
      )}
    >
      {isHome ? (
        <Home className="h-6 w-6" />
      ) : (
        <Building2 className="h-6 w-6" />
      )}
    </div>
  );
};

export default async function AddressPage() {
  const nextHeaders = await headers();
  const userAddresses = await getUserAddresses(nextHeaders);

  return (
    <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">Saved Addresses</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {userAddresses.length} address
            {userAddresses.length !== 1 ? "es" : ""} saved
          </p>
        </div>
        <Button asChild className="rounded-full px-4 sm:px-6 h-10" size="sm">
          <Link href="/address/create">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add New</span>
          </Link>
        </Button>
      </div>

      {/* Address List - with overflow */}
      <div className="flex flex-col overflow-y-auto max-h-[50vh] sm:max-h-[55vh] md:max-h-[60vh]">
        {userAddresses.length > 0 ? (
          userAddresses.map((address, index) => (
            <Link
              key={address.id}
              href={`/address/${address.id}`}
              className={cn(
                "group flex items-start gap-3 p-4 transition-colors",
                "hover:bg-muted/50 active:bg-muted",
                index !== userAddresses.length - 1 && "border-b border-border"
              )}
            >
              <AddressTypeIcon type={address.addressType} />

              <div className="flex-1 min-w-0">
                {/* Header row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm sm:text-base">
                    {address.addressType === "HOME" ? "Home" : "Office"}
                  </span>
                  {address.isDefault && <DefaultBadge />}
                </div>

                {/* Address details */}
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {address.addressName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {address.recipientName} • {address.postCode}
                </p>
              </div>
            </Link>
          ))
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <MapPin className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No addresses saved yet</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-xs">
              Add your home or office address for faster checkout
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link href="/address/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
