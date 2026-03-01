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
import { Loader2, Plus, Percent, Tag, Gift, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  CreateDiscountInput,
} from "@/services/discount";
import { toast } from "sonner";
import type { Discount } from "@/types/Discount";
import { getProducts, type ProductWithDetails } from "@/services/product/getProducts";
import SelectionModal from "@/components/Dialog/SelectionModal";

const discountTypeIcons = {
  PERCENTAGE: Percent,
  FIXED_AMOUNT: Tag,
  QUANTITY: Gift,
};

const discountTypeLabels = {
  PERCENTAGE: "Percentage",
  FIXED_AMOUNT: "Fixed Amount",
  QUANTITY: "Buy X Get Y",
};

export function DiscountsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [selectedDiscountType, setSelectedDiscountType] = useState<
    "PERCENTAGE" | "FIXED_AMOUNT" | "QUANTITY"
  >("PERCENTAGE");
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithMinimumChecked, setIsWithMinimumChecked] = useState<boolean>(
    editingDiscount?.isWithMinimum ?? false
  );
  const [hasDiscountAmountCapChecked, setHasDiscountAmountCapChecked] =
    useState<boolean>(editingDiscount?.hasDiscountAmountCap ?? false);

  // Product selection states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithDetails | null>(null);

  // Pagination states
  const [discountsPage, setDiscountsPage] = useState(1);
  const [discountsPagination, setDiscountsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Fetch discounts on mount and when filters change
  useEffect(() => {
    fetchDiscounts();
  }, [typeFilter, discountsPage, searchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setDiscountsPage(1);
  }, [searchQuery, typeFilter]);

  const fetchDiscounts = async () => {
    setIsLoading(true);
    try {
      const response = await getDiscounts({
        name: searchQuery || undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        page: discountsPage,
        limit: 20,
      });
      setDiscounts(response.data);
      setDiscountsPagination(response.meta);
    } catch (error) {
      toast.error("Failed to load discounts");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDiscounts: Discount[] = discounts;

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setSelectedDiscountType(discount.type);
    if (discount.productId) {
      setSelectedProduct({ id: discount.productId } as ProductWithDetails);
    } else {
      setSelectedProduct(null);
    }
    setIsDialogOpen(true);
  };

  useEffect(() => {
    setIsWithMinimumChecked(editingDiscount?.isWithMinimum ?? false);
    setHasDiscountAmountCapChecked(
      editingDiscount?.hasDiscountAmountCap ?? false
    );
  }, [editingDiscount]);

  const handleCreate = () => {
    setEditingDiscount(null);
    setSelectedProduct(null);
    setSelectedDiscountType("PERCENTAGE");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const type = formData.get("type") as
        | "PERCENTAGE"
        | "FIXED_AMOUNT"
        | "QUANTITY";
      const endsAt = formData.get("endsAt") as string;
      const startsAt = formData.get("startsAt") as string;
      const rawValue = (formData.get("value") as string) ?? "";

      const discountData: any = {
        name: formData.get("name") as string,
        type,
        isVoucher: false,
        isWithMinimum: formData.has("isWithMinimum"),
        isTiedToProduct: !!selectedProduct?.id,
        productId: selectedProduct?.id || null,
      };

      // Add type-specific fields
      if (type === "PERCENTAGE") {
        discountData.percentage = Number(rawValue);
      } else if (type === "FIXED_AMOUNT") {
        const amount = Number(rawValue);
        if (!Number.isInteger(amount)) {
          toast.error("Fixed amount must be a whole number");
          setIsSubmitting(false);
          return;
        }
        discountData.amount = amount;
      } else if (type === "QUANTITY") {
        const buyQuantity = Number(formData.get("buyQuantity"));
        const freeQuantity = Number(formData.get("freeQuantity"));

        if (!Number.isInteger(buyQuantity) || !Number.isInteger(freeQuantity)) {
          toast.error("Buy and free quantities must be whole numbers");
          setIsSubmitting(false);
          return;
        }

        discountData.buyQuantity = buyQuantity;
        discountData.freeQuantity = freeQuantity;
      }

      if (formData.get("minimumPrice")) {
        const minimumPrice = Number(formData.get("minimumPrice"));
        if (!Number.isInteger(minimumPrice)) {
          toast.error("Minimum purchase must be a whole number");
          setIsSubmitting(false);
          return;
        }
        discountData.minimumPrice = minimumPrice;
      }

      // Handle max discount amount (only for percentage discounts)
      if (type === "PERCENTAGE" && formData.has("hasDiscountAmountCap")) {
        discountData.hasDiscountAmountCap = true;
        const maxDiscountAmount = Number(formData.get("maxDiscountAmount"));
        if (!Number.isInteger(maxDiscountAmount) || maxDiscountAmount < 1) {
          toast.error(
            "Max discount amount must be a whole number greater than 0"
          );
          setIsSubmitting(false);
          return;
        }
        discountData.maxDiscountAmount = maxDiscountAmount;
      } else {
        discountData.hasDiscountAmountCap = false;
      }

      if (startsAt) {
        discountData.startsAt = new Date(startsAt);
      }

      if (endsAt) {
        discountData.endsAt = new Date(endsAt);
      }

      if (editingDiscount) {
        await updateDiscount({ id: editingDiscount.id, ...discountData });
      } else {
        await createDiscount(discountData as CreateDiscountInput);
      }

      await fetchDiscounts();
      setIsDialogOpen(false);
      setEditingDiscount(null);
      setSelectedProduct(null);
    } catch (error) {
      // Error toast is handled in the service
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount?")) {
      return;
    }

    try {
      await deleteDiscount(id);
      await fetchDiscounts();
    } catch (error) {
      // Error toast is handled in the service
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
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search discounts..."
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                  <SelectItem value="QUANTITY">Buy X Get Y</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Discount
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingDiscount ? "Edit Discount" : "Create New Discount"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDiscount
                      ? "Update discount details"
                      : "Set up a new promotion"}
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Discount Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Summer Sale 20%"
                      defaultValue={editingDiscount?.name}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Discount Type</Label>
                    <Select
                      name="type"
                      value={selectedDiscountType}
                      onValueChange={(value) =>
                        setSelectedDiscountType(
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

                  {/* Conditional fields based on type */}
                  <div className="space-y-2">
                    <Label htmlFor="value">
                      {selectedDiscountType === "PERCENTAGE"
                        ? "Percentage (%)"
                        : selectedDiscountType === "FIXED_AMOUNT"
                          ? "Amount (Rp)"
                          : "Quantity"}
                    </Label>
                    {selectedDiscountType === "QUANTITY" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="buyQuantity" className="text-xs">
                            Buy Quantity
                          </Label>
                          <Input
                            id="buyQuantity"
                            name="buyQuantity"
                            type="number"
                            min="1"
                            placeholder="2"
                            defaultValue={editingDiscount?.buyQuantity}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="freeQuantity" className="text-xs">
                            Free Quantity
                          </Label>
                          <Input
                            id="freeQuantity"
                            name="freeQuantity"
                            type="number"
                            min="1"
                            placeholder="1"
                            defaultValue={editingDiscount?.freeQuantity}
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <Input
                        name="value"
                        type="number"
                        step={
                          selectedDiscountType === "FIXED_AMOUNT" ? "1" : "0.01"
                        }
                        placeholder={
                          selectedDiscountType === "PERCENTAGE" ? "10" : "50000"
                        }
                        defaultValue={
                          editingDiscount?.percentage ||
                          editingDiscount?.amount
                        }
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isWithMinimum"
                        name="isWithMinimum"
                        checked={isWithMinimumChecked}
                        onChange={(e) =>
                          setIsWithMinimumChecked(e.target.checked)
                        }
                        className="rounded"
                      />
                      <Label
                        htmlFor="isWithMinimum"
                        className="font-normal cursor-pointer"
                      >
                        Minimum purchase required
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumPrice">
                      Minimum Purchase (Rp)
                    </Label>
                    <Input
                      id="minimumPrice"
                      name="minimumPrice"
                      type="number"
                      placeholder="50000"
                      defaultValue={editingDiscount?.minimumPrice}
                      disabled={!isWithMinimumChecked}
                    />
                  </div>

                  {selectedDiscountType === "PERCENTAGE" && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="hasDiscountAmountCap"
                            name="hasDiscountAmountCap"
                            checked={hasDiscountAmountCapChecked}
                            onChange={(e) =>
                              setHasDiscountAmountCapChecked(e.target.checked)
                            }
                            className="rounded"
                          />
                          <Label
                            htmlFor="hasDiscountAmountCap"
                            className="font-normal cursor-pointer"
                          >
                            Cap maximum discount amount
                          </Label>
                        </div>
                      </div>

                      {hasDiscountAmountCapChecked && (
                        <div className="space-y-2">
                          <Label htmlFor="maxDiscountAmount">
                            Maximum Discount Amount (Rp)
                          </Label>
                          <Input
                            id="maxDiscountAmount"
                            name="maxDiscountAmount"
                            type="number"
                            placeholder="100000"
                            defaultValue={editingDiscount?.maxDiscountAmount}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Apply to Product (Optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      onClick={() => setIsProductModalOpen(true)}
                    >
                      {selectedProduct
                        ? selectedProduct.id
                        : "Click to select a product"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startsAt">Start Date</Label>
                      <Input
                        id="startsAt"
                        name="startsAt"
                        type="date"
                        defaultValue={
                          editingDiscount?.startsAt
                            ? format(
                                new Date(editingDiscount.startsAt),
                                "yyyy-MM-dd"
                              )
                            : ""
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endsAt">End Date</Label>
                      <Input
                        id="endsAt"
                        name="endsAt"
                        type="date"
                        defaultValue={
                          editingDiscount?.endsAt
                            ? format(
                                new Date(editingDiscount.endsAt),
                                "yyyy-MM-dd"
                              )
                            : ""
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingDiscount(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Discount"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDiscounts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No discounts found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Discount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Min. Purchase</TableHead>
                  <TableHead>Remaining Uses</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiscounts.map((discount) => {
                  const TypeIcon = discountTypeIcons[discount.type];
                  const isExpired = discount.endsAt
                    ? new Date(discount.endsAt) < new Date()
                    : false;
                  return (
                    <TableRow key={discount.id}>
                      <TableHead className="font-medium">
                        {discount.name}
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4" />
                          {discountTypeLabels[discount.type]}
                        </div>
                      </TableHead>
                      <TableHead>{getDiscountValue(discount)}</TableHead>
                      <TableHead>
                        {discount.isWithMinimum
                          ? `Rp ${discount.minimumPrice?.toLocaleString("id-ID")}`
                          : "No minimum"}
                      </TableHead>
                      <TableHead>{getRemainingUsesLabel(discount)}</TableHead>
                      <TableHead>
                        {discount.endsAt
                          ? format(new Date(discount.endsAt), "MMM dd, yyyy")
                          : "No expiry"}
                      </TableHead>
                      <TableHead>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            isExpired
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {isExpired ? "Expired" : "Active"}
                        </span>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(discount)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(discount.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableHead>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <Pagination
          page={discountsPagination.page}
          totalPages={discountsPagination.totalPages}
          total={discountsPagination.total}
          onChange={setDiscountsPage}
        />
      </Card>

      {/* Product Selection Modal */}
      <SelectionModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        onSelect={(product) => {
          setSelectedProduct(product);
        }}
        getType={getProducts}
        selectedSelectionId={selectedProduct?.id}
        title="Select Product"
        description="Search and select a product to apply the discount"
      />
    </div>
  );
}
