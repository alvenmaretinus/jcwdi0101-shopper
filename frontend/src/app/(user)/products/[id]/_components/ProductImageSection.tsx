"use client";

import { ProductImageWithFallback } from "@/components/ProductImageWithFallback";
import { Package } from "lucide-react";

interface ProductImageSectionProps {
  productName: string;
  primaryImage: string | null;
}

export const ProductImageSection = ({
  productName,
  primaryImage,
}: ProductImageSectionProps) => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-soft">
      {primaryImage ? (
        <div className="relative aspect-square">
          <ProductImageWithFallback
            src={primaryImage}
            alt={productName}
            productName={productName}
            priority={true}
            className="object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square bg-muted flex items-center justify-center">
          <Package className="h-24 w-24 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
