"use client";

import Image from "next/image";
import { Package } from "lucide-react";
import { useState } from "react";

interface ProductImageWithFallbackProps {
  src: string;
  alt: string;
  productName: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  fill?: boolean;
  className?: string;
}

export const ProductImageWithFallback = ({
  src,
  alt,
  productName,
  priority = false,
  loading = "eager",
  fill = true,
  className = "",
}: ProductImageWithFallbackProps) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center gap-3">
        <Package className="h-16 w-16 text-muted-foreground/60" />
        <p className="text-sm font-medium text-muted-foreground text-center px-4 line-clamp-2">
          {productName}
        </p>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      loading={loading}
      unoptimized
      onError={() => setImageError(true)}
    />
  );
};
