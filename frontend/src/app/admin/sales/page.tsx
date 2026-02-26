
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
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);


export default function SalesReport() {
  const { data } = authClient.useSession();
  const sessionUser = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userStoreId, setUserStoreId] = useState<string>('');

  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(String(getMonth(new Date())));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [productSearch, setProductSearch] = useState('');
  const [allSalesRecords, setAllSalesRecords] = useState<SalesReportEntity[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; category: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const handleCategoryChange = (category: string, categoryIdAny: any) => {
    setSelectedCategory(category);
    setSelectedCategoryId(categoryIdAny as string);
  }

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
    const fetchStoresAndCategories = async () => {
      try {
        const storesData = await apiFetch<{ id: string; name: string }[] | { data?: { id: string; name: string }[] }>('/stores', {
          method: HttpMethod.GET,
        });
        const storesArray = Array.isArray(storesData) ? storesData : storesData?.data || [];
        setStores(storesArray);
      } catch (err) {
        console.error('Failed to fetch stores:', err);
        setStores([]);
      }

      try {
        const categoriesData = await apiFetch<{ id: string; category: string }[] | { data?: { id: string; category: string }[] }>('/product-category', {
          method: HttpMethod.GET,
        });
        const categoriesArray = Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || [];
        setCategories(categoriesArray);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      }
    };
    fetchStoresAndCategories(); 
  }, [])
  

  useEffect(() => {
    // Fetch sales records with pagination
    const fetchSalesRecords = async () => {
      const limit = 20;
      const skip = (currentPage - 1) * limit;
      let query = `skip=${skip}&take=${limit}`
      if (selectedCategory !== 'all') query += `&category=${selectedCategory}`
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
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map(store => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <Select value={selectedCategory} onValueChange={(value) => handleCategoryChange(value, value)}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.category}>
                        {cat.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full sm:w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
    </div>
  );
}
