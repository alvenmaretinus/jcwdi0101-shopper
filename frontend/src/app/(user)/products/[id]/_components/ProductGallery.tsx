"use client";

import { ProductImageWithFallback } from "@/components/ProductImageWithFallback";
import { Package } from "lucide-react";

interface ProductImage {
  id: string;
  url: string | null;
}

interface ProductGalleryProps {
  productName: string;
  productImages: ProductImage[];
}

export const ProductGallery = ({
  productName,
  productImages,
}: ProductGalleryProps) => {
  if (!productImages || productImages.length <= 1) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4">More Images</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {productImages.slice(1).map((image) => (
          <div
            key={image.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-card shadow-soft"
          >
            {image.url ? (
              <ProductImageWithFallback
                src={image.url}
                alt={productName}
                productName={productName}
                loading="lazy"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
