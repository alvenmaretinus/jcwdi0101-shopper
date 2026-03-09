export const PRODUCT_QUERY_DEFAULTS = {
  page: 1,
  limit: 20,
  sort: "featured" as const,
  inStockOnly: false,
  withStock: false,
  withDiscounts: false,
};

export const PRODUCT_CATEGORY_QUERY_DEFAULTS = {
  page: 1,
  limit: 20,
};

export const PRODUCT_ALLOWED_SORTS = [
  "featured",
  "name",
  "price-low",
  "price-high",
] as const;
