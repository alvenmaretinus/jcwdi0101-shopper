"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortBy = "isDefault" | "createdAt" | "employeeCount";
type SortOrder = "asc" | "desc";

interface StoreTableFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  sortBy: SortBy;
  onSortByChange: (value: SortBy) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
}

const sortByOptions = [
  { value: "isDefault", label: "Default Store" },
  { value: "employeeCount", label: "Total Employee" },
  { value: "createdAt", label: "Store Created" },
];

// Get order options based on sortBy
const getSortOrderOptions = (sortBy: SortBy) => {
  switch (sortBy) {
    case "isDefault":
      return [{ value: "desc", label: "Default" }];
    case "employeeCount":
      return [
        { value: "desc", label: "Most Employees" },
        { value: "asc", label: "Least Employees" },
      ];
    case "createdAt":
      return [
        { value: "desc", label: "Newest First" },
        { value: "asc", label: "Oldest First" },
      ];
    default:
      return [
        { value: "desc", label: "Descending" },
        { value: "asc", label: "Ascending" },
      ];
  }
};

export const StoreTableFilters = ({
  searchInput,
  onSearchChange,
  onSearchClear,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: StoreTableFiltersProps) => {
  const sortOrderOptions = getSortOrderOptions(sortBy);
  const isDefaultSort = sortBy === "isDefault";

  // When sortBy changes to isDefault, force desc
  const handleSortByChange = (value: SortBy) => {
    onSortByChange(value);
    if (value === "isDefault") {
      onSortOrderChange("desc");
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Search */}
      <div className="space-y-1.5 flex-1 max-w-sm">
        <label className="text-xs font-medium text-muted-foreground">
          Search by name or location
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stores..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={onSearchClear}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Sort by
        </label>
        <Select value={sortBy} onValueChange={handleSortByChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {sortByOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Order */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Order
        </label>
        <Select
          value={sortOrder}
          onValueChange={onSortOrderChange}
          disabled={isDefaultSort}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {sortOrderOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
