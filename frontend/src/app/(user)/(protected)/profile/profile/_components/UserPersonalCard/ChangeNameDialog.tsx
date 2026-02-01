import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/authClient";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName?: string;
}

export const ChangeNameDialog = ({
  open,
  onOpenChange,
  currentName,
}: Props) => {
  const [name, setName] = useState(currentName || "");

  useEffect(() => {
    if (!open) {
      setName("");
    }
  }, [open]);

  const handleSave = async () => {
    const { data } = z
      .string()
      .min(4, "Name must be at least 4 characters")
      .safeParse(name);
    if (!data) {
      toast.error("Name must be at least 4 characters");
      return;
    }
    await authClient.updateUser({ name });
    toast.success("Name updated successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Name</DialogTitle>
        </DialogHeader>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter new name"
          className="mb-4"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
