import  Link  from "next/link";
import { Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductWithDetails } from "@/services/product/getProducts";
import Image from "next/image";

interface ProductCardProps {
  product: ProductWithDetails;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalStock = product.productStores
    ? product.productStores.reduce((sum, ps) => sum + ps.quantity, 0)
    : 0;
  const isOutOfStock = totalStock === 0;
  const primaryImage = product.productImages[0]?.url || "https://placehold.co/400x400?text=No+Image";

  return (
    <div className="card-product group relative">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {isOutOfStock && (
          <Badge className="bg-destructive text-destructive-foreground border-0">
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Wishlist button */}
      <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-soft opacity-0 group-hover:opacity-100 transition-opacity hover:bg-berry hover:text-white">
        <Heart className="h-4 w-4" />
      </button>

      {/* Image */}
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square bg-muted/30 flex items-center justify-center overflow-hidden relative">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {product.category.category}
        </span>
        
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-foreground mt-1 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price and CTA */}
        <div className="flex items-end justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
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
        {!isOutOfStock && totalStock <= 10 && (
          <p className="text-sm text-secondary font-medium mt-2">
            Only {totalStock} left
          </p>
        )}
      </div>
    </div>
  );
}
