import Link from "next/link";
import { ProductCard } from "../../../_components/ProductCard";

const featuredProducts = [
  {
    id: 1,
    name: "Fresh Red Apples",
    price: 35000,
    originalPrice: 45000,
    image: "🍎",
    category: "Fruits",
    rating: 4.8,
    stock: 25,
    unit: "per kg",
    discount: 22,
  },
  {
    id: 2,
    name: "Organic Broccoli",
    price: 28000,
    image: "🥦",
    category: "Vegetables",
    rating: 4.6,
    stock: 18,
    unit: "per piece",
    isNew: true,
  },
  {
    id: 3,
    name: "Premium Salmon Fillet",
    price: 125000,
    originalPrice: 150000,
    image: "🐟",
    category: "Meat & Fish",
    rating: 4.9,
    stock: 8,
    unit: "per 500g",
    discount: 17,
  },
  {
    id: 4,
    name: "Farm Fresh Eggs",
    price: 32000,
    image: "🥚",
    category: "Dairy & Eggs",
    rating: 4.7,
    stock: 45,
    unit: "per dozen",
    isBuyOneGetOne: true,
  },
  {
    id: 5,
    name: "Organic Avocados",
    price: 55000,
    image: "🥑",
    category: "Fruits",
    rating: 4.5,
    stock: 3,
    unit: "per 3 pcs",
  },
  {
    id: 6,
    name: "Fresh Whole Milk",
    price: 18000,
    image: "🥛",
    category: "Dairy & Eggs",
    rating: 4.8,
    stock: 30,
    unit: "per liter",
  },
  {
    id: 7,
    name: "Artisan Sourdough Bread",
    price: 42000,
    image: "🍞",
    category: "Bakery",
    rating: 4.9,
    stock: 12,
    unit: "per loaf",
    isNew: true,
  },
  {
    id: 8,
    name: "Sweet Oranges",
    price: 38000,
    originalPrice: 48000,
    image: "🍊",
    category: "Fruits",
    rating: 4.6,
    stock: 0,
    unit: "per kg",
    discount: 21,
  },
];

export function ProductSection() {
  return <section className="py-12 md:py-16 bg-muted/30">
    <div className="container mx-auto px-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="section-title">Featured Products</h2>
          <p className="text-muted-foreground mt-2">
            Handpicked fresh items just for you
          </p>
        </div>
        <Link
          href="/products"
          className="text-primary font-semibold hover:underline hidden sm:block"
        >
          View All →
        </Link>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Mobile view all */}
      <div className="mt-8 text-center sm:hidden">
        <Link
          href="/products"
          className="text-primary font-semibold hover:underline"
        >
          View All Products →
        </Link>
      </div>
    </div>
  </section>
}
