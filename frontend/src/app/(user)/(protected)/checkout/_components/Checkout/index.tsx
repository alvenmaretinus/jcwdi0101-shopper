"use client";

import { useEffect, useState, useCallback } from "react";
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

export default function CheckoutShell() {
  const router = useRouter();
  const { cartItems, loading: isCartLoading, subtotal } = useCart();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null
  );
  const [paymentType, setPaymentType] = useState<
    "BANK_TRANSFER" | "PAYMENT_GATEWAY"
  >("BANK_TRANSFER");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVouchers, setAppliedVouchers] = useState<string[]>([]);
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  // Early Store Selection state
  const [shippingData, setShippingData] = useState<ShippingCost | null>(null);
  const [shippingInfo, setShippingInfo] = useState<CheckoutShippingInfo | null>(
    null
  );
  const [selectedShippingMethod, setSelectedShippingMethod] = useState("");
  const [selectedShippingCost, setSelectedShippingCost] = useState(0);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

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
    if (!isCartLoading && (!cartItems || cartItems.length === 0))
      router.push("/cart");
  }, [cartItems, isCartLoading, router]);

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

      router.push(`/order/${order.id}/payment`);
    } catch (err) {
      console.error("[CheckoutShell] Error creating order:", err);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const cartSubtotal = subtotal || 0;
  const discount = voucherDiscount;
  const shippingCost = selectedShippingCost;
  const total = cartSubtotal - discount + shippingCost;

  const applyVoucher = async (): Promise<void> => {
    if (!voucherInput) return;
    try {
      const ids = [...appliedVouchers, voucherInput.trim()];
      const resp = await calculateVoucher({
        voucherIds: ids,
        subtotal: cartSubtotal,
      });
      const isApiWrapper = (
        v: unknown
      ): v is { data: CalculateVoucherResponse } =>
        typeof v === "object" && v !== null && "data" in v;
      const result: CalculateVoucherResponse = isApiWrapper(resp)
        ? resp.data
        : (resp as CalculateVoucherResponse);
      const totalDiscount = result.totalDiscount ?? 0;
      setAppliedVouchers(ids);
      setVoucherDiscount(totalDiscount);
      setVoucherInput("");
    } catch (err) {
      console.error("[CheckoutShell] Apply voucher failed:", err);
    }
  };

  const removeVoucher = (id: string) => {
    const ids = appliedVouchers.filter((v) => v !== id);
    setAppliedVouchers(ids);
    if (ids.length === 0) setVoucherDiscount(0);
    else {
      calculateVoucher({ voucherIds: ids, subtotal: cartSubtotal })
        .then((resp) => {
          const isApiWrapper = (
            v: unknown
          ): v is { data: CalculateVoucherResponse } =>
            typeof v === "object" && v !== null && "data" in v;
          const result: CalculateVoucherResponse = isApiWrapper(resp)
            ? resp.data
            : (resp as CalculateVoucherResponse);
          setVoucherDiscount(result.totalDiscount ?? 0);
        })
        .catch(() => setVoucherDiscount(0));
    }
  };

  const orderItems = (cartItems || []).map((it) => ({
    id: String(it.id),
    name: it.name || "",
    price: it.price || 0,
    quantity: it.quantity || 0,
    image: it.image || "/placeholder.png",
  }));

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
              subtotal={cartSubtotal}
              discount={discount}
              shippingCost={shippingCost}
              total={total}
              onPlaceOrder={handlePlaceOrder}
              isCreatingOrder={isCreatingOrder}
              isCartLoading={isCartLoading}
              disablePlace={
                !selectedAddress ||
                !selectedShippingMethod ||
                (cartItems && cartItems.length === 0)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
