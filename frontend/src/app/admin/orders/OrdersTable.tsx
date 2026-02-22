"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import type { AdminOrder } from "@/services/admin/getOrders";

interface Props {
  orders: AdminOrder[];
  loading: boolean;
  onView: (o: AdminOrder) => void;
}

const statusColors: Record<string, string> = {
  PAYMENT_PENDING: "bg-yellow-100 text-yellow-800",
  PAYMENT_WAITING_CONFIRMATION: "bg-orange-100 text-orange-800",
  PAYMENT_EXPIRED: "bg-red-100 text-red-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

const getStatusColor = (status?: string) =>
  status
    ? (statusColors[status] ?? "bg-gray-100 text-gray-800")
    : "bg-gray-100 text-gray-800";
const getStatusLabel = (status?: string) =>
  status ? status.replace(/_/g, " ") : "UNKNOWN";

export default function OrdersTable({ orders, loading, onView }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Store</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell
              colSpan={8}
              className="text-center text-muted-foreground"
            >
              Loading orders...
            </TableCell>
          </TableRow>
        ) : orders.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={8}
              className="text-center text-muted-foreground"
            >
              No orders found
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium font-mono text-sm">
                {order.id.slice(0, 8)}...
              </TableCell>
              <TableCell>{order.user?.email}</TableCell>
              <TableCell>{order.storeName}</TableCell>
              <TableCell>
                Rp {order.grandTotal.toLocaleString("id-ID")}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {order.paymentType === "BANK_TRANSFER"
                    ? "Transfer"
                    : "Gateway"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={getStatusColor(order.status)}
                  variant="secondary"
                >
                  {getStatusLabel(order.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(order.createdAt), "MMM dd, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(order)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
