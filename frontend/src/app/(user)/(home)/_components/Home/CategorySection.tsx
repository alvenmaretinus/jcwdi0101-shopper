import Link from "next/link";

const categories = [
  { id: 1, name: "Fruits", icon: "🍎", color: "from-red-100 to-orange-100", count: 48 },
  { id: 2, name: "Vegetables", icon: "🥬", color: "from-green-100 to-emerald-100", count: 62 },
  { id: 3, name: "Dairy & Eggs", icon: "🥛", color: "from-blue-100 to-sky-100", count: 35 },
  { id: 4, name: "Meat & Fish", icon: "🥩", color: "from-rose-100 to-pink-100", count: 28 },
  { id: 5, name: "Bakery", icon: "🍞", color: "from-amber-100 to-yellow-100", count: 24 },
  { id: 6, name: "Beverages", icon: "🧃", color: "from-purple-100 to-violet-100", count: 42 },
  { id: 7, name: "Snacks", icon: "🍪", color: "from-orange-100 to-amber-100", count: 56 },
  { id: 8, name: "Frozen", icon: "🧊", color: "from-cyan-100 to-blue-100", count: 31 },
];

export function CategorySection() {
  return (
    <section className="py-10 sm:py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Shop by Category
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              Explore our wide range of fresh products
            </p>
          </div>
          <Link 
            href="/categories" 
            className="text-primary font-semibold hover:underline hidden sm:block text-sm"
          >
            View All → 
          </Link>
        </div>

        {/* Categories - Horizontal scroll on mobile, grid on desktop */}
        <div className="relative">
          {/* Mobile: Horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:hidden snap-x snap-mandatory">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group flex-shrink-0 snap-start"
              >
                <div className={`w-[100px] aspect-square rounded-2xl bg-gradient-to-br ${category.color} flex flex-col items-center justify-center p-3 transition-all duration-300 group-active:scale-95`}>
                  <span className="text-3xl mb-1">
                    {category.icon}
                  </span>
                  <h3 className="font-semibold text-foreground text-center text-xs">
                    {category.name}
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    {category.count} items
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: Grid */}
          <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group"
              >
                <div className={`aspect-square rounded-2xl bg-gradient-to-br ${category.color} flex flex-col items-center justify-center p-4 transition-all duration-300 group-hover:shadow-medium group-hover:-translate-y-1`}>
                  <span className="text-3xl md:text-4xl lg:text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </span>
                  <h3 className="font-semibold text-foreground text-center text-xs md:text-sm mt-1">
                    {category.name}
                  </h3>
                  <span className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                    {category.count} items
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile view all link */}
        <div className="mt-4 text-center sm:hidden">
          <Link 
            href="/categories" 
            className="text-primary font-semibold hover:underline text-sm"
          >
            View All Categories →
          </Link>
        </div>
      </div>
    </section>
  );
}
