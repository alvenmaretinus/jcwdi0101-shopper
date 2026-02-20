"use client";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface AddToCartSectionProps {
  productId: string;
  totalStock: number;
}

export function AddToCartSection({ productId, totalStock }: AddToCartSectionProps) {
  const { addToCart } = useCart();

  return (
    <>
      <div className="flex gap-3 pt-6">
        <Button
          size="lg"
          className="flex-1"
          disabled={totalStock === 0}
          onClick={() => addToCart(productId)}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </Button>
        <Button size="lg" variant="outline">
          Buy Now
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
