"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Coords } from "@/types/Coords";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateUserAddressById } from "@/services/user-address/updateUserAddressById";
import { useRouter } from "next/navigation";
import { UserAddress } from "@/types/UserAddress";
import { AddressFormHeader } from "../../../_components/AddressFormHeader";
import { RecipientSection } from "../../../_components/RecipientSection";
import { LocationSection } from "../../../_components/LocationSection";
import { AddressType } from "../../../_components/AddressTypeSelector";
import { DefaultAddressToggle } from "./DefaultAddressToggle";
import { DeleteAddressDialog } from "./DeleteAddressDialog";

type Props = { address: UserAddress };

export function EditAddress({ address }: Props) {
  const router = useRouter();

  const [coords, setCoords] = useState<Coords>({
    lat: address.latitude,
    lng: address.longitude,
  });
  const [addressName, setAddressName] = useState(address.addressName);
  const [addressType, setAddressType] = useState<AddressType>(
    address.addressType
  );
  const [recipientName, setRecipientName] = useState(address.recipientName);
  const [isDefault, setIsDefault] = useState(address.isDefault);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await updateUserAddressById({
        id: address.id,
        addressType,
        recipientName,
        addressName,
        latitude: coords.lat,
        longitude: coords.lng,
        isDefault,
      });
      toast.success("Address updated successfully!");
      router.push("/profile/address");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 pb-32">
      <div className="max-w-2xl mx-auto">
        <Card className="border-none shadow-xl bg-emerald-600 overflow-hidden rounded-2xl relative">
          <AddressFormHeader
            title="Edit Address"
            subtitle="Modify your address details below"
          />

          <DeleteAddressDialog id={address.id}>
            <button
              type="button"
              className="absolute top-6 right-6 flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-md active:scale-95 text-sm font-semibold border border-red-400/30"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete address</span>
            </button>
          </DeleteAddressDialog>

          <CardContent className="p-6 -mt-4 bg-white space-y-8">
            <RecipientSection
              name={recipientName}
              setName={setRecipientName}
              type={addressType}
              setType={setAddressType}
            />

            <DefaultAddressToggle
              disabled={address.isDefault}
              isDefault={isDefault}
              setIsDefault={setIsDefault}
            />

            <hr className="border-slate-100" />

            <LocationSection
              coords={coords}
              setCoords={setCoords}
              addressName={addressName}
              setAddressName={setAddressName}
            />
          </CardContent>

          <CardFooter className="flex gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => router.push("/profile/address")}
              className="h-14 px-6 border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all text-lg"
            >
              Back
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isLoading}
              className="flex-1 h-14 bg-white border-2 border-emerald-100 hover:bg-gray-100 text-emerald-600 font-bold rounded-2xl transition-all text-lg"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
