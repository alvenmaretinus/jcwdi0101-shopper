
"use client"

import { useEffect, useState } from 'react';
import { getMonth } from 'date-fns';
import { authClient } from '@/lib/authClient';
import { getUserByEmail } from '@/services/user/getUserByEmail';
import { apiFetch, HttpMethod } from '@/lib/apiFetch';
import { SalesReportHeader } from './_components/SalesReportHeader';
import { SalesReportCard } from './_components/SalesReportCard';

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

const currentYear = new Date().getFullYear();

export default function SalesReport() {
  const { data } = authClient.useSession();
  const sessionUser = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userStoreId, setUserStoreId] = useState<string>('');

  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [selectedStoreName, setSelectedStoreName] = useState<string>('All Stores');
  const [selectedMonth, setSelectedMonth] = useState<string>(String(getMonth(new Date())));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [productSearch, setProductSearch] = useState('');
  const [allSalesRecords, setAllSalesRecords] = useState<SalesReportEntity[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const handleCategorySelect = (category: { id: string; name: string } | null) => {
    if (category) {
      setSelectedCategoryId(category.id);
      setSelectedCategoryName(category.name);
    } else {
      setSelectedCategoryId('');
      setSelectedCategoryName('');
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
  }, [selectedCategoryId, selectedStoreId, selectedMonth, selectedYear, productSearch, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, selectedStoreId, selectedMonth, selectedYear, productSearch]);

  return (
    <div className="space-y-6">
      <SalesReportHeader
        isSuperAdmin={isSuperAdmin}
        selectedStoreName={selectedStoreName}
        onStoreSelect={handleStoreSelect}
      />
      <SalesReportCard
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedCategoryId={selectedCategoryId}
        selectedCategoryName={selectedCategoryName}
        productSearch={productSearch}
        allSalesRecords={allSalesRecords}
        pagination={pagination}
        onMonthChange={setSelectedMonth}
        onYearChange={(year: any) => setSelectedYear(year?.id || year)}
        onCategoryChange={handleCategorySelect}
        onSearchChange={setProductSearch}
        onPageChange={(page) => {
          setCurrentPage(page);
        }}
      />
    </div>
  );
}
