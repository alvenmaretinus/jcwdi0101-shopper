import SearchBar from "@/app/admin/_components/SearchBar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import {
  discountTypeFilterOptions,
  type DiscountTypeFilter,
} from "../shared/promoOptions";

interface DiscountsFilterBarProps {
  searchQuery: string;
  typeFilter: DiscountTypeFilter;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: DiscountTypeFilter) => void;
  onCreate: () => void;
}

export function DiscountsFilterBar({
  searchQuery,
  typeFilter,
  onSearchChange,
  onTypeFilterChange,
  onCreate,
}: DiscountsFilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search discounts..."
        />
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {discountTypeFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onCreate}>
        <Plus className="h-4 w-4 mr-2" />
        Create Discount
      </Button>
    </div>
  );
}
