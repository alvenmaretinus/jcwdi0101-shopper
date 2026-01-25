import { DeleteDialog } from "@/components/Dialog/DeleteDialog";
import { removeEmployee } from "@/services/store/removeEmployee";
import { Store } from "@/types/Store";
import { User } from "@/types/User";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  store: Store;
  selectedAdmin: User | null;
  setSelectedAdmin: Dispatch<SetStateAction<User | null>>;
};

export const RemoveAdminDialog = ({
  isOpen,
  setIsOpen,
  store,
  selectedAdmin,
  setSelectedAdmin,
}: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemove = async () => {
    if (!selectedAdmin?.id) return;
    try {
      setIsDeleting(true);
      await removeEmployee({
        id: store.id,
        employeeId: selectedAdmin.id,
      });
      window.location.reload();
    } catch (error) {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) setSelectedAdmin(null);
  }, [isOpen]);

  return (
    <DeleteDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Remove Admin?"
      description={`Are you sure you want to remove (${
        selectedAdmin?.email || "this admin"
      }) from (${store.name})?`}
      confirmText="Yes, Remove"
      onConfirm={handleRemove}
      disabled={isDeleting}
    />
  );
};
