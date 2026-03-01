import { Sparkles } from "lucide-react";

export const HeroBanner: React.FC = () => {
  return (
    <div className="text-white" style={{ background: 'linear-gradient(to right, #ec4899, #db2777, #ec4899)' }}>
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
          <div className="leading-none animate-bounce" style={{ fontSize: "220px" }}>🏷️</div>
        </div>
      </div>
    </div>
  );
};
