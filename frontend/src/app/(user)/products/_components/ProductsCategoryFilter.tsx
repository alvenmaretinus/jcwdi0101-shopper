import { ProductsCategoryPagination } from "./ProductsCategoryPagination";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductsCategoryFilterProps {
  categoryOptions: CategoryOption[];
  selectedCategoryId: string;
  showInStock: boolean;
  safeCategoryPage: number;
  totalCategoryPages: number;
  search?: string;
  sort?: string;
}

export function ProductsCategoryFilter({
  categoryOptions,
  selectedCategoryId,
  showInStock,
  safeCategoryPage,
  totalCategoryPages,
  search,
  sort,
}: ProductsCategoryFilterProps) {
  return (
    <div>
      <h3 className="font-semibold mb-3">Categories</h3>
      <div className="space-y-2">
        {categoryOptions.map((category) => (
          <form key={category.id} method="GET" action="/products" className="block">
            <input type="hidden" name="page" value="1" />
            {showInStock && <input type="hidden" name="inStockOnly" value="true" />}
            {search && <input type="hidden" name="search" value={search} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
            <button
              type="submit"
              {...(category.id === "all"
                ? {}
                : {
                    name: "categoryId",
                    value: category.id,
                  })}
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
  );
}
