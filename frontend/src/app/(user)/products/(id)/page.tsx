"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
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
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getProducts, ProductWithDetails } from "@/services/product/getProducts";
import { getProductCategories, ProductCategory } from "@/services/product/getProductCategories";
import { authClient } from "@/lib/authClient";
import { LoadingScreen } from "@/components/LoadingScreen";

const Products = () => {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [showInStock, setShowInStock] = useState(false);
  const [showOnSale, setShowOnSale] = useState(false);
  
  const [allProducts, setAllProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    if (!isPending && !data) {
      router.replace(`/login?redirectTo=${window.location.pathname}`);
    }
  }, [data, isPending, router]);

  // Fetch products and categories on mount
  useEffect(() => {
    if (!data) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts({ withStock: true }),
          getProductCategories(),
        ]);
        setAllProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [data]);

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category.id === selectedCategory;
    
    // Calculate total stock across all stores
    const totalStock = product.productStores
      ? product.productStores.reduce((sum, ps) => sum + ps.quantity, 0)
      : 0;
    
    const matchesStock = !showInStock || totalStock > 0;
    // Note: We don't have discount info in the current API, so we'll skip the sale filter for now
    const matchesSale = !showOnSale; // || product.discount;
    
    return matchesSearch && matchesCategory && matchesStock && matchesSale;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "newest":
        return new Date(b.createAt).getTime() - new Date(a.createAt).getTime();
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
          <button
            onClick={() => setSelectedCategory("All")}
            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === "All"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
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
          {/* Temporarily hide On Sale filter since we don't have discount data */}
          {/* <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={showOnSale}
              onCheckedChange={(checked) => setShowOnSale(checked as boolean)}
            />
            <span>On Sale</span>
          </label> */}
        </div>
      </div>
    </div>
  );

  // Show loading screen while checking authentication
  if (isPending || !data) {
    return <LoadingScreen />;
  }

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen">
        <div className="container-app py-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">All Products</h1>
            <p className="text-muted-foreground mt-2">
              {isLoading ? "Loading..." : `Showing ${sortedProducts.length} products`}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex gap-8">{/* Desktop Sidebar */}
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
                        {categories.find(c => c.id === selectedCategory)?.category || selectedCategory}
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Products;
