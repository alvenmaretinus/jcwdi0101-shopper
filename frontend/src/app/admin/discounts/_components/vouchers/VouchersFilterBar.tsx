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
  type VoucherTypeFilter,
  voucherTypeFilterOptions,
} from "../shared/promoOptions";

interface VouchersFilterBarProps {
  voucherSearch: string;
  voucherTypeFilter: VoucherTypeFilter;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: VoucherTypeFilter) => void;
  onCreate: () => void;
}

export function VouchersFilterBar({
  voucherSearch,
  voucherTypeFilter,
  onSearchChange,
  onTypeFilterChange,
  onCreate,
}: VouchersFilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <SearchBar
          value={voucherSearch}
          onChange={onSearchChange}
          placeholder="Search voucher codes..."
        />
        <Select value={voucherTypeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {voucherTypeFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onCreate}>
        <Plus className="h-4 w-4 mr-2" />
        Create Voucher
      </Button>
    </div>
  );
}
