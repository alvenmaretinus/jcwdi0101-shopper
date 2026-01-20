import Link from "next/link";
import { CategorySectionHeader } from "./CategorySectionHeader";
import { CategorySectionGrid } from "./CategorySectionGrid";

export function CategorySection() {
  return (
    <section className="py-12 md:py-16 bg-background container mx-auto px-6">
      <div className="container-app">
        <CategorySectionHeader />

        <CategorySectionGrid />

        {/* Mobile view all */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/categories"
            className="text-primary font-semibold hover:underline"
          >
            View All Categories →
          </Link>
        </div>
      </div>
    </section>
  );
}
