"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OrderFiltersProps {
  orderNumberQuery: string;
  selectedDate: string;
  onOrderNumberChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onClearFilters: () => void;
}

export const OrderFilters = ({
  orderNumberQuery,
  selectedDate,
  onOrderNumberChange,
  onDateChange,
  onClearFilters,
}: OrderFiltersProps) => {
  const hasActiveFilters =
    orderNumberQuery.trim().length > 0 || selectedDate.length > 0;

  return (
    <div className="bg-card rounded-2xl shadow-soft p-4 mb-6">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number..."
            value={orderNumberQuery}
            onChange={(e) => onOrderNumberChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
        />

        <Button
          variant="outline"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="w-full md:w-auto"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default OrderFilters;
