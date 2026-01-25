"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { LocationForm } from "@/components/LocationForm";
import { useLocationForm } from "@/components/LocationForm/useLocationForm";
import { Store } from "@/types/Store";
import { updateStore } from "@/services/store/updateStore";
import { ActionButtons } from "@/app/admin/_components/ActionButtons";
import { useState } from "react";

type Props = { store: Store };

export default function StoreChangeLocation({ store }: Props) {
  const router = useRouter();
  const [isSubmittiing, setIsSubmitting] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { coords, setCoords, addressName, setAddressName } = useLocationForm(
    { lat: store.latitude, lng: store.longitude },
    store.addressName
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
      window.location.href = `/admin/stores/${id}`;
    } catch (error) {
      setIsSubmitting(false);
      console.warn(error);
    }
  };

  return (
    <div className="space-y-6">
      <LocationForm
        coords={coords}
        setCoords={setCoords}
        addressName={addressName}
        setAddressName={setAddressName}
      />

      <ActionButtons
        isSubmitting={isSubmittiing}
        onSubmit={handleSave}
        submitText="Save Location"
        onCancel={() => router.push(`/admin/stores/${id}`)}
      />
    </div>
  );
}
