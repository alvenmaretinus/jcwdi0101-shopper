import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/Pagination/Pagination';
import { SalesReportFilters } from './SalesReportFilters';
import { SalesReportTable } from './SalesReportTable';
import { useSalesReportStore } from '@/store';

export function SalesReportCard() {
  const selectedMonth = useSalesReportStore((state) => state.selectedMonth);
  const selectedYear = useSalesReportStore((state) => state.selectedYear);
  const selectedCategoryId = useSalesReportStore((state) => state.selectedCategoryId);
  const selectedCategoryName = useSalesReportStore((state) => state.selectedCategoryName);
  const productSearch = useSalesReportStore((state) => state.productSearch);
  const allSalesRecords = useSalesReportStore((state) => state.allSalesRecords);
  const pagination = useSalesReportStore((state) => state.pagination);
  const setMonth = useSalesReportStore((state) => state.setMonth);
  const setYear = useSalesReportStore((state) => state.setYear);
  const setCategorySelection = useSalesReportStore((state) => state.setCategorySelection);
  const setProductSearch = useSalesReportStore((state) => state.setProductSearch);
  const setCurrentPage = useSalesReportStore((state) => state.setCurrentPage);

  return (
    <Card>
      <SalesReportFilters
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedCategoryId={selectedCategoryId}
        selectedCategoryName={selectedCategoryName}
        productSearch={productSearch}
        onMonthChange={setMonth}
        onYearChange={(year) => setYear(year?.id || selectedYear)}
        onCategoryChange={(category) => {
          if (!category) {
            setCategorySelection('', '');
            return;
          }
          setCategorySelection(category.id, category.name);
        }}
        onSearchChange={setProductSearch}
      />
      <SalesReportTable records={allSalesRecords} />
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onChange={setCurrentPage}
      />
    </Card>
  );
}
