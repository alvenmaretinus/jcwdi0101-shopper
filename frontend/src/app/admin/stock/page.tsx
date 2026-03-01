"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { authClient } from '@/lib/authClient';
import { getUserByEmail } from '@/services/user/getUserByEmail';
import { getSummaryStockReport, SummaryStockReportItem } from '@/services/stock-report/getSummaryStockReport';
import { getDetailedStockReport, DetailedMovementRecord } from '@/services/stock-report/getDetailedStockReport';
import { apiFetch, HttpMethod } from '@/lib/apiFetch';
import { Product } from '@/types/Product';
import { usePagination } from '@/hooks/usePagination';
import { fetchProductsForSelect } from '@/lib/reportSelectors';
import { SelectableItem } from '@/types/common';
import { SummaryReportTab } from './_components/SummaryReportTab';
import { DetailedReportTab } from './_components/DetailedReportTab';

export default function StockReports() {
  const { data, isPending } = authClient.useSession();
  const sessionUser = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userStoreId, setUserStoreId] = useState<string>('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');

  // Report State
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [reportMonth, setReportMonth] = useState<number>(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());
  
  // Summary Report State
  const [summaryReports, setSummaryReports] = useState<SummaryStockReportItem[]>([]);
  const summary = usePagination();
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Detailed Report State
  const [stockRecords, setStockRecords] = useState<Product[]>([]);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<string>('');
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [detailedReports, setDetailedReports] = useState<DetailedMovementRecord[]>([]);
  const [detailedStartingStock, setDetailedStartingStock] = useState<number>(0);
  const [detailedEndingStock, setDetailedEndingStock] = useState<number>(0);
  const detailed = usePagination();
  const [isDetailedLoading, setIsDetailedLoading] = useState(false);

  // Fetch user role and permissions
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

  // Fetch stock records for product selection
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
          skip: (summary.currentPage - 1) * summary.limit,
          take: summary.limit,
        });

        setSummaryReports(response.data);
        summary.updatePagination({
          page: response.page,
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
  }, [activeTab, reportMonth, reportYear, selectedStoreId, summary.currentPage]);

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
          skip: (detailed.currentPage - 1) * detailed.limit,
          take: detailed.limit,
        });

        setDetailedReports(response.data);
        setDetailedStartingStock(response.startingStock);
        setDetailedEndingStock(response.endingStock);
        detailed.updatePagination({
          page: response.page,
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
  }, [activeTab, selectedProductForDetail, reportMonth, reportYear, selectedStoreId, detailed.currentPage]);

  // Set store automatically for non-superadmins on detailed tab
  useEffect(() => {
    if (activeTab === 'detailed' && !isSuperAdmin && userStoreId) {
      setSelectedStoreId(userStoreId);
    }
  }, [activeTab, isSuperAdmin, userStoreId]);

  // Handlers
  const handleProductSelect = (product: SelectableItem | null) => {
    if (product) {
      setSelectedProductForDetail(product.id);
      setSelectedProductName(product.name);
    } else {
      setSelectedProductForDetail('');
      setSelectedProductName('');
    }
    detailed.resetPage();
  };

  const handleStoreSelect = (store: SelectableItem | null) => {
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

  const fetchProductsForDetailedTab = async({ name, page, limit }: { name: string | undefined; page: number; limit: number }) => {
    return fetchProductsForSelect(name || '', page, limit, selectedStoreId);
  };

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

        <TabsContent value="summary" className="space-y-6">
          <SummaryReportTab
            isSuperAdmin={isSuperAdmin}
            selectedStoreName={selectedStoreName}
            reportMonth={reportMonth}
            reportYear={reportYear}
            summaryReports={summaryReports}
            pagination={summary.pagination}
            isLoading={isSummaryLoading}
            onMonthChange={setReportMonth}
            onYearChange={setReportYear}
            onStoreSelect={handleStoreSelect}
            onPageChange={summary.setCurrentPage}
          />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <DetailedReportTab
            isSuperAdmin={isSuperAdmin}
            userStoreId={userStoreId}
            selectedStoreName={selectedStoreName}
            selectedProductName={selectedProductName}
            selectedProductForDetail={selectedProductForDetail}
            reportMonth={reportMonth}
            reportYear={reportYear}
            detailedReports={detailedReports}
            detailedStartingStock={detailedStartingStock}
            detailedEndingStock={detailedEndingStock}
            pagination={detailed.pagination}
            isLoading={isDetailedLoading}
            onStoreSelect={handleStoreSelect}
            onProductSelect={handleProductSelect}
            onMonthChange={setReportMonth}
            onYearChange={setReportYear}
            onPageChange={detailed.setCurrentPage}
            fetchProductsForDetailedTab={fetchProductsForDetailedTab}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

