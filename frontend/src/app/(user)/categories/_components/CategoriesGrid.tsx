import Link from "next/link";
import { CategoryCard } from "./CategoryCard";

const gradientsMuted = [
  { from: "#e85d6f", to: "#d63b59" }, // strawberry red
  { from: "#f0c844", to: "#e8b833" }, // banana yellow
  { from: "#ff8c42", to: "#f07b2a" }, // orange
  { from: "#9ccc65", to: "#7cb342" }, // lime green
  { from: "#5c9cff", to: "#4285f4" }, // blueberry blue
  { from: "#ab47bc", to: "#8e24aa" }, // grape purple
  { from: "#ffa726", to: "#ff7043" }, // carrot orange
  { from: "#66bb6a", to: "#558b2f" }, // broccoli green
];

interface Category {
  id: string;
  name: string;
  productCount: number;
}

interface CategoriesGridProps {
  categories: Category[];
  totalPages: number;
  currentPage: number;
  visiblePages: Array<number | "ellipsis">;
  buildPageHref: (page: number) => string;
}

export const CategoriesGrid = ({
  categories,
  totalPages,
  currentPage,
  visiblePages,
  buildPageHref,
}: CategoriesGridProps) => {
  return (
    <>
      {/* Categories grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category, i) => {
          const gradient = gradientsMuted[i % gradientsMuted.length];

          return (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              productCount={category.productCount}
              gradient={gradient}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Link
            href={buildPageHref(currentPage - 1)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              currentPage === 1
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

            const isActive = item === currentPage;

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
            href={buildPageHref(currentPage + 1)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "hover:bg-muted"
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </>
  );
};
