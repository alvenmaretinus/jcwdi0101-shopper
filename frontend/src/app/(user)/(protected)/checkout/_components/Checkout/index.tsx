"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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

const formatMinimumPrice = (raw?: string) => {
  const parsed = Number(raw ?? "0");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(parsed);
};

const mapNotApplicableReason = (reasonRaw: string) => {
  const reason = reasonRaw.trim().toLowerCase();

  if (reason.includes("not started yet")) {
    return "voucher belum aktif";
  }
  if (reason.includes("expired")) {
    return "voucher sudah kedaluwarsa";
  }
  if (reason.includes("no remaining uses")) {
    return "kuota voucher sudah habis";
  }
  if (reason.includes("invalid discount cap configuration")) {
    return "konfigurasi voucher tidak valid";
  }
  if (reason.includes("eligible cart item not found")) {
    return "produk syarat voucher tidak ada di keranjang";
  }
  if (reason.includes("invalid quantity voucher rule")) {
    return "aturan voucher quantity tidak valid";
  }

  const minimumQtyMatch = reasonRaw.match(/minimum quantity not met \(required qty:\s*([0-9]+)\)/i);
  if (minimumQtyMatch) {
    const qty = Number(minimumQtyMatch[1]);
    if (Number.isFinite(qty) && qty > 0) {
      return `jumlah item minimum ${qty} belum terpenuhi`;
    }
    return "jumlah item minimum voucher belum terpenuhi";
  }

  const minimumMatch = reasonRaw.match(/minimum not met \(required:\s*([0-9]+)\)/i);
  if (minimumMatch) {
    const formattedMinimum = formatMinimumPrice(minimumMatch[1]);
    if (formattedMinimum) {
      return `minimum belanja ${formattedMinimum} belum terpenuhi`;
    }
    return "minimum belanja voucher belum terpenuhi";
  }

  return "voucher tidak memenuhi syarat";
};

const mapVoucherErrorMessage = (error: unknown) => {
  const rawMessage =
    error instanceof Error && error.message.trim().length > 0
      ? error.message
      : "Voucher tidak bisa digunakan saat ini.";

  const message = rawMessage.trim();
  const normalized = message.toLowerCase();

  if (normalized.includes("voucher is invalid, unavailable, or already redeemed")) {
    const identifiers = message.split(":").slice(1).join(":").trim();
    if (identifiers) {
      return `Kode voucher ${identifiers} tidak valid, tidak tersedia, atau sudah digunakan.`;
    }
    return "Kode voucher tidak valid, tidak tersedia, atau sudah digunakan.";
  }

  if (normalized.includes("voucher can only be used by its assigned user")) {
    return "Voucher ini hanya bisa dipakai oleh akun yang ditentukan.";
  }

  if (normalized.includes("voucher is currently used in another active order")) {
    const code = message.split(":").slice(1).join(":").trim();
    return code
      ? `Voucher ${code} sedang dipakai di order aktif lain.`
      : "Voucher sedang dipakai di order aktif lain.";
  }

  if (normalized.includes("voucher quota reached")) {
    const code = message.split(":").slice(1).join(":").trim();
    return code
      ? `Kuota voucher ${code} sudah habis.`
      : "Kuota voucher sudah habis.";
  }

  if (normalized.startsWith("voucher is not applicable:")) {
    const rawEntries = message.slice("Voucher is not applicable:".length).trim();
    if (!rawEntries) {
      return "Voucher tidak memenuhi syarat penggunaan.";
    }

    const mappedEntries = rawEntries
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .map((entry) => {
        const separatorIndex = entry.indexOf(":");
        if (separatorIndex === -1) {
          return mapNotApplicableReason(entry);
        }

        const code = entry.slice(0, separatorIndex).trim();
        const reason = entry.slice(separatorIndex + 1).trim();
        const mappedReason = mapNotApplicableReason(reason);
        return code ? `${code}: ${mappedReason}` : mappedReason;
      });

    return mappedEntries.join(". ");
  }

  return message;
};

