import { Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuantityDiscount {
  id: string;
  name: string;
  buyQuantity: number;
  freeQuantity: number;
  endsAt?: string | Date | null;
}

interface QuantityDiscountsSectionProps {
  quantityDiscounts?: QuantityDiscount[];
}

export function QuantityDiscountsSection({
  quantityDiscounts,
}: QuantityDiscountsSectionProps) {
  if (!quantityDiscounts || quantityDiscounts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-primary" />
        <span className="font-medium">Available Offers:</span>
      </div>
      <div className="space-y-2">
        {quantityDiscounts.map((discount) => (
          <div
            key={discount.id}
            className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">
                Buy {discount.buyQuantity}
              </span>
              <span className="text-xs text-muted-foreground">Get</span>
              <span className="text-sm font-semibold text-primary">
                {discount.freeQuantity} Free
              </span>
            </div>
            {discount.endsAt && (
              <Badge variant="outline" className="text-xs">
                Limited time
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
