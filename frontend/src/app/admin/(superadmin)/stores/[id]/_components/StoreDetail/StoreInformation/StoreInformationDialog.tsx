import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  label: string;
  onSave: (newValue: string) => void;
};

export const StoreInformationDialog = ({
  isOpen,
  setIsOpen,
  label,
  onSave,
}: Props) => {
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (!isOpen) setEditValue("");
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editValue)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
