import { Layout } from "@/components/layout/Layout";
import { getProducts } from "@/services/product/getProducts";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AddToCartSection } from "./_components/AddToCartSection";
import { QuantityDiscountsSection } from "./_components/QuantityDiscountsSection";
import { ProductImageSection } from "./_components/ProductImageSection";
import { ProductHeaderSection } from "./_components/ProductHeaderSection";
import { ProductPricingSection } from "./_components/ProductPricingSection";
import { ProductAvailableDiscounts } from "./_components/ProductAvailableDiscounts";
import { ProductStockInfo } from "./_components/ProductStockInfo";
import { ProductStoreAvailability } from "./_components/ProductStoreAvailability";
import { ProductGallery } from "./_components/ProductGallery";
import { ProductDetailsSection } from "./_components/ProductDetailsSection";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

const ProductDetailPage = async ({ params }: ProductDetailPageProps) => {
  const { id } = await params;
  const nextHeaders = await headers();

  // Fetch product with stock and discounts calculated on backend
  const response = await getProducts({ id, withStock: true, withDiscounts: true }, nextHeaders);

  const product = response.data[0];

  if (!product) {
    notFound();
  }

  // Calculate total stock
  const totalStock = product.productStores?.reduce(
    (sum, store) => sum + store.quantity,
    0
  ) ?? 0;

  const resolveImageUrl = (url?: string) => {
    if (!url) return null;
    // If URL is already absolute (starts with http:// or https://), return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Otherwise, prepend API base URL for relative paths
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    return `${apiBaseUrl}${url}`;
  };

  const primaryImage = resolveImageUrl(product.productImages?.[0]?.url);
  const galleryImages = (product.productImages ?? []).map((image) => ({
    id: image.id,
    url: resolveImageUrl(image.url),
  }));

  // Format price in IDR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get discount pricing from backend calculation
  const bestDiscount = product.discountedPricing ?? null;
  const hasPriceDiscount =
    !!bestDiscount && bestDiscount.appliedCount > 0 && bestDiscount.discountedPrice < product.price;
  const unmetMinimumDiscounts = bestDiscount?.unmetMinimumDiscounts ?? [];

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
            <ProductImageSection
              productName={product.name}
              primaryImage={primaryImage}
            />

            {/* Product Info */}
            <div className="space-y-6">
              <ProductHeaderSection
                categoryName={product.category?.name ?? null}
                productName={product.name}
                description={product.description ?? null}
              />

              {/* Price */}
              <ProductPricingSection
                price={product.price}
                hasPriceDiscount={hasPriceDiscount}
                bestDiscount={bestDiscount}
                formatPrice={formatPrice}
              />

              <ProductAvailableDiscounts
                unmetMinimumDiscounts={unmetMinimumDiscounts}
                formatPrice={formatPrice}
              />

              {/* Quantity Discounts */}
              {bestDiscount?.quantityDiscounts && (
                <QuantityDiscountsSection
                  quantityDiscounts={bestDiscount.quantityDiscounts}
                />
              )}

              {/* Stock Info */}
              <ProductStockInfo totalStock={totalStock} />

              {/* Store Availability */}
              <ProductStoreAvailability productStores={product.productStores ?? []} />

              {/* Actions */}
              <AddToCartSection productId={product.id} totalStock={totalStock} />
            </div>
          </div>

          {/* Additional Images */}
          <ProductGallery
            productName={product.name}
            productImages={galleryImages}
          />

          {/* Product Details */}
          <ProductDetailsSection
            product={product}
            totalStock={totalStock}
            hasPriceDiscount={hasPriceDiscount}
            bestDiscount={bestDiscount}
            initialPrice={product.price}
            formatPrice={formatPrice}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
