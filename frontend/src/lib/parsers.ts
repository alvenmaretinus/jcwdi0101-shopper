export const parseOptionalPositiveInt = (value?: string): number | undefined => {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export const parseOptionalBoolean = (value?: string): boolean | undefined => {
  if (value === undefined) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  return undefined;
};

interface ProductsSearchParams {
  categoryId?: string;
  page?: string;
  limit?: string;
  categoryPage?: string;
  categoryLimit?: string;
  search?: string;
  inStockOnly?: string;
  sort?: string;
}

export const parseProductsSearchParams = (searchParams: ProductsSearchParams) => {
  const selectedCategoryId = searchParams.categoryId ?? "all";
  const showInStock = parseOptionalBoolean(searchParams.inStockOnly) ?? false;
  const page = parseOptionalPositiveInt(searchParams.page);
  const limit = parseOptionalPositiveInt(searchParams.limit);
  const categoryPage = parseOptionalPositiveInt(searchParams.categoryPage);
  const categoryLimit = parseOptionalPositiveInt(searchParams.categoryLimit);
  const search = searchParams.search;
  const inStockOnly = parseOptionalBoolean(searchParams.inStockOnly);
  const normalizedSort = (searchParams.sort === "featured" || searchParams.sort === "name" || searchParams.sort === "price-low" || searchParams.sort === "price-high")
    ? searchParams.sort as "featured" | "name" | "price-low" | "price-high"
    : undefined;

  return {
    selectedCategoryId,
    showInStock,
    page,
    limit,
    categoryPage,
    categoryLimit,
    search,
    inStockOnly,
    normalizedSort,
  };
};
