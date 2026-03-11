import { getProducts, type ProductWithDetails } from "@/services/product/getProducts";
import type { Discount } from "@/types/Discount";

export async function resolveDiscountProduct(
  discount: Discount
): Promise<ProductWithDetails | null> {
  if (discount.product) {
    return discount.product as ProductWithDetails;
  }

  if (!discount.productId) {
    return null;
  }

  try {
    const response = await getProducts({ id: discount.productId, limit: 1 });
    return response.data[0] ?? null;
  } catch {
    return null;
  }
}
