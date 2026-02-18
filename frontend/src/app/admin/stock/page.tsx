"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { format, getMonth, getYear } from 'date-fns';
import type { MovementType } from '@/types/MovementType';
import type { StockReport } from '@/types/StockReport';
import { authClient } from '@/lib/authClient';
import { getUserByEmail } from '@/services/user/getUserByEmail';
import { Pagination } from '@/components/Pagination/Pagination';

const movementTypeColors: Record<MovementType, string> = {
  PURCHASED: 'bg-green-100 text-green-800',
  SOLD: 'bg-blue-100 text-blue-800',
  REALLOCATED: 'bg-purple-100 text-purple-800',
  CANCELED: 'bg-orange-100 text-orange-800',
  ADJUSTMENT: 'bg-gray-100 text-gray-800',
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function StockReport() {
  const { data } = authClient.useSession();
  const sessionUser = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userStoreId, setUserStoreId] = useState<string>('');
  
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(String(getMonth(new Date())));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Filter movements by store and month/year
  const [ filteredMovements, setFilteredMovements ] = useState<StockReport[]>([]);
  
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; category: string }[]>([]);

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
      fetch('/api/stores').then(res => res.json()).then(data => setStores(data)).catch(err => console.error('Failed to fetch stores:', err));
      fetch('/api/categories').then(res => res.json()).then(data => setCategories(data)).catch(err => console.error('Failed to fetch categories:', err)); 
    };
    fetchStoresAndCategories(); 
  }, [])

  useEffect(() => {
    // Fetch stock report with pagination
    const fetchMovements = async () => {
      const limit = 20;
      const skip = (currentPage - 1) * limit;
      let query = `skip=${skip}&take=${limit}`
      if (selectedStoreId !== 'all') query += `&storeId=${selectedStoreId}`
      // Parse month and year for the API
      const monthNum = Number(selectedMonth) + 1; // API expects 1-12, state is 0-11
      const yearNum = Number(selectedYear);
      query += `&createdAtMonth=${monthNum}&createdAtYear=${yearNum}`
      fetch(`/api/stock-report?${query}`) // Adjust query params as needed
        .then(res => res.json())
        .then(response => {
          // Check if response has data array and pagination info
          if (response && 'data' in response) {
            setFilteredMovements(response.data || []);
            setPagination({
              page: response.page || 1,
              limit: limit,
              total: response.total || 0,
              totalPages: response.totalPages || 1,
            });
          } else {
            // Fallback if response is just an array
            setFilteredMovements(Array.isArray(response) ? response : []);
          }
        })
        .catch(err => {
          console.error('Failed to fetch stock movements:', err);
          setFilteredMovements([]);
        });
    };
    fetchMovements();
  }, [selectedStoreId, selectedMonth, selectedYear, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStoreId, selectedMonth, selectedYear]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Report</h1>
          <p className="text-muted-foreground">Monitor inventory movements</p>
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
        <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-4">
          <div className="flex flex-wrap items-center gap-2">
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
        </CardHeader>
        <CardContent>
          {filteredMovements.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No movements found for this period</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="text-muted-foreground">
                      {format(movement.createdAt, 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">{movement.productId}</TableCell>
                    <TableCell>
                      <Badge className={movementTypeColors[movement.movementType]} variant="secondary">
                        {movement.movementType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`flex items-center gap-1 ${movement.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.quantityChange > 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {Math.abs(movement.quantityChange)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {movement.movementType === 'REALLOCATED' ? (
                        <span>{movement.fromStore?.name} → {movement.toStore?.name}</span>
                      ) : (
                        movement.description || '-'
                      )}
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
          onChange={(page) => {
            setCurrentPage(page);
          }}
        />
      </Card>
    </div>
  );
}
