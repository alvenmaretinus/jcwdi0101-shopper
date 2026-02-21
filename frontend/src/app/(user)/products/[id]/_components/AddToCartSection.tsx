"use client";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface AddToCartSectionProps {
  productId: string;
  totalStock: number;
}

export function AddToCartSection({ productId, totalStock }: AddToCartSectionProps) {
  const { addToCart } = useCart({ autoFetch: false });

  return (
    <>
      <div className="pt-6">
        <Button
          size="lg"
          className="w-full"
          disabled={totalStock === 0}
          onClick={() => addToCart(productId)}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </Button>
      </div>

      {totalStock === 0 && (
        <p className="text-sm text-center text-muted-foreground">
          This product is currently unavailable
        </p>
      )}
    </>
  );
}
