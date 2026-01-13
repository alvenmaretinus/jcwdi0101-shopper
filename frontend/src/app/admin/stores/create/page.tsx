"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { MONAS_LOCATION } from "@/app/constants/location";
import { LocationFormCard } from "@/components/Map/LocationFormCard";
import StoreDetailFormCard from "./_components/StoreDetailFormCard";
import { Location } from "@/types/Location";

export default function StoreCreate() {
  const router = useRouter();
  const [location, setLocation] = useState<Location>(MONAS_LOCATION);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [addressName, setAddressName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    console.log({ name, description, location, addressName });

    // toast.success("Store created successfully");
    // router.push("/admin/stores");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/stores")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Store</h1>
          <p className="text-muted-foreground">Add a new store location</p>
        </div>
      </div>

      <StoreDetailFormCard
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
      />
      <LocationFormCard
        title="Store Location"
        subtitle="Set the location on the map"
        location={location}
        setLocation={setLocation}
        addressName={addressName}
        setAddressName={setAddressName}
      />

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/stores")}
        >
          Cancel
        </Button>
        <Button onClick={handleCreate}>Create Store</Button>
      </div>
    </div>
  );
}
