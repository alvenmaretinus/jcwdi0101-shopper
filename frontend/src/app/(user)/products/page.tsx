"use client";

import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "./_components/ProductCard";
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

const allProducts = [
  { id: 1, name: "Fresh Red Apples", price: 35000, originalPrice: 45000, image: "🍎", category: "Fruits", rating: 4.8, stock: 25, unit: "per kg", discount: 22 },
  { id: 2, name: "Organic Broccoli", price: 28000, image: "🥦", category: "Vegetables", rating: 4.6, stock: 18, unit: "per piece", isNew: true },
  { id: 3, name: "Premium Salmon Fillet", price: 125000, originalPrice: 150000, image: "🐟", category: "Meat & Fish", rating: 4.9, stock: 8, unit: "per 500g", discount: 17 },
  { id: 4, name: "Farm Fresh Eggs", price: 32000, image: "🥚", category: "Dairy & Eggs", rating: 4.7, stock: 45, unit: "per dozen", isBuyOneGetOne: true },
  { id: 5, name: "Organic Avocados", price: 55000, image: "🥑", category: "Fruits", rating: 4.5, stock: 3, unit: "per 3 pcs" },
  { id: 6, name: "Fresh Whole Milk", price: 18000, image: "🥛", category: "Dairy & Eggs", rating: 4.8, stock: 30, unit: "per liter" },
  { id: 7, name: "Artisan Sourdough Bread", price: 42000, image: "🍞", category: "Bakery", rating: 4.9, stock: 12, unit: "per loaf", isNew: true },
  { id: 8, name: "Sweet Oranges", price: 38000, originalPrice: 48000, image: "🍊", category: "Fruits", rating: 4.6, stock: 0, unit: "per kg", discount: 21 },
  { id: 9, name: "Fresh Spinach", price: 15000, image: "🥬", category: "Vegetables", rating: 4.4, stock: 40, unit: "per bundle" },
  { id: 10, name: "Greek Yogurt", price: 28000, image: "🍶", category: "Dairy & Eggs", rating: 4.7, stock: 22, unit: "per 500g" },
  { id: 11, name: "Chicken Breast", price: 65000, image: "🍗", category: "Meat & Fish", rating: 4.5, stock: 15, unit: "per kg" },
  { id: 12, name: "Bananas", price: 22000, image: "🍌", category: "Fruits", rating: 4.6, stock: 35, unit: "per kg" },
  { id: 13, name: "Carrots", price: 12000, image: "🥕", category: "Vegetables", rating: 4.5, stock: 50, unit: "per kg" },
  { id: 14, name: "Cheddar Cheese", price: 48000, image: "🧀", category: "Dairy & Eggs", rating: 4.8, stock: 20, unit: "per 250g" },
  { id: 15, name: "Croissants", price: 35000, image: "🥐", category: "Bakery", rating: 4.7, stock: 8, unit: "per 4 pcs" },
  { id: 16, name: "Tomatoes", price: 18000, image: "🍅", category: "Vegetables", rating: 4.4, stock: 28, unit: "per kg" },
];

const categories = ["All", "Fruits", "Vegetables", "Dairy & Eggs", "Meat & Fish", "Bakery"];

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [showInStock, setShowInStock] = useState(false);
  const [showOnSale, setShowOnSale] = useState(false);

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesStock = !showInStock || product.stock > 0;
    const matchesSale = !showOnSale || product.discount;
    return matchesSearch && matchesCategory && matchesStock && matchesSale;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      default:
        return 0;
    }
  });

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {category}
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
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={showOnSale}
              onCheckedChange={(checked) => setShowOnSale(checked as boolean)}
            />
            <span>On Sale</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen">
        <div className="container-app py-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">All Products</h1>
            <p className="text-muted-foreground mt-2">
              Showing {sortedProducts.length} products
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
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active filters */}
              {(selectedCategory !== "All" || showInStock || showOnSale) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCategory !== "All" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setSelectedCategory("All")}
                    >
                      {selectedCategory}
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
                  {showOnSale && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setShowOnSale(false)}
                    >
                      On Sale
                      <X className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}

              {/* Products grid */}
              {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {sortedProducts.map((product) => (
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
    </Layout>
  );
};

export default Products;
