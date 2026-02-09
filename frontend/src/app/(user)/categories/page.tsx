import Link from "next/link";
import { Layout } from "@/components/layout/Layout";

const categories = [
  { 
    id: 1, 
    name: "Fruits", 
    icon: "🍎", 
    description: "Fresh seasonal fruits",
    color: "from-red-100 to-orange-100",
    items: 48 
  },
  { 
    id: 2, 
    name: "Vegetables", 
    icon: "🥬", 
    description: "Farm-fresh vegetables",
    color: "from-green-100 to-emerald-100",
    items: 62 
  },
  { 
    id: 3, 
    name: "Dairy & Eggs", 
    icon: "🥛", 
    description: "Milk, cheese, eggs & more",
    color: "from-blue-100 to-sky-100",
    items: 35 
  },
  { 
    id: 4, 
    name: "Meat & Fish", 
    icon: "🥩", 
    description: "Fresh meat and seafood",
    color: "from-rose-100 to-pink-100",
    items: 28 
  },
  { 
    id: 5, 
    name: "Bakery", 
    icon: "🍞", 
    description: "Bread, pastries & cakes",
    color: "from-amber-100 to-yellow-100",
    items: 24 
  },
  { 
    id: 6, 
    name: "Beverages", 
    icon: "🧃", 
    description: "Juices, water & drinks",
    color: "from-purple-100 to-violet-100",
    items: 42 
  },
  { 
    id: 7, 
    name: "Snacks", 
    icon: "🍪", 
    description: "Chips, cookies & more",
    color: "from-orange-100 to-amber-100",
    items: 56 
  },
  { 
    id: 8, 
    name: "Frozen Foods", 
    icon: "🧊", 
    description: "Ice cream & frozen meals",
    color: "from-cyan-100 to-blue-100",
    items: 31 
  },
  { 
    id: 9, 
    name: "Rice & Grains", 
    icon: "🍚", 
    description: "Rice, pasta & cereals",
    color: "from-stone-100 to-neutral-100",
    items: 38 
  },
  { 
    id: 10, 
    name: "Cooking Essentials", 
    icon: "🧈", 
    description: "Oil, spices & sauces",
    color: "from-yellow-100 to-lime-100",
    items: 65 
  },
  { 
    id: 11, 
    name: "Organic", 
    icon: "🌱", 
    description: "Certified organic products",
    color: "from-emerald-100 to-green-100",
    items: 28 
  },
  { 
    id: 12, 
    name: "Baby Products", 
    icon: "🍼", 
    description: "Baby food & essentials",
    color: "from-pink-100 to-rose-100",
    items: 22 
  },
];

const Categories = () => {
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
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group"
              >
                <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-6 h-full transition-all duration-300 hover:shadow-elevated hover:-translate-y-1`}>
                  <div className="flex items-start justify-between">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <span className="text-xs font-medium bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full">
                      {category.items} items
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
