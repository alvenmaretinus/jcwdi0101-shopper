"use client";

import { useEffect, useState } from "react";
import { OrderSummary, OrderItem } from "./OrderSummary";
import { UserAddress } from "@/types/UserAddress";
import { ShippingCost } from "@/types/ShippingCost";
import { toast } from "sonner";
import { ShippingMethodSelection } from "./ShippingMethodSelection";
import { AddressSelection } from "./AddressSelection";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getShippingCost } from "@/services/shipping-cost/getShippingCost";
import { Store } from "@/types/Store";
import { LoadingScreen } from "@/components/LoadingScreen";

interface CheckoutProps {
  addresses: UserAddress[];
  shippingData: ShippingCost | null;
  orderItems: OrderItem[];
  subtotal: number;
  stores: Store[];
  totalWeight: number;
}

export default function Checkout({
  stores,
  addresses,
  shippingData: initialShippingData,
  orderItems,
  subtotal,
  totalWeight,
}: CheckoutProps) {
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    addresses.find((a) => a.isDefault === true) || addresses[0] || null
  );
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>("regular");
  const [shippingData, setShippingData] = useState<ShippingCost | null>(
    initialShippingData
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!orderItems || orderItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 flex flex-col items-center justify-center text-center">
        <div className="bg-muted/50 p-8 rounded-full mb-8">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-semibold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-10 max-w-sm">
          Looks like you haven't added anything to your cart yet. Please shop
          first to continue to checkout.
        </p>
        <Button
          asChild
          className="rounded-full py-6 px-10 text-lg font-medium shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700"
        >
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            Back to Shopping
          </Link>
        </Button>
      </div>
    );
  }

  const getCheapestShippingService = () => {
    if (!shippingData) return 0;

    let items: any[] = [];
    if (selectedShippingMethod === "regular") items = shippingData.calculate_reguler;
    if (selectedShippingMethod === "cargo") items = shippingData.calculate_cargo;
    if (selectedShippingMethod === "instant") items = shippingData.calculate_instant;

    if (items.length === 0) return 0;

    return items.reduce((prev, curr) =>
      prev.shipping_cost < curr.shipping_cost ? prev : curr
    ).shipping_cost;
  };

  const discount = 0;
  const shippingCostValue = getCheapestShippingService();
  const totalValue = subtotal - discount + shippingCostValue;

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }
    toast.success("Order placed successfully! (Mock)");
  };

  useEffect(() => {
    const updateShippingCost = async () => {
      if (selectedAddress) {
        setIsLoading(true);
        try {
          const nearestStore = stores[1];
          const newShippingData = await getShippingCost({
            originPostCode: selectedAddress.postCode,
            destinationPostCode: nearestStore.postCode,
            weight: totalWeight,
            itemValue: subtotal,
          });
          setShippingData(newShippingData);
        } catch (error) {
          console.error("Failed to update shipping cost:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    updateShippingCost();
  }, [selectedAddress, stores, totalWeight, subtotal]);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AddressSelection
              addresses={addresses}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
            />

            <ShippingMethodSelection
              shippingData={shippingData}
              selectedMethod={selectedShippingMethod}
              onSelect={setSelectedShippingMethod}
            />
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              items={orderItems}
              subtotal={subtotal}
              discount={discount}
              shippingCost={shippingCostValue}
              total={totalValue}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>
      </div>
    </>
  );
}
