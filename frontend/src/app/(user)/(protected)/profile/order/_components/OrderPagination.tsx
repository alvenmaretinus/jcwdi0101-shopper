"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OrderPaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const OrderPagination = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: OrderPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={currentPage === 1}
        className="rounded-full"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>

      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="rounded-full"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

export default OrderPagination;
