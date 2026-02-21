"use client";

import Image from "next/image";
import type { ChangeEvent } from "react";
import type { CreateOrderResponse } from "@/services/order/createOrder";
import type { BankInfo } from "@/services/order/getBankInfo";
import { Button } from "@/components/ui/button";
import { formatCountdown } from "../_lib/payment-utils";

type BankTransferSectionProps = {
  order: CreateOrderResponse;
  bankInfo: BankInfo | null;
  remainingSeconds: number | null;
  showReuploadNotice: boolean;
  isProcessing: boolean;
  isProofUploadExpired: boolean;
  onProofFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onUploadProof: () => Promise<void>;
};

export const BankTransferSection = ({
  order,
  bankInfo,
  remainingSeconds,
  showReuploadNotice,
  isProcessing,
  isProofUploadExpired,
  onProofFileChange,
  onUploadProof,
}: BankTransferSectionProps) => {
  return (
    <div>
      <h3 className="font-semibold mb-2">Bank Transfer Details</h3>
      {bankInfo ? (
        <div className="text-sm mb-4">
          <div>
            {bankInfo.bankName} - {bankInfo.accountNumber}
          </div>
          <div>Account Holder: {bankInfo.accountHolder}</div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground mb-4">
          Bank info not available
        </div>
      )}

      {remainingSeconds !== null && (
        <div className="mb-3 text-sm">
          <strong>Payment due in:</strong> {formatCountdown(remainingSeconds)}
          {remainingSeconds <= 0 && (
            <span className="text-red-600"> - EXPIRED</span>
          )}
        </div>
      )}

      {order.paymentProofUrl && (
        <div className="mb-3">
          <div className="text-sm font-semibold mb-2">Uploaded proof</div>
          <Image
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${order.paymentProofUrl}`}
            alt="payment-proof"
            width={400}
            height={300}
            className="max-w-xs rounded"
          />
          {order.status === "PAYMENT_WAITING_CONFIRMATION" && (
            <div className="text-sm text-yellow-700 mt-2">
              Menunggu konfirmasi admin untuk bukti pembayaran.
            </div>
          )}
        </div>
      )}

      {order.status === "PAYMENT_PENDING" && (
        <div>
          {showReuploadNotice && (
            <div className="mb-2 text-sm text-red-600">
              Bukti pembayaran ditolak sebelumnya. Silakan upload ulang bukti
              transfer.
            </div>
          )}

          <div className="mb-3">
            <input
              type="file"
              accept="image/*"
              onChange={onProofFileChange}
              disabled={isProofUploadExpired}
              className="w-full cursor-pointer rounded-md border border-dashed border-muted-foreground/40 bg-muted/60 p-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-background file:px-3 file:py-1.5 file:text-xs file:font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            />
            <div className="text-sm text-muted-foreground mt-2">
              Maksimum ukuran upload: <strong>1MB</strong>. Format yang diterima:
              JPG, PNG, GIF.
            </div>
          </div>

          <Button
            onClick={onUploadProof}
            disabled={isProcessing || isProofUploadExpired}
            className="w-full md:w-auto"
          >
            {isProcessing ? "Uploading..." : "Upload Proof"}
          </Button>
        </div>
      )}
    </div>
  );
};
