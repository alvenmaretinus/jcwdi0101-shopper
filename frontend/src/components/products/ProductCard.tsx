"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductWithDetails } from "@/services/product/getProducts";
import { StoreProduct } from "@/types/StoreProduct";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { authClient } from "@/lib/authClient";
import { toast } from "sonner";
import { useState } from "react";

type ProductInput = ProductWithDetails | StoreProduct;

interface ProductCardProps {
  product: ProductInput;
  discountBadge?: {
    label: string;
    endsAt?: string | Date | null;
  };
  bugoBadge?: {
    label: string;
    endsAt?: string | Date | null;
  };
}

function isStoreProduct(product: ProductInput): product is StoreProduct {
  return "quantity" in product && !("productStores" in product);
}

export function ProductCard({
  product,
  discountBadge,
  bugoBadge,
}: ProductCardProps) {
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session;
  const { addToCart } = useCart({ autoFetch: false });
  const [isAdding, setIsAdding] = useState(false);

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

  // Normalize product data
  const isStoreProductType = isStoreProduct(product);
  const totalStock = isStoreProductType
    ? product.quantity
    : (product.productStores?.reduce((sum, ps) => sum + ps.quantity, 0) ?? 0);
  
  const isOutOfStock = totalStock === 0;
  
  const originalPrice = isStoreProductType
    ? (product.originalPrice ?? product.price)
    : (typeof product.originalPrice === "number" ? product.originalPrice : null);
  
  const displayPrice = isStoreProductType
    ? (product.finalPrice ?? product.price)
    : product.price;
  
  const hasDiscount = isStoreProductType
    ? (product.discountAmount ?? 0) > 0 && originalPrice !== null && originalPrice > displayPrice
    : originalPrice !== null && originalPrice > displayPrice;
  
  const discountPercentage = isStoreProductType
    ? hasDiscount && originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0
    : hasDiscount && originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;
  
  let savingsAmount: number;
  if (isStoreProductType) {
    savingsAmount = (product as StoreProduct).discountAmount ?? 0;
  } else {
    const productWithDetails = product as ProductWithDetails;
    savingsAmount = 
      typeof productWithDetails.savingsAmount === "number"
        ? productWithDetails.savingsAmount
        : (hasDiscount && originalPrice !== null ? originalPrice - displayPrice : 0);
  }
  savingsAmount = savingsAmount ?? 0;

  const weightDisplay = isStoreProductType && product.weight 
    ? `${product.weight}g/pcs` 
    : null;

  const getImageUrl = (url?: string) => {
    if (!url) return "https://placehold.co/400x400?text=No+Image";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    return `${apiBaseUrl}${url}`;
  };

  const primaryImage = isStoreProductType
    ? product.images[0] || "https://placehold.co/400x400?text=No+Image"
    : getImageUrl(product.productImages[0]?.url);

  const productName = product.name;
  const productId = product.id;
  const categoryName = isStoreProductType ? product.category : product.category.name;

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
      await addToCart(productId);
    } catch (error) {
      console.error("Add to cart failed:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="card-product group relative flex flex-col bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-medium transition-all duration-300">
      {/* Badges */}
      <Link href={`/products/${productId}`} className="flex-1">
        {/* Image with discount badge */}
        <div className="relative aspect-square bg-muted/30 overflow-hidden">
          {/* Out of stock badge - top left */}
          {isOutOfStock && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground border-0 text-xs z-10">
              Out of Stock
            </Badge>
          )}

          {/* Discount badge for simple discount (bottom right for home/products, centered top for deals) */}
          {!discountBadge && !bugoBadge && hasDiscount && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0 text-xs z-10">
              -{discountPercentage}%
            </Badge>
          )}
          
          <div className="relative h-full w-full">
            <Image
              fill
              src={primaryImage}
              alt={productName}
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          </div>
        </div>

        {/* Discount and BOGO Badges - positioned at top center for deals */}
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

        {/* Content */}
        <div className="p-3 sm:p-4">
          <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
            {categoryName}
          </span>

          <h3 className="font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base">
            {productName}
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
            {hasDiscount && originalPrice !== null && (
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Savings message */}
          {hasDiscount && savingsAmount > 0 && !isStoreProductType && (
            <p className="text-xs text-green-700 font-medium mt-1">
              You saved {formatPrice(savingsAmount)}
            </p>
          )}

          {/* Stock status */}
          {isOutOfStock && (
            <p className="text-[10px] sm:text-xs text-red-500 font-medium mt-1">
              Out of Stock
            </p>
          )}
          {!isOutOfStock && totalStock <= 10 && totalStock > 0 && (
            <p className="text-[10px] sm:text-xs text-amber-600 font-medium mt-1">
              Only {totalStock} left in stock!
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
