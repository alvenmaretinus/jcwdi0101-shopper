"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authClient } from "@/lib/authClient";
import { compareTimeFromNow } from "@/lib/compareTime";
import { applyReferralCode } from "@/services/referral/applyReferralCode";

export function ReferralCodeModal() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data } = authClient.useSession();
  const user = data?.user;

  useEffect(() => {
    if (user) {
      const { minutes } = compareTimeFromNow(user.createdAt);
      if (minutes < 5) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOpen(true);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return toast.error("Please enter a referral code.");

    setIsLoading(true);
    try {
      await applyReferralCode(code.trim());
      toast.success("Referral code applied! You've received a reward voucher.");
      setOpen(false);
    } catch {
      // Error toast is already handled by apiFetch
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Have a referral code?</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referral-code">Referral Code</Label>
            <Input
              id="referral-code"
              placeholder="Enter REFERRAL CODE"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="uppercase"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Applying..." : "Apply Code"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip for now
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          You can still add a referral code within <strong>30 days</strong>{" "}
          after signup from your profile settings.
        </p>
      </DialogContent>
    </Dialog>
  );
}
