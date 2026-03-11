import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DiscountBadge {
  label: string;
  endsAt: string | Date | null;
}

interface BogoBadge {
  label: string;
  endsAt: string | Date | null;
}

interface Deal {
  product: any;
  discountBadge?: DiscountBadge;
  bugoBadge?: BogoBadge;
}

interface DealsCarouselSectionProps {
  title: string;
  icon: React.ReactNode;
  deals: Deal[];
  emptyMessage?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export const DealsCarouselSection: React.FC<DealsCarouselSectionProps> = ({
  title,
  icon,
  deals,
  emptyMessage = "No deals available at the moment",
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}) => {
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <section className="mb-16">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {icon}
            {title}
          </h2>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-4 text-center py-8 text-muted-foreground">
            Loading...
          </div>
        ) : deals.length > 0 ? (
          deals.map((deal) => (
            <ProductCard
              key={deal.product.id}
              product={deal.product}
              discountBadge={deal.discountBadge}
              bugoBadge={deal.bugoBadge}
            />
          ))
        ) : (
          <div className="col-span-4 text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  );
};
