"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StoreInformationCardField from "./StoreInformationCardField";
import { useRouter } from "next/navigation";
import { Store } from "@/types/Store";
import { Dispatch, SetStateAction } from "react";
import { format } from "date-fns";

type Props = {
  store: Store;
  setIsEditNameOpen: Dispatch<SetStateAction<boolean>>;
  setIsEditDescOpen: Dispatch<SetStateAction<boolean>>;
  setIsEditPhoneOpen: Dispatch<SetStateAction<boolean>>;
};

export const StoreInformationCard = ({
  store,
  setIsEditDescOpen,
  setIsEditNameOpen,
  setIsEditPhoneOpen,
}: Props) => {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Information</CardTitle>
        <CardDescription>Basic details about this store</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <StoreInformationCardField
          title="Store Name"
          value={store.name}
          onEditClick={() => setIsEditNameOpen(true)}
        />
        <StoreInformationCardField
          title="Description"
          value={store.description}
          onEditClick={() => setIsEditDescOpen(true)}
        />
        <StoreInformationCardField
          title="Phone Number"
          value={store.phone}
          onEditClick={() => setIsEditPhoneOpen(true)}
        />
        <StoreInformationCardField
          title="Location"
          value={store.addressName}
          onEditClick={() =>
            router.push(`/admin/stores/${store.id}/change-location`)
          }
        />
        <StoreInformationCardField
          title="Created"
          value={format(store.createdAt, "MMMM dd, yyyy")}
        />
      </CardContent>
    </Card>
  );
};
