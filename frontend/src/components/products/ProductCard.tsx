"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductWithDetails } from "@/services/product/getProducts";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  product: ProductWithDetails;
  discountBadge?: {
    label: string;
    endsAt?: string | Date | null;
  };
  bugoBadge?: {
    label: string;
    endsAt?: string | Date | null;
  };
}

export function ProductCard({
  product,
  discountBadge,
  bugoBadge,
}: ProductCardProps) {
  const { addToCart } = useCart({ autoFetch: false });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatEndsIn = (endsAt?: string | Date | null) => {
    if (!endsAt) return "";
    const endDate = new Date(endsAt);
    if (Number.isNaN(endDate.getTime())) return "";

    const formattedDate = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(endDate);

    return `, ends ${formattedDate}`;
  };

  const totalStock = product.productStores
    ? product.productStores.reduce((sum, ps) => sum + ps.quantity, 0)
    : 0;
  const isOutOfStock = totalStock === 0;
  const originalPrice =
    typeof product.originalPrice === "number" ? product.originalPrice : null;
  const hasDiscountedPrice =
    originalPrice !== null && originalPrice > product.price;
  const savingsAmount =
    typeof product.savingsAmount === "number"
      ? product.savingsAmount
      : hasDiscountedPrice
        ? originalPrice - product.price
        : 0;
  console.log("Product:", product);
  const primaryImage =
    product.productImages[0]?.url ||
    "https://placehold.co/400x400?text=No+Image";

  return (
    <div className="card-product group relative">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {isOutOfStock && (
          <Badge className="bg-destructive text-destructive-foreground border-0">
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Discount and BOGO Badges - positioned at top center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-2 w-full px-4 pt-4">
        {discountBadge && (
          <div className="flex justify-center">
            <div
              className="text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap"
              style={{
                background: "linear-gradient(to right, #ec4899, #db2777)",
              }}
            >
              {discountBadge.label}
              {formatEndsIn(discountBadge.endsAt)}
            </div>
          </div>
        )}
        {bugoBadge && (
          <div className="flex justify-center">
            <div
              className="text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap"
              style={{
                background: "linear-gradient(to right, #f97316, #dc2626)",
              }}
            >
              {bugoBadge.label}
              {formatEndsIn(bugoBadge.endsAt)}
            </div>
          </div>
        )}
      </div>

      {/* Image */}
      <Link href={`/products/${product.id}`}>
        <div
          className={`aspect-square bg-muted/30 flex items-center justify-center overflow-hidden relative ${discountBadge || bugoBadge ? "pt-4" : ""}`}
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {product.category.category}
        </span>

        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-foreground mt-1 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price and CTA */}
        <div className="flex items-end justify-between mt-3">
          <div>
            {hasDiscountedPrice && originalPrice !== null && (
              <span className="text-xs text-muted-foreground line-through block">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {hasDiscountedPrice && savingsAmount > 0 && (
              <p className="text-xs text-green-700 font-medium mt-1">
                You saved {formatPrice(savingsAmount)}
              </p>
            )}
          </div>

          <Button
            size="icon"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.preventDefault();
              addToCart(product.id);
            }}
            className={`h-9 w-9 rounded-full shrink-0 ${
              isOutOfStock
                ? "bg-muted text-muted-foreground"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Stock status */}
        {!isOutOfStock && totalStock <= 10 && (
          <p className="text-sm text-secondary font-medium mt-2">
            Only {totalStock} left
          </p>
        )}
      </div>
    </div>
  );
}
