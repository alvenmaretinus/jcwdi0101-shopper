"use client";

import { SectionHeader } from "@/app/admin/_components/SectionHeader";
import DeleteStoreDialog from "./DeleteStoreDialog";
import { StoreInformation } from "./StoreInformation";
import { Store } from "@/types/Store";
import { Employee } from "@/types/Employee";
import { useState } from "react";
import { StoreAdmin } from "./StoreAdmin";
import { useRouter } from "next/navigation";

type Props = {
  initialStore: Store & {
    employees: Employee[];
  };
};
export const StoreDetail = ({ initialStore }: Props) => {
  const [store, setStore] = useState(initialStore);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title={store.name}
          description="Store details and admin management"
          onBack={() => router.push("/admin/stores")}
        />
        <DeleteStoreDialog storeId={store.id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StoreInformation store={store} setStore={setStore} />

        <StoreAdmin storeWithEmployees={store} />
      </div>
    </div>
  );
};
