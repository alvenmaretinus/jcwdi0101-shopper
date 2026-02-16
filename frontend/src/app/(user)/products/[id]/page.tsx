import { Layout } from "@/components/layout/Layout";
import { getProducts } from "@/services/product/getProducts";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Store, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AddToCartSection } from "./_components/AddToCartSection";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

const ProductDetailPage = async ({ params }: ProductDetailPageProps) => {
  const { id } = await params;
  const nextHeaders = await headers();

  // Fetch single product by ID
  const products = await getProducts({ id, withStock: true }, nextHeaders);
  const product = products[0];

  if (!product) {
    notFound();
  }

  // Calculate total stock
  const totalStock = product.productStores?.reduce(
    (sum, store) => sum + store.quantity,
    0
  ) ?? 0;

  const primaryImage = product.productImages?.[0]?.url;

  // Format price in IDR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen">
        <div className="container-app py-8">
          {/* Back button */}
          <Link
            href="/products"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Product Image */}
            <div className="bg-card rounded-2xl overflow-hidden shadow-soft">
              {primaryImage ? (
                <div className="relative aspect-square">
                  <Image
                    src={primaryImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {product.category?.category || "Uncategorized"}
                </Badge>
                <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                {product.description && (
                  <p className="text-muted-foreground text-lg">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="border-y py-4">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </div>
              </div>

              {/* Stock Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Stock Availability:</span>
                  {totalStock > 0 ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {totalStock} units available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Out of Stock
                    </Badge>
                  )}
                </div>

                {totalStock <= 10 && totalStock > 0 && (
                  <p className="text-sm text-orange-600">
                    Only {totalStock} left in stock!
                  </p>
                )}
              </div>

              {/* Store Availability */}
              {product.productStores && product.productStores.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Store className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Available at:</span>
                  </div>
                  <div className="space-y-2">
                    {product.productStores
                      .filter((ps) => ps.quantity > 0)
                      .map((ps) => (
                        <div
                          key={ps.storeId}
                          className="flex justify-between items-center bg-muted/50 rounded-lg px-4 py-2"
                        >
                          <span className="text-sm">{ps.store.name}</span>
                          <span className="text-sm font-medium">
                            {ps.quantity} units
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <AddToCartSection productId={product.id} totalStock={totalStock} />
            </div>
          </div>

          {/* Additional Images */}
          {product.productImages && product.productImages.length > 1 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">More Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.productImages.slice(1).map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-lg overflow-hidden bg-card shadow-soft"
                  >
                    <Image
                      src={image.url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <h2 className="text-2xl font-bold mb-4">Product Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Product ID</dt>
                <dd className="font-mono text-sm">{product.id}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Category</dt>
                <dd>{product.category?.category || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Price</dt>
                <dd className="font-semibold">{formatPrice(product.price)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Total Stock</dt>
                <dd>{totalStock} units</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
