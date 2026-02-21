"use client";

import Link from "next/link";
import { StoreProduct } from "@/types/StoreProduct";
import { authClient } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  product: StoreProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isOutOfStock = product.quantity === 0;
  const displayPrice = product.finalPrice ?? product.price;
  const originalPrice = product.originalPrice ?? product.price;
  const discountAmount =
    product.discountAmount ?? Math.max(0, originalPrice - displayPrice);
  const hasDiscount = discountAmount > 0 && originalPrice > displayPrice;
  const discountPercentage = hasDiscount
    ? Math.round((1 - displayPrice / originalPrice) * 100)
    : 0;

  // Format weight display from product data
  const weightDisplay = product.weight ? `${product.weight}g/pcs` : null;

  const { addToCart } = useCart({ autoFetch: false });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.info("Please login to add items to cart");
      return;
    }

    if (isOutOfStock) return;

    try {
      setIsAdding(true);
      await addToCart(product.id, 1);
      console.log("Add to cart:", product.id);
    } catch (error) {
      console.error("Add to cart failed:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="card-product group relative flex flex-col bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-medium transition-all duration-300">
      {/* Badges */}
      <Link href={`/products/${product.id}`} className="flex-1">
        {/* Image with discount badge */}
        <div className="relative aspect-square bg-muted/30 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {hasDiscount && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0 text-xs">
              -{discountPercentage}%
            </Badge>
          )}
          <span className="text-4xl sm:text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">
            {product.images[0]}
          </span>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
            {product.category}
          </span>

          <h3 className="font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base">
            {product.name}
          </h3>

          {/* Weight info */}
          {weightDisplay && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {weightDisplay}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-2 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-primary">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Stock status */}
          {isOutOfStock && (
            <p className="text-[10px] sm:text-xs text-red-500 font-medium mt-1">
              Out of Stock
            </p>
          )}
          {!isOutOfStock && product.quantity <= 5 && (
            <p className="text-[10px] sm:text-xs text-amber-600 font-medium mt-1">
              Only {product.quantity} left
            </p>
          )}
        </div>
      </Link>

      {/* Quick Add Button */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <Button
          disabled={isOutOfStock || isAdding}
          size="sm"
          className="w-full h-9 sm:h-10 rounded-full"
          onClick={handleAddToCart}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {isAdding ? "Adding..." : "Add"}
        </Button>
      </div>
    </div>
  );
}
