"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserProductsStore } from "@/store/user";

interface ProductsCategoryPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function ProductsCategoryPagination({
  currentPage,
  totalPages,
}: ProductsCategoryPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setCategoryPage = useUserProductsStore((state) => state.setCategoryPage);

  const handlePrevPage = () => {
    const nextPage = Math.max(1, currentPage - 1);
    setCategoryPage(nextPage);

    const params = new URLSearchParams(searchParams.toString());
    params.set("categoryPage", nextPage.toString());

    router.push(`/products?${params.toString()}`);
  };

  const handleNextPage = () => {
    const nextPage = Math.min(totalPages, currentPage + 1);
    setCategoryPage(nextPage);

    const params = new URLSearchParams(searchParams.toString());
    params.set("categoryPage", nextPage.toString());

    router.push(`/products?${params.toString()}`);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-3 flex items-center justify-between">
      <button
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className="inline-flex items-center gap-1 px-2 py-1 text-sm border rounded hover:bg-muted disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Prev
      </button>
      <span className="text-xs text-muted-foreground">
        {currentPage}/{totalPages}
      </span>
      <button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className="inline-flex items-center gap-1 px-2 py-1 text-sm border rounded hover:bg-muted disabled:opacity-50"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
}
