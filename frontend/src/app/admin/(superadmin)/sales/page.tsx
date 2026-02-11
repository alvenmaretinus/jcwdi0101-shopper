
"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { getMonth, getYear } from 'date-fns';
import { Search } from 'lucide-react';

interface SalesReportEntity {
  number: number;
  completion_date: string;
  order_id: string;
  product_name: string;
  category_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);


export default function SalesReport() {
  const user = {
    role: 'SUPERADMIN', // Change to 'ADMIN' to test non-superadmin view
    storeId: 'store-123',
  };
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    isSuperAdmin ? 'all' : user?.storeId || ''
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(String(getMonth(new Date())));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  const [allSalesRecords, setAllSalesRecords] = useState<SalesReportEntity[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; category: string }[]>([]);

  useEffect(() => {
    const fetchStoresAndCategories = async () => {
      fetch('/api/stores').then(res => res.json()).then(data => setStores(data)).catch(err => console.error('Failed to fetch stores:', err));
      fetch('/api/categories').then(res => res.json()).then(data => setCategories(data)).catch(err => console.error('Failed to fetch categories:', err)); 
    };
    fetchStoresAndCategories(); 
  }, [])
  

  useEffect(() => {
    // Mock fetch - replace with actual API call
    const fetchSalesRecords = async () => {
      let query = ``
      if (selectedCategory !== 'all') query += `&categoryId=${selectedCategory}`
      if (selectedStoreId !== 'all') query += `&storeId=${selectedStoreId}`
      if (productSearch.trim() !== '') query += `&productName=${encodeURIComponent(productSearch.trim())}`
      query += `&monthAndYear=${selectedYear}-${String(Number(selectedMonth) + 1).padStart(2, '0')}`
      fetch(`/api/sales-report?${query}`) // Adjust query params as needed
        .then(res => res.json())
        .then(data => setAllSalesRecords(data))
        .catch(err => console.error('Failed to fetch sales records:', err));
    };
    fetchSalesRecords();
  }, [selectedCategory, selectedStoreId, selectedMonth, selectedYear, productSearch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Report</h1>
          <p className="text-muted-foreground">Completed sales records</p>
        </div>
        {isSuperAdmin && (
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
        )}
      </div>

      <Card>
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Sales Records</CardTitle>
              <CardDescription>Sales for {months[Number(selectedMonth)]} {selectedYear}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-8 w-44"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-36 sm:w-44">
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
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, i) => (
                  <SelectItem key={i} value={String(i)}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24">
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
                    <TableCell className="text-right">Rp {record.product_price.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">{record.quantity}</TableCell>
                    <TableCell className="text-right font-medium">Rp {record.total_price.toLocaleString('id-ID')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
