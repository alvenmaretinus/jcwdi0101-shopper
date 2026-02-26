"use client";
import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  createCharge,
  type CreateChargeResponse,
} from "@/services/order/createCharge";
import type { CreateOrderResponse } from "@/services/order/createOrder";
import { uploadPaymentProof } from "@/services/order/uploadProof";
import { apiFetch, HttpMethod } from "@/lib/apiFetch";
import { toast } from "sonner";
import { loadMidtransSnap } from "../_lib/load-midtrans-snap";
import {
  clearCachedMidtransTx,
  isApiWrapper,
  parseErrorMessage,
  readCachedMidtransTx,
  saveCachedMidtransTx,
} from "../_lib/payment-utils";

type UsePaymentActionsParams = {
  orderId: string | null;
  order: CreateOrderResponse | null;
  setOrder: Dispatch<SetStateAction<CreateOrderResponse | null>>;
  fetchOrder: (targetOrderId: string) => Promise<CreateOrderResponse | null>;
  clearTimers: () => void;
  navigateToOrders: () => void;
};

type UsePaymentActionsResult = {
  isProcessing: boolean;
  onProofFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onUploadProof: () => Promise<void>;
  onPayWithMidtrans: () => Promise<void>;
  onCancelOrder: () => Promise<void>;
};

export const usePaymentActions = ({
  orderId,
  order,
  setOrder,
  fetchOrder,
  clearTimers,
  navigateToOrders,
}: UsePaymentActionsParams): UsePaymentActionsResult => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [cachedMidtransTx, setCachedMidtransTx] =
    useState<CreateChargeResponse | null>(null);

  useEffect(() => {
    if (!orderId) {
      setCachedMidtransTx(null);
      return;
    }
    setCachedMidtransTx(readCachedMidtransTx(orderId));
  }, [orderId]);

  useEffect(() => {
    if (!orderId || !order) return;
    if (order.status !== "PAYMENT_PENDING") {
      clearCachedMidtransTx(orderId);
      setCachedMidtransTx(null);
    }
  }, [order, orderId]);

  const onPayWithMidtrans = useCallback(async () => {
    if (!orderId) {
      toast.error("Order ID missing");
      return;
    }

    try {
      setIsProcessing(true);
      let transaction = cachedMidtransTx ?? readCachedMidtransTx(orderId);
      if (!transaction) {
        transaction = await createCharge(orderId);
        if (transaction) {
          setCachedMidtransTx(transaction);
          saveCachedMidtransTx(orderId, transaction);
        }
      } else if (transaction.orderId === orderId) {
        setCachedMidtransTx(transaction);
      }

      if (transaction?.redirectUrl && !transaction.token) {
        window.location.href = transaction.redirectUrl;
        return;
      }
      if (!transaction?.token) {
        toast.error("Payment initiation failed");
        return;
      }

      try {
        await loadMidtransSnap(transaction);
        window.snap?.pay(transaction.token, {
          onSuccess: async () => {
            clearCachedMidtransTx(orderId);
            setCachedMidtransTx(null);
            toast.success("Payment successful, updating order...");
            const latestOrder = await fetchOrder(orderId);
            setOrder(latestOrder);
          },
          onPending: () => toast("Payment pending"),
          onError: () => toast.error("Payment failed"),
        });
      } catch (error) {
        console.error("[Payment] snap load error:", error);
        if (transaction.redirectUrl)
          window.location.href = transaction.redirectUrl;
        else toast.error("Payment initiation failed");
      }
    } catch (error: unknown) {
      console.error("[Payment] createCharge error:", error);
      let message = parseErrorMessage(error, "Failed to create payment charge");

      // Handle duplicate order_id from Midtrans: try to recover using cached transaction
      if (
        message.includes("order_id sudah digunakan") ||
        message.includes("order_id has already been taken")
      ) {
        const existing = orderId ? readCachedMidtransTx(orderId) : null;
        if (existing?.token) {
          try {
            await loadMidtransSnap(existing);
            window.snap?.pay(existing.token, {
              onSuccess: async () => {
                clearCachedMidtransTx(orderId!);
                setCachedMidtransTx(null);
                toast.success("Payment successful, updating order...");
                const latestOrder = await fetchOrder(orderId!);
                setOrder(latestOrder);
              },
              onPending: () => toast("Payment pending"),
              onError: () => toast.error("Payment failed"),
            });
            return;
          } catch (e) {
            console.error(
              "[Payment] recover from duplicate order_id failed:",
              e
            );
            message =
              "Sesi pembayaran Midtrans sudah dibuat namun tidak dapat dibuka ulang otomatis. Muat ulang halaman dan coba lagi.";
            toast.error(message);
            return;
          }
        }

        // If no cached transaction found, show instructive message
        message =
          "Sesi pembayaran Midtrans untuk order ini sudah dibuat. Muat ulang halaman (F5) lalu klik tombol pembayaran kembali.";
        toast.error(message);
        return;
      }

      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [cachedMidtransTx, fetchOrder, orderId, setOrder]);

  const onProofFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      if (!file) {
        setProofFile(null);
        return;
      }

      const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedMimeTypes.includes(file.type)) {
        toast.error("Format tidak didukung. Gunakan JPG/PNG/GIF.");
        setProofFile(null);
        return;
      }

      const maxSize = 1 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File terlalu besar. Maks 1MB.");
        setProofFile(null);
        return;
      }

      setProofFile(file);
    },
    []
  );

  const onUploadProof = useCallback(async () => {
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

      const latestOrder = await fetchOrder(orderId);
      setOrder(latestOrder);
      clearTimers();
      navigateToOrders();
    } catch (error: unknown) {
      console.error("[Payment] uploadProof error:", error);
      toast.error(parseErrorMessage(error, "Gagal upload bukti pembayaran"));
    } finally {
      setIsProcessing(false);
    }
  }, [clearTimers, fetchOrder, navigateToOrders, orderId, proofFile, setOrder]);

  const onCancelOrder = useCallback(async () => {
    if (!orderId) {
      toast.error("Order ID missing");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setIsProcessing(true);
      const response = await apiFetch<{
        success?: boolean;
        data?: CreateOrderResponse;
        message?: string;
      }>(`/order/${orderId}/cancel`, { method: HttpMethod.POST });

      if (response.success === true) {
        toast.success("Order berhasil dibatalkan");
        const cancelledOrder = isApiWrapper<CreateOrderResponse>(response)
          ? (response.data ?? null)
          : null;
        if (cancelledOrder) setOrder(cancelledOrder);
        else
          setOrder((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
        clearTimers();
        return;
      }

      toast.error(response.message || "Failed to cancel order");
    } catch (error: unknown) {
      console.error("[Payment] cancel error:", error);
      toast.error(parseErrorMessage(error, "Gagal membatalkan order"));
    } finally {
      setIsProcessing(false);
    }
  }, [clearTimers, orderId, setOrder]);

  return {
    isProcessing,
    onProofFileChange,
    onUploadProof,
    onPayWithMidtrans,
    onCancelOrder,
  };
};
