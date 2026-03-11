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
import type { Discount } from "@/types/Discount";
import type { ProductWithDetails } from "@/services/product/getProducts";
import {
  discountTypeOptions,
  type DiscountType,
} from "../shared/promoOptions";

interface DiscountsFormDialogProps {
  open: boolean;
  editingDiscount: Discount | null;
  selectedDiscountType: DiscountType;
  isWithMinimumChecked: boolean;
  hasDiscountAmountCapChecked: boolean;
  selectedProduct: ProductWithDetails | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onDiscountTypeChange: (value: DiscountType) => void;
  onIsWithMinimumCheckedChange: (value: boolean) => void;
  onHasDiscountAmountCapCheckedChange: (value: boolean) => void;
  onOpenProductModal: () => void;
}

export function DiscountsFormDialog({
  open,
  editingDiscount,
  selectedDiscountType,
  isWithMinimumChecked,
  hasDiscountAmountCapChecked,
  selectedProduct,
  isSubmitting,
  onOpenChange,
  onSubmit,
  onDiscountTypeChange,
  onIsWithMinimumCheckedChange,
  onHasDiscountAmountCapCheckedChange,
  onOpenProductModal,
}: DiscountsFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingDiscount ? "Edit Discount" : "Create New Discount"}
          </DialogTitle>
          <DialogDescription>
            {editingDiscount ? "Update discount details" : "Set up a new promotion"}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
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
                step={selectedDiscountType === "FIXED_AMOUNT" ? "1" : "0.01"}
                placeholder={selectedDiscountType === "PERCENTAGE" ? "10" : "50000"}
                defaultValue={editingDiscount?.percentage || editingDiscount?.amount}
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
                onChange={(e) => onIsWithMinimumCheckedChange(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isWithMinimum" className="font-normal cursor-pointer">
                Minimum purchase required
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumPrice">Minimum Purchase (Rp)</Label>
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
                    onChange={(e) => onHasDiscountAmountCapCheckedChange(e.target.checked)}
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
                  <Label htmlFor="maxDiscountAmount">Maximum Discount Amount (Rp)</Label>
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
              onClick={onOpenProductModal}
            >
              {selectedProduct?.name ?? "Click to select a product"}
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
                    ? format(new Date(editingDiscount.startsAt), "yyyy-MM-dd")
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
                    ? format(new Date(editingDiscount.endsAt), "yyyy-MM-dd")
                    : ""
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Discount"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
