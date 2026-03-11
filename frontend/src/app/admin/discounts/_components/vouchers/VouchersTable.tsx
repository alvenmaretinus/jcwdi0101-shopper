import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Copy, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Voucher } from "@/types/Voucher";
import {
  discountTypeLabels,
  getDiscountValue,
  getRemainingUsesLabel,
  voucherTypeIcons,
  voucherTypeLabels,
} from "../shared/promoDisplay";

interface VouchersTableProps {
  vouchers: Voucher[];
  isLoading: boolean;
  onCopyCode: (code: string) => void;
  onEdit: (voucher: Voucher) => void;
  onDelete: (id: string) => void;
}

export function VouchersTable({ vouchers, isLoading, onCopyCode, onEdit, onDelete }: VouchersTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (vouchers.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No vouchers found</div>;
  }

  return (
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
        {vouchers.map((voucher) => {
          const VTypeIcon = voucherTypeIcons[voucher.voucherType];
          const linkedDiscount = voucher.discount;

          return (
            <TableRow key={voucher.id}>
              <TableHead className="font-mono font-medium">{voucher.code}</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <VTypeIcon className="h-4 w-4" />
                  {voucherTypeLabels[voucher.voucherType]}
                </div>
              </TableHead>
              <TableHead>
                {linkedDiscount ? (
                  <div className="space-y-0.5">
                    <div className="font-medium">{linkedDiscount.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {discountTypeLabels[linkedDiscount.type]}
                    </div>
                  </div>
                ) : (
                  "-"
                )}
              </TableHead>
              <TableHead>{linkedDiscount ? getDiscountValue(linkedDiscount) : "-"}</TableHead>
              <TableHead>
                {linkedDiscount ? getRemainingUsesLabel(linkedDiscount) : "-"}
              </TableHead>
              <TableHead>
                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </TableHead>
              <TableHead>{format(new Date(voucher.createdAt), "MMM dd, yyyy")}</TableHead>
              <TableHead className="text-right space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(voucher)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onCopyCode(voucher.code)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(voucher.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
