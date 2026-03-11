import { ProductCard } from "../../../../components/products/ProductCard";
import { ProductsGridProps } from "./ProductsList.types";

export function ProductsGrid({ products }: ProductsGridProps) {
  const uniqueProducts = new Map<string, (typeof products)[number]>();

  products.forEach((product) => {
    if (!uniqueProducts.has(product.id)) {
      uniqueProducts.set(product.id, product);
    }
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from(uniqueProducts.values()).map((product) => {
        const discountBadge =
          product.discountedPricing && product.discountedPricing.appliedCount > 0
            ? {
                label:
                  product.discountedPricing.appliedCount > 1
                    ? `${product.discountedPricing.appliedCount} discounts applied`
                    : product.discountedPricing.appliedDiscounts[0]?.label ||
                      `${Math.round((product.discountedPricing.totalDiscount / product.price) * 100)}% off`,
                endsAt: product.discountedPricing.earliestEndsAt,
              }
            : undefined;

        const bugoBadge =
          product.discountedPricing?.quantityDiscounts &&
          product.discountedPricing.quantityDiscounts.length > 0
            ? {
                label:
                  product.discountedPricing.quantityDiscounts.length > 1
                    ? `${product.discountedPricing.quantityDiscounts.length} BXGY offers`
                    : `Buy ${product.discountedPricing.quantityDiscounts[0].buyQuantity} get ${product.discountedPricing.quantityDiscounts[0].freeQuantity} free`,
                endsAt: product.discountedPricing.quantityDiscounts[0].endsAt,
              }
            : undefined;

        return (
          <ProductCard
            key={product.id}
            product={{
              ...product,
              price: product.discountedPricing?.discountedPrice || product.price,
              originalPrice: product.discountedPricing?.discountedPrice
                ? product.price
                : undefined,
              savingsAmount: product.discountedPricing?.totalDiscount,
            }}
            discountBadge={discountBadge}
            bugoBadge={bugoBadge}
          />
        );
      })}
    </div>
  );
}
