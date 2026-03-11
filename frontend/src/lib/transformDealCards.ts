import { ProductWithDiscount } from "@/services/discount";

interface DealBadge {
  label: string;
  endsAt: Date | string | null;
}

interface TransformedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  savingsAmount?: number;
  weight: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  productImages: Array<{
    id: string;
    url: string;
    productId: string;
    createdAt: string;
    updatedAt: string;
  }>;
  productStores: any[];
  isSoftDeleted: boolean;
  createAt: string;
  updatedAt: string;
  discountBadge?: string;
  bugoBadge?: DealBadge;
  endsAt?: Date | string | null;
}

interface DealCard {
  product: TransformedProduct;
  discountBadge?: DealBadge;
  bugoBadge?: DealBadge;
}

/**
 * Calculates the earliest end date from a group of discounts
 */
function getEarliestEndsAt(group: ProductWithDiscount[]): Date | null {
  const endsAtList = group
    .map((discount) => (discount.endsAt ? new Date(discount.endsAt) : null))
    .filter((date): date is Date => !!date && !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  return endsAtList[0] ?? null;
}

/**
 * Transforms a product into a standardized shape for deal cards
 */
function transformProduct(
  product: ProductWithDiscount["product"],
  options?: {
    discountedPrice?: number;
    totalDiscount?: number;
  }
): Omit<TransformedProduct, "discountBadge" | "bugoBadge" | "endsAt"> {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: options?.discountedPrice ?? product.price,
    ...(options?.discountedPrice && {
      originalPrice: product.price,
      savingsAmount: options.totalDiscount,
    }),
    weight: product.weight,
    categoryId: product.categoryId,
    category: {
      id: product.category?.id || product.categoryId,
      name: product.category?.name || "Products",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    productImages: (product.productImages || []).map((img) => ({
      ...img,
      productId: product.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    productStores: product.productStores || [],
    isSoftDeleted: false,
    createAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Transforms flash deal groups into deal cards with pricing from discountedPricing
 */
export function transformFlashDealCards(
  groups: Record<string, ProductWithDiscount[]>
): DealCard[] {
  const transformedDeals = Object.values(groups)
    .map((group) => {
      const product = group[0].product;
      const pricing = product.discountedPricing;

      if (!pricing || pricing.appliedCount === 0) {
        return null;
      }

      const earliestEndsAt = pricing.earliestEndsAt ?? null;

      // BXGY/Quantity discount badge
      const bugoBadge =
        pricing.quantityDiscounts && pricing.quantityDiscounts.length > 0
          ? {
              label:
                pricing.quantityDiscounts.length > 1
                  ? `${pricing.quantityDiscounts.length} BXGY offers`
                  : `Buy ${pricing.quantityDiscounts[0].buyQuantity} get ${pricing.quantityDiscounts[0].freeQuantity} free`,
              endsAt: pricing.quantityDiscounts[0].endsAt ?? null,
            }
          : undefined;

      // Regular discount badge (percentage/amount)
      const discountBadge =
        pricing.appliedCount > 0
          ? pricing.appliedCount > 1
            ? `${pricing.appliedCount} discounts applied`
            : pricing.appliedDiscounts[0]?.label ||
              `${Math.round((pricing.totalDiscount / product.price) * 100)}% off`
          : undefined;

      return {
        ...transformProduct(product, {
          discountedPrice: pricing.discountedPrice,
          totalDiscount: pricing.totalDiscount,
        }),
        discountBadge,
        bugoBadge,
        endsAt: earliestEndsAt,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return transformedDeals.map((product) => ({
    product,
    discountBadge: product.discountBadge
      ? {
          label: product.discountBadge,
          endsAt: product.endsAt ?? null,
        }
      : undefined,
    bugoBadge: product.bugoBadge,
  }));
}

/**
 * Transforms BOGO deal groups into deal cards with buy/get quantity info
 */
export function transformBogoDealCards(
  groups: Record<string, ProductWithDiscount[]>
): DealCard[] {
  return Object.values(groups)
    .map((group) => {
      const product = group[0].product;
      const bogoDiscount = group[0];

      if (!bogoDiscount.buyQuantity || !bogoDiscount.freeQuantity) {
        return null;
      }

      const earliestEndsAt = getEarliestEndsAt(group);

      return {
        product: transformProduct(product),
        discountBadge: undefined,
        bugoBadge: {
          label:
            group.length > 1
              ? `${group.length} BXGY offers`
              : `Buy ${bogoDiscount.buyQuantity} get ${bogoDiscount.freeQuantity} free`,
          endsAt: earliestEndsAt,
        },
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
