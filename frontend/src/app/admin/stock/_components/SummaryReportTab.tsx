import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/Pagination/Pagination';
import MonthSelect from '@/app/admin/_components/MonthSelect';
import SelectionSelect from '@/app/admin/_components/SelectionSelect';
import { getYearsForSelection } from '@/services/report/getYearsForSelection';
import { SummaryStockReportItem } from '@/services/stock-report/getSummaryStockReport';
import { PaginationState } from '@/types/common';
import { StockBadge } from './StockBadge';
import { ReportEmptyState } from './ReportEmptyState';
import { StoreSelector } from './StoreSelector';

interface SummaryReportTabProps {
  isSuperAdmin: boolean;
  selectedStoreName: string;
  reportMonth: number;
  reportYear: number;
  summaryReports: SummaryStockReportItem[];
  pagination: PaginationState;
  isLoading: boolean;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onStoreSelect: (store: any) => void;
  onPageChange: (page: number) => void;
}

export function SummaryReportTab({
  isSuperAdmin,
  selectedStoreName,
  reportMonth,
  reportYear,
  summaryReports,
  pagination,
  isLoading,
  onMonthChange,
  onYearChange,
  onStoreSelect,
  onPageChange,
}: SummaryReportTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Monthly Inventory Summary</h2>
            <p className="text-sm text-muted-foreground">Total additions, reductions, and ending stock per product</p>
          </div>
        </div>
        <div className="flex gap-4 pt-4 flex-wrap">
          <MonthSelect
            value={String(reportMonth - 1)}
            onChange={(v) => onMonthChange(parseInt(v) + 1)}
            className="w-32"
          />
          <SelectionSelect
            value={reportYear}
            label="Year"
            onChange={(year: any) => onYearChange(Number(year?.id || year))}
            getType={getYearsForSelection}
            title="Select Year"
            description="Choose a year for the report"
            className="w-32"
          />
          <StoreSelector
            isSuperAdmin={isSuperAdmin}
            selectedStoreName={selectedStoreName}
            onStoreSelect={onStoreSelect}
            className="w-64"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ReportEmptyState
          isLoading={isLoading}
          hasData={summaryReports.length > 0}
          message="No data available for the selected period"
        />
        {!isLoading && summaryReports.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Total Additions</TableHead>
                <TableHead className="text-right">Total Reductions</TableHead>
                <TableHead className="text-right">Ending Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryReports.map(report => (
                <TableRow key={report.productId}>
                  <TableCell className="font-medium">{report.productName}</TableCell>
                  <TableCell className="text-right text-green-600">{report.totalAdditions}</TableCell>
                  <TableCell className="text-right text-red-600">{report.totalReductions}</TableCell>
                  <TableCell className="text-right font-semibold">
                    <StockBadge stock={report.endingStock} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onChange={onPageChange}
      />
    </Card>
  );
}
