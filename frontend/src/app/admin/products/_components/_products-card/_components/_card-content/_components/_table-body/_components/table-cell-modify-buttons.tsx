import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";

export default function TableCellModifyButtons(props: any) {
    return (
        <TableCell className="text-right">
            <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => props.handleEdit(props.product)}>
                <Pencil className="h-4 w-4" />
            </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => props.handleDelete && props.handleDelete(props.product.id)}
                        >
                                <Trash2 className="h-4 w-4" />
                        </Button>
            </div>
        </TableCell>
    );
}