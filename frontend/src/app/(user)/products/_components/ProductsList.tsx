"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductWithDetails } from "@/services/product/getProducts";
import { ProductCard } from "../../../../components/products/ProductCard";

interface ProductCategory {
  id: string;
  name: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductsListProps {
  initialProducts: ProductWithDetails[];
  categories: ProductCategory[];
  categoryPagination: PaginationMeta;
  selectedCategoryId?: string;
  selectedCategoryName?: string;
  pagination: PaginationMeta;
  initialSearch?: string;
  initialInStockOnly?: boolean;
  initialSort?: string;
}

export function ProductsList({
  initialProducts,
  categories,
  categoryPagination,
  selectedCategoryId: initialCategoryId,
  selectedCategoryName,
  pagination,
  initialSearch = "",
  initialInStockOnly = false,
  initialSort = "featured",
}: ProductsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryOptions = [
    { id: "all", name: "All Categories" },
    ...categories,
  ];

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCategoryId || "all"
  );
  const [sortBy, setSortBy] = useState(initialSort);
  const [showInStock, setShowInStock] = useState(initialInStockOnly);

  const safeCategoryPage = Math.min(categoryPagination.page, categoryPagination.totalPages);
  const totalCategoryPages = categoryPagination.totalPages;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/products?${params.toString()}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to first page
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === "all") {
      params.delete("categoryId");
    } else {
      params.set("categoryId", categoryId);
    }
    params.set("page", "1"); // Reset to first page
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryPageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("categoryPage", newPage.toString());
    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.set("page", "1"); // Reset to first page
    router.push(`/products?${params.toString()}`);
  };

  const handleInStockChange = (checked: boolean) => {
    setShowInStock(checked);
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set("inStockOnly", "true");
    } else {
      params.delete("inStockOnly");
    }
    params.set("page", "1"); // Reset to first page
    router.push(`/products?${params.toString()}`);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categoryOptions.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategoryId === category.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {totalCategoryPages > 1 && (
          <div className="mt-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCategoryPageChange(safeCategoryPage - 1)}
              disabled={safeCategoryPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <span className="text-xs text-muted-foreground">
              {safeCategoryPage}/{totalCategoryPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCategoryPageChange(safeCategoryPage + 1)}
              disabled={safeCategoryPage === totalCategoryPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div>
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={showInStock}
              onCheckedChange={handleInStockChange}
            />
            <span>In Stock Only</span>
          </label>
        </div>
      </div>
    </div>
  );

  const selectedCategory = categoryOptions.find(
    (c) => c.id === selectedCategoryId
  );

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="container-app py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {selectedCategoryName ? selectedCategoryName : "All Products"}
          </h1>
          <p className="text-muted-foreground mt-2">
            Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-28">
              <FilterContent />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Search and sort bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 h-12 rounded-full bg-card border-0 shadow-soft"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                {/* Mobile filter button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden h-12 rounded-full">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] h-12 rounded-full bg-card border-0 shadow-soft">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters */}
            {(selectedCategoryId !== "all" || showInStock) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategoryId !== "all" && selectedCategory && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleCategoryChange("all")}
                  >
                    {selectedCategory.name}
                    <X className="ml-1 h-3 w-3" />
                  </Button>
                )}
                {showInStock && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleInStockChange(false)}
                  >
                    In Stock
                    <X className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
            )}

            {/* Products grid */}
            {initialProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {(() => {
                    // Deduplicate products - group by product ID and use first occurrence with all discounts
                    const uniqueProducts = new Map<string, typeof initialProducts[0]>();
                    
                    initialProducts.forEach((product) => {
                      if (!uniqueProducts.has(product.id)) {
                        uniqueProducts.set(product.id, product);
                      }
                    });

                    return Array.from(uniqueProducts.values()).map((product) => {
                      // Build discount badge if discounts are applied (same as deals page)
                      const discountBadge = product.discountedPricing && product.discountedPricing.appliedCount > 0 ? {
                        label: product.discountedPricing.appliedCount > 1
                          ? `${product.discountedPricing.appliedCount} discounts applied`
                          : (product.discountedPricing.appliedDiscounts[0]?.label || `${Math.round((product.discountedPricing.totalDiscount / product.price) * 100)}% off`),
                        endsAt: product.discountedPricing.earliestEndsAt,
                      } : undefined;

                      // Build BOGO badge if quantity discounts exist
                      const bugoBadge = product.discountedPricing?.quantityDiscounts && product.discountedPricing.quantityDiscounts.length > 0 ? {
                        label: product.discountedPricing.quantityDiscounts.length > 1
                          ? `${product.discountedPricing.quantityDiscounts.length} BXGY offers`
                          : `Buy ${product.discountedPricing.quantityDiscounts[0].buyQuantity} get ${product.discountedPricing.quantityDiscounts[0].freeQuantity} free`,
                        endsAt: product.discountedPricing.quantityDiscounts[0].endsAt,
                      } : undefined;

                      return (
                        <ProductCard 
                          key={product.id} 
                          product={{
                            ...product,
                            // Update price to discounted price if available
                            price: product.discountedPricing?.discountedPrice || product.price,
                            originalPrice: product.discountedPricing?.discountedPrice ? product.price : undefined,
                            savingsAmount: product.discountedPricing?.totalDiscount,
                          }}
                          discountBadge={discountBadge}
                          bugoBadge={bugoBadge}
                        />
                      );
                    });
                  })()}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="rounded-full"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          // Show first page, last page, current page, and pages around current
                          return (
                            page === 1 ||
                            page === pagination.totalPages ||
                            (page >= pagination.page - 1 && page <= pagination.page + 1)
                          );
                        })
                        .map((page, index, array) => {
                          // Add ellipsis between non-consecutive pages
                          const prevPage = array[index - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;

                          return (
                            <div key={page} className="flex items-center gap-1">
                              {showEllipsis && (
                                <span className="px-2 text-muted-foreground">...</span>
                              )}
                              <Button
                                variant={pagination.page === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className="rounded-full w-10 h-10"
                              >
                                {page}
                              </Button>
                            </div>
                          );
                        })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="rounded-full"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
