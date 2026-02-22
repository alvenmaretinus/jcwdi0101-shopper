"use client";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
import ProductSelectionModal from '@/components/Dialog/ProductSelectionModal';
import type { ProductWithDetails } from '@/services/product/getProducts';

export default function StockReports() {
  const { data, isPending } = authClient.useSession();
  const sessionUser = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userStoreId, setUserStoreId] = useState<string>('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [stores, setStores] = useState<any[]>([]);
  const [storesPage, setStoresPage] = useState(1);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');
  const ITEMS_PER_PAGE = 10;

  // Report State
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [reportMonth, setReportMonth] = useState<number>(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());
  
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
    if (isSuperAdmin) {
      const fetchAllStores = async () => {
        try {
          const response = await getStores();
          const storesData = Array.isArray(response) ? response : response?.data || [];
          setStores(storesData);
        } catch (error) {
          console.error('Failed to fetch stores:', error);
          setStores([]);
        }
      };
      fetchAllStores();
    }
  }, [isSuperAdmin]);

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

  const getPaginatedStores = (storesList: any[], page: number) => {
    const startIdx = (page - 1) * ITEMS_PER_PAGE;
    return storesList.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  };

  const getTotalPages = (storesList: any[]) => Math.ceil(storesList.length / ITEMS_PER_PAGE);
  const paginatedStores = getPaginatedStores(stores, storesPage);

  const handleProductSelect = (product: ProductWithDetails | null) => {
    if (product) {
      setSelectedProductForDetail(product.id);
      setSelectedProductName(product.name);
      setDetailedCurrentPage(1);
    } else {
      setSelectedProductForDetail('');
      setSelectedProductName('');
    }
  };

  const handleStoreSelect = (storeId: string, storeName: string) => {
    setSelectedStoreId(storeId);
    setSelectedStoreName(storeName);
    setIsStoreModalOpen(false);
    setStoresPage(1);
  };

  useEffect(() => {
    setStoresPage(1);
  }, [stores]);

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
                  <Select value={reportYear.toString()} onValueChange={(v) => setReportYear(parseInt(v))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select value={reportYear.toString()} onValueChange={(v) => setReportYear(parseInt(v))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
      <ProductSelectionModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        onSelect={handleProductSelect}
        selectedProductId={selectedProductForDetail}
        title="Select Product"
        description="Search and select a product to view its detailed inventory history"
      />

      {/* Store Selection Modal */}
      <Dialog open={isStoreModalOpen} onOpenChange={setIsStoreModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Store</DialogTitle>
            <DialogDescription>
              Choose a store to {activeTab === 'detailed' ? 'view detailed inventory history' : 'filter the inventory reports'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <div className="divide-y">
                  {activeTab === 'summary' && (
                    <button
                      onClick={() => handleStoreSelect('all', 'All Stores')}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                    >
                      <span className="font-medium">All Stores</span>
                      {selectedStoreId === 'all' && (
                        <Badge variant="default" className="ml-2">Selected</Badge>
                      )}
                    </button>
                  )}
                  {paginatedStores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => handleStoreSelect(store.id, store.name)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                    >
                      <span className="font-medium">{store.name}</span>
                      {selectedStoreId === store.id && (
                        <Badge variant="default" className="ml-2">Selected</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {getTotalPages(stores) > 1 && (
                <div className="border-t bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {storesPage} of {getTotalPages(stores)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStoresPage(p => Math.max(1, p - 1))}
                        disabled={storesPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStoresPage(p => Math.min(getTotalPages(stores), p + 1))}
                        disabled={storesPage === getTotalPages(stores)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

