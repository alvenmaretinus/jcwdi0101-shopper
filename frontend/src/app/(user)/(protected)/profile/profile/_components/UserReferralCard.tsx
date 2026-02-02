"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

export const ReferralCard = ({ referralCode }: { referralCode: string }) => {

return(
  <div className="bg-primary text-primary-foreground p-6 rounded-2xl">
    <p className="font-bold mb-2">Invite Friends</p>
    <div className="flex gap-2">
      <code className="bg-white/20 px-4 py-2 rounded flex-1">
        {referralCode||"-"}
      </code>
      <button
        onClick={() => {
          toast.success("Copied to clipboard");
          navigator.clipboard.writeText(referralCode);
        }}
        className="bg-white cursor-pointer text-primary px-4 rounded"
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  </div>
);

}
