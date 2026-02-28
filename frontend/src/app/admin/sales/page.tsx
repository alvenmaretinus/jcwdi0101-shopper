
"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { getMonth, getYear } from 'date-fns';
import { Search } from 'lucide-react';
import { authClient } from '@/lib/authClient';
import { getUserByEmail } from '@/services/user/getUserByEmail';
import { Pagination } from '@/components/Pagination/Pagination';
import { apiFetch, HttpMethod } from '@/lib/apiFetch';
import { getProductCategories } from '@/services/product/getProductCategories';
import SelectionModal from '@/components/Dialog/SelectionModal';
import { Button } from '@/components/ui/button';
import { getStores } from '@/services/store/getStores';
import { getYearsForSelection } from '@/services/report/getYearsForSelection';

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

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const currentYear = new Date().getFullYear();


export default function SalesReport() {
  const { data } = authClient.useSession();
  const sessionUser = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userStoreId, setUserStoreId] = useState<string>('');

  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [selectedStoreName, setSelectedStoreName] = useState<string>('All Stores');
  const [isStoreSelectionModalOpen, setIsStoreSelectionModalOpen] = useState(false);
  const [isYearSelectionModalOpen, setIsYearSelectionModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(String(getMonth(new Date())));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [selectedYearName, setSelectedYearName] = useState<string>(String(currentYear));
  const [selectedCategory, setSelectedCategory] = useState<string>('Select Category');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [productSearch, setProductSearch] = useState('');
  const [allSalesRecords, setAllSalesRecords] = useState<SalesReportEntity[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [isCategorySelectionModalOpen, 
    setIsCategorySelectionModalOpen] = useState(false);

  const handleCategorySelect = (category: { id: string; name: string } | null) => {
    if (category) {
      setSelectedCategory(category.name);
      setSelectedCategoryId(category.id);
    } else {
      setSelectedCategory('all');
      setSelectedCategoryId('');
    }
  };

  const handleStoreSelect = (store: { id: string; name: string } | null) => {
    if (!store) {
      setSelectedStoreId('all');
      setSelectedStoreName('All Stores');
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
    setSelectedYear(year.id);
    setSelectedYearName(year.name);
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      if (sessionUser) {
        const userData = await getUserByEmail(sessionUser.email);
        if (userData?.role === 'SUPERADMIN') {
          setIsSuperAdmin(true);
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
  }, [sessionUser]);

  useEffect(() => {
    // Fetch sales records with pagination
    const fetchSalesRecords = async () => {
      const limit = 20;
      const skip = (currentPage - 1) * limit;
      let query = `skip=${skip}&take=${limit}`
      if (selectedCategoryId !== '') query += `&categoryId=${selectedCategoryId}`
      if (selectedStoreId !== 'all') query += `&storeId=${selectedStoreId}`
      if (productSearch.trim() !== '') query += `&productName=${encodeURIComponent(productSearch.trim())}`
      query += `&monthAndYear=${selectedYear}-${String(Number(selectedMonth) + 1).padStart(2, '0')}`
      try {
        const response = await apiFetch<
          | { data?: SalesReportEntity[]; count?: number; page?: number }
          | SalesReportEntity[]
        >(`/sales-report?${query}`, { method: HttpMethod.GET });

        if (response && typeof response === 'object' && 'data' in response) {
          setAllSalesRecords(response.data || []);
          const total = response.count || 0;
          const totalPages = Math.ceil(total / limit);
          setPagination({
            page: response.page || 1,
            limit,
            total,
            totalPages,
          });
        } else {
          setAllSalesRecords(Array.isArray(response) ? response : []);
        }
      } catch (err) {
        console.error('Failed to fetch sales records:', err);
        setAllSalesRecords([]);
      }
    };
    fetchSalesRecords();
  }, [selectedCategory, selectedStoreId, selectedMonth, selectedYear, productSearch, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedStoreId, selectedMonth, selectedYear, productSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Report</h1>
          <p className="text-muted-foreground">Completed sales records</p>
        </div>
        {isSuperAdmin && (
          <div className="ml-auto sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="w-48 justify-start text-left font-normal"
              onClick={() => setIsStoreSelectionModalOpen(true)}
            >
              {selectedStoreId === 'all' ? 'All Stores' : selectedStoreName}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>Sales Records</CardTitle>
              <CardDescription>Sales for {months[Number(selectedMonth)]} {selectedYear}</CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative w-full sm:min-w-[220px] sm:max-w-md sm:grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search product..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-8"
                />
              </div>
              <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal sm:w-auto"
                  onClick={() => setIsCategorySelectionModalOpen(true)}
                >
                  {selectedCategory || 'Select a category'}
                </Button>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, i) => (
                      <SelectItem key={i} value={String(i)}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal sm:w-24"
                  onClick={() => setIsYearSelectionModalOpen(true)}
                >
                  {selectedYearName}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {allSalesRecords.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No sales found for this period</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Discounts</TableHead>
                  <TableHead>Vouchers</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allSalesRecords.map((record) => (
                  <TableRow key={`${record.order_id}-${record.product_name}`}>
                    <TableCell className="text-muted-foreground">{record.number}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(record.completion_date).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{record.order_id}</TableCell>
                    <TableCell className="font-medium">{record.product_name}</TableCell>
                    <TableCell>{record.category_name}</TableCell>
                    <TableCell>
                      {record.discount_names.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {record.discount_names.map((discount, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {discount}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.voucher_codes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {record.voucher_codes.map((voucher, idx) => (
                            <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-mono">
                              {voucher}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">Rp {record.product_price.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">{record.quantity}</TableCell>
                    <TableCell className="text-right font-medium">Rp {record.total_price.toLocaleString('id-ID')}</TableCell>
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
          onChange={(page) => {
            setCurrentPage(page);
          }}
        />
      </Card>

        <SelectionModal
          open={isCategorySelectionModalOpen}
          getType={getProductCategories}
          onOpenChange={setIsCategorySelectionModalOpen}
          onSelect={handleCategorySelect}
          selectedSelectionId={selectedCategoryId}
          title="Select Category"
          description="Search and select a category to filter sales report"
        />

        <SelectionModal
          open={isStoreSelectionModalOpen}
          onOpenChange={setIsStoreSelectionModalOpen}
          onSelect={handleStoreSelect}
          selectedSelectionId={selectedStoreId === 'all' ? undefined : selectedStoreId}
          title="Select Store"
          description="Search and select a store to filter sales report"
          getType={getStoresForSelection}
        />

        <SelectionModal
          open={isYearSelectionModalOpen}
          onOpenChange={setIsYearSelectionModalOpen}
          onSelect={handleYearSelect}
          selectedSelectionId={selectedYear}
          title="Select Year"
          description="Search and select year to filter sales report"
          getType={getYearsForSelection}
        />
    </div>
  );
}
