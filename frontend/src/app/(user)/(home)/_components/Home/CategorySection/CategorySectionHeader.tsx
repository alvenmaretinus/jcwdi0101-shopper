import Link from "next/link";

export const CategorySectionHeader = () => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="section-title">Shop by Category</h2>
        <p className="text-muted-foreground mt-2">
          Explore our wide range of fresh products
        </p>
      </div>
      <Link
        href="/categories"
        className="text-primary font-semibold hover:underline hidden sm:block"
      >
        View All →
      </Link>
    </div>
  );
};
