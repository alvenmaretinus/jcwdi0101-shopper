import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/Pagination/Pagination';
import { SalesReportFilters } from './SalesReportFilters';
import { SalesReportTable } from './SalesReportTable';
import { PaginationState } from '@/types/common';

interface SalesReportEntity {
  number: number;
  completion_date: string;
  order_id: string;
  product_name: string;
  category_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
  voucher_codes: string[];
  discount_names: string[];
}

interface SalesReportCardProps {
  selectedMonth: string;
  selectedYear: string;
  selectedCategoryId: string;
  selectedCategoryName: string;
  productSearch: string;
  allSalesRecords: SalesReportEntity[];
  pagination: PaginationState;
  onMonthChange: (month: string) => void;
  onYearChange: (year: any) => void;
  onCategoryChange: (category: { id: string; name: string } | null) => void;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
}

export function SalesReportCard({
  selectedMonth,
  selectedYear,
  selectedCategoryId,
  selectedCategoryName,
  productSearch,
  allSalesRecords,
  pagination,
  onMonthChange,
  onYearChange,
  onCategoryChange,
  onSearchChange,
  onPageChange,
}: SalesReportCardProps) {
  return (
    <Card>
      <SalesReportFilters
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedCategoryId={selectedCategoryId}
        selectedCategoryName={selectedCategoryName}
        productSearch={productSearch}
        onMonthChange={onMonthChange}
        onYearChange={onYearChange}
        onCategoryChange={onCategoryChange}
        onSearchChange={onSearchChange}
      />
      <SalesReportTable records={allSalesRecords} />
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onChange={onPageChange}
      />
    </Card>
  );
}
