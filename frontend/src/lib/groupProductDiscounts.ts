import { ProductWithDiscount } from "@/services/discount";

/**
 * Groups product discounts by product ID.
 * Useful for combining multiple discounts that apply to the same product.
 * 
 * @param items - Array of products with discounts
 * @returns Object with product IDs as keys and arrays of discounts as values
 */
export function groupProductDiscounts(
  items: ProductWithDiscount[]
): Record<string, ProductWithDiscount[]> {
  return items.reduce((acc, item) => {
    const productId = item.product.id;
    if (!acc[productId]) {
      acc[productId] = [];
    }
    acc[productId].push(item);
    return acc;
  }, {} as Record<string, ProductWithDiscount[]>);
}
