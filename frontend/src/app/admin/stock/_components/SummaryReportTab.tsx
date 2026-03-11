"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/Pagination/Pagination';
import MonthSelect from '@/app/admin/_components/MonthSelect';
import SelectionSelect from '@/app/admin/_components/SelectionSelect';
import { getYearsForSelection } from '@/services/report/getYearsForSelection';
import { StockBadge } from './StockBadge';
import { ReportEmptyState } from './ReportEmptyState';
import { StoreSelector } from './StoreSelector';
import { useStockReportStore } from '@/store/admin';
import { useAuthStore } from '@/store';
import { useStockReportHandlers } from '../_hooks/useStockReportHandlers';

export function SummaryReportTab() {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const reportMonth = useStockReportStore((s) => s.reportMonth);
  const reportYear = useStockReportStore((s) => s.reportYear);
  const selectedStoreName = useStockReportStore((s) => s.selectedStoreName);
  const summaryReports = useStockReportStore((s) => s.summaryReports);
  const summaryPagination = useStockReportStore((s) => s.summaryPagination);
  const isSummaryLoading = useStockReportStore((s) => s.isSummaryLoading);
  const setReportMonth = useStockReportStore((s) => s.setReportMonth);
  const setReportYear = useStockReportStore((s) => s.setReportYear);
  const setSummaryPage = useStockReportStore((s) => s.setSummaryPage);

  const { handleStoreSelect } = useStockReportHandlers();

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
            onChange={(v) => setReportMonth(parseInt(v) + 1)}
            className="w-32"
          />
          <SelectionSelect
            value={reportYear}
            label="Year"
            onChange={(year: { id: string; name: string } | null) => setReportYear(Number(year?.id || reportYear))}
            getType={getYearsForSelection}
            title="Select Year"
            description="Choose a year for the report"
            className="w-32"
          />
          <StoreSelector
            isSuperAdmin={isSuperAdmin}
            selectedStoreName={selectedStoreName}
            onStoreSelect={handleStoreSelect}
            className="w-64"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ReportEmptyState
          isLoading={isSummaryLoading}
          hasData={summaryReports.length > 0}
          message="No data available for the selected period"
        />
        {!isSummaryLoading && summaryReports.length > 0 && (
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
        page={summaryPagination.page}
        totalPages={summaryPagination.totalPages}
        total={summaryPagination.total}
        onChange={setSummaryPage}
      />
    </Card>
  );
}
