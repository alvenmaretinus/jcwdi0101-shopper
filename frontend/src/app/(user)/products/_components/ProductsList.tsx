import { getProducts } from "@/services/product/getProducts";
import { headers } from "next/headers";
import { ProductsDesktopSidebar } from "./ProductsDesktopSidebar";
import { ProductsMainContent } from "./ProductsMainContent";
import { ProductsPageHeader } from "./ProductsPageHeader";
import { ProductsFilterContent } from "./ProductsFilterContent";
import { ProductsStoreHydrator } from "./ProductsStoreHydrator";
import { parseProductsSearchParams } from "@/lib/parsers";
import { getProductCategoryById } from "@/services/product/getProductCategoryById";

interface ProductsListProps {
  searchParams: {
    categoryId?: string;
    page?: string;
    limit?: string;
    categoryPage?: string;
    categoryLimit?: string;
    search?: string;
    inStockOnly?: string;
    sort?: string;
  };
}

export async function ProductsList({
  searchParams,
}: ProductsListProps) {
  const nextHeaders = await headers();
  const {
    selectedCategoryId,
    showInStock,
    page,
    limit,
    categoryPage,
    categoryLimit,
    search,
    inStockOnly,
    normalizedSort,
  } = parseProductsSearchParams(searchParams);

  const selectedCategoryNamePromise = selectedCategoryId === "all"
    ? Promise.resolve("All Categories")
    : getProductCategoryById(selectedCategoryId, nextHeaders).then((category) => category.name);

  const [productsResponse, selectedCategoryName] = await Promise.all([
    getProducts(
      {
        withStock: true,
        withDiscounts: true,
        categoryId: selectedCategoryId === "all" ? undefined : selectedCategoryId,
        page,
        limit,
        name: search,
        inStockOnly,
        sort: normalizedSort,
      },
      nextHeaders
    ),
    selectedCategoryNamePromise,
  ]);

  const pagination = productsResponse.meta;
  const initialProducts = productsResponse.data;
  const filterContent = (
    <ProductsFilterContent
      selectedCategoryId={selectedCategoryId}
      showInStock={showInStock}
      categoryPage={searchParams.categoryPage}
      categoryLimit={searchParams.categoryLimit}
    />
  );

  return (
    <div className="bg-muted/30 min-h-screen">
      <ProductsStoreHydrator
        selectedCategoryId={selectedCategoryId === "all" ? undefined : selectedCategoryId}
        selectedCategoryName={selectedCategoryName}
        showInStock={showInStock}
        currentSearch={search}
        currentSort={normalizedSort}
        page={page}
        limit={limit}
        categoryPage={categoryPage}
        categoryLimit={categoryLimit}
        products={initialProducts || []}
        pagination={pagination}
      />

      <div className="container-app py-8">
        <ProductsPageHeader
          categoryName={selectedCategoryName}
          pagination={pagination}
        />

        <div className="flex gap-8">
          <ProductsDesktopSidebar>
            {filterContent}
          </ProductsDesktopSidebar>

          <ProductsMainContent
            filterContent={filterContent}
          />
        </div>
      </div>
    </div>
  );
}
