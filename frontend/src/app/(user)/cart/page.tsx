"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Minus,
  Plus,
  Trash2,
  Tag,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";
import { CartItem, CartResponse } from "@/types/cart";

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Fetch cart items on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await apiFetch<CartResponse>("/cart", {
          method: "GET",
        });
        setCartItems(response.data || []);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const updateQuantity = async (id: number | string, delta: number) => {
    try {
      const item = cartItems.find((item) => item.id === id);
      if (!item) return;

      const newQuantity = Math.max(
        1,
        Math.min(item.stock, item.quantity + delta)
      );

      // Update optimistically
      setCartItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );

      // Sync with backend
      await apiFetch("/cart", {
        method: "PUT",
        body: { productId: id, quantity: newQuantity },
      });
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update item");
      // Refetch cart on error
      const response = await apiFetch<CartResponse>("/cart", {
        method: "GET",
      });
      setCartItems(response.data || []);
    }
  };

  const removeItem = async (id: number | string) => {
    try {
      // Update optimistically
      setCartItems((items) => items.filter((item) => item.id !== id));

      // Sync with backend
      await apiFetch(`/cart/${id}`, {
        method: "DELETE",
      });
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item");
      // Refetch cart on error
      const response = await apiFetch<CartResponse>("/cart", {
        method: "GET",
      });
      setCartItems(response.data || []);
    }
  };

  const applyPromo = async () => {
    try {
      await apiFetch("/promo/validate", {
        method: "POST",
        body: { code: promoCode },
      });
      setAppliedPromo(promoCode.toUpperCase());
      toast.success("Promo code applied successfully");
    } catch (error) {
      console.error("Failed to apply promo:", error);
      toast.error("Invalid promo code");
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = subtotal >= 200000 ? 0 : 15000;
  const discount = appliedPromo ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + deliveryFee - discount;

  if (loading) {
    return (
      <div className="container-app py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-6 animate-pulse">🛒</div>
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-app py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added any items to your cart yet.
          </p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-12">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="container-app py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Shopping Cart ({cartItems.length} items)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-2xl p-4 md:p-6 shadow-soft flex gap-4"
              >
                {/* Image */}
                <div className="w-24 h-24 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                  <span className="text-5xl">{item.image}</span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <Link
                        href={`/products/${item.id}`}
                        className="font-semibold text-foreground hover:text-primary line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} / {item.unit || "item"}
                      </p>
                      {item.isBuyOneGetOne && (
                        <span className="inline-block mt-1 text-xs font-medium bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                          Buy 1 Get 1 Free
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-berry transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity */}
                    <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Line total */}
                    <div className="text-right">
                      <span className="font-bold text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      {item.originalPrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(item.originalPrice * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-28">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Promo code */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="pl-10 rounded-full"
                      disabled={!!appliedPromo}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={applyPromo}
                    disabled={!promoCode || !!appliedPromo}
                  >
                    Apply
                  </Button>
                </div>
                {appliedPromo && (
                  <p className="text-sm text-primary mt-2">
                    ✓ {appliedPromo} applied - 10% off
                  </p>
                )}
              </div>

              {/* Summary lines */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-primary">Free</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span className="font-medium">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}
                <hr className="border-border" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">{formatPrice(total)}</span>
                </div>
              </div>

              {deliveryFee > 0 && (
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Add {formatPrice(200000 - subtotal)} more for free delivery
                </p>
              )}

              <Link href="/checkout">
                <Button className="w-full mt-6 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/products">
                <Button
                  variant="ghost"
                  className="w-full mt-2 rounded-full text-muted-foreground"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
