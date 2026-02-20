import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";

export default function TableCellStock(props: any) {
    return (
        <TableCell>
            {props.product.totalStock === 0 ? (
                <Badge variant="destructive">Out of Stock</Badge>
            ) : props.product.totalStock <= 10 ? (
                <Badge className="bg-yellow-100 text-yellow-800">Low: {props.product.totalStock}</Badge>
            ) : (
                <span className="text-muted-foreground">{props.product.totalStock}</span>
            )}
        </TableCell>
    );
}