import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Discount } from "@/types/Discount";
import {
  discountTypeIcons,
  discountTypeLabels,
  getDiscountValue,
  getRemainingUsesLabel,
} from "../shared/promoDisplay";

interface DiscountsTableProps {
  discounts: Discount[];
  isLoading: boolean;
  onEdit: (discount: Discount) => void;
  onDelete: (id: string) => void;
}

export function DiscountsTable({ discounts, isLoading, onEdit, onDelete }: DiscountsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (discounts.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No discounts found</div>;
  }

  return (
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
        {discounts.map((discount) => {
          const TypeIcon = discountTypeIcons[discount.type];
          const isExpired = discount.endsAt ? new Date(discount.endsAt) < new Date() : false;

          return (
            <TableRow key={discount.id}>
              <TableHead className="font-medium">{discount.name}</TableHead>
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
                    isExpired ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {isExpired ? "Expired" : "Active"}
                </span>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(discount)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(discount.id)}
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
  );
}
