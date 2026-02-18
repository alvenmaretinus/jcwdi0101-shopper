"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { getUserAddresses } from "@/services/user-address/getUserAddresses";
import {
  calculateVoucher,
  CalculateVoucherResponse,
} from "@/services/voucher/calculateVoucher";
import { createOrder } from "@/services/order/createOrder";
import { UserAddress } from "@/types/UserAddress";
import CheckoutHeader from "./CheckoutHeader";
import { AddressSelection } from "./AddressSelection";
import SummarySidebar from "./SummarySidebar";
import VoucherInput from "./VoucherInput";
import PaymentMethod from "./PaymentMethod";
import ShippingInfo from "./ShippingInfo";

export default function CheckoutShell() {
  const router = useRouter();
  const {
    cartItems,
    loading: isCartLoading,
    subtotal,
    deliveryFee,
  } = useCart();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null
  );
  const [paymentType, setPaymentType] = useState<
    "BANK_TRANSFER" | "PAYMENT_GATEWAY"
  >("BANK_TRANSFER");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVouchers, setAppliedVouchers] = useState<string[]>([]);
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
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
        toast.error("Gagal memuat alamat pengiriman");
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!isCartLoading && (!cartItems || cartItems.length === 0))
      router.push("/cart");
  }, [cartItems, isCartLoading, router]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Pilih alamat pengiriman terlebih dahulu");
      return;
    }
    try {
      setIsCreatingOrder(true);
      const order = await createOrder({
        addressId: selectedAddress.id,
        paymentType,
        voucherIds: appliedVouchers.length > 0 ? appliedVouchers : undefined,
      });

      if (!order) {
        toast.error("Gagal membuat pesanan");
        return;
      }

      toast.success("Pesanan berhasil dibuat! Lanjut ke pembayaran...");
      setTimeout(() => router.push(`/order/${order.id}/payment`), 1200);
    } catch (err) {
      console.error("[CheckoutShell] Error creating order:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Gagal membuat pesanan";
      toast.error(errorMsg);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const cartSubtotal = subtotal || 0;
  const discount = voucherDiscount;
  const shippingCost = deliveryFee || 0;
  const total = cartSubtotal - discount + shippingCost;

  const applyVoucher = async (): Promise<void> => {
    if (!voucherInput) {
      toast.error("Masukkan kode voucher atau ID");
      return;
    }
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
      toast.success("Voucher applied");
    } catch (err) {
      console.error("[CheckoutShell] Apply voucher failed:", err);
      const msg =
        err instanceof Error ? err.message : "Gagal menerapkan voucher";
      toast.error(msg);
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

            {/* <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">Informasi Pengiriman</p>
                <p>
                  Sistem akan otomatis memilih toko terdekat (dalam radius 5 km)
                  dari alamat pengiriman Anda untuk memproses pesanan ini.
                </p>
              </div>
            </div> */}
            <ShippingInfo />
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
                !selectedAddress || (cartItems && cartItems.length === 0)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
