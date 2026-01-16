"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LocationFormCard } from "@/components/LocationFormCard";
import { useLocationFormCard } from "@/components/LocationFormCard/useLocationFormCard";
import { Store } from "@/types/Store";
import { updateStore } from "@/services/store/updateStore";
import { ActionButtons } from "@/app/admin/_components/ActionButtons";
import { useState } from "react";

type Props = { store: Store };

export default function StoreChangeLocation({ store }: Props) {
  const router = useRouter();
  const [isSubmittiing, setIsSubmitting] = useState(false);

  const { coords, setCoords, addressName, setAddressName } =
    useLocationFormCard(
      { lat: store.latitude, lng: store.longitude },
      store.name
    );

  const handleSave = async () => {
    if (addressName.trim() === "") {
      toast.info("Address cannot empty");
    }
    try {
      setIsSubmitting(true);
      await updateStore({
        id: store.id,
        lat: coords.lat,
        lng: coords.lng,
        addressName,
      });
    } catch (error) {
      setIsSubmitting(false);
      console.warn(error);
    }
    toast.success("Location updated successfully");
    router.back();
  };

  return (
    <div className="space-y-6">
      <LocationFormCard
        title="Change Location"
        subtitle="Set new location on the map"
        coords={coords}
        setCoords={setCoords}
        addressName={addressName}
        setAddressName={setAddressName}
      />

      <ActionButtons
        isSubmitting={isSubmittiing}
        onSubmit={handleSave}
        submitText="Save Location"
      />
    </div>
  );
}
