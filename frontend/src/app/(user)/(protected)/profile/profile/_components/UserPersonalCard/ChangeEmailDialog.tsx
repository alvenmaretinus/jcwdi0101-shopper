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
}

export const ChangeEmailDialog = ({ open, onOpenChange }: Props) => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!open) {
      setEmail("");
    }
  }, [open]);

  const handleSave = async () => {
    const { data } = z.email().safeParse(email);
    if (!data) {
      toast.error("Invalid email address");
      return;
    }
    await authClient.changeEmail({
      newEmail: email,
      callbackURL: `${window.location.origin}/profile/profile`,
    });
    toast.success("Check your new email for a confirmation link.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Email</DialogTitle>
        </DialogHeader>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter new name"
          className="mb-4"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Change Email</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
