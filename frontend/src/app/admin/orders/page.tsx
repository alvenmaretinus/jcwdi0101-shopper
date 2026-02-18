"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getOrders } from "@/services/admin/getOrders";
import { getStores } from "@/services/store/getStores";
import { authClient } from "@/lib/authClient";
import { getUserByEmail } from "@/services/user/getUserByEmail";
import {
  approveOrder,
  shipOrder,
  adminCancelOrder,
  rejectPaymentProof,
} from "@/services/admin/orderActions";
import type { AdminOrder } from "@/services/admin/getOrders";
import type { Store } from "@/types/Store";
import OrdersFilters from "./OrdersFilters";
import OrdersTable from "./OrdersTable";
import OrderDetailDialog from "./OrderDetailDialog";
import PaginationControls from "./PaginationControls";

export default function Orders() {
  const { data } = authClient.useSession();
  const user = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stores, setStores] = useState<(Store & { employeeCount: number })[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const fetchStores = useCallback(async () => {
    try {
      const res = await getStores({
        query: { page: 1, sortBy: "createdAt", sortOrder: "desc" },
      });
      setStores(res.data || []);
    } catch (e) {
      console.error("Failed to fetch stores", e);
    }
  }, []);

  const fetchOrders = useCallback(
    async (pageArg: number, limitArg: number) => {
      try {
        setLoading(true);
        const res = await getOrders({
          page: pageArg,
          limit: limitArg,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: searchQuery === "" ? undefined : searchQuery,
        });
        setOrders(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotal(res.pagination.total || 0);
        } else {
          setTotalPages(1);
          setTotal(res.data?.length || 0);
        }
        setPage(pageArg);
      } catch (e) {
        console.error("Failed to fetch orders", e);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, searchQuery]
  );

  useEffect(() => {
    const init = async () => {
      if (user?.email) {
        try {
          const dbUser = await getUserByEmail(user.email);
          const role = dbUser?.role;

          if (role === "SUPERADMIN") {
            setIsSuperAdmin(true);
            // Only superadmin needs the full stores list
            await fetchStores();
          } else if (role === "ADMIN") {
            // Scope UI to the admin's assigned store to avoid showing other stores
            if (dbUser?.storeId) setStoreFilter(dbUser.storeId);
          }
        } catch (e) {
          console.error("Failed to determine admin role", e);
        }
      }

      // Fetch orders after role/store is determined so ADMIN receives server-scoped results
      fetchOrders(1, limit);
    };
    init();
  }, [user, fetchOrders, fetchStores, limit]);

  // Note: initial stores/orders fetch handled in auth-init useEffect above

  useEffect(() => {
    const t = setTimeout(() => fetchOrders(1, limit), 250);
    return () => clearTimeout(t);
  }, [fetchOrders, limit]);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (storeFilter !== "all" && String(order.storeId) !== String(storeFilter))
      return false;
    return true;
  });

  const handleViewOrder = (order: AdminOrder) => setSelectedOrder(order);
  const handleCloseDialog = () => setSelectedOrder(null);

  const handleApprove = async () => {
    if (!selectedOrder) return;
    await approveOrder(selectedOrder.id);
    await fetchOrders(page, limit);
    setSelectedOrder(null);
  };

  const handleReject = async () => {
    if (!selectedOrder) return;
    await rejectPaymentProof(selectedOrder.id);
    await fetchOrders(page, limit);
    setSelectedOrder(null);
  };

  const handleShip = async () => {
    if (!selectedOrder) return;
    await shipOrder(selectedOrder.id);
    await fetchOrders(page, limit);
    setSelectedOrder(null);
  };

  const handleAdminCancel = async () => {
    if (!selectedOrder) return;
    await adminCancelOrder(selectedOrder.id, "Cancelled by admin");
    await fetchOrders(page, limit);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">
          Manage and track customer orders
        </p>
      </div>

      <Card>
        <CardHeader>
          <OrdersFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            storeFilter={storeFilter}
            setStoreFilter={setStoreFilter}
            stores={stores}
            isSuperAdmin={isSuperAdmin}
          />
        </CardHeader>
        <CardContent>
          <OrdersTable
            orders={filteredOrders}
            loading={loading}
            onView={handleViewOrder}
          />
        </CardContent>
      </Card>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPrev={() => fetchOrders(Math.max(1, page - 1), limit)}
        onNext={() => fetchOrders(Math.min(totalPages, page + 1), limit)}
        onLimitChange={(n) => {
          setLimit(n);
          fetchOrders(1, n);
        }}
      />

      <OrderDetailDialog
        selectedOrder={selectedOrder}
        onClose={handleCloseDialog}
        onApprove={handleApprove}
        onReject={handleReject}
        onShip={handleShip}
        onAdminCancel={handleAdminCancel}
      />
    </div>
  );
}
