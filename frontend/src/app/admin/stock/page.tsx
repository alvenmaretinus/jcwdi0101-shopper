"use client";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { authClient } from '@/lib/authClient';
import { getUserByEmail } from '@/services/user/getUserByEmail';
import { getStores } from '@/services/store/getStores';
import { getSummaryStockReport, SummaryStockReportItem } from '@/services/stock-report/getSummaryStockReport';
import { getDetailedStockReport, DetailedMovementRecord } from '@/services/stock-report/getDetailedStockReport';
import { Pagination } from '@/components/Pagination/Pagination';
import { apiFetch, HttpMethod } from '@/lib/apiFetch';
import { Product } from '@/types/Product';
import SelectionModal from '@/components/Dialog/SelectionModal';
import { getProducts, type ProductWithDetails } from '@/services/product/getProducts';
import { getYearsForSelection } from '@/services/report/getYearsForSelection';

export default function StockReports() {
  const { data, isPending } = authClient.useSession();
  const sessionUser = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userStoreId, setUserStoreId] = useState<string>('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');

  // Report State
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [reportMonth, setReportMonth] = useState<number>(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [reportYearName, setReportYearName] = useState<string>(String(new Date().getFullYear()));
  
  // Summary Report State
  const [summaryReports, setSummaryReports] = useState<SummaryStockReportItem[]>([]);
  const [summaryReportsPagination, setSummaryReportsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [summaryCurrentPage, setSummaryCurrentPage] = useState(1);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Detailed Report State
  const [stockRecords, setStockRecords] = useState<Product[]>([]);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<string>('');
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [detailedReports, setDetailedReports] = useState<DetailedMovementRecord[]>([]);
  const [detailedStartingStock, setDetailedStartingStock] = useState<number>(0);
  const [detailedEndingStock, setDetailedEndingStock] = useState<number>(0);
  const [detailedReportsPagination, setDetailedReportsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [detailedCurrentPage, setDetailedCurrentPage] = useState(1);
  const [isDetailedLoading, setIsDetailedLoading] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!isPending && sessionUser) {
        const userData = await getUserByEmail(sessionUser.email);
        if (userData?.role === 'SUPERADMIN') {
          setIsSuperAdmin(true);
          setSelectedStoreId('all');
          setSelectedStoreName('All Stores');
        }
        if (userData?.storeId) {
          setUserStoreId(userData.storeId);
          if (userData.role !== 'SUPERADMIN') {
            setSelectedStoreId(userData.storeId);
          }
        }
      }
    };
    fetchUserRole();
  }, [sessionUser, isPending]);

  useEffect(() => {
    const fetchStockRecords = async () => {
      if (selectedStoreId === '') return; 
      try {
        let url = `/product?withStock=true&page=1&limit=100`;
        if (selectedStoreId !== 'all') {
          url += `&storeId=${selectedStoreId}`;
        }
        const response = await apiFetch<any>(url, { method: HttpMethod.GET });
        if (response && 'data' in response) {
          setStockRecords(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Failed to fetch stock records:', error);
        setStockRecords([]);
      }
    };
    fetchStockRecords();
  }, [selectedStoreId]);

  // Fetch summary stock report
  useEffect(() => {
    if (activeTab !== 'summary') return;

    const fetchSummaryReport = async () => {
      setIsSummaryLoading(true);
      if (selectedStoreId === '') return;
      try {
        const response = await getSummaryStockReport({
          month: reportMonth,
          year: reportYear,
          storeId: selectedStoreId !== 'all' ? selectedStoreId : undefined,
          skip: (summaryCurrentPage - 1) * 20,
          take: 20,
        });

        setSummaryReports(response.data);
        setSummaryReportsPagination({
          page: response.page,
          limit: 20,
          total: response.total,
          totalPages: response.totalPages,
        });
      } catch (error) {
        console.error('Failed to fetch summary stock report:', error);
        setSummaryReports([]);
      } finally {
        setIsSummaryLoading(false);
      }
    };

    fetchSummaryReport();
  }, [activeTab, reportMonth, reportYear, selectedStoreId, summaryCurrentPage]);

  // Fetch detailed stock report
  useEffect(() => {
    if (activeTab !== 'detailed' || !selectedProductForDetail || !selectedStoreId) return;

    const fetchDetailedReport = async () => {
      setIsDetailedLoading(true);
      try {
        const response = await getDetailedStockReport({
          productId: selectedProductForDetail,
          month: reportMonth,
          year: reportYear,
          storeId: selectedStoreId,
          skip: (detailedCurrentPage - 1) * 20,
          take: 20,
        });

        setDetailedReports(response.data);
        setDetailedStartingStock(response.startingStock);
        setDetailedEndingStock(response.endingStock);
        setDetailedReportsPagination({
          page: response.page,
          limit: 20,
          total: response.total,
          totalPages: response.totalPages,
        });
      } catch (error) {
        console.error('Failed to fetch detailed stock report:', error);
        setDetailedReports([]);
      } finally {
        setIsDetailedLoading(false);
      }
    };

    fetchDetailedReport();
  }, [activeTab, selectedProductForDetail, reportMonth, reportYear, selectedStoreId, detailedCurrentPage]);

  const handleProductSelect = (product: ProductWithDetails | null) => {
    if (product) {
      setSelectedProductForDetail(product.id);
      setSelectedProductName(product.name);
    } else {
      setSelectedProductForDetail('');
      setSelectedProductName('');
    }
    setDetailedCurrentPage(1);
  };

  const handleStoreSelect = (store: { id: string; name: string } | null) => {
    if (!store) {
      if (activeTab === 'summary') {
        setSelectedStoreId('all');
        setSelectedStoreName('All Stores');
      } else {
        setSelectedStoreId('');
        setSelectedStoreName('');
      }
      return;
    }

    setSelectedStoreId(store.id);
    setSelectedStoreName(store.name);
  };

  const getStoresForSelection = async ({
    name,
    page,
    limit,
  }: {
    name: string | undefined;
    page: number;
    limit: number;
  }) => {
    const response = await getStores({
      query: {
        page,
        search: name,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    });

    return {
      data: (response.data || []).map((store) => ({ id: store.id, name: store.name })),
      meta: response.meta,
    };
  };

  const handleYearSelect = (year: { id: string; name: string } | null) => {
    if (!year) return;
    setReportYear(parseInt(year.id));
    setReportYearName(year.name);
  };

  // For detailed tab, set store automatically for non-superadmins
  useEffect(() => {
    if (activeTab === 'detailed' && !isSuperAdmin && userStoreId) {
      setSelectedStoreId(userStoreId);
    }
  }, [activeTab, isSuperAdmin, userStoreId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Reports</h1>
          <p className="text-muted-foreground">View inventory summary and detailed movement history</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Summary Report</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Report</TabsTrigger>
        </TabsList>

        {/* SUMMARY REPORT TAB */}
        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Monthly Inventory Summary</h2>
                  <p className="text-sm text-muted-foreground">Total additions, reductions, and ending stock per product</p>
                </div>
              </div>
              <div className="flex gap-4 pt-4 flex-wrap">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={reportMonth.toString()} onValueChange={(v) => setReportMonth(parseInt(v))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <SelectItem key={month} value={month.toString()}>
                          {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-32 justify-start text-left font-normal"
                    onClick={() => setIsYearModalOpen(true)}
                  >
                    {reportYearName}
                  </Button>
                </div>
                {isSuperAdmin && (
                  <div className="space-y-2">
                    <Label>Store</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-64 justify-start text-left font-normal"
                      onClick={() => setIsStoreModalOpen(true)}
                    >
                      {selectedStoreName || 'Select a store'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading report...</div>
              ) : summaryReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No data available for the selected period</div>
              ) : (
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
                          {report.endingStock === 0 ? (
                            <Badge variant="destructive">Out</Badge>
                          ) : report.endingStock <= 10 ? (
                            <Badge className="bg-yellow-100 text-yellow-800">{report.endingStock}</Badge>
                          ) : (
                            <span>{report.endingStock}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <Pagination
              page={summaryReportsPagination.page}
              totalPages={summaryReportsPagination.totalPages}
              total={summaryReportsPagination.total}
              onChange={setSummaryCurrentPage}
            />
          </Card>
        </TabsContent>

        {/* DETAILED REPORT TAB */}
        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Detailed Inventory History</h2>
                  <p className="text-sm text-muted-foreground">All movements for a specific product and store</p>
                </div>
              </div>
              <div className="flex gap-4 pt-4 flex-wrap">
                {isSuperAdmin && (
                  <div className="space-y-2">
                    <Label>Store *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-64 justify-start text-left font-normal"
                      onClick={() => setIsStoreModalOpen(true)}
                    >
                      {selectedStoreName || 'Select a store'}
                    </Button>
                  </div>
                )}
                {!isSuperAdmin && userStoreId && (
                  <div className="space-y-2">
                    <Label>Store</Label>
                    <div className="px-4 py-2 border rounded-md bg-gray-50 text-sm">
                      {selectedStoreName || 'Your Store'}
                    </div>
                  </div>
                )}
                <div className="space-y-2 flex-1 min-w-64">
                  <Label>Product *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => setIsProductModalOpen(true)}
                    disabled={!selectedStoreId || (isSuperAdmin && selectedStoreId === 'all')}
                  >
                    {selectedProductName || 'Select a product'}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={reportMonth.toString()} onValueChange={(v) => setReportMonth(parseInt(v))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <SelectItem key={month} value={month.toString()}>
                          {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-32 justify-start text-left font-normal"
                    onClick={() => setIsYearModalOpen(true)}
                  >
                    {reportYearName}
                  </Button>
                </div>
              </div>
              {selectedProductForDetail && !isDetailedLoading && detailedReports.length > 0 && (
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
              ) : isDetailedLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading report...</div>
              ) : detailedReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No movements recorded for the selected period</div>
              ) : (
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
                        <TableCell className="text-sm">{format(new Date(record.date), 'MMM dd, yyyy HH:mm')}</TableCell>
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
            </CardContent>
            {selectedProductForDetail && detailedReports.length > 0 && (
              <Pagination
                page={detailedReportsPagination.page}
                totalPages={detailedReportsPagination.totalPages}
                total={detailedReportsPagination.total}
                onChange={setDetailedCurrentPage}
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Selection Modal */}
      <SelectionModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        onSelect={handleProductSelect}
        selectedSelectionId={selectedProductForDetail}
        title="Select Product"
        description="Search and select a product to view its detailed inventory history"
        getType={getProducts}
      />

      <SelectionModal
        open={isStoreModalOpen}
        onOpenChange={setIsStoreModalOpen}
        onSelect={handleStoreSelect}
        selectedSelectionId={selectedStoreId === 'all' ? undefined : selectedStoreId}
        title="Select Store"
        description={`Choose a store to ${activeTab === 'detailed' ? 'view detailed inventory history' : 'filter the inventory reports'}`}
        getType={getStoresForSelection}
      />

      <SelectionModal
        open={isYearModalOpen}
        onOpenChange={setIsYearModalOpen}
        onSelect={handleYearSelect}
        selectedSelectionId={reportYear.toString()}
        title="Select Year"
        description="Search and select year to filter stock report"
        getType={getYearsForSelection}
      />
    </div>
  );
}

