import { getProductCategories } from "@/services/product/getProductCategories";
import { ProductsInStockOnlyToggle } from "./ProductsInStockOnlyToggle";
import { ProductsCategoryPagination } from "./ProductsCategoryPagination";
import { parseOptionalPositiveInt } from "@/lib/parsers";

interface ProductsFilterContentProps {
  selectedCategoryId: string;
  showInStock: boolean;
  categoryPage?: string;
  categoryLimit?: string;
}

export async function ProductsFilterContent({
  selectedCategoryId,
  showInStock,
  categoryPage,
  categoryLimit,
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
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categoryOptions.map((category) => (
            <form key={category.id} method="GET" action="/products" className="block">
              {showInStock && (
                <input type="hidden" name="inStockOnly" value="true" />
              )}
              <button
                type="submit"
                name="categoryId"
                value={category.id === "all" ? "" : category.id}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategoryId === category.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {category.name}
              </button>
            </form>
          ))}
        </div>

        <ProductsCategoryPagination
          currentPage={safeCategoryPage}
          totalPages={totalCategoryPages}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="space-y-3">
          <ProductsInStockOnlyToggle showInStock={showInStock} />
        </div>
      </div>
    </div>
  );
}
