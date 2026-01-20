"use client";

import { useState } from "react";
import { MONAS_LOCATION } from "@/constants/location";
import { LocationFormCard } from "@/components/LocationFormCard";
import StoreDetailFormCard from "./_components/StoreDetailFormCard";
import { SectionHeader } from "../../_components/SectionHeader";
import { useLocationFormCard } from "@/components/LocationFormCard/useLocationFormCard";
import { createStore } from "@/services/store/createStore";
import { ActionButtons } from "../../_components/ActionButtons";
import { useRouter } from "next/navigation";

export default function StoreCreate() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const { addressName, setAddressName, coords, setCoords } =
    useLocationFormCard(MONAS_LOCATION, "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    const inputData = { name, description, coords, phone, addressName };

    try {
      setIsSubmitting(true);
      await createStore(inputData);
      window.location.href = "/admin/stores/";
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <SectionHeader
        title="Create Store"
        description="Add a new store location"
        onBack={() => router.push("/admin/stores")}
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

      <ActionButtons
        onCancel={() => router.push("/admin/stores")}
        submitText="Create Store"
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
