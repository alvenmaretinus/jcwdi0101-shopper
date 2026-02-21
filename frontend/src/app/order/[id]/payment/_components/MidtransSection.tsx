"use client";

import { Button } from "@/components/ui/button";

type MidtransSectionProps = {
  isProcessing: boolean;
  onPayWithMidtrans: () => Promise<void>;
};

export const MidtransSection = ({
  isProcessing,
  onPayWithMidtrans,
}: MidtransSectionProps) => {
  return (
    <div>
      <h3 className="font-semibold mb-2">Payment Gateway (Midtrans)</h3>
      <p className="text-sm mb-4">
        Anda akan diarahkan ke halaman pembayaran Midtrans.
      </p>
      <Button
        onClick={onPayWithMidtrans}
        disabled={isProcessing}
        className="w-full md:w-auto"
      >
        {isProcessing ? "Processing..." : "Pay with Midtrans"}
      </Button>
    </div>
  );
};
