"use client";

import { useState } from "react";
import { MONAS_LOCATION } from "@/constants/location";
import { LocationForm } from "@/components/LocationForm";
import { useLocationForm } from "@/components/LocationForm/useLocationForm";
import { createStore } from "@/services/store/createStore";
import { useRouter } from "next/navigation";
import StoreDetailFormCard from "./_components/StoreDetailFormCard";
import { SectionHeader } from "@/app/admin/_components/SectionHeader";
import { ActionButtons } from "@/app/admin/_components/ActionButtons";

export default function StoreCreate() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const { addressName, setAddressName, coords, setCoords } =
    useLocationForm(MONAS_LOCATION);
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
      <LocationForm
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