export default function CheckoutShell() {
  const router = useRouter();
  const { cartItems, loading: isCartLoading, refetch: refetchCart } = useCart();

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
  const pricingRequestIdRef = useRef(0);

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
    async (
      addressId: string,
      voucherIds?: string[],
      shippingCost?: number,
    ): Promise<CheckoutPricingResponse | null> => {
      const requestId = ++pricingRequestIdRef.current;
      setIsLoadingPricing(true);
      setPricingError(null);

      try {
        const breakdown = await getCheckoutPricingBreakdown(
          addressId,
          voucherIds,
          undefined,
          shippingCost,
        );

        if (requestId === pricingRequestIdRef.current) {
          setPricingBreakdown(breakdown);
        }
        return breakdown;
      } catch (err) {
        console.error(
          "[CheckoutShell] Failed to fetch pricing breakdown:",
          err
        );
        const msg = mapVoucherErrorMessage(err);
        if (requestId === pricingRequestIdRef.current) {
          setPricingError(msg);
        }
        return null;
      } finally {
        if (requestId === pricingRequestIdRef.current) {
          setIsLoadingPricing(false);
        }
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

  // Fetch shipping info only when address changes
  useEffect(() => {
    if (!selectedAddress?.id) return;
    fetchShippingInfo(selectedAddress.id);
  }, [selectedAddress?.id, fetchShippingInfo]);

  // Fetch pricing when address/vouchers/shipping selection changes
  useEffect(() => {
    if (!selectedAddress?.id) return;
    if (!selectedShippingMethod) return;

    fetchPricingBreakdown(
      selectedAddress.id,
      appliedVouchers.length > 0 ? appliedVouchers : undefined,
      selectedShippingCost,
    );
  }, [
    selectedAddress?.id,
    selectedShippingMethod,
    selectedShippingCost,
    appliedVouchers,
    fetchPricingBreakdown,
  ]);

  useEffect(() => {
    if (isNavigatingToPayment) return;
    if (
      !isCartLoading &&
      !isCreatingOrder &&
      (!cartItems || cartItems.length === 0)
    )
      router.push("/cart");
  }, [
    cartItems,
    isCartLoading,
    isCreatingOrder,
    isNavigatingToPayment,
    router,
  ]);

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
      const message = err instanceof Error ? err.message.toLowerCase() : "";
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
  const totalDiscountExcludingShipping =
    pricingBreakdown?.totalDiscountExcludingShipping ?? 0;
  const shippingCost = pricingBreakdown?.shippingCost ?? selectedShippingCost;
  const appliedShippingDiscount = pricingBreakdown?.shippingDiscount ?? 0;
  const finalShippingCost =
    pricingBreakdown?.finalShippingCost ??
    Math.max(0, shippingCost - appliedShippingDiscount);
  const total = pricingBreakdown?.grandTotal ?? baseSubtotal;

  const applyVoucher = async (): Promise<void> => {
    const normalizedCode = voucherInput.trim().toUpperCase();
    if (!normalizedCode) return;
    if (appliedVouchers.includes(normalizedCode)) {
      setVoucherInput("");
      setPricingError("Voucher tersebut sudah ditambahkan.");
      return;
    }

    if (!selectedAddress?.id) {
      setPricingError("Pilih alamat pengiriman dulu sebelum memakai voucher.");
      return;
    }

    if (!selectedShippingMethod) {
      setPricingError("Pilih metode pengiriman dulu sebelum memakai voucher.");
      return;
    }

    try {
      const ids = [...appliedVouchers, normalizedCode];
      const breakdown = await fetchPricingBreakdown(
        selectedAddress.id,
        ids,
        selectedShippingCost,
      );

      if (!breakdown) {
        return;
      }

      setAppliedVouchers(ids);
      setVoucherInput("");
      setPricingError(null);
    } catch (err) {
      console.error("[CheckoutShell] Apply voucher failed:", err);
      setPricingError(mapVoucherErrorMessage(err));
    }
  };

  const removeVoucher = async (id: string) => {
    if (!selectedAddress?.id || !selectedShippingMethod) {
      const ids = appliedVouchers.filter((v) => v !== id);
      setAppliedVouchers(ids);
      setPricingError(null);
      return;
    }

    const ids = appliedVouchers.filter((v) => v !== id);
    const breakdown = await fetchPricingBreakdown(
      selectedAddress.id,
      ids.length > 0 ? ids : undefined,
      selectedShippingCost,
    );

    if (!breakdown) {
      return;
    }

    setAppliedVouchers(ids);
    setPricingError(null);
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
              errorMessage={pricingError}
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
              totalDiscount={totalDiscountExcludingShipping}
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
