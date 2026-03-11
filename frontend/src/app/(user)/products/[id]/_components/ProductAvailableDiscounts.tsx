import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

interface UnmetMinimumDiscount {
  id: string;
  name: string;
  label: string;
  minimumPrice: number;
}

interface ProductAvailableDiscountsProps {
  unmetMinimumDiscounts: UnmetMinimumDiscount[];
  formatPrice: (price: number) => string;
}

export const ProductAvailableDiscounts = ({
  unmetMinimumDiscounts,
  formatPrice,
}: ProductAvailableDiscountsProps) => {
  if (unmetMinimumDiscounts.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="h-5 w-5 text-primary" />
        <span className="font-medium">Available Discounts:</span>
      </div>
      <div className="space-y-2">
        {unmetMinimumDiscounts.map((discount) => (
          <div
            key={discount.id}
            className="bg-muted/40 border border-muted/50 rounded-lg p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{discount.name}</span>
              <Badge variant="outline" className="text-xs">
                {discount.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              If you buy until a minimum of {formatPrice(discount.minimumPrice)}{" "}
              per item, you&apos;ll get this discount. Discount will be applied at
              checkout.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
