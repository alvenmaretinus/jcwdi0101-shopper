import { Layout } from "@/components/layout/Layout";
import { getProductCategories } from "@/services/product/getProductCategories";
import { getProducts } from "@/services/product/getProducts";
import { headers } from "next/headers";
import { Header } from "./_components/Header";
import { CategoriesGrid } from "./_components/CategoriesGrid";

const ITEMS_PER_PAGE = 8;

const getVisiblePages = (currentPage: number, totalPages: number): Array<number | "ellipsis"> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pageSet = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  if (currentPage <= 3) {
    pageSet.add(2);
    pageSet.add(3);
    pageSet.add(4);
  }

  if (currentPage >= totalPages - 2) {
    pageSet.add(totalPages - 1);
    pageSet.add(totalPages - 2);
    pageSet.add(totalPages - 3);
  }

  const sortedPages = Array.from(pageSet)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const visiblePages: Array<number | "ellipsis"> = [];

  for (let index = 0; index < sortedPages.length; index++) {
    const page = sortedPages[index];
    const previousPage = sortedPages[index - 1];

    if (previousPage) {
      const gap = page - previousPage;

      if (gap === 2) {
        visiblePages.push(previousPage + 1);
      } else if (gap > 2) {
        visiblePages.push("ellipsis");
      }
    }

    visiblePages.push(page);
  }

  return visiblePages;
};

const Categories = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const nextHeaders = await headers();
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const categoriesResponse = await getProductCategories(
    { page: currentPage, limit: ITEMS_PER_PAGE },
    nextHeaders,
  );
  const allProducts = await getProducts({ withStock: true }, nextHeaders);
  
  // Count products per category
  const productCounts = categoriesResponse.data.map(category => ({
    ...category,
    productCount: allProducts.data.filter(p => p.categoryId === category.id).length
  }));

  const totalPages = categoriesResponse.meta.totalPages;
  const safeCurrentPage = Math.min(categoriesResponse.meta.page, totalPages);
  const visiblePages = getVisiblePages(safeCurrentPage, totalPages);

  const buildPageHref = (page: number) => `/categories?page=${page}`;

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen">
        <div className="container-app py-8">
          {/* Header */}
          <Header />

          {/* Categories Grid and Pagination */}
          <CategoriesGrid
            categories={productCounts}
            totalPages={totalPages}
            currentPage={safeCurrentPage}
            visiblePages={visiblePages}
            buildPageHref={buildPageHref}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
