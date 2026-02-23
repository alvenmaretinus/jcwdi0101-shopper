"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { getUserAddresses } from "@/services/user-address/getUserAddresses";
import {
  calculateVoucher,
  CalculateVoucherResponse,
} from "@/services/voucher/calculateVoucher";
import { createOrder } from "@/services/order/createOrder";
import {
  getCheckoutShippingInfo,
  CheckoutShippingInfo,
} from "@/services/order/getCheckoutShippingInfo";
import { UserAddress } from "@/types/UserAddress";
import { ShippingCost } from "@/types/ShippingCost";
import CheckoutHeader from "./CheckoutHeader";
import { AddressSelection } from "./AddressSelection";
import SummarySidebar from "./SummarySidebar";
import VoucherInput from "./VoucherInput";
import PaymentMethod from "./PaymentMethod";
import ShippingInfo from "./ShippingInfo";
import { ShippingMethodSelection } from "./ShippingMethodSelection";
import { resolveProductImageUrl } from "@/lib/resolveProductImageUrl";

export default function CheckoutShell() {
  const router = useRouter();
  const {
    cartItems,
    loading: isCartLoading,
    subtotal,
    serverPricingDiscount,
    serverProductPromotionDiscount,
    serverGlobalDiscount,
    refetch: refetchCart,
  } = useCart();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null
  );
  const [paymentType, setPaymentType] = useState<
    "BANK_TRANSFER" | "PAYMENT_GATEWAY"
  >("BANK_TRANSFER");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isNavigatingToPayment, setIsNavigatingToPayment] = useState(false);

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVouchers, setAppliedVouchers] = useState<string[]>([]);
  const [voucherProductDiscount, setVoucherProductDiscount] = useState(0);
  const [voucherShippingDiscount, setVoucherShippingDiscount] = useState(0);
  const [voucherQuantityBonusByProductId, setVoucherQuantityBonusByProductId] =
    useState<Record<string, number>>({});

  // Early Store Selection state
  const [shippingData, setShippingData] = useState<ShippingCost | null>(null);
  const [shippingInfo, setShippingInfo] = useState<CheckoutShippingInfo | null>(
    null
  );
  const [selectedShippingMethod, setSelectedShippingMethod] = useState("");
  const [selectedShippingCost, setSelectedShippingCost] = useState(0);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const resetVoucherState = useCallback(() => {
    setAppliedVouchers([]);
    setVoucherProductDiscount(0);
    setVoucherShippingDiscount(0);
    setVoucherQuantityBonusByProductId({});
    setVoucherInput("");
  }, []);

  const refreshCheckoutForVoucherFailure = useCallback(async () => {
    resetVoucherState();
    await refetchCart(true);
    router.refresh();
  }, [refetchCart, resetVoucherState, router]);

  // Fetch shipping info when address changes (Early Store Selection)
  const fetchShippingInfo = useCallback(async (addressId: string) => {
    setIsLoadingShipping(true);
    setShippingError(null);
    setShippingData(null);
    setShippingInfo(null);
    setSelectedShippingMethod("");
    setSelectedShippingCost(0);

    try {
      const info = await getCheckoutShippingInfo(addressId);
      setShippingInfo(info);
      setShippingData(info.shippingMethods);

      // Auto-select Economy (reguler) as default shipping method
      const reguler = info.shippingMethods?.calculate_reguler;
      if (reguler && reguler.length > 0) {
        const cheapest = [...reguler].sort(
          (a, b) => a.shipping_cost - b.shipping_cost
        )[0];
        setSelectedShippingMethod("regular");
        setSelectedShippingCost(cheapest.shipping_cost_net);
      }
    } catch (err) {
      console.error("[CheckoutShell] Failed to fetch shipping info:", err);
      const msg =
        err instanceof Error ? err.message : "Gagal memuat opsi pengiriman";
      setShippingError(msg);
    } finally {
      setIsLoadingShipping(false);
    }
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await getUserAddresses();
        const isWrapper = (v: unknown): v is { data: UserAddress[] } =>
          typeof v === "object" && v !== null && "data" in v;
        const list: UserAddress[] = isWrapper(data)
          ? (data.data ?? [])
          : (data as UserAddress[]);
        setAddresses(list);
        if (list.length > 0) {
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          setSelectedAddress(defaultAddr);
        }
      } catch (err) {
        console.error("[CheckoutShell] Failed to fetch addresses:", err);
      }
    };

    fetchAddresses();
  }, []);

  // Trigger shipping fetch when address changes
  useEffect(() => {
    if (selectedAddress?.id) {
      fetchShippingInfo(selectedAddress.id);
    }
  }, [selectedAddress?.id, fetchShippingInfo]);

  useEffect(() => {
    if (isNavigatingToPayment) return;
    if (!isCartLoading && !isCreatingOrder && (!cartItems || cartItems.length === 0))
      router.push("/cart");
  }, [cartItems, isCartLoading, isCreatingOrder, isNavigatingToPayment, router]);

  // Handle shipping method selection — extract cost from selected method
  const handleShippingMethodSelect = (methodKey: string, cost: number) => {
    setSelectedShippingMethod(methodKey);
    setSelectedShippingCost(cost);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedShippingMethod) return;
    try {
      setIsCreatingOrder(true);
      const order = await createOrder({
        addressId: selectedAddress.id,
        paymentType,
        voucherIds: appliedVouchers.length > 0 ? appliedVouchers : undefined,
        shippingCost: selectedShippingCost,
        shippingMethod: selectedShippingMethod,
      });

      if (!order) return;

      setIsNavigatingToPayment(true);
      await refetchCart(true);
      router.replace(`/order/${order.id}/payment`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message.toLowerCase() : "";
      if (message.includes("voucher")) {
        await refreshCheckoutForVoucherFailure();
      }
      setIsNavigatingToPayment(false);
      console.error("[CheckoutShell] Error creating order:", err);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const baseSubtotal = subtotal || 0;
  const productDiscount = serverProductPromotionDiscount || 0;
  const globalDiscount =
    serverGlobalDiscount ||
    Math.max(0, (serverPricingDiscount || 0) - productDiscount);
  const nonVoucherDiscount = Math.max(0, productDiscount + globalDiscount);
  const cartSubtotal = Math.max(0, baseSubtotal - nonVoucherDiscount);
  const voucherDiscount = voucherProductDiscount;
  const shippingCost = selectedShippingCost;
  const appliedShippingDiscount = Math.max(
    0,
    Math.min(voucherShippingDiscount, shippingCost)
  );
  const finalShippingCost = Math.max(0, shippingCost - appliedShippingDiscount);
  const total = Math.max(0, cartSubtotal - voucherDiscount + finalShippingCost);

  const readVoucherResult = useCallback((resp: unknown): CalculateVoucherResponse => {
    const isApiWrapper = (
      value: unknown
    ): value is { data: CalculateVoucherResponse } =>
      typeof value === "object" && value !== null && "data" in value;

    return isApiWrapper(resp)
      ? resp.data
      : (resp as CalculateVoucherResponse);
  }, []);

  const mapVoucherQuantityBonuses = useCallback(
    (result: CalculateVoucherResponse): Record<string, number> => {
      const map: Record<string, number> = {};
      const lines = Array.isArray(result.quantityBonuses)
        ? result.quantityBonuses
        : [];

      for (const line of lines) {
        if (!line?.productId || !line?.freeQuantity) continue;
        const productId = String(line.productId);
        const freeQty = Math.max(0, Number(line.freeQuantity) || 0);
        map[productId] = (map[productId] || 0) + freeQty;
      }

      return map;
    },
    []
  );

  const voucherCartItems = useMemo(
    () =>
      (cartItems || []).map((item) => ({
        productId: String(item.productId ?? item.id),
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.price) || 0,
      })).filter((item) => item.productId && item.quantity > 0),
    [cartItems]
  );

  const applyVoucher = async (): Promise<void> => {
    const normalizedCode = voucherInput.trim().toUpperCase();
    if (!normalizedCode) return;
    if (appliedVouchers.includes(normalizedCode)) {
      setVoucherInput("");
      return;
    }

    try {
      const ids = [...appliedVouchers, normalizedCode];
      const resp = await calculateVoucher({
        voucherCodes: ids,
        subtotal: cartSubtotal,
        shippingCost: selectedShippingCost,
        cartItems: voucherCartItems,
      });
      const result = readVoucherResult(resp);
      const rawTotalDiscount = result.totalDiscount ?? 0;
      const rawShippingDiscount = result.shippingDiscount ?? 0;
      const shippingDiscount = Math.max(
        0,
        Math.min(rawShippingDiscount, selectedShippingCost)
      );
      const productDiscountValue = Math.max(
        0,
        (result.productDiscount ?? rawTotalDiscount - shippingDiscount) || 0
      );
      setAppliedVouchers(ids);
      setVoucherProductDiscount(productDiscountValue);
      setVoucherShippingDiscount(shippingDiscount);
      setVoucherQuantityBonusByProductId(mapVoucherQuantityBonuses(result));
      setVoucherInput("");
    } catch (err) {
      console.error("[CheckoutShell] Apply voucher failed:", err);
      await refreshCheckoutForVoucherFailure();
    }
  };

  const removeVoucher = (id: string) => {
    const ids = appliedVouchers.filter((v) => v !== id);
    setAppliedVouchers(ids);
    if (ids.length === 0) {
      setVoucherProductDiscount(0);
      setVoucherShippingDiscount(0);
      setVoucherQuantityBonusByProductId({});
    } else {
      calculateVoucher({
        voucherCodes: ids,
        subtotal: cartSubtotal,
        shippingCost: selectedShippingCost,
        cartItems: voucherCartItems,
      })
        .then((resp) => {
          const result = readVoucherResult(resp);
          const rawTotalDiscount = result.totalDiscount ?? 0;
          const rawShippingDiscount = result.shippingDiscount ?? 0;
          const shippingDiscount = Math.max(
            0,
            Math.min(rawShippingDiscount, selectedShippingCost)
          );
          const productDiscountValue = Math.max(
            0,
            (result.productDiscount ?? rawTotalDiscount - shippingDiscount) || 0
          );
          setVoucherProductDiscount(productDiscountValue);
          setVoucherShippingDiscount(shippingDiscount);
          setVoucherQuantityBonusByProductId(mapVoucherQuantityBonuses(result));
        })
        .catch(() => {
          void refreshCheckoutForVoucherFailure();
        });
    }
  };

  useEffect(() => {
    if (appliedVouchers.length === 0) {
      setVoucherProductDiscount(0);
      setVoucherShippingDiscount(0);
      setVoucherQuantityBonusByProductId({});
      return;
    }

    let cancelled = false;
    calculateVoucher({
      voucherCodes: appliedVouchers,
      subtotal: cartSubtotal,
      shippingCost: selectedShippingCost,
      cartItems: voucherCartItems,
    })
      .then((resp) => {
        if (cancelled) return;
        const result = readVoucherResult(resp);
        const rawTotalDiscount = result.totalDiscount ?? 0;
        const rawShippingDiscount = result.shippingDiscount ?? 0;
        const shippingDiscount = Math.max(
          0,
          Math.min(rawShippingDiscount, selectedShippingCost)
        );
        const productDiscountValue = Math.max(
          0,
          (result.productDiscount ?? rawTotalDiscount - shippingDiscount) || 0
        );
        setVoucherProductDiscount(productDiscountValue);
        setVoucherShippingDiscount(shippingDiscount);
        setVoucherQuantityBonusByProductId(mapVoucherQuantityBonuses(result));
      })
      .catch(() => {
        if (cancelled) return;
        void refreshCheckoutForVoucherFailure();
      });

    return () => {
      cancelled = true;
    };
  }, [
    appliedVouchers,
    cartSubtotal,
    mapVoucherQuantityBonuses,
    readVoucherResult,
    selectedShippingCost,
    voucherCartItems,
    refreshCheckoutForVoucherFailure,
  ]);

  const orderItems = (cartItems || []).map((it) => {
    const originalUnitPrice = it.price || 0;
    const discountedUnitPrice = it.discountedPrice ?? originalUnitPrice;
    const hasProductDiscount =
      discountedUnitPrice >= 0 && discountedUnitPrice < originalUnitPrice;

    return {
      id: String(it.id),
      name: it.name || "",
      price: hasProductDiscount ? discountedUnitPrice : originalUnitPrice,
      originalPrice: hasProductDiscount ? originalUnitPrice : undefined,
      quantity: it.quantity || 0,
      bogoFreeQuantity:
        (it.bogoFreeQuantity || 0) +
        (voucherQuantityBonusByProductId[String(it.productId ?? it.id)] || 0),
      image: resolveProductImageUrl(it.image),
    };
  });

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="container-app py-8">
        <CheckoutHeader />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AddressSelection
              addresses={addresses}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
            />

            <ShippingMethodSelection
              shippingData={shippingData}
              selectedMethod={selectedShippingMethod}
              onSelect={handleShippingMethodSelect}
              isLoading={isLoadingShipping}
              error={shippingError}
            />

            <VoucherInput
              voucherInput={voucherInput}
              setVoucherInput={setVoucherInput}
              appliedVouchers={appliedVouchers}
              applyVoucher={applyVoucher}
              removeVoucher={removeVoucher}
            />

            <PaymentMethod
              paymentType={paymentType}
              setPaymentType={setPaymentType}
            />

            <ShippingInfo storeName={shippingInfo?.store.name} />
          </div>

          <div>
            <SummarySidebar
              items={orderItems}
              subtotal={baseSubtotal}
              productDiscount={productDiscount}
              globalDiscount={globalDiscount}
              voucherDiscount={voucherDiscount}
              shippingCost={finalShippingCost}
              shippingOriginalCost={shippingCost}
              shippingDiscount={appliedShippingDiscount}
              total={total}
              onPlaceOrder={handlePlaceOrder}
              isCreatingOrder={isCreatingOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
