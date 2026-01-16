"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LocationFormCard } from "@/components/LocationFormCard";
import { useLocationFormCard } from "@/components/LocationFormCard/useLocationFormCard";

// Mock Data
const mockStores = [
  {
    id: "store-1",
    name: "Store A",
    addressName: "Jl. Sudirman No. 123, Jakarta",
    latitude: -6.2,
    longitude: 106.8166,
  },
  {
    id: "store-2",
    name: "Store B",
    addressName: "Jl. Thamrin No. 45, Jakarta",
    latitude: -6.21,
    longitude: 106.8451,
  },
];

export default function StoreChangeLocation() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const storeId = params.id;

  const store = mockStores.find((s) => s.id === storeId);
  if (!store) return <p> Store Not Found</p>;

  const { coords, setCoords, addressName, setAddressName } =
    useLocationFormCard(
      { lat: store.latitude, lng: store.longitude },
      store.name
    );

  const handleSave = () => {
    if (!addressName.trim()) {
      toast.info("Address will be fetched from coordinates");
    }
    toast.success("Location updated successfully");
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
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/admin/stores/${storeId}`)}
        >
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Location</Button>
      </div>
    </div>
  );
}
