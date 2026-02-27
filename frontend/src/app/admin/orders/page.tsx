"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrders } from "@/services/admin/getOrders";
import { authClient } from "@/lib/authClient";
import { getUserByEmail } from "@/services/user/getUserByEmail";
import {
  approveOrder,
  shipOrder,
  adminCancelOrder,
  rejectPaymentProof,
  triggerAutoComplete,
  triggerAutoDeliver,
} from "@/services/admin/orderActions";
import type { AdminOrder } from "@/services/admin/getOrders";
import OrdersFilters from "./OrdersFilters";
import OrdersTable from "./OrdersTable";
import OrderDetailDialog from "./OrderDetailDialog";
import PaginationControls from "./PaginationControls";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Orders() {
  const { data } = authClient.useSession();
  const user = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggeringJob, setTriggeringJob] = useState<"deliver" | "complete" | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

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
  }, [user, fetchOrders, limit]);

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

  const handleTriggerAutoDeliver = async () => {
    try {
      setTriggeringJob("deliver");
      const result = await triggerAutoDeliver();
      const count = result?.data?.count ?? 0;
      toast.success(`Auto-deliver selesai: ${count} order diperbarui`);
      await fetchOrders(page, limit);
    } catch (err: unknown) {
      console.error("Failed to trigger auto-deliver", err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Gagal trigger auto-deliver");
    } finally {
      setTriggeringJob(null);
    }
  };

  const handleTriggerAutoComplete = async () => {
    try {
      setTriggeringJob("complete");
      const result = await triggerAutoComplete();
      const count = result?.data?.count ?? 0;
      const rewardCount = result?.data?.rewardGrantedCount ?? 0;
      toast.success(
        `Auto-complete selesai: ${count} order, voucher reward ${rewardCount}`
      );
      await fetchOrders(page, limit);
    } catch (err: unknown) {
      console.error("Failed to trigger auto-complete", err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Gagal trigger auto-complete");
    } finally {
      setTriggeringJob(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
        {isSuperAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTriggerAutoDeliver}
              disabled={triggeringJob !== null}
            >
              {triggeringJob === "deliver" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Run Auto Deliver
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleTriggerAutoComplete}
              disabled={triggeringJob !== null}
            >
              {triggeringJob === "complete" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Run Auto Complete
            </Button>
          </div>
        )}
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
