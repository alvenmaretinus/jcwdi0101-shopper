import { Badge } from "@/components/ui/badge";

interface DiscountedPrice {
  discountedPrice: number;
  appliedCount: number;
  totalDiscount: number;
  appliedDiscounts: Array<{
    id: string;
    name: string;
    label: string;
    savedAmount: number;
  }>;
}

interface ProductPricingSectionProps {
  price: number;
  hasPriceDiscount: boolean;
  bestDiscount: DiscountedPrice | null;
  formatPrice: (price: number) => string;
}

export const ProductPricingSection = ({
  price,
  hasPriceDiscount,
  bestDiscount,
  formatPrice,
}: ProductPricingSectionProps) => {
  return (
    <div className="border-y py-4">
      {hasPriceDiscount ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold text-primary">
              {formatPrice(bestDiscount!.discountedPrice)}
            </div>
            <Badge variant="secondary">
              {bestDiscount!.appliedCount} discount
              {bestDiscount!.appliedCount > 1 ? "s" : ""} applied
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground line-through">
            {formatPrice(price)}
          </div>
          <div className="text-sm text-green-700">
            You save {formatPrice(bestDiscount!.totalDiscount)}
          </div>
          <div className="pt-2 space-y-1">
            <p className="text-xs text-muted-foreground">Applied discounts:</p>
            {bestDiscount!.appliedDiscounts.map((discount) => (
              <div
                key={discount.id}
                className="text-xs text-muted-foreground flex items-center justify-between"
              >
                <span>
                  {discount.name} ({discount.label})
                </span>
                <span>-{formatPrice(discount.savedAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-3xl font-bold text-primary">
          {formatPrice(price)}
        </div>
      )}
    </div>
  );
};
