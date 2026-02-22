"use client";

import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { CreateOrderResponse } from "@/services/order/createOrder";
import { getBankInfo, type BankInfo } from "@/services/order/getBankInfo";
import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";
import { isApiWrapper } from "../_lib/payment-utils";

type UsePaymentCoreStateResult = {
  orderId: string | null;
  order: CreateOrderResponse | null;
  setOrder: Dispatch<SetStateAction<CreateOrderResponse | null>>;
  loading: boolean;
  bankInfo: BankInfo | null;
  fetchOrder: (targetOrderId: string) => Promise<CreateOrderResponse | null>;
};

const resolveOrderId = async (params: unknown): Promise<string | null> => {
  if (params && typeof params === "object" && "then" in params) {
    const awaited = await (params as Promise<{ id?: string }>);
    return awaited?.id ?? null;
  }

  const direct = params as { id?: string } | null;
  return direct?.id ?? null;
};

export const usePaymentCoreState = (
  params: unknown
): UsePaymentCoreStateResult => {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isOrderIdResolved, setIsOrderIdResolved] = useState(false);
  const [order, setOrder] = useState<CreateOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);

  const fetchOrder = useCallback(
    async (targetOrderId: string): Promise<CreateOrderResponse | null> => {
      const response = await apiFetch<
        {
          success?: boolean;
          data?: CreateOrderResponse;
        } | CreateOrderResponse
      >(`/order/${targetOrderId}`, { method: "GET" });
      return isApiWrapper<CreateOrderResponse>(response)
        ? response.data ?? null
        : (response as CreateOrderResponse);
    },
    []
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resolvedOrderId = await resolveOrderId(params);
        if (mounted) setOrderId(resolvedOrderId);
      } catch {
        if (mounted) setOrderId(null);
      } finally {
        if (mounted) setIsOrderIdResolved(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!isOrderIdResolved) return;
    if (!orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const loadedOrder = await fetchOrder(orderId);
        if (cancelled) return;
        setOrder(loadedOrder);

        try {
          const bank = await getBankInfo();
          if (!cancelled) setBankInfo(bank);
        } catch {
          if (!cancelled) setBankInfo(null);
        }
      } catch (error: unknown) {
        if (cancelled) return;
        console.error("[Payment] Failed to load order:", error);
        toast.error("Gagal memuat order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchOrder, isOrderIdResolved, orderId]);

  return {
    orderId,
    order,
    setOrder,
    loading,
    bankInfo,
    fetchOrder,
  };
};
