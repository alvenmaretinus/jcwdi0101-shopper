import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  stock: number;
  unit: string;
  discount?: number;
  isNew?: boolean;
  isBuyOneGetOne?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="card-product group relative">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.discount && (
          <Badge className="bg-berry text-white border-0">
            -{product.discount}%
          </Badge>
        )}
        {product.isNew && (
          <Badge className="bg-primary text-primary-foreground border-0">
            New
          </Badge>
        )}
        {product.isBuyOneGetOne && (
          <Badge className="bg-secondary text-secondary-foreground border-0">
            Buy 1 Get 1
          </Badge>
        )}
      </div>

      {/* Image */}
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square bg-muted/30 flex items-center justify-center p-6 overflow-hidden">
          <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
            {product.image}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {product.category}
        </span>

        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-foreground mt-1 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <Star className="h-4 w-4 fill-secondary text-secondary" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">
            • {product.unit}
          </span>
        </div>

        {/* Price and CTA */}
        <div className="flex items-end justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through ml-2">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <Button
            size="icon"
            disabled={isOutOfStock}
            className={`h-9 w-9 rounded-full shrink-0 ${
              isOutOfStock
                ? "bg-muted text-muted-foreground"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Stock status */}
        {isOutOfStock && (
          <p className="text-sm text-berry font-medium mt-2">Out of Stock</p>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-sm text-secondary font-medium mt-2">
            Only {product.stock} left
          </p>
        )}
      </div>
    </div>
  );
}
