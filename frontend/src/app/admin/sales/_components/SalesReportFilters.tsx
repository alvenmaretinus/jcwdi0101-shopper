import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SearchBar from '@/app/admin/_components/SearchBar';
import MonthSelect from '@/app/admin/_components/MonthSelect';
import SelectionSelect from '@/app/admin/_components/SelectionSelect';
import { getYearsForSelection } from '@/services/report/getYearsForSelection';
import { getProductCategories } from '@/services/product/getProductCategories';

interface SalesReportFiltersProps {
  selectedMonth: string;
  selectedYear: string;
  selectedCategoryId: string;
  selectedCategoryName: string;
  productSearch: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: any) => void;
  onCategoryChange: (category: { id: string; name: string } | null) => void;
  onSearchChange: (search: string) => void;
}

export function SalesReportFilters({
  selectedMonth,
  selectedYear,
  selectedCategoryId,
  selectedCategoryName,
  productSearch,
  onMonthChange,
  onYearChange,
  onCategoryChange,
  onSearchChange,
}: SalesReportFiltersProps) {
  return (
    <CardHeader className="space-y-4 pb-4">
      <div className="flex flex-col gap-4">
        <div>
          <CardTitle>Sales Records</CardTitle>
          <CardDescription>
            Sales for {new Date(Number(selectedYear), Number(selectedMonth)).toLocaleString('default', { month: 'long' })} {selectedYear}
          </CardDescription>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchBar 
            value={productSearch}
            onChange={onSearchChange}
            placeholder="Search product..."
          />
          <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <SelectionSelect
              value={selectedCategoryId}
              onChange={onCategoryChange}
              getType={getProductCategories}
              title="Select Category"
              description="Search and select a category"
              className="w-full sm:w-auto"
              displayValue={selectedCategoryName || 'Select Category'}
              showLabel={false}
            />
            <MonthSelect
              isLabelHidden={true}
              value={selectedMonth}
              onChange={onMonthChange}
              className="w-full sm:w-36"
            />
            <SelectionSelect
              value={selectedYear}
              onChange={onYearChange}
              getType={getYearsForSelection}
              title="Select Year"
              description="Choose a year for the report"
              className="w-full sm:w-24"
              showLabel={false}
            />
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
