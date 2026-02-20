import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import TableCellOne from "./_components/table-cell-1";
import TableCellStock from "./_components/table-cell-stock";
import TableCellModifyButtons from "./_components/table-cell-modify-buttons";

export default function ProductTableBody(props: any) {
    const { products = [], isSuperAdmin, handleEdit, handleDelete } = props;
    
    if (!products || products.length === 0) {
        return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan={isSuperAdmin ? 4 : 3} className="text-center text-muted-foreground py-8">
                        No products found
                    </TableCell>
                </TableRow>
            </TableBody>
        );
    }

    return (
        <TableBody>
            {products.map((product: any) => (
            <TableRow key={product.id}>
                <TableCellOne product={product} />
                
                <TableCellStock product={product} />
                {isSuperAdmin && (
                    <TableCellModifyButtons product={product} handleEdit={handleEdit} handleDelete={props.handleDelete} />
                )}
            </TableRow>
            ))}
        </TableBody>
    );
}