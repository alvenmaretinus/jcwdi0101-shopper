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
import { Dispatch, SetStateAction, useState } from "react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateStore } from "@/services/store/updateStore";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSetDefault = async () => {
    setIsLoading(true);
    try {
      await updateStore({ id: store.id, isDefault: true });
      window.location.reload();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

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

        <div className="flex items-center justify-between py-4 mt-4">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Default Store</Label>
            <p className="text-xs text-muted-foreground">
              {store.isDefault 
                ? "This is currently your default store" 
                : "Set this store as the default for the platform"}
            </p>
          </div>
          <Switch
            checked={store.isDefault}
            disabled={store.isDefault || isLoading}
            onCheckedChange={(checked) => {
              if (checked) {
                setShowConfirmDialog(true);
              }
            }}
          />
        </div>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Set as Default Store?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to set <strong>{store.name}</strong> as the
                default store? This will unset other store currently marked
                as default.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSetDefault}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
