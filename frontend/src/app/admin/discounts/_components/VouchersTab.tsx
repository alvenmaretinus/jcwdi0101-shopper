"use client";

import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pagination } from "@/components/Pagination/Pagination";
import { useAdminVouchersStore } from "@/store/admin";
import { toast } from "sonner";
import type { Voucher } from "@/types/Voucher";
import { mapVoucherFormData } from "./shared/promoFormMappers";
import { VouchersFilterBar } from "./vouchers/VouchersFilterBar";
import { VouchersFormDialog } from "./vouchers/VouchersFormDialog";
import { VouchersTable } from "./vouchers/VouchersTable";

export function VouchersTab() {
  const {
    vouchers,
    isLoading,
    isSubmitting,
    isDialogOpen,
    editingVoucher,
    voucherSearch,
    voucherTypeFilter,
    selectedVoucherDiscountType,
    selectedVoucherType,
    pagination,
    fetchVouchers,
    setVoucherSearch,
    setVoucherTypeFilter,
    setSelectedVoucherDiscountType,
    setSelectedVoucherType,
    setCurrentPage,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    createVoucher,
    updateVoucher,
    deleteVoucher,
  } = useAdminVouchersStore();

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const filteredVouchers = useMemo(
    () =>
      vouchers.filter((voucher: Voucher) => {
        const searchValue = voucherSearch.toLowerCase();
        return (
          voucher.code.toLowerCase().includes(searchValue) ||
          voucher.discount.name?.toLowerCase().includes(searchValue) ||
          voucher.voucherType.toLowerCase().includes(searchValue)
        );
      }),
    [voucherSearch, vouchers]
  );

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      closeDialog();
    }
  };

  const handleVoucherSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);
      const { data: voucherData, error } = mapVoucherFormData(formData);

      if (error) {
        toast.error(error);
        return;
      }

      if (!voucherData) {
        return;
      }

      if (editingVoucher) {
        await updateVoucher(editingVoucher.id, voucherData);
      } else {
        await createVoucher(voucherData);
      }
    } catch {
      // Error toast is handled in the service/store
    }
  };

  const handleVoucherEdit = (voucher: Voucher) => {
    openEditDialog(voucher);
  };

  const handleVoucherDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voucher?")) {
      return;
    }

    try {
      await deleteVoucher(id);
    } catch {
      // Error toast is handled in the service/store
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Voucher code copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <VouchersFilterBar
            voucherSearch={voucherSearch}
            voucherTypeFilter={voucherTypeFilter}
            onSearchChange={setVoucherSearch}
            onTypeFilterChange={setVoucherTypeFilter}
            onCreate={openCreateDialog}
          />

          <VouchersFormDialog
            open={isDialogOpen}
            editingVoucher={editingVoucher}
            selectedVoucherDiscountType={selectedVoucherDiscountType}
            selectedVoucherType={selectedVoucherType}
            isSubmitting={isSubmitting}
            onOpenChange={handleDialogChange}
            onSubmit={handleVoucherSubmit}
            onDiscountTypeChange={setSelectedVoucherDiscountType}
            onVoucherTypeChange={setSelectedVoucherType}
          />
        </CardHeader>

        <CardContent>
          <VouchersTable
            vouchers={filteredVouchers}
            isLoading={isLoading}
            onCopyCode={copyCode}
            onEdit={handleVoucherEdit}
            onDelete={handleVoucherDelete}
          />
        </CardContent>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onChange={setCurrentPage}
        />
      </Card>
    </div>
  );
}
