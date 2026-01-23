"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { StoreInformationCard } from "./StoreInformationCard";
import { StoreInformationDialog } from "./StoreInformationDialog";
import { Store } from "@/types/Store";
import { updateStore } from "@/services/store/updateStore";
import { Employee } from "@/types/Employee";

type Props = {
  store: Store & {
    employees: Employee[];
  };
  setStore: Dispatch<
    SetStateAction<
      Store & {
        employees: Employee[];
      }
    >
  >;
};

export const StoreInformation = ({ store, setStore }: Props) => {
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isEditDescOpen, setIsEditDescOpen] = useState(false);
  const [isEditPhoneOpen, setIsEditPhoneOpen] = useState(false);

  const handleSave = async (
    field: "name" | "description" | "phone",
    value: string
  ) => {
    await updateStore({ id: store.id, [field]: value });
    setStore((prev) => {
      if (!prev) return store;
      return { ...prev, [field]: value };
    });
    setIsEditNameOpen(false);
    setIsEditDescOpen(false);
    setIsEditPhoneOpen(false);
  };

  return (
    <div className="space-y-4">
      <StoreInformationCard
        store={store}
        setIsEditNameOpen={setIsEditNameOpen}
        setIsEditDescOpen={setIsEditDescOpen}
        setIsEditPhoneOpen={setIsEditPhoneOpen}
      />

      <StoreInformationDialog
        isOpen={isEditNameOpen}
        setIsOpen={setIsEditNameOpen}
        label="Edit Store Name"
        onSave={(val) => handleSave("name", val)}
      />

      <StoreInformationDialog
        isOpen={isEditDescOpen}
        setIsOpen={setIsEditDescOpen}
        label="Edit Description"
        onSave={(val) => handleSave("description", val)}
      />

      <StoreInformationDialog
        isOpen={isEditPhoneOpen}
        setIsOpen={setIsEditPhoneOpen}
        label="Edit Phone Number"
        onSave={(val) => handleSave("phone", val)}
      />
    </div>
  );
};
