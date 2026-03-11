import { getProductCategories } from "@/services/product/getProductCategories";
import { parseOptionalPositiveInt } from "@/lib/parsers";
import { ProductsCategoryFilter } from "./ProductsCategoryFilter";
import { ProductsToggleFilter } from "./ProductsToggleFilter";

interface ProductsFilterContentProps {
  selectedCategoryId: string;
  showInStock: boolean;
  categoryPage?: string;
  categoryLimit?: string;
  search?: string;
  sort?: string;
}

export async function ProductsFilterContent({
  selectedCategoryId,
  showInStock,
  categoryPage,
  categoryLimit,
  search,
  sort,
}: ProductsFilterContentProps) {
  const categoryPageValue = parseOptionalPositiveInt(categoryPage);
  const categoryLimitValue = parseOptionalPositiveInt(categoryLimit);

  const categoriesResponse = await getProductCategories({
    page: categoryPageValue,
    limit: categoryLimitValue,
  });

  const categoryOptions = [
    { id: "all", name: "All Categories" },
    ...categoriesResponse.data,
  ];

  const safeCategoryPage = Math.min(
    categoriesResponse.meta.page,
    categoriesResponse.meta.totalPages
  );
  const totalCategoryPages = categoriesResponse.meta.totalPages;

  return (
    <div className="space-y-6">
      <ProductsCategoryFilter
        categoryOptions={categoryOptions}
        selectedCategoryId={selectedCategoryId}
        showInStock={showInStock}
        safeCategoryPage={safeCategoryPage}
        totalCategoryPages={totalCategoryPages}
        search={search}
        sort={sort}
      />

      <ProductsToggleFilter showInStock={showInStock} />
    </div>
  );
}
