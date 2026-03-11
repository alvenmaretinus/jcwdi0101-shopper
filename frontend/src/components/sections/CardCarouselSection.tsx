import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CardCarouselSectionProps {
  title: string;
  icon: React.ReactNode;
  items: any[];
  renderCard: (item: any, index: number, gradients: Array<{ from: string; to: string }>) => React.ReactNode;
  gradients: Array<{ from: string; to: string }>;
  emptyMessage?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export const CardCarouselSection: React.FC<CardCarouselSectionProps> = ({
  title,
  icon,
  items,
  renderCard,
  gradients,
  emptyMessage = "No items available at the moment",
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {totalPages > 1 && items.length > 0 && (
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
      <div className="grid md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-8 text-muted-foreground">
            Loading...
          </div>
        ) : items.length > 0 ? (
          items.map((item, index) =>
            renderCard(item, index, gradients)
          )
        ) : (
          <div className="col-span-3 text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  );
};
