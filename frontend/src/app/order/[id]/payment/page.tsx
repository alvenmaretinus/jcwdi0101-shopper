"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createCharge } from "@/services/order/createCharge";
import type {
  CreateOrderResponse,
  OrderItem as OrderServiceItem,
} from "@/services/order/createOrder";
import { getBankInfo, type BankInfo } from "@/services/order/getBankInfo";
import { uploadPaymentProof } from "@/services/order/uploadProof";
import { apiFetch } from "@/lib/apiFetch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type OrderItem = OrderServiceItem;

type ApiWrapper<T> = { success?: boolean; data?: T };

function isApiWrapper<T>(v: unknown): v is ApiWrapper<T> {
  return typeof v === "object" && v !== null && "data" in (v as object);
}

// Midtrans Snap typing to avoid `any`
type SnapOptions = {
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: () => void;
  onClose?: () => void;
};

type SnapNamespace = {
  pay: (token: string, opts?: SnapOptions) => void;
};

declare global {
  interface Window {
    snap?: SnapNamespace;
  }
}

export default function PaymentPage({ params }: { params: unknown }) {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);

  // Unwrap params which may be a Promise in Next.js app router
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = params as unknown;
        let unwrapped: { id?: string } | null = null;
        if (p && typeof p === "object" && "then" in p) {
          unwrapped = await (p as Promise<{ id?: string }>);
        } else {
          unwrapped = p as { id?: string } | null;
        }
        if (mounted) setOrderId(unwrapped?.id ?? null);
      } catch {
        if (mounted) setOrderId(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params]);

  const [order, setOrder] = useState<CreateOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const pollRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const prevOrderRef = useRef<CreateOrderResponse | null>(null);
  const [showReuploadNotice, setShowReuploadNotice] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!orderId) return;
      try {
        setLoading(true);
        const resp = await apiFetch<
          ApiWrapper<CreateOrderResponse> | CreateOrderResponse
        >(`/order/${orderId}`, { method: "GET" });
        const o = isApiWrapper<CreateOrderResponse>(resp)
          ? (resp.data ?? null)
          : (resp as CreateOrderResponse);
        setOrder(o);
        // load bank info for bank transfer
        try {
          const b = await getBankInfo();
          setBankInfo(b);
        } catch {
          // ignore
        }
      } catch (err: unknown) {
        console.error("[Payment] Failed to load order:", err);
        toast.error("Gagal memuat order");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const handleMidtrans = async () => {
    if (!orderId) {
      toast.error("Order ID missing");
      return;
    }
    try {
      setIsProcessing(true);
      const tx = await createCharge(orderId);
      if (tx && tx.redirectUrl && !tx.token) {
        // redirect user to Midtrans payment page (non-snap)
        window.location.href = tx.redirectUrl;
        return;
      }

      if (tx && tx.token) {
        // snap token flow (modal) — ensure snap.js is loaded
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";

        const loadSnap = (): Promise<void> =>
          new Promise((resolve, reject) => {
            if (typeof window.snap !== "undefined") return resolve();
            const script = document.createElement("script");
            // prefer sandbox URL during development if redirectUrl indicates sandbox
            const snapUrl = tx.redirectUrl?.includes("sandbox")
              ? "https://app.sandbox.midtrans.com/snap/snap.js"
              : "https://app.midtrans.com/snap/snap.js";
            script.src = snapUrl;
            if (clientKey) script.setAttribute("data-client-key", clientKey);
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () =>
              reject(new Error("Failed to load Midtrans Snap"));
            document.head.appendChild(script);
          });

        try {
          await loadSnap();
          if (window.snap) {
            window.snap.pay(tx.token, {
              onSuccess: async () => {
                toast.success("Payment successful, updating order...");
                // refresh order after payment
                const resp = await apiFetch<
                  ApiWrapper<CreateOrderResponse> | CreateOrderResponse
                >(`/order/${orderId}`, { method: "GET" });
                const o = isApiWrapper<CreateOrderResponse>(resp)
                  ? (resp.data ?? null)
                  : (resp as CreateOrderResponse);
                setOrder(o);
              },
              onPending: () => {
                toast("Payment pending");
              },
              onError: () => {
                toast.error("Payment failed");
              },
              onClose: () => {
                // user closed modal
              },
            });
          }
        } catch (e) {
          console.error("[Payment] snap load error:", e);
          if (tx.redirectUrl) window.location.href = tx.redirectUrl;
          else toast.error("Payment initiation failed");
        }
        return;
      }

      toast.error("Payment initiation failed");
    } catch (err: unknown) {
      console.error("[Payment] createCharge error:", err);
      let msg = "Failed to create payment charge";
      if (typeof err === "object" && err !== null && "message" in err) {
        const m = (err as { message?: unknown }).message;
        if (typeof m === "string") msg = m;
      }
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile) {
      toast.error("Pilih file bukti pembayaran terlebih dahulu");
      return;
    }
    if (!orderId) {
      toast.error("Order ID missing");
      return;
    }
    try {
      setIsProcessing(true);
      await uploadPaymentProof(orderId, proofFile);
      toast.success(
        "Bukti pembayaran berhasil diupload. Menunggu konfirmasi admin."
      );
      // refresh order
      const resp = await apiFetch<
        ApiWrapper<CreateOrderResponse> | CreateOrderResponse
      >(`/order/${orderId}`, { method: "GET" });
      const o = isApiWrapper<CreateOrderResponse>(resp)
        ? (resp.data ?? null)
        : (resp as CreateOrderResponse);
      setOrder(o);

      // stop timers and redirect user to orders list
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }

      router.push("/profile/order");
    } catch (err: unknown) {
      console.error("[Payment] uploadProof error:", err);
      let msg = "Gagal upload bukti pembayaran";
      if (typeof err === "object" && err !== null && "message" in err) {
        const m = (err as { message?: unknown }).message;
        if (typeof m === "string") msg = m;
      }
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!orderId) {
      toast.error("Order ID missing");
      return;
    }

    // simple confirm modal
    const ok = window.confirm(
      "Are you sure you want to cancel this order? This action cannot be undone."
    );
    if (!ok) return;

    try {
      setIsProcessing(true);
      const resp = await apiFetch<
        ApiWrapper<{ success?: boolean; message?: string }>
      >(`/order/${orderId}/cancel`, { method: "POST" });
      const body = isApiWrapper<{ success?: boolean; message?: string }>(resp)
        ? resp.data
        : (resp as { success?: boolean; message?: string } | null);

      const bodyRecord = body as Record<string, unknown> | null;
      if (
        bodyRecord &&
        (bodyRecord.success === true || bodyRecord.ok === true)
      ) {
        toast.success("Order canceled");

        // stop timers/polling
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (pollRef.current) {
          window.clearInterval(pollRef.current);
          pollRef.current = null;
        }

        router.push("/profile/order");
        return;
      }

      // fallback: show message from server
      const msg = (body && body.message) || "Failed to cancel order";
      toast.error(msg);
    } catch (err: unknown) {
      console.error("[Payment] cancel error:", err);
      let msg = "Gagal membatalkan order";
      if (typeof err === "object" && err !== null && "message" in err) {
        const m = (err as { message?: unknown }).message;
        if (typeof m === "string") msg = m;
      }
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // start timer for payment due and polling order status
  useEffect(() => {
    // clear previous timers
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (pollRef.current) window.clearInterval(pollRef.current);

    const startTimers = () => {
      if (!order) return;

      // payment due timer
      if (order.paymentDueAt) {
        const updateRemaining = () => {
          const due = new Date(order.paymentDueAt).getTime();
          const secs = Math.max(0, Math.floor((due - Date.now()) / 1000));
          setRemainingSeconds(secs);
          if (secs <= 0 && timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
        };
        updateRemaining();
        timerRef.current = window.setInterval(updateRemaining, 1000);
      } else {
        setRemainingSeconds(null);
      }

      // poll order status while awaiting payment or confirmation
      const shouldPoll = (st: string | undefined) =>
        st === "PAYMENT_PENDING" || st === "PAYMENT_WAITING_CONFIRMATION";
      if (shouldPoll(order.status)) {
        pollRef.current = window.setInterval(async () => {
          try {
            const resp = await apiFetch<
              ApiWrapper<CreateOrderResponse> | CreateOrderResponse
            >(`/order/${orderId}`, { method: "GET" });
            const o = isApiWrapper<CreateOrderResponse>(resp)
              ? (resp.data ?? null)
              : (resp as CreateOrderResponse);
            // update only if status or paymentProofUrl changed
            setOrder((prev) => {
              if (!prev) return o;
              if (
                prev.status !== o?.status ||
                prev.paymentProofUrl !== o?.paymentProofUrl
              )
                return o;
              return prev;
            });
          } catch {
            // ignore polling errors
          }
        }, 5000);
      }
    };

    startTimers();

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [order, orderId]);

  // detect payment proof rejection: PAYMENT_WAITING_CONFIRMATION -> PAYMENT_PENDING
  useEffect(() => {
    const prev = prevOrderRef.current;
    if (
      prev?.status === "PAYMENT_WAITING_CONFIRMATION" &&
      order?.status === "PAYMENT_PENDING"
    ) {
      // admin rejected proof and reset order to pending
      toast.error(
        "Bukti pembayaran ditolak. Silakan upload ulang bukti transfer."
      );
      setShowReuploadNotice(true);
    }
    prevOrderRef.current = order;
  }, [order]);

  // Redirect when order reaches a successful/processing state after payment
  useEffect(() => {
    if (!order) return;
    const successStatuses = new Set(["PROCESSING", "PAID", "COMPLETED"]);
    const st = order.status;
    if (st && successStatuses.has(st)) {
      // clear timers
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
      // navigate to orders list
      router.push("/profile/order");
    }
  }, [order, router]);

  if (loading) {
    return (
      <div className="container-app py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="container-app py-8">Order not found</div>;
  }

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold mb-6">Payment for Order {order.id}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          {order.orderItems?.map((it: OrderItem) => (
            <div
              key={it.productId}
              className="flex justify-between text-sm mb-2"
            >
              <div>
                {it.productName} x{it.quantity}
              </div>
              <div>
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(it.unitPrice * it.quantity)}
              </div>
            </div>
          ))}

          <hr className="my-4" />
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>{order.subtotal}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping</span>
            <span>{order.shippingCost}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{order.grandTotal}</span>
          </div>

          <div className="mt-6">
            {order.paymentType === "BANK_TRANSFER" ? (
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
                    <strong>Payment due in:</strong>{" "}
                    {new Date(remainingSeconds * 1000)
                      .toISOString()
                      .substr(11, 8)}
                    {remainingSeconds <= 0 && (
                      <span className="text-red-600"> — EXPIRED</span>
                    )}
                  </div>
                )}

                {order.paymentProofUrl && (
                  <div className="mb-3">
                    <div className="text-sm font-semibold mb-2">
                      Uploaded proof
                    </div>
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

                {/* Show upload controls only when order is pending payment */}
                {order.status === "PAYMENT_PENDING" && (
                  <div>
                    {showReuploadNotice && (
                      <div className="mb-2 text-sm text-red-600">
                        Bukti pembayaran ditolak sebelumnya. Silakan upload
                        ulang bukti transfer.
                      </div>
                    )}

                    <div className="mb-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          if (!file) {
                            setProofFile(null);
                            return;
                          }
                          const allowed = [
                            "image/jpeg",
                            "image/jpg",
                            "image/png",
                            "image/gif",
                          ];
                          if (!allowed.includes(file.type)) {
                            toast.error("Format tidak didukung. Gunakan JPG/PNG/GIF.");
                            setProofFile(null);
                            return;
                          }
                          const max = 1 * 1024 * 1024; // 1MB
                          if (file.size > max) {
                            toast.error("File terlalu besar. Maks 1MB.");
                            setProofFile(null);
                            return;
                          }
                          setProofFile(file);
                        }}
                        disabled={
                          remainingSeconds !== null && remainingSeconds <= 0
                        }
                      />
                      <div className="text-sm text-muted-foreground mt-2">
                        Maksimum ukuran upload: <strong>1MB</strong>. Format yang
                        diterima: JPG, PNG, GIF.
                      </div>
                    </div>

                    <Button
                      onClick={handleUploadProof}
                      disabled={
                        isProcessing ||
                        (remainingSeconds !== null && remainingSeconds <= 0)
                      }
                    >
                      {isProcessing ? "Uploading..." : "Upload Proof"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-2">
                  Payment Gateway (Midtrans)
                </h3>
                <p className="text-sm mb-4">
                  Anda akan diarahkan ke halaman pembayaran Midtrans.
                </p>
                <Button onClick={handleMidtrans} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Pay with Midtrans"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Status</h3>
          <div>Order status: {order.status}</div>
          <div className="mt-4">
            {order.status === "PAYMENT_PENDING" && (
              <div className="mb-2">
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={isProcessing || order.status !== "PAYMENT_PENDING"}
                >
                  {isProcessing ? "Processing..." : "Cancel Order"}
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              onClick={() => router.push("/profile/order")}
            >
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
