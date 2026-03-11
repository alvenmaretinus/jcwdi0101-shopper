import { ChevronLeft, ChevronRight } from "lucide-react";
import { useUserProductsStore } from "@/store/user";
import { useSearchParams } from "next/navigation";

export function ProductsPagination() {
  const pagination = useUserProductsStore((state) => state.pagination);
  const searchParams = useSearchParams();
  const preservedParams = Array.from(searchParams.entries()).filter(
    ([key]) => key !== "page",
  );

  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <form method="GET" action="/products" className="inline">
        {preservedParams.map(([key, value], index) => (
          <input
            key={`prev-${key}-${value}-${index}`}
            type="hidden"
            name={key}
            value={value}
          />
        ))}
        <button
          type="submit"
          name="page"
          value={Math.max(1, pagination.page - 1).toString()}
          disabled={pagination.page === 1}
          className="inline-flex items-center justify-center px-3 py-2 rounded-full text-sm font-medium bg-card border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </button>
      </form>

      <div className="flex items-center gap-1">
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
          .filter((page) => {
            return (
              page === 1 ||
              page === pagination.totalPages ||
              (page >= pagination.page - 1 && page <= pagination.page + 1)
            );
          })
          .map((page, index, array) => {
            const prevPage = array[index - 1];
            const showEllipsis = prevPage && page - prevPage > 1;

            return (
              <div key={page} className="flex items-center gap-1">
                {showEllipsis && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <form method="GET" action="/products" className="inline">
                  {preservedParams.map(([key, value], hiddenIndex) => (
                    <input
                      key={`page-${page}-${key}-${value}-${hiddenIndex}`}
                      type="hidden"
                      name={key}
                      value={value}
                    />
                  ))}
                  <button
                    type="submit"
                    name="page"
                    value={page.toString()}
                    className={`inline-flex items-center justify-center px-3 py-2 rounded-full text-sm font-medium w-10 h-10 ${
                      pagination.page === page
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-input hover:bg-muted"
                    }`}
                  >
                    {page}
                  </button>
                </form>
              </div>
            );
          })}
      </div>

      <form method="GET" action="/products" className="inline">
        {preservedParams.map(([key, value], index) => (
          <input
            key={`next-${key}-${value}-${index}`}
            type="hidden"
            name={key}
            value={value}
          />
        ))}
        <button
          type="submit"
          name="page"
          value={Math.min(pagination.totalPages, pagination.page + 1).toString()}
          disabled={pagination.page === pagination.totalPages}
          className="inline-flex items-center justify-center px-3 py-2 rounded-full text-sm font-medium bg-card border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </form>
    </div>
  );
}
