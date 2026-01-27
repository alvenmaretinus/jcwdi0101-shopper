import Link from "next/link";
import { StoreProduct } from "@/types/StoreProduct";

interface ProductCardProps {
  product: StoreProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isOutOfStock = product.quantity === 0;

  return (
    <div className="card-product group relative">
      {/* Badges */}
      <Link href={`/products/${product.id}`}>
        {/* Image */}
        <div className="aspect-square bg-muted/30 flex items-center justify-center p-6 overflow-hidden">
          <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
            {product.images[0]}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {product.category}
          </span>

          <h3 className="font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Price and CTA */}
          <div className="flex items-end justify-between mt-3">
            <div>
              <span className="text-lg font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.price && (
                <span className="text-sm text-muted-foreground line-through ml-2">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Stock status */}
          {isOutOfStock && (
            <p className="text-sm text-berry font-medium mt-2">Out of Stock</p>
          )}
          {product.quantity > 0 && product.quantity <= 5 && (
            <p className="text-sm text-secondary font-medium mt-2">
              Only {product.quantity} left
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
