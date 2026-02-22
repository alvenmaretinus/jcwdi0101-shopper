"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { CreateOrderResponse } from "@/services/order/createOrder";
import { toast } from "sonner";

type UsePaymentRealtimeEffectsParams = {
  orderId: string | null;
  order: CreateOrderResponse | null;
  fetchOrder: (targetOrderId: string) => Promise<CreateOrderResponse | null>;
  setOrder: Dispatch<SetStateAction<CreateOrderResponse | null>>;
  navigateToOrders: () => void;
};

type UsePaymentRealtimeEffectsResult = {
  remainingSeconds: number | null;
  showReuploadNotice: boolean;
  clearTimers: () => void;
};

export const usePaymentRealtimeEffects = ({
  orderId,
  order,
  fetchOrder,
  setOrder,
  navigateToOrders,
}: UsePaymentRealtimeEffectsParams): UsePaymentRealtimeEffectsResult => {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [showReuploadNotice, setShowReuploadNotice] = useState(false);
  const pollRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimers();
    if (!order || !orderId) return;

    let resetTimer: number | null = null;
    if (order.paymentDueAt) {
      const updateCountdown = () => {
        const dueTimestamp = new Date(order.paymentDueAt).getTime();
        const seconds = Math.max(0, Math.floor((dueTimestamp - Date.now()) / 1000));
        setRemainingSeconds(seconds);
        if (seconds <= 0 && timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      updateCountdown();
      timerRef.current = window.setInterval(updateCountdown, 1000);
    } else {
      resetTimer = window.setTimeout(() => setRemainingSeconds(null), 0);
    }

    const shouldPoll =
      order.status === "PAYMENT_PENDING" ||
      order.status === "PAYMENT_WAITING_CONFIRMATION";
    if (shouldPoll) {
      pollRef.current = window.setInterval(async () => {
        try {
          const latestOrder = await fetchOrder(orderId);
          setOrder((previous) => {
            if (!previous) return latestOrder;
            if (!latestOrder) return previous;
            if (
              previous.status === "PAYMENT_WAITING_CONFIRMATION" &&
              latestOrder.status === "PAYMENT_PENDING"
            ) {
              toast.error(
                "Bukti pembayaran ditolak. Silakan upload ulang bukti transfer."
              );
              setShowReuploadNotice(true);
            }
            if (
              previous.status !== latestOrder.status ||
              previous.paymentProofUrl !== latestOrder.paymentProofUrl
            ) {
              return latestOrder;
            }
            return previous;
          });
        } catch {
          // ignore polling errors
        }
      }, 5000);
    }

    return () => {
      if (resetTimer !== null) {
        window.clearTimeout(resetTimer);
      }
      clearTimers();
    };
  }, [clearTimers, fetchOrder, order, orderId, setOrder]);

  useEffect(() => {
    if (!order) return;
    const successStatuses = new Set(["PROCESSING", "PAID", "COMPLETED"]);
    if (successStatuses.has(order.status)) {
      clearTimers();
      navigateToOrders();
    }
  }, [clearTimers, navigateToOrders, order]);

  return {
    remainingSeconds,
    showReuploadNotice,
    clearTimers,
  };
};
