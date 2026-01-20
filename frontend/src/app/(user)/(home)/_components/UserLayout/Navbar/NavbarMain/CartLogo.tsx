import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

const mockCartCount = 3;

export const CartLogo = () => {
  return (
    <Link href="/cart" className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
      >
        <ShoppingCart className="h-5 w-5" />
        {mockCartCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-secondary text-secondary-foreground text-xs">
            {mockCartCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
};
