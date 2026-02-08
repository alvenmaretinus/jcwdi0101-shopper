import { TableCell } from "@/components/ui/table";
import { Package } from "lucide-react";

export default function TableCellOne(props: any) {
    return (
        <TableCell>
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                <p className="font-medium">{props.product.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                    {props.product.description}
                </p>
                </div>
            </div>
        </TableCell>
    );
}