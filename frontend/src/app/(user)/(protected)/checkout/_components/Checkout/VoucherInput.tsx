"use client";

import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";

interface VoucherInputProps {
  voucherInput: string;
  setVoucherInput: Dispatch<SetStateAction<string>>;
  appliedVouchers: string[];
  applyVoucher: () => Promise<void>;
  removeVoucher: (id: string) => Promise<void>;
  errorMessage?: string | null;
}

export const VoucherInput = ({
  voucherInput,
  setVoucherInput,
  appliedVouchers,
  applyVoucher,
  removeVoucher,
  errorMessage,
}: VoucherInputProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <h2 className="text-lg font-semibold mb-3">Voucher / Promo</h2>
      <div className="flex gap-2">
        <input
          value={voucherInput}
          onChange={(e) => setVoucherInput(e.target.value)}
          placeholder="Masukkan kode voucher"
          className="flex-1 input"
        />
        <Button onClick={applyVoucher} className="px-4">
          Apply
        </Button>
      </div>
      {errorMessage && (
        <p className="mt-3 text-sm text-red-500">{errorMessage}</p>
      )}
      {appliedVouchers.length > 0 && (
        <div className="mt-3 space-y-2">
          {appliedVouchers.map((v) => (
            <div key={v} className="flex items-center justify-between">
              <div className="text-sm">Voucher: {v}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeVoucher(v)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoucherInput;
