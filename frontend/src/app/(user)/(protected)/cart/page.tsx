"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";

const Cart = () => {
  const {
    cartItems,
    loading,
    updateQuantity,
    removeItem,
    serverPricingDiscount,
    serverProductPromotionDiscount,
    serverGlobalDiscount,
    subtotal,
    formatPrice,
  } = useCart();

  const productPromoDiscount = Math.max(0, serverProductPromotionDiscount || 0);
  const globalDiscount = Math.max(0, serverGlobalDiscount || 0);
  const discount = Math.max(0, serverPricingDiscount || 0);
  const total = Math.max(0, subtotal - discount);

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

  // Safe check for empty cart
  const isEmpty = !Array.isArray(cartItems) || cartItems.length === 0;
  if (isEmpty) {
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
                <div className="w-24 h-24 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 overflow-hidden relative">
                  <Image
                    src={
                      item.image || "https://placehold.co/120x120?text=No+Image"
                    }
                    alt={item.name || "Product image"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
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
                      {/* Unit price — show discounted price when a product promotion applies */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {formatPrice(
                            item.discountedPrice !== undefined &&
                              item.discountedPrice < item.price
                              ? item.discountedPrice
                              : item.price
                          )}{" "}
                          / {item.unit || "item"}
                        </span>
                        {item.discountedPrice !== undefined &&
                          item.discountedPrice < item.price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(item.price)}
                            </span>
                          )}
                      </div>
                      {(item.bogoFreeQuantity ?? 0) > 0 && (
                        <span className="inline-block mt-1 text-xs text-green-600 font-medium bg-secondary/20  px-2 py-0.5 rounded-full">
                          +{item.bogoFreeQuantity} free item
                          {(item.bogoFreeQuantity ?? 0) > 1 ? "s" : ""}
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
                        disabled={
                          item.stock > 0 ? item.quantity >= item.stock : false
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Line total — show discounted total when applicable */}
                    <div className="text-right">
                      {item.discountedPrice !== undefined &&
                      item.discountedPrice < item.price ? (
                        <>
                          <span className="font-bold text-foreground">
                            {formatPrice(item.discountedPrice * item.quantity)}
                          </span>
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </>
                      ) : (
                        <span className="font-bold text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-card rounded-2xl p-6 shadow-soft lg:sticky lg:top-28">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Promo code removed: voucher application moved to Checkout page */}

              {/* Summary lines */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                {productPromoDiscount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Product Discounts</span>
                    <span className="font-medium">
                      -{formatPrice(productPromoDiscount)}
                    </span>
                  </div>
                )}
                {globalDiscount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Total Discounts</span>
                    <span className="font-medium">
                      -{formatPrice(globalDiscount)}
                    </span>
                  </div>
                )}
                {discount > 0 &&
                  productPromoDiscount === 0 &&
                  globalDiscount === 0 && (
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
