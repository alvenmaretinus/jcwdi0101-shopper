"use client";

import { useState, useMemo } from "react";
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
import { Search, SlidersHorizontal, X } from "lucide-react";
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
  category: string;
}

interface ProductsListProps {
  initialProducts: ProductWithDetails[];
  categories: ProductCategory[];
  selectedCategoryId?: string;
  selectedCategoryName?: string;
}

export function ProductsList({
  initialProducts,
  categories,
  selectedCategoryId: initialCategoryId,
  selectedCategoryName,
}: ProductsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCategoryId || "all"
  );
  const [sortBy, setSortBy] = useState("featured");
  const [showInStock, setShowInStock] = useState(false);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = initialProducts.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategoryId === "all" || product.categoryId === selectedCategoryId;
      
      // Check if product has stock in any store
      const hasStock = product.productStores
        ? product.productStores.some((ps) => ps.quantity > 0)
        : true;
      const matchesStock = !showInStock || hasStock;

      return matchesSearch && matchesCategory && matchesStock;
    });

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [initialProducts, searchQuery, selectedCategoryId, sortBy, showInStock]);

  const categoryOptions = [
    { id: "all", category: "All Categories" },
    ...categories,
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categoryOptions.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategoryId === category.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {category.category}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div>
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={showInStock}
              onCheckedChange={(checked) => setShowInStock(checked as boolean)}
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
            Showing {filteredAndSortedProducts.length} products
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-full bg-card border-0 shadow-soft"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
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

                <Select value={sortBy} onValueChange={setSortBy}>
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
                    onClick={() => setSelectedCategoryId("all")}
                  >
                    {selectedCategory.category}
                    <X className="ml-1 h-3 w-3" />
                  </Button>
                )}
                {showInStock && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setShowInStock(false)}
                  >
                    In Stock
                    <X className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
            )}

            {/* Products grid */}
            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
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
