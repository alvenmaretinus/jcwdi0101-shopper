import Link from "next/link";
import { StoreWithProducts } from "@/types/Store";
import { headers } from "next/headers";
import { getDefaultAddressByUserId } from "@/services/user-address/getDefaultAddressByUserId";
import { getStoresWithProducts } from "@/services/store/getStoresWithProducts";
import { getDistance } from "geolib";
import { ProductGrid } from "./ProductGrid";

export async function ProductSection() {
  const nextHeaders = await headers();
  const storesWithProducts = await getStoresWithProducts(nextHeaders);
  let defaultAddress=null
  try {
     defaultAddress = await getDefaultAddressByUserId(nextHeaders);
  } catch (error) {
  }
  let sortedStores = storesWithProducts;
  if (defaultAddress) {
    sortedStores = storesWithProducts.sort((storeA, storeB) => {
      const distanceA = getDistance(
        {
          latitude: defaultAddress.latitude,
          longitude: defaultAddress.longitude,
        },
        {
          latitude: storeA.latitude,
          longitude: storeA.longitude,
        }
      );
      const distanceB = getDistance(
        {
          latitude: defaultAddress.latitude,
          longitude: defaultAddress.longitude,
        },
        {
          latitude: storeB.latitude,
          longitude: storeB.longitude,
        }
      );
      return distanceA - distanceB;
    });
  }

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
          inititalStores={sortedStores}
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
