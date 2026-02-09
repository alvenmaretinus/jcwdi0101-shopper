"use client";

import Link from "next/link";
import { StoreProduct } from "@/types/StoreProduct";
import { authClient } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

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
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  const getButtonText = () => {
    if (isOutOfStock) return "Out of Stock";
    if (!isLoggedIn) return "Login to Buy";
    return "Add to Cart";
  };

  return (
    <div className="card-product group relative flex flex-col">
      {/* Badges */}
      <Link href={`/products/${product.id}`} className="flex-1">
        {/* Image with discount badge */}
        <div className="relative aspect-square bg-muted/30 flex items-center justify-center p-6 overflow-hidden">
          {hasDiscount && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0">
              -{discountPercentage}%
            </Badge>
          )}
          <span className="text-6xl sm:text-7xl group-hover:scale-110 transition-transform duration-300">
            {product.images[0]}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.category}
          </span>

          <h3 className="font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base sm:text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>

          {/* Stock status */}
          {isOutOfStock && (
            <p className="text-xs sm:text-sm text-red-500 font-medium mt-1">
              Out of Stock
            </p>
          )}
          {!isOutOfStock && product.quantity <= 5 && (
            <p className="text-xs sm:text-sm text-amber-600 font-medium mt-1">
              Only {product.quantity} left
            </p>
          )}
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-4 pb-4">
        <Button
          disabled={isOutOfStock || !isLoggedIn}
          size="sm"
          className="w-full h-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // TODO: Add to cart logic
            console.log("Add to cart:", product.id);
          }}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
}
