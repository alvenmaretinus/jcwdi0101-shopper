import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface ProductStockInfoProps {
  totalStock: number;
}

export const ProductStockInfo = ({ totalStock }: ProductStockInfoProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">Stock Availability:</span>
        {totalStock > 0 ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {totalStock} units available
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Out of Stock
          </Badge>
        )}
      </div>

      {totalStock <= 10 && totalStock > 0 && (
        <p className="text-sm text-orange-600">Only {totalStock} left in stock!</p>
      )}
    </div>
  );
};
