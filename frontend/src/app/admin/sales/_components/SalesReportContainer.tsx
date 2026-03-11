'use client';

import { useEffect, useRef } from 'react';
import { authClient } from '@/lib/authClient';
import { useAuthStore, useSalesReportStore } from '@/store';
import { SalesReportHeader } from './SalesReportHeader';
import { SalesReportCard } from './SalesReportCard';

export function SalesReportContainer() {
  const { data } = authClient.useSession();
  const sessionUser = data?.user;
  const isInitializedRef = useRef(false);

  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);
  const userStoreId = useAuthStore((state) => state.userStoreId);
  const isLoading = useAuthStore((state) => state.isLoading);
  const fetchUserRole = useAuthStore((state) => state.fetchUserRole);

  const selectedStoreId = useSalesReportStore((state) => state.selectedStoreId);
  const selectedStoreName = useSalesReportStore((state) => state.selectedStoreName);
  const setStoreSelection = useSalesReportStore((state) => state.setStoreSelection);
  const fetchSalesRecords = useSalesReportStore((state) => state.fetchSalesRecords);
  const reset = useSalesReportStore((state) => state.reset);

  useEffect(() => {
    if (!sessionUser?.email) {
      return;
    }

    fetchUserRole(sessionUser.email);
  }, [sessionUser?.email, fetchUserRole]);

  useEffect(() => {
    if (isLoading || isInitializedRef.current) {
      return;
    }

    if (!isSuperAdmin && userStoreId) {
      if (selectedStoreId !== userStoreId) {
        setStoreSelection(userStoreId, selectedStoreName);
      } else {
        fetchSalesRecords();
      }
      isInitializedRef.current = true;
      return;
    }

    fetchSalesRecords();
    isInitializedRef.current = true;
  }, [
    isLoading,
    isSuperAdmin,
    userStoreId,
    selectedStoreId,
    selectedStoreName,
    setStoreSelection,
    fetchSalesRecords,
  ]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <div className="space-y-6">
      <SalesReportHeader
        isSuperAdmin={isSuperAdmin}
        selectedStoreName={selectedStoreName}
        onStoreSelect={(store) => {
          if (!store) {
            setStoreSelection('all', 'All Stores');
            return;
          }
          setStoreSelection(store.id, store.name);
        }}
      />
      <SalesReportCard />
    </div>
  );
}
