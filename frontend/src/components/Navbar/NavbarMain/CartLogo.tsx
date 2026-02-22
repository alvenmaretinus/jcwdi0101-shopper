import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export const CartLogo = () => {
  const { cartItems } = useCart();

  const uniqueProductCount = useMemo(() => {
    const uniqueIds = new Set(
      cartItems.map((item) => String(item.productId ?? item.id))
    );

    return uniqueIds.size;
  }, [cartItems]);

  return (
    <Link href="/cart" className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
      >
        <ShoppingCart className="h-5 w-5" />
        {uniqueProductCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-secondary text-secondary-foreground text-xs">
            {uniqueProductCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
};
