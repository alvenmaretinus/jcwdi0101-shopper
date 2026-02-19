"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authClient } from "@/lib/authClient";
import { compareTimeFromNow } from "@/lib/compareTime";

export const EnterReferralCodeCard = () => {
  const [code, setCode] = useState("");
  const [isShow, setIsShow] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  const { data } = authClient.useSession();
  const user = data?.user;

  useEffect(() => {
    if (user?.createdAt) {
      const { days } = compareTimeFromNow(user.createdAt);
      const left = 30 - days;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDaysLeft(left);
       
      setIsShow(left > 0);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Referral code applied!");
    setCode("");
  };

  if (!isShow) return null;

  return (
    <div className="border p-4 rounded-xl">
      <p className="font-medium mb-2">Have a referral code?</p>
      <p className="text-sm text-muted-foreground mb-3">
        You have <strong>{daysLeft} days</strong> left to add a referral code.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="uppercase flex-1"
        />
        <Button type="submit" disabled={!code.trim()}>
          Apply
        </Button>
      </form>
    </div>
  );
};
