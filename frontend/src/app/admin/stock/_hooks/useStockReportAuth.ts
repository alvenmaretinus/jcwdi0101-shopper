import { useEffect, useRef } from 'react';
import { authClient } from '@/lib/authClient';
import { useAuthStore } from '@/store';
import { useStockReportStore } from '@/store/admin';

/**
 * Seeds the stock report store with the correct initial store selection
 * based on the authenticated user's role.
 * Auth state is read from useAuthStore; components should read it from there directly.
 */
export function useStockReportAuth() {
  const { data, isPending } = authClient.useSession();
  const sessionUser = data?.user;
  const isInitializedRef = useRef(false);

  const fetchUserRole = useAuthStore((s) => s.fetchUserRole);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const userStoreId = useAuthStore((s) => s.userStoreId);

  const setStoreSelection = useStockReportStore((s) => s.setStoreSelection);
  const reset = useStockReportStore((s) => s.reset);

  useEffect(() => {
    if (isPending || !sessionUser?.email) return;
    fetchUserRole(sessionUser.email);
  }, [sessionUser?.email, isPending, fetchUserRole]);

  useEffect(() => {
    if (isAuthLoading || isPending || isInitializedRef.current) return;
    if (!sessionUser) return;

    if (isSuperAdmin) {
      setStoreSelection('all', 'All Stores');
    } else if (userStoreId) {
      setStoreSelection(userStoreId, '');
    }
    isInitializedRef.current = true;
  }, [isAuthLoading, isPending, sessionUser, isSuperAdmin, userStoreId, setStoreSelection]);

  // Clean up store state when leaving the page
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);
}
