import Link from "next/link";
import { headers } from "next/headers";
import { getDefaultAddressByUserId } from "@/services/user-address/getDefaultAddressByUserId";
import { getNearestProducts } from "@/services/store/getNearestProducts";
import { ProductGrid } from "./ProductGrid";

export async function ProductSection() {
  const nextHeaders = await headers();
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  let defaultAddress: any = null;
  try {
    defaultAddress = await getDefaultAddressByUserId(nextHeaders);
  } catch {}

  const products = await getNearestProducts({
    limit: 20,
    headers: nextHeaders,
    coords: defaultAddress
      ? {
          latitude: defaultAddress.latitude,
          longitude: defaultAddress.longitude,
        }
      : undefined,
  });

  return (
    <section className="py-12 md:py-16 bg-muted/30">
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
        <ProductGrid
          initialProducts={products}
          isDefaultAddress={!!defaultAddress}
        />

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
  );
}
