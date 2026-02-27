import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { getProductCategories } from "@/services/product/getProductCategories";
import { getProducts } from "@/services/product/getProducts";
import { headers } from "next/headers";

// Icon and color mapping for fruit categories
const categoryStyles: Record<string, { icon: string; color: string; description: string }> = {
  "Tropical Fruits": {
    icon: "🍌",
    color: "from-yellow-100 to-amber-100",
    description: "Bananas, pineapples, and more"
  },
  "Citrus Fruits": {
    icon: "🍊",
    color: "from-orange-100 to-yellow-100",
    description: "Oranges, lemons, and citrus"
  },
  "Berries": {
    icon: "🍓",
    color: "from-red-100 to-pink-100",
    description: "Strawberries, blueberries, and more"
  },
  "Stone Fruits": {
    icon: "🍑",
    color: "from-pink-100 to-rose-100",
    description: "Peaches, plums, and cherries"
  },
  "Exotic Fruits": {
    icon: "🐲",
    color: "from-purple-100 to-fuchsia-100",
    description: "Dragon fruit, passion fruit, and more"
  },
  "Melons": {
    icon: "🍉",
    color: "from-green-100 to-emerald-100",
    description: "Watermelons, cantaloupes, and more"
  },
  "Apples & Pears": {
    icon: "🍎",
    color: "from-red-100 to-orange-100",
    description: "Fresh apples and pears"
  },
  "Dried Fruits": {
    icon: "🥭",
    color: "from-amber-100 to-orange-100",
    description: "Dried mango, dates, and more"
  }
};

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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Shop by Category
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Browse through our wide selection of fresh groceries organized by category
            </p>
          </div>

          {/* Categories grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productCounts.map((category) => {
              const style = categoryStyles[category.name] || {
                icon: "🍇",
                color: "from-purple-100 to-pink-100",
                description: "Fresh fruits"
              };
              
              return (
                <Link
                  key={category.id}
                  href={`/products?categoryId=${category.id}`}
                  className="group"
                >
                  <div className={`bg-gradient-to-br ${style.color} rounded-2xl p-6 h-full transition-all duration-300 hover:shadow-elevated hover:-translate-y-1`}>
                    <div className="flex items-start justify-between">
                      <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        {style.icon}
                      </div>
                      <span className="text-xs font-medium bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full">
                        {category.productCount} items
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {style.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Link
                href={buildPageHref(safeCurrentPage - 1)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  safeCurrentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-muted"
                }`}
              >
                Previous
              </Link>

              {visiblePages.map((item, index) => {
                if (item === "ellipsis") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 py-2 text-sm text-muted-foreground"
                    >
                      ...
                    </span>
                  );
                }

                const isActive = item === safeCurrentPage;

                return (
                  <Link
                    key={item}
                    href={buildPageHref(item)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    {item}
                  </Link>
                );
              })}

              <Link
                href={buildPageHref(safeCurrentPage + 1)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  safeCurrentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-muted"
                }`}
              >
                Next
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
