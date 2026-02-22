"use client";

import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

interface OrderStatusBadgeProps {
  status: string;
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-primary" />;
      case "shipping":
        return <Truck className="h-5 w-5 text-orange-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-berry" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "delivered":
        return "bg-primary/10 text-primary border-primary/20";
      case "shipping":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "processing":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "cancelled":
        return "bg-berry/10 text-berry border-berry/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Badge
      className={`${getStatusColor(status)} border flex items-center gap-2 w-fit`}
    >
      {getStatusIcon(status)}
      {statusLabel}
    </Badge>
  );
};

export default OrderStatusBadge;
