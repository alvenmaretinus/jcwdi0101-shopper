import { DeleteDialog } from "@/components/Dialog/DeleteDialog";
import { Button } from "@/components/ui/button";
import { deleteStoreById } from "@/services/store/deleteStoreById";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  storeId: string;
};

const DeleteStoreDialog = ({ storeId }: Props) => {
  const [isDeleteStoreOpen, setIsDeleteStoreOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteStore = async () => {
    try {
      setIsDeleting(true);
      await deleteStoreById({ id: storeId });
      router.push("/admin/stores/");
    } catch (error) {
    } finally {
      setIsDeleting(false);
      setIsDeleteStoreOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsDeleteStoreOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-2" /> Delete Store
      </Button>
      <DeleteDialog
        isOpen={isDeleteStoreOpen}
        setIsOpen={setIsDeleteStoreOpen}
        onConfirm={handleDeleteStore}
        confirmText="Yes, Delete"
        title="Delete Store?"
        description="This action cannot be undone."
        disabled={isDeleting}
      />
    </>
  );
};

export default DeleteStoreDialog;
