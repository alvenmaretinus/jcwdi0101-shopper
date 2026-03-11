interface ProductDetailsData {
  id: string;
  category?: {
    name: string;
  } | null;
}

interface DiscountedPrice {
  discountedPrice: number;
}

interface ProductDetailsSectionProps {
  product: ProductDetailsData;
  totalStock: number;
  hasPriceDiscount: boolean;
  bestDiscount: DiscountedPrice | null;
  initialPrice: number;
  formatPrice: (price: number) => string;
}

export const ProductDetailsSection = ({
  product,
  totalStock,
  hasPriceDiscount,
  bestDiscount,
  initialPrice,
  formatPrice,
}: ProductDetailsSectionProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <h2 className="text-2xl font-bold mb-4">Product Details</h2>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <dt className="text-sm text-muted-foreground">Product ID</dt>
          <dd className="font-mono text-sm">{product.id}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Category</dt>
          <dd>{product.category?.name || "N/A"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Price</dt>
          <dd className="font-semibold">
            {hasPriceDiscount
              ? formatPrice(bestDiscount!.discountedPrice)
              : formatPrice(initialPrice)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Total Stock</dt>
          <dd>{totalStock} units</dd>
        </div>
      </dl>
    </div>
  );
};
