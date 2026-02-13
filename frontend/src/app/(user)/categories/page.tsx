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

const Categories = async () => {
  const nextHeaders = await headers();
  const categories = await getProductCategories(nextHeaders);
  const allProducts = await getProducts({ withStock: true }, nextHeaders);
  
  // Count products per category
  const productCounts = categories.map(category => ({
    ...category,
    productCount: allProducts.filter(p => p.categoryId === category.id).length
  }));
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
              const style = categoryStyles[category.category] || {
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
                      {category.category}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {style.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
