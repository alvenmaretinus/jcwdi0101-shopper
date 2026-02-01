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
  setStoreWithEmployees: Dispatch<
    SetStateAction<
      Store & {
        employees: User[];
      }
    >
  >;
};

export const RemoveAdminDialog = ({
  isOpen,
  setIsOpen,
  store,
  selectedAdmin,
  setSelectedAdmin,
  setStoreWithEmployees,
}: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemove = async () => {
    if (!selectedAdmin?.id) return;
    try {
      setIsDeleting(true);
      const removedEmployee = await removeEmployee({
        id: store.id,
        employeeId: selectedAdmin.id,
      });
      setStoreWithEmployees((prev) => {
        const { employees, ...store } = prev;
        return {
          ...store,
          employees: employees.filter((e) => e.id !== removedEmployee.id),
        };
      });
      setIsDeleting(false);
      setIsOpen(false);
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
