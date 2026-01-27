import Link from "next/link";
import { StoreWithProducts } from "@/types/Store";
import { headers } from "next/headers";
import { getDefaultAddressByUserId } from "@/services/user-address/getDefaultAddressByUserId";
import { getStoresWithProducts } from "@/services/store/getStoresWithProducts";
import { getDistance } from "geolib";
import { ProductGrid } from "./ProductGrid";

export const mockStores: StoreWithProducts[] = [
  {
    id: "store_001",
    name: "Tech Haven",
    description: "Your one-stop shop for electronics and gadgets.",
    phone: "+1 (555) 123-4567",
    longitude: -122.4194,
    latitude: 37.7749,
    addressName: "123 Market Street",
    postCode: "94103",
    isDefault: true,
    createdAt: "2023-01-01T10:00:00Z",
    updatedAt: "2023-12-01T12:00:00Z",
    products: [
      {
        id: "prod_001",
        name: "Wireless Headphones",
        description:
          "Noise-cancelling over-ear headphones with 20h battery life.",
        quantity: 50,
        price: 199.99,
        category: "cat_001",
        images: [],
        createAt: "2023-01-10T09:00:00Z",
        updatedAt: "2023-12-01T11:00:00Z",
      },
      {
        id: "prod_002",
        name: "Gaming Mouse",
        description: "RGB gaming mouse with customizable buttons.",
        quantity: 120,
        price: 49.99,
        category: "cat_002",
        images: [],
        createAt: "2023-02-15T10:30:00Z",
        updatedAt: "2023-11-25T14:45:00Z",
      },
    ],
  },
  {
    id: "store_002",
    name: "Fashion Fiesta",
    description: "Trendy clothing and accessories for all ages.",
    phone: "+1 (555) 987-6543",
    longitude: -74.006,
    latitude: 40.7128,
    addressName: "456 Fashion Ave",
    postCode: "10018",
    isDefault: false,
    createdAt: "2023-02-01T09:30:00Z",
    updatedAt: "2023-11-20T10:00:00Z",
    products: [
      {
        id: "prod_003",
        name: "Denim Jacket",
        description: "Classic blue denim jacket, unisex.",
        quantity: 35,
        price: 79.99,
        category: "cat_003",
        images: [],
        createAt: "2023-02-10T12:00:00Z",
        updatedAt: "2023-11-18T14:20:00Z",
      },
      {
        id: "prod_004",
        name: "Leather Boots",
        description: "Genuine leather boots, comfortable and durable.",
        quantity: 25,
        price: 149.99,
        category: "cat_004",
        images: [],
        createAt: "2023-03-05T11:30:00Z",
        updatedAt: "2023-11-15T13:00:00Z",
      },
    ],
  },
  {
    id: "store_003",
    name: "Home Essentials",
    description: "Everything you need to make your house a home.",
    phone: "+1 (555) 555-1212",
    longitude: -118.2437,
    latitude: 34.0522,
    addressName: "789 Home St",
    postCode: "90012",
    isDefault: false,
    createdAt: "2023-03-01T08:45:00Z",
    updatedAt: "2023-11-28T09:30:00Z",
    products: [
      {
        id: "prod_005",
        name: "Blender",
        description: "High-speed blender for smoothies and soups.",
        quantity: 40,
        price: 89.99,
        category: "cat_005",
        images: ["https://placehold.co/600x400"],
        createAt: "2023-03-10T10:00:00Z",
        updatedAt: "2023-11-25T11:15:00Z",
      },
      {
        id: "prod_006",
        name: "Ceramic Vase",
        description: "Elegant ceramic vase for home decor.",
        quantity: 60,
        price: 39.99,
        category: "cat_006",
        images: ["https://placehold.co/600x400"],
        createAt: "2023-04-01T09:15:00Z",
        updatedAt: "2023-11-20T12:30:00Z",
      },
    ],
  },
];

export async function ProductSection() {
  const nextHeaders = await headers();
  // const storesWithProducts= await getStoresWithProducts(nextHeaders);
  const defaultAddress = await getDefaultAddressByUserId(nextHeaders);
  let sortedStores = mockStores;
  if (defaultAddress) {
    sortedStores = mockStores.sort((storeA, storeB) => {
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
