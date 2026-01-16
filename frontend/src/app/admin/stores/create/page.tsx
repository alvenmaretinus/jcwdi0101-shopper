"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MONAS_LOCATION } from "@/constants/location";
import { LocationFormCard } from "@/components/LocationFormCard";
import StoreDetailFormCard from "./_components/StoreDetailFormCard";
import { SectionHeader } from "../../_components/SectionHeader";
import { toast } from "sonner";
import { CreateStoreSchema } from "@/schemas/store/CreateStoreSchema";
import { useLocationFormCard } from "@/components/LocationFormCard/useLocationFormCard";
import { createStore } from "@/services/store/createStore";

export default function StoreCreate() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const { addressName, setAddressName, coords, setCoords } =
    useLocationFormCard(MONAS_LOCATION, "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    const inputData = { name, description, coords, phone, addressName };
    const result = CreateStoreSchema.safeParse(inputData);

    if (result.error?.message) {
      const firstError = result.error.issues[0].message;
      toast.error(firstError || "Invalid input");
      return;
    }
    try {
      setIsSubmitting(true);
      await createStore(inputData);
      toast.success("Store created successfully");
      router.push("/admin/stores");
    } catch (error) {
      setIsSubmitting(false);
      console.warn(error);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <SectionHeader
        title="Create Store"
        description="Add a new store location"
        isBackButtonEnabled={true}
      />

      <StoreDetailFormCard
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        phone={phone}
        setPhone={setPhone}
      />
      <LocationFormCard
        title="Store Location"
        subtitle="Set the location on the map"
        coords={coords}
        setCoords={setCoords}
        addressName={addressName}
        setAddressName={setAddressName}
      />

      <div className="flex justify-end gap-4">
        <Button
          variant="secondary"
          onClick={() => router.push("/admin/stores")}
        >
          Cancel
        </Button>
        <Button disabled={isSubmitting} onClick={handleCreate}>
          Create Store
        </Button>
      </div>
    </div>
  );
}
