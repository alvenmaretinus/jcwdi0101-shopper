import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/Pagination/Pagination';
import MonthSelect from '@/app/admin/_components/MonthSelect';
import SelectionSelect from '@/app/admin/_components/SelectionSelect';
import { getYearsForSelection } from '@/services/report/getYearsForSelection';
import { DetailedMovementRecord } from '@/services/stock-report/getDetailedStockReport';
import { PaginationState } from '@/types/common';
import { formatMovementDate } from '@/lib/dateUtils';
import { ReportEmptyState } from './ReportEmptyState';
import { StoreSelector } from './StoreSelector';

interface DetailedReportTabProps {
  isSuperAdmin: boolean;
  userStoreId: string;
  selectedStoreName: string;
  selectedProductName: string;
  selectedProductForDetail: string;
  reportMonth: number;
  reportYear: number;
  detailedReports: DetailedMovementRecord[];
  detailedStartingStock: number;
  detailedEndingStock: number;
  pagination: PaginationState;
  isLoading: boolean;
  onStoreSelect: (store: any) => void;
  onProductSelect: (product: any) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onPageChange: (page: number) => void;
  fetchProductsForDetailedTab: (params: { name: string | undefined; page: number; limit: number }) => Promise<any>;
}

export function DetailedReportTab({
  isSuperAdmin,
  userStoreId,
  selectedStoreName,
  selectedProductName,
  selectedProductForDetail,
  reportMonth,
  reportYear,
  detailedReports,
  detailedStartingStock,
  detailedEndingStock,
  pagination,
  isLoading,
  onStoreSelect,
  onProductSelect,
  onMonthChange,
  onYearChange,
  onPageChange,
  fetchProductsForDetailedTab,
}: DetailedReportTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Detailed Inventory History</h2>
            <p className="text-sm text-muted-foreground">All movements for a specific product and store</p>
          </div>
        </div>
        <div className="flex gap-4 pt-4 flex-wrap">
          <StoreSelector
            isSuperAdmin={isSuperAdmin}
            selectedStoreName={selectedStoreName}
            userStoreId={userStoreId}
            onStoreSelect={onStoreSelect}
            className="w-64"
          />
          <SelectionSelect
            value={selectedProductName}
            label="Product *"
            onChange={onProductSelect}
            getType={fetchProductsForDetailedTab}
            title="Select Product"
            description="Search and select a product"
            className="flex-1 min-w-64"
            displayValue={selectedProductName || 'Select a product'}
          />
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
        </div>
        {selectedProductForDetail && !isLoading && detailedReports.length > 0 && (
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Starting Stock</p>
              <p className="text-2xl font-bold">{detailedStartingStock}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ending Stock</p>
              <p className="text-2xl font-bold text-green-600">{detailedEndingStock}</p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!selectedProductForDetail ? (
          <div className="text-center py-8 text-muted-foreground">Please select a product to view detailed history</div>
        ) : (
          <>
            <ReportEmptyState
              isLoading={isLoading}
              hasData={detailedReports.length > 0}
              message="No movements recorded for the selected period"
            />
            {!isLoading && detailedReports.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Movement Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>From Store</TableHead>
                    <TableHead>To Store</TableHead>
                    <TableHead className="text-right">Qty Change</TableHead>
                    <TableHead className="text-right">End Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailedReports.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm">{formatMovementDate(new Date(record.date))}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.movementType}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{record.description || '-'}</TableCell>
                      <TableCell className="text-sm">{record.fromStoreName || '-'}</TableCell>
                      <TableCell className="text-sm">{record.toStoreName || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {record.quantityChange > 0 ? (
                          <span className="text-green-600">+{record.quantityChange}</span>
                        ) : (
                          <span className="text-red-600">{record.quantityChange}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">{record.endStock || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </CardContent>
      {selectedProductForDetail && pagination.totalPages > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onChange={onPageChange}
        />
      )}
    </Card>
  );
}
