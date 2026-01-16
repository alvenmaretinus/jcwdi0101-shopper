import { DeleteDialog } from "@/components/Dialog/DeleteDialog";
import { deleteStoreById } from "@/services/store/deleteStoreById";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

type Props = {
  isDeleteStoreOpen: boolean;
  setIsDeleteStoreOpen: Dispatch<SetStateAction<boolean>>;
  storeId: string;
};

const DeleteStoreDialog = ({
  isDeleteStoreOpen,
  setIsDeleteStoreOpen,
  storeId,
}: Props) => {
  const router = useRouter();

  const handleDeleteStore = async () => {
    try {
      const store = await deleteStoreById({ id: storeId });
      console.log(store);
      toast.success(`${store.name} Deleted successfully`);
      router.back();
    } catch (error) {
      setIsDeleteStoreOpen(false);
    }
  };
  return (
    <DeleteDialog
      isOpen={isDeleteStoreOpen}
      setIsOpen={setIsDeleteStoreOpen}
      onConfirm={handleDeleteStore}
      confirmText="Yes, Delete"
      title="Delete Store?"
      description="This action cannot be undone."
    />
  );
};

export default DeleteStoreDialog;
