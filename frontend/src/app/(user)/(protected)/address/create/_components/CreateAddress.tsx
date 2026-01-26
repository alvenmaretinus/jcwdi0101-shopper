"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Coords } from "@/types/Coords";
import { useState } from "react";
import { toast } from "sonner";
import { MONAS_LOCATION } from "@/constants/location";
import { createUserAddress } from "@/services/user-address/createUserAddress";
import { useRouter } from "next/navigation";
import { AddressFormHeader } from "../../_components/AddressFormHeader";
import { RecipientSection } from "../../_components/RecipientSection";
import { LocationSection } from "../../_components/LocationSection";
import { AddressType } from "../../_components/AddressTypeSelector";

export default function CreateAddress() {
  const [coords, setCoords] = useState<Coords>(MONAS_LOCATION);
  const [addressName, setAddressName] = useState("");
  const [addressType, setAddressType] = useState<AddressType>("HOME");
  const [recipientName, setRecipientName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await createUserAddress({
        addressType,
        recipientName,
        addressName,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      toast.success("Address confirmed!");
      router.back();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 pb-32">
      <div className="max-w-2xl mx-auto">
        <Card className="border-none shadow-xl bg-emerald-600 overflow-hidden rounded-2xl">
          <AddressFormHeader
            title="Add New Address"
            subtitle="Please fill in your delivery details below"
          />

          <CardContent className="p-6 -mt-4 bg-white space-y-8">
            <RecipientSection
              name={recipientName}
              setName={setRecipientName}
              type={addressType}
              setType={setAddressType}
            />

            <hr className="border-slate-100" />

            <LocationSection
              coords={coords}
              setCoords={setCoords}
              addressName={addressName}
              setAddressName={setAddressName}
            />
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="h-14 px-6 border-white/20 bg-white hover:bg-gray-100 text-gray-600 font-bold rounded-2xl transition-all text-lg"
            >
              Back
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 h-14 bg-white hover:bg-gray-100 text-emerald-600 font-bold rounded-2xl transition-all text-lg flex gap-2"
            >
              {isLoading ? "Confirming..." : "Confirm Delivery Address"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
