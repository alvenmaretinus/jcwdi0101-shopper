import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { format } from "date-fns";
import type { Voucher } from "@/types/Voucher";
import {
  discountTypeOptions,
  type DiscountType,
  type VoucherType,
  voucherTypeOptions,
} from "../shared/promoOptions";

interface VouchersFormDialogProps {
  open: boolean;
  editingVoucher: Voucher | null;
  selectedVoucherDiscountType: DiscountType;
  selectedVoucherType: VoucherType;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onDiscountTypeChange: (value: DiscountType) => void;
  onVoucherTypeChange: (value: VoucherType) => void;
}

export function VouchersFormDialog({
  open,
  editingVoucher,
  selectedVoucherDiscountType,
  selectedVoucherType,
  isSubmitting,
  onOpenChange,
  onSubmit,
  onDiscountTypeChange,
  onVoucherTypeChange,
}: VouchersFormDialogProps) {
  const editingDiscount = editingVoucher?.discount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingVoucher ? "Edit Voucher" : "Create Voucher"}</DialogTitle>
          <DialogDescription>
            {editingVoucher
              ? "Update voucher code and linked discount details"
              : "Generate a voucher code with a new discount"}
          </DialogDescription>
        </DialogHeader>
        <form key={editingVoucher?.id ?? "create"} onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voucherCode">Voucher Code</Label>
            <Input
              id="voucherCode"
              name="voucherCode"
              placeholder="e.g. SUMMER2024"
              className="uppercase"
              defaultValue={editingVoucher?.code}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="voucherName">Discount Name</Label>
            <Input
              id="voucherName"
              name="voucherName"
              placeholder="e.g. Summer Sale"
              defaultValue={editingDiscount?.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="voucherType">Voucher Type</Label>
            <Select
              name="voucherType"
              value={selectedVoucherType}
              onValueChange={(value) => onVoucherTypeChange(value as VoucherType)}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voucherTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="voucherDiscountType">Discount Type</Label>
            <Select
              name="voucherDiscountType"
              value={selectedVoucherDiscountType}
              onValueChange={(value) => onDiscountTypeChange(value as DiscountType)}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {discountTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedVoucherDiscountType === "QUANTITY" ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="voucherBuyQuantity">Buy Quantity</Label>
                <Input
                  id="voucherBuyQuantity"
                  name="voucherBuyQuantity"
                  type="number"
                  min="1"
                  placeholder="2"
                  defaultValue={editingDiscount?.buyQuantity}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voucherFreeQuantity">Free Quantity</Label>
                <Input
                  id="voucherFreeQuantity"
                  name="voucherFreeQuantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  defaultValue={editingDiscount?.freeQuantity}
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
                step={selectedVoucherDiscountType === "FIXED_AMOUNT" ? "1" : "0.01"}
                placeholder={selectedVoucherDiscountType === "PERCENTAGE" ? "10" : "50000"}
                defaultValue={editingDiscount?.percentage || editingDiscount?.amount}
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
                defaultChecked={editingDiscount?.isWithMinimum}
              />
              <Label htmlFor="voucherIsWithMinimum" className="font-normal cursor-pointer">
                Minimum purchase required
              </Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="voucherMinimumPrice">Minimum Purchase (Rp)</Label>
            <Input
              id="voucherMinimumPrice"
              name="voucherMinimumPrice"
              type="number"
              placeholder="e.g. 100000"
              defaultValue={editingDiscount?.minimumPrice}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="voucherStartsAt">Start Date & Time</Label>
            <Input
              id="voucherStartsAt"
              name="voucherStartsAt"
              type="datetime-local"
              defaultValue={
                editingDiscount?.startsAt
                  ? format(new Date(editingDiscount.startsAt), "yyyy-MM-dd'T'HH:mm")
                  : ""
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="voucherEndsAt">End Date & Time</Label>
            <Input
              id="voucherEndsAt"
              name="voucherEndsAt"
              type="datetime-local"
              defaultValue={
                editingDiscount?.endsAt
                  ? format(new Date(editingDiscount.endsAt), "yyyy-MM-dd'T'HH:mm")
                  : ""
              }
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (editingVoucher ? "Saving..." : "Creating...") : editingVoucher ? "Save Voucher" : "Create Voucher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
