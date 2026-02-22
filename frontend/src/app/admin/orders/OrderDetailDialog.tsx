"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, XCircle, CheckCircle, Truck } from "lucide-react";
import type { AdminOrder } from "@/services/admin/getOrders";

interface Props {
  selectedOrder: AdminOrder | null;
  onClose: () => void;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  onShip: () => Promise<void>;
  onAdminCancel: () => Promise<void>;
}

const statusColors: Record<string, string> = {
  PAYMENT_PENDING: "bg-yellow-100 text-yellow-800",
  PAYMENT_WAITING_CONFIRMATION: "bg-orange-100 text-orange-800",
  PAYMENT_EXPIRED: "bg-red-100 text-red-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

const getStatusColor = (status?: string) =>
  status
    ? (statusColors[status] ?? "bg-gray-100 text-gray-800")
    : "bg-gray-100 text-gray-800";
const getStatusLabel = (status?: string) =>
  status ? status.replace(/_/g, " ") : "UNKNOWN";

const getProofUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const prefix = url.startsWith("/") ? "" : "/";
  return `${base}${prefix}${url}`;
};

export default function OrderDetailDialog({
  selectedOrder,
  onClose,
  onApprove,
  onReject,
  onShip,
  onAdminCancel,
}: Props) {
  const [processing, setProcessing] = useState<string | null>(null);
  return (
    <Dialog open={!!selectedOrder} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {selectedOrder && (
          <>
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription className="mt-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Order ID
                </span>
                <span className="mt-1 block rounded-md border bg-muted px-2 py-1 font-mono text-xs text-foreground break-all">
                  {selectedOrder.id}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge
                  className={getStatusColor(selectedOrder.status)}
                  variant="secondary"
                >
                  {getStatusLabel(selectedOrder.status)}
                </Badge>
                <div className="flex gap-2">
                  {selectedOrder.status === "PAYMENT_WAITING_CONFIRMATION" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={async () => {
                          try {
                            setProcessing("reject");
                            await onReject();
                            toast.success("Bukti pembayaran ditolak");
                          } catch (err: unknown) {
                            console.error(err);
                            const msg =
                              err instanceof Error ? err.message : String(err);
                            toast.error(msg || "Gagal menolak bukti");
                          } finally {
                            setProcessing(null);
                          }
                        }}
                        disabled={!!processing}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            setProcessing("approve");
                            await onApprove();
                            toast.success("Pembayaran dikonfirmasi");
                          } catch (err: unknown) {
                            console.error(err);
                            const msg =
                              err instanceof Error ? err.message : String(err);
                            toast.error(msg || "Gagal mengkonfirmasi");
                          } finally {
                            setProcessing(null);
                          }
                        }}
                        disabled={!!processing}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm Payment
                      </Button>
                    </>
                  )}
                  {selectedOrder.status === "PROCESSING" && (
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          setProcessing("ship");
                          await onShip();
                          toast.success("Pesanan ditandai Dikirim");
                        } catch (err: unknown) {
                          console.error(err);
                          const msg =
                            err instanceof Error ? err.message : String(err);
                          toast.error(msg || "Gagal menandai Dikirim");
                        } finally {
                          setProcessing(null);
                        }
                      }}
                      disabled={!!processing}
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      Mark as Shipped
                    </Button>
                  )}
                  {selectedOrder.status !== "CANCELLED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={async () => {
                        try {
                          setProcessing("cancel");
                          await onAdminCancel();
                          toast.success("Order dibatalkan oleh admin");
                        } catch (err: unknown) {
                          console.error(err);
                          const msg =
                            err instanceof Error ? err.message : String(err);
                          toast.error(msg || "Gagal membatalkan order");
                        } finally {
                          setProcessing(null);
                        }
                      }}
                      disabled={!!processing}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Admin Cancel
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Customer Information</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.user?.email}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Shipping:</strong>{" "}
                  {selectedOrder.shippingAddress || "-"}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.orderItems?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.productCategory}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>
                          {item.quantity} x Rp{" "}
                          {item.unitPrice.toLocaleString("id-ID")}
                        </p>
                        <p className="font-medium">
                          Rp{" "}
                          {(item.quantity * item.unitPrice).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    Rp {selectedOrder.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                {selectedOrder.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">
                      -Rp {selectedOrder.totalDiscount.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    Rp {selectedOrder.shippingCost.toLocaleString("id-ID")}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Grand Total</span>
                  <span>
                    Rp {selectedOrder.grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {selectedOrder.paymentProofUrl && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Payment Proof</h4>
                    <div className="border rounded-lg p-4 flex items-center gap-3">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        payment-proof.jpg
                      </span>
                      <Button
                        asChild
                        variant="link"
                        size="sm"
                        className="ml-auto"
                      >
                        <a
                          href={getProofUrl(selectedOrder.paymentProofUrl)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Image
                        </a>
                      </Button>
                    </div>
                    <div className="mt-3">
                      <Image
                        src={getProofUrl(selectedOrder.paymentProofUrl)}
                        width={500}
                        height={500}
                        alt="Payment proof"
                        className="w-full max-h-90 object-contain rounded-md border"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
