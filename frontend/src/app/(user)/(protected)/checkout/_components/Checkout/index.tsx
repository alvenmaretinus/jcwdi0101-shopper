"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { getUserAddresses } from "@/services/user-address/getUserAddresses";
import { createOrder } from "@/services/order/createOrder";
import {
  getCheckoutShippingInfo,
  CheckoutShippingInfo,
} from "@/services/order/getCheckoutShippingInfo";
import {
  getCheckoutPricingBreakdown,
  CheckoutPricingResponse,
} from "@/services/order/getCheckoutPricingBreakdown";
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
    setVoucherInput("");
    setPricingBreakdown(null);
  }, []);

  const refreshCheckoutForVoucherFailure = useCallback(async () => {
    resetVoucherState();
    await refetchCart(true);
    router.refresh();
  }, [refetchCart, resetVoucherState, router]);

  // Pricing breakdown state
  const [pricingBreakdown, setPricingBreakdown] =
    useState<CheckoutPricingResponse | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

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

  // Fetch pricing breakdown when dependencies change
  const fetchPricingBreakdown = useCallback(
    async (addressId: string, voucherIds?: string[]) => {
      setIsLoadingPricing(true);
      setPricingError(null);
      setPricingBreakdown(null);

      try {
        const breakdown = await getCheckoutPricingBreakdown(
          addressId,
          voucherIds
        );
        setPricingBreakdown(breakdown);
      } catch (err) {
        console.error("[CheckoutShell] Failed to fetch pricing breakdown:", err);
        const msg =
          err instanceof Error
            ? err.message
            : "Gagal memuat rincian harga";
        setPricingError(msg);
      } finally {
        setIsLoadingPricing(false);
      }
    },
    []
  );

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

  // Trigger shipping and pricing fetch when address or vouchers change
  useEffect(() => {
    if (selectedAddress?.id) {
      fetchShippingInfo(selectedAddress.id);
      fetchPricingBreakdown(selectedAddress.id, appliedVouchers.length > 0 ? appliedVouchers : undefined);
    }
  }, [selectedAddress?.id, appliedVouchers, fetchShippingInfo, fetchPricingBreakdown]);

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

  // Calculate pricing from backend breakdown
  const baseSubtotal = pricingBreakdown?.subtotal ?? 0;
  const totalDiscount = pricingBreakdown?.totalDiscount ?? 0;
  const shippingCost = selectedShippingCost;
  const appliedShippingDiscount = 0; // Shipping vouchers handled separately if needed
  const finalShippingCost = shippingCost;
  const total = pricingBreakdown?.grandTotal ?? 0;

  const applyVoucher = async (): Promise<void> => {
    const normalizedCode = voucherInput.trim().toUpperCase();
    if (!normalizedCode) return;
    if (appliedVouchers.includes(normalizedCode)) {
      setVoucherInput("");
      return;
    }

    // Add voucher and refetch pricing breakdown
    try {
      const ids = [...appliedVouchers, normalizedCode];
      setAppliedVouchers(ids);
      setVoucherInput("");
      // Pricing breakdown will be refetched by the useEffect watching appliedVouchers
    } catch (err) {
      console.error("[CheckoutShell] Apply voucher failed:", err);
      await refreshCheckoutForVoucherFailure();
    }
  };

  const removeVoucher = (id: string) => {
    const ids = appliedVouchers.filter((v) => v !== id);
    setAppliedVouchers(ids);
    // Pricing breakdown will be refetched by the useEffect watching appliedVouchers
  };
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
      bogoFreeQuantity: it.bogoFreeQuantity || 0,
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
              totalDiscount={totalDiscount}
              shippingCost={finalShippingCost}
              shippingOriginalCost={shippingCost}
              shippingDiscount={appliedShippingDiscount}
              total={total}
              onPlaceOrder={handlePlaceOrder}
              isCreatingOrder={isCreatingOrder}
              pricingBreakdown={pricingBreakdown}
              isLoadingPricing={isLoadingPricing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
