"use client";

import { RadioGroup, RadioGroupItem } from "./radio-group";
import { CreditCard, Building } from "lucide-react";

interface PaymentMethodProps {
  paymentType: "BANK_TRANSFER" | "PAYMENT_GATEWAY";
  setPaymentType: (value: "BANK_TRANSFER" | "PAYMENT_GATEWAY") => void;
}

export const PaymentMethod = ({
  paymentType,
  setPaymentType,
}: PaymentMethodProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5 text-primary" />
        Payment Method
      </h2>

      <RadioGroup
        value={paymentType}
        onValueChange={(value: string) =>
          setPaymentType(value as "BANK_TRANSFER" | "PAYMENT_GATEWAY")
        }
        className="space-y-3"
      >
        <label
          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
            paymentType === "BANK_TRANSFER"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <RadioGroupItem value="BANK_TRANSFER" />
          <Building className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-semibold">Bank Transfer</p>
            <p className="text-sm text-muted-foreground">
              Transfer manual dengan verifikasi admin
            </p>
          </div>
        </label>

        <label
          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
            paymentType === "PAYMENT_GATEWAY"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <RadioGroupItem value="PAYMENT_GATEWAY" />
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-semibold">Payment Gateway</p>
            <p className="text-sm text-muted-foreground">
              Pembayaran instant via Midtrans
            </p>
          </div>
        </label>
      </RadioGroup>
    </div>
  );
};

export default PaymentMethod;
