"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LocationFormCard } from "@/components/LocationFormCard";
import { useLocationFormCard } from "@/components/LocationFormCard/useLocationFormCard";
import { Store } from "@/types/Store";
import { updateStore } from "@/services/store/updateStore";

type Props = { store: Store };

export default function StoreChangeLocation({ store }: Props) {
  const router = useRouter();

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
      await updateStore({ id: store.id, coords, addressName });
    } catch (error) {
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

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Location</Button>
      </div>
    </div>
  );
}
