import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, Sparkles, Percent, Gift } from "lucide-react";

const flashDeals = [
  { id: 1, name: "Fresh Red Apples", price: 35000, originalPrice: 45000, image: "🍎", category: "Fruits", rating: 4.8, stock: 25, unit: "per kg", discount: 22 },
  { id: 3, name: "Premium Salmon Fillet", price: 125000, originalPrice: 150000, image: "🐟", category: "Meat & Fish", rating: 4.9, stock: 8, unit: "per 500g", discount: 17 },
  { id: 8, name: "Sweet Oranges", price: 38000, originalPrice: 48000, image: "🍊", category: "Fruits", rating: 4.6, stock: 15, unit: "per kg", discount: 21 },
  { id: 9, name: "Greek Yogurt", price: 22000, originalPrice: 28000, image: "🍶", category: "Dairy", rating: 4.7, stock: 30, unit: "per 500g", discount: 21 },
];

const buyOneGetOne = [
  { id: 4, name: "Farm Fresh Eggs", price: 32000, image: "🥚", category: "Dairy & Eggs", rating: 4.7, stock: 45, unit: "per dozen", isBuyOneGetOne: true },
  { id: 10, name: "Whole Grain Bread", price: 28000, image: "🍞", category: "Bakery", rating: 4.5, stock: 20, unit: "per loaf", isBuyOneGetOne: true },
  { id: 11, name: "Fresh Spinach", price: 15000, image: "🥬", category: "Vegetables", rating: 4.4, stock: 35, unit: "per bundle", isBuyOneGetOne: true },
  { id: 12, name: "Bananas", price: 22000, image: "🍌", category: "Fruits", rating: 4.6, stock: 40, unit: "per kg", isBuyOneGetOne: true },
];

const promoCards = [
  {
    title: "Weekend Fresh Produce",
    description: "Get 30% off on all fruits and vegetables",
    discount: "30%",
    code: "FRESH30",
    bgColor: "from-green-500 to-emerald-600",
    emoji: "🥗",
    expiresIn: "2 days",
  },
  {
    title: "Dairy Delights",
    description: "Buy 2 dairy products, get 1 free",
    discount: "B2G1",
    code: "DAIRY3",
    bgColor: "from-blue-500 to-cyan-600",
    emoji: "🧀",
    expiresIn: "5 days",
  },
  {
    title: "Free Delivery",
    description: "On orders above Rp 150,000",
    discount: "FREE",
    code: "FREEDELIVERY",
    bgColor: "from-orange-500 to-amber-600",
    emoji: "🚚",
    expiresIn: "Ongoing",
  },
];

const Deals = () => {
  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-berry via-berry to-pink-500 text-white">
          <div className="container-app py-12 md:py-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-6 w-6" />
                  <span className="font-semibold">Special Offers</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Today's Best Deals
                </h1>
                <p className="text-lg text-white/80 max-w-lg">
                  Save big on fresh groceries! Limited time offers on your favorite products.
                </p>
              </div>
              <div className="text-[120px] animate-bounce">🏷️</div>
            </div>
          </div>
        </div>

        <div className="container-app py-12">
          {/* Promo Cards */}
          <section className="mb-16">
            <h2 className="section-title mb-6 flex items-center gap-2">
              <Gift className="h-6 w-6 text-primary" />
              Promo Codes
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {promoCards.map((promo, index) => (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${promo.bgColor} text-white p-6`}
                >
                  <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">
                    {promo.emoji}
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                      <Clock className="h-4 w-4" />
                      <span>{promo.expiresIn}</span>
                    </div>
                    <div className="text-3xl font-bold mb-2">{promo.discount}</div>
                    <h3 className="text-lg font-bold mb-2">{promo.title}</h3>
                    <p className="text-white/80 text-sm mb-4">{promo.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                        <span className="text-sm">Code: </span>
                        <span className="font-mono font-bold">{promo.code}</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-white text-foreground hover:bg-white/90 rounded-full"
                      >
                        Use Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Flash Deals */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title flex items-center gap-2">
                <Percent className="h-6 w-6 text-berry" />
                Flash Deals
              </h2>
              <div className="flex items-center gap-2 text-berry font-semibold">
                <Clock className="h-5 w-5" />
                <span>Ends in 05:32:18</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {flashDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Buy One Get One */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                Buy 1 Get 1 Free
              </h2>
              <Link to="/products?promo=b1g1" className="text-primary font-semibold hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {buyOneGetOne.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Newsletter CTA */}
          <section className="bg-gradient-to-br from-primary to-fresh-green-dark rounded-3xl p-8 md:p-12 text-primary-foreground text-center">
            <h2 className="text-3xl font-bold mb-4">
              Never Miss a Deal!
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-6 max-w-lg mx-auto">
              Subscribe to our newsletter and be the first to know about exclusive offers and flash sales.
            </p>
            <Link to="/">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8">
                Subscribe Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Deals;
