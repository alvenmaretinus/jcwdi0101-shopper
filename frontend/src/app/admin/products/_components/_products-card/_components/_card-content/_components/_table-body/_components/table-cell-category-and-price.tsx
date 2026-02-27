import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";

export default function TableCellCategoryAndPrice(props: any) {
    return (
        <>
            <TableCell>
                <Badge variant="secondary">{props.product.category?.name}</Badge>
            </TableCell>
            <TableCell>
                    Rp {props.product.price.toLocaleString('id-ID')}
            </TableCell>
        </>
    );
}