"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SearchBar from "@/app/admin/_components/SearchBar";
import { Pagination } from "@/components/Pagination/Pagination";
import { Loader2, Plus, Copy, Users, Ticket, Truck, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  getVouchers,
  createVoucher,
  CreateVoucherInput,
  deleteVoucher,
} from "@/services/voucher";
import { toast } from "sonner";
import type { Voucher } from "@/types/Voucher";
import type { Discount } from "@/types/Discount";

const voucherTypeIcons = {
  REFERRAL: Users,
  TRANSACTIONAL: Ticket,
  FREEDELIVERY: Truck,
};

const voucherTypeLabels = {
  REFERRAL: "Referral",
  TRANSACTIONAL: "Transactional",
  FREEDELIVERY: "Free Delivery",
};

const discountTypeLabels = {
  PERCENTAGE: "Percentage",
  FIXED_AMOUNT: "Fixed Amount",
  QUANTITY: "Buy X Get Y",
};

export function VouchersTab() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [voucherSearch, setVoucherSearch] = useState("");
  const [voucherTypeFilter, setVoucherTypeFilter] = useState<string>("all");
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState(false);
  const [isVouchersLoading, setIsVouchersLoading] = useState(false);
  const [selectedVoucherDiscountType, setSelectedVoucherDiscountType] =
    useState<"PERCENTAGE" | "FIXED_AMOUNT" | "QUANTITY">("PERCENTAGE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination states
  const [vouchersPage, setVouchersPage] = useState(1);
  const [vouchersPagination, setVouchersPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Fetch vouchers on mount and when filters change
  useEffect(() => {
    fetchVouchers();
  }, [voucherTypeFilter, vouchersPage]);

  useEffect(() => {
    setVouchersPage(1);
  }, [voucherSearch, voucherTypeFilter]);

  const fetchVouchers = async () => {
    setIsVouchersLoading(true);
    try {
      const response = await getVouchers({
        voucherType:
          voucherTypeFilter !== "all" ? voucherTypeFilter : undefined,
        page: vouchersPage,
        limit: 20,
      });
      setVouchers(response.data);
      setVouchersPagination(response.meta);
    } catch (error) {
      toast.error("Failed to load vouchers");
    } finally {
      setIsVouchersLoading(false);
    }
  };

  const filteredVouchers: Voucher[] = vouchers.filter((voucher: Voucher) => {
    const matchesSearch =
      voucher.code.toLowerCase().includes(voucherSearch.toLowerCase()) ||
      voucher.discount.name
        ?.toLowerCase()
        .includes(voucherSearch.toLowerCase()) ||
      voucher.voucherType.toLowerCase().includes(voucherSearch.toLowerCase());
    return matchesSearch;
  });

  const getDiscountForVoucher = (voucher: Voucher): Discount | undefined => {
    return voucher.discount;
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Voucher code copied to clipboard");
  };

  const handleVoucherDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voucher?")) {
      return;
    }

    try {
      await deleteVoucher(id);
      await fetchVouchers();
    } catch (error) {
      // Error toast is handled in the service
    }
  };

  const handleVoucherSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const type = formData.get("voucherDiscountType") as
        | "PERCENTAGE"
        | "FIXED_AMOUNT"
        | "QUANTITY";
      const endsAt = formData.get("voucherEndsAt") as string;
      const startsAt = formData.get("voucherStartsAt") as string;

      const voucherData: CreateVoucherInput = {
        code: (formData.get("voucherCode") as string).toUpperCase(),
        name: formData.get("voucherName") as string,
        type,
        voucherType: formData.get("voucherType") as
          | "REFERRAL"
          | "TRANSACTIONAL"
          | "FREEDELIVERY",
        isWithMinimum: formData.has("voucherIsWithMinimum"),
      };

      // Add type-specific fields
      if (type === "PERCENTAGE") {
        voucherData.percentage = Number(formData.get("voucherValue"));
      } else if (type === "FIXED_AMOUNT") {
        voucherData.amount = Number(formData.get("voucherValue"));
      } else if (type === "QUANTITY") {
        voucherData.buyQuantity = Number(formData.get("voucherBuyQuantity"));
        voucherData.freeQuantity = Number(formData.get("voucherFreeQuantity"));
      }

      if (formData.get("voucherMinimumPrice")) {
        voucherData.minimumPrice = Number(formData.get("voucherMinimumPrice"));
      }

      if (startsAt) {
        voucherData.startsAt = new Date(startsAt);
      }

      if (endsAt) {
        voucherData.endsAt = new Date(endsAt);
      }

      await createVoucher(voucherData);
      await fetchVouchers();
      setIsVoucherDialogOpen(false);
      setSelectedVoucherDiscountType("PERCENTAGE");
    } catch (error) {
      // Error toast is handled in the service
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDiscountValue = (discount: Discount) => {
    switch (discount.type) {
      case "PERCENTAGE":
        return `${discount.percentage}%`;
      case "FIXED_AMOUNT":
        return `Rp ${discount.amount?.toLocaleString("id-ID")}`;
      case "QUANTITY":
        return `Buy ${discount.buyQuantity} Get ${discount.freeQuantity}`;
      default:
        return "-";
    }
  };

  const getRemainingUsesLabel = (discount: Discount) => {
    if (!discount.isQuantityLimited) return "Unlimited";
    const totalLimit =
      typeof discount.maxUses === "number" ? discount.maxUses : 0;
    const used =
      typeof discount.useCounter === "number" ? discount.useCounter : 0;
    return String(Math.max(0, totalLimit - used));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <SearchBar
                value={voucherSearch}
                onChange={setVoucherSearch}
                placeholder="Search voucher codes..."
              />
              <Select
                value={voucherTypeFilter}
                onValueChange={setVoucherTypeFilter}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="REFERRAL">Referral</SelectItem>
                  <SelectItem value="TRANSACTIONAL">Transactional</SelectItem>
                  <SelectItem value="FREEDELIVERY">Free Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog
              open={isVoucherDialogOpen}
              onOpenChange={(open) => {
                setIsVoucherDialogOpen(open);
                if (!open) {
                  setSelectedVoucherDiscountType("PERCENTAGE");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setIsVoucherDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Voucher
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Voucher</DialogTitle>
                  <DialogDescription>
                    Generate a voucher code with a new discount
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleVoucherSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="voucherCode">Voucher Code</Label>
                    <Input
                      id="voucherCode"
                      name="voucherCode"
                      placeholder="e.g. SUMMER2024"
                      className="uppercase"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voucherName">Discount Name</Label>
                    <Input
                      id="voucherName"
                      name="voucherName"
                      placeholder="e.g. Summer Sale"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voucherType">Voucher Type</Label>
                    <Select
                      name="voucherType"
                      defaultValue="TRANSACTIONAL"
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRANSACTIONAL">
                          Transactional
                        </SelectItem>
                        <SelectItem value="REFERRAL">Referral</SelectItem>
                        <SelectItem value="FREEDELIVERY">
                          Free Delivery
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voucherDiscountType">Discount Type</Label>
                    <Select
                      name="voucherDiscountType"
                      value={selectedVoucherDiscountType}
                      onValueChange={(value) =>
                        setSelectedVoucherDiscountType(
                          value as
                            | "PERCENTAGE"
                            | "FIXED_AMOUNT"
                            | "QUANTITY"
                        )
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">
                          Fixed Amount
                        </SelectItem>
                        <SelectItem value="QUANTITY">Buy X Get Y</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedVoucherDiscountType === "QUANTITY" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="voucherBuyQuantity">
                          Buy Quantity
                        </Label>
                        <Input
                          id="voucherBuyQuantity"
                          name="voucherBuyQuantity"
                          type="number"
                          min="1"
                          placeholder="2"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voucherFreeQuantity">
                          Free Quantity
                        </Label>
                        <Input
                          id="voucherFreeQuantity"
                          name="voucherFreeQuantity"
                          type="number"
                          min="1"
                          placeholder="1"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="voucherValue">
                        {selectedVoucherDiscountType === "PERCENTAGE"
                          ? "Percentage (%)"
                          : "Amount (Rp)"}
                      </Label>
                      <Input
                        id="voucherValue"
                        name="voucherValue"
                        type="number"
                        step={
                          selectedVoucherDiscountType === "FIXED_AMOUNT"
                            ? "1"
                            : "0.01"
                        }
                        placeholder={
                          selectedVoucherDiscountType === "PERCENTAGE"
                            ? "10"
                            : "50000"
                        }
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="voucherIsWithMinimum"
                        name="voucherIsWithMinimum"
                        className="rounded"
                      />
                      <Label
                        htmlFor="voucherIsWithMinimum"
                        className="font-normal cursor-pointer"
                      >
                        Minimum purchase required
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voucherMinimumPrice">
                      Minimum Purchase (Rp)
                    </Label>
                    <Input
                      id="voucherMinimumPrice"
                      name="voucherMinimumPrice"
                      type="number"
                      placeholder="e.g. 100000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voucherStartsAt">Start Date & Time</Label>
                    <Input
                      id="voucherStartsAt"
                      name="voucherStartsAt"
                      type="datetime-local"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voucherEndsAt">End Date & Time</Label>
                    <Input
                      id="voucherEndsAt"
                      name="voucherEndsAt"
                      type="datetime-local"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsVoucherDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Voucher"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isVouchersLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No vouchers found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Linked Discount</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Remaining Uses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVouchers.map((voucher) => {
                  const VTypeIcon = voucherTypeIcons[voucher.voucherType];
                  const linkedDiscount = getDiscountForVoucher(voucher);
                  return (
                    <TableRow key={voucher.id}>
                      <TableHead className="font-mono font-medium">
                        {voucher.code}
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <VTypeIcon className="h-4 w-4" />
                          {voucherTypeLabels[voucher.voucherType]}
                        </div>
                      </TableHead>
                      <TableHead>
                        {linkedDiscount ? (
                          <div className="space-y-0.5">
                            <div className="font-medium">
                              {linkedDiscount.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {discountTypeLabels[linkedDiscount.type]}
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableHead>
                      <TableHead>
                        {linkedDiscount
                          ? getDiscountValue(linkedDiscount)
                          : "-"}
                      </TableHead>
                      <TableHead>
                        {linkedDiscount
                          ? getRemainingUsesLabel(linkedDiscount)
                          : "-"}
                      </TableHead>
                      <TableHead>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </TableHead>
                      <TableHead>
                        {format(new Date(voucher.createdAt), "MMM dd, yyyy")}
                      </TableHead>
                      <TableHead className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(voucher.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleVoucherDelete(voucher.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableHead>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <Pagination
          page={vouchersPagination.page}
          totalPages={vouchersPagination.totalPages}
          total={vouchersPagination.total}
          onChange={setVouchersPage}
        />
      </Card>
    </div>
  );
}
