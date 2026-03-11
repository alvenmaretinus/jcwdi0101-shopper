import Link from "next/link";

interface CategoryCardProps {
  id: string;
  name: string;
  productCount: number;
  gradient: { from: string; to: string };
}

export const CategoryCard = ({
  id,
  name,
  productCount,
  gradient,
}: CategoryCardProps) => {
  return (
    <Link
      href={`/products?categoryId=${id}`}
      className="group"
    >
      <div
        className="rounded-2xl p-6 h-full transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 flex flex-col"
        style={{
          background: `linear-gradient(to bottom right, ${gradient.from}, ${gradient.to})`,
        }}
      >
        <div className="flex items-start justify-end mb-4">
          <span className="text-xs font-medium bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full text-gray-900">
            {productCount} items
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-white mb-2">
            {name}
          </h3>
          <p className="text-sm text-white/80">
            Explore our selection
          </p>
        </div>
      </div>
    </Link>
  );
};
