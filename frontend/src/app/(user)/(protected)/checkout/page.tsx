"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "./_components/Checkout/radio-group";
import {
  MapPin,
  Plus,
  CreditCard,
  Building,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getUserAddresses } from "@/services/user-address/getUserAddresses";
import { useCart } from "@/hooks/useCart";
import { createOrder } from "@/services/order/createOrder";
import { UserAddress } from "@/types/UserAddress";

const Checkout = () => {
  const router = useRouter();
  const {
    cartItems,
    loading: isCartLoading,
    subtotal,
    deliveryFee,
  } = useCart();

  // State
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentType, setPaymentType] = useState<
    "BANK_TRANSFER" | "PAYMENT_GATEWAY"
  >("BANK_TRANSFER");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Fetch addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        const data = await getUserAddresses();
        setAddresses(data);
        if (data.length > 0) {
          // Select first address by default (or default address if exists)
          const defaultAddr = data.find((a) => a.isDefault) || data[0];
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.error("[Checkout] Failed to fetch addresses:", err);
        toast.error("Gagal memuat alamat pengiriman");
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, []);

  // Redirect to cart if no items
  useEffect(() => {
    if (!isCartLoading && (!cartItems || cartItems.length === 0)) {
      router.push("/cart");
    }
  }, [cartItems, isCartLoading, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Pilih alamat pengiriman terlebih dahulu");
      return;
    }

    try {
      setIsCreatingOrder(true);

      console.log("[Checkout] Creating order with:", {
        addressId: selectedAddressId,
        paymentType,
      });

      const order = await createOrder({
        addressId: selectedAddressId,
        paymentType,
      });

      console.log("[Checkout] Order created successfully:", order);
      toast.success("Pesanan berhasil dibuat! Lanjut ke pembayaran...");

      // Redirect to payment page with order ID
      setTimeout(() => {
        router.push(`/order/${order.id}/payment`);
      }, 1500);
    } catch (err) {
      console.error("[Checkout] Error creating order:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Gagal membuat pesanan";
      toast.error(errorMsg);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Calculate order summary from cart
  const cartSubtotal = subtotal || 0;
  const discount = 0; // TODO: Add discount calculation from promo
  const shippingCost = deliveryFee || 0;
  const total = cartSubtotal - discount + shippingCost;

  // Get selected address for display (not used here)

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="container-app py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <a href="/cart" className="hover:text-primary cursor-pointer">
            Cart
          </a>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Checkout</span>
        </nav>

        <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Shipping Address
                </h2>
                <Button variant="ghost" size="sm" className="text-primary">
                  <Plus className="h-4 w-4 mr-1" />
                  Add New
                </Button>
              </div>

              {isLoadingAddresses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">
                    Loading addresses...
                  </span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-100">
                      No addresses found
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Please add a shipping address
                    </p>
                  </div>
                </div>
              ) : (
                <RadioGroup
                  value={selectedAddressId}
                  onValueChange={setSelectedAddressId}
                  className="space-y-3"
                >
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedAddressId === address.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={address.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {address.addressType}
                          </span>
                          {address.isDefault && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.recipientName}
                        </p>
                        <p className="text-sm mt-1">{address.addressName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Kode Pos: {address.postCode}
                        </p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Method
              </h2>

              <RadioGroup
                value={paymentType}
                onValueChange={(value: string) =>
                  setPaymentType(value as "BANK_TRANSFER" | "PAYMENT_GATEWAY")
                }
                className="space-y-3"
              >
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentType === "BANK_TRANSFER"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="BANK_TRANSFER" />
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Bank Transfer</p>
                    <p className="text-sm text-muted-foreground">
                      Transfer manual dengan verifikasi admin
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentType === "PAYMENT_GATEWAY"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="PAYMENT_GATEWAY" />
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Payment Gateway</p>
                    <p className="text-sm text-muted-foreground">
                      Pembayaran instant via Midtrans
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            {/* Info text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">Informasi Pengiriman</p>
                <p>
                  Sistem akan otomatis memilih toko terdekat (dalam radius 5 km)
                  dari alamat pengiriman Anda untuk memproses pesanan ini.
                </p>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-28">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              {/* Items */}
              {cartItems && cartItems.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} x{item.quantity}
                      </span>
                      <span>
                        {formatPrice((item.price || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mb-6 py-4 text-center">
                  Tidak ada item di keranjang
                </div>
              )}

              <hr className="border-border mb-4" />

              {/* Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Cost</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {shippingCost > 0 ? formatPrice(shippingCost) : "Gratis"}
                  </span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={
                  isCreatingOrder ||
                  isCartLoading ||
                  !selectedAddressId ||
                  (cartItems && cartItems.length === 0)
                }
                className="w-full mt-6 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Place Order
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Dengan membuat pesanan ini, Anda setuju dengan Syarat Layanan
                kami.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
