"use client";
import { useState } from "react";
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SelectionModal from "@/components/Dialog/SelectionModal";
import { getStores } from "@/services/store/getStores";

interface Props {
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  storeFilter: string;
  setStoreFilter: (s: string) => void;
  isSuperAdmin: boolean;
}

export default function OrdersFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  storeFilter,
  setStoreFilter,
  isSuperAdmin,
}: Props) {
  const [isStoreSelectionModalOpen, setIsStoreSelectionModalOpen] =
    useState(false);
  const [selectedStoreName, setSelectedStoreName] = useState("All Stores");

  const handleStoreSelect = (store: { id: string; name: string } | null) => {
    if (!store) {
      setStoreFilter("all");
      setSelectedStoreName("All Stores");
      return;
    }

    setStoreFilter(store.id);
    setSelectedStoreName(store.name);
  };

  const getStoresForSelection = async ({
    name,
    page,
    limit,
  }: {
    name: string | undefined;
    page: number;
    limit: number;
  }) => {
    const response = await getStores({
      query: {
        page,
        search: name,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    });

    return {
      data: (response.data || []).map((store) => ({
        id: store.id,
        name: store.name,
      })),
      meta: response.meta,
    };
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-50 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by order ID or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="PAYMENT_PENDING">Payment Pending</SelectItem>
          <SelectItem value="PAYMENT_WAITING_CONFIRMATION">
            Waiting Confirmation
          </SelectItem>
          <SelectItem value="PROCESSING">Processing</SelectItem>
          <SelectItem value="SHIPPED">Shipped</SelectItem>
          <SelectItem value="DELIVERED">Delivered</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {isSuperAdmin && (
        <>
          <Button
            type="button"
            variant="outline"
            className="w-48 justify-start text-left font-normal"
            onClick={() => setIsStoreSelectionModalOpen(true)}
          >
            {storeFilter === "all" ? "All Stores" : selectedStoreName}
          </Button>

          <SelectionModal
            open={isStoreSelectionModalOpen}
            onOpenChange={setIsStoreSelectionModalOpen}
            onSelect={handleStoreSelect}
            selectedSelectionId={storeFilter === "all" ? undefined : storeFilter}
            title="Select Store"
            description="Search and select a store to filter orders"
            getType={getStoresForSelection}
          />
        </>
      )}
    </div>
  );
}
