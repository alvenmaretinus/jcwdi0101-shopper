import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import TableCellOne from "./_components/table-cell-1";
import TableCellCategoryAndPrice from "./_components/table-cell-category-and-price";
import TableCellId from "./_components/table-cell-id";
import TableCellModifyButtons from "./_components/table-cell-modify-buttons";

export default function ProductTableBody(props: any) {
    const { products = [], isSuperAdmin, handleEdit, handleDelete } = props;
    
    if (!products || products.length === 0) {
        return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan={isSuperAdmin ? 5 : 4} className="text-center text-muted-foreground py-8">
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
                <TableCellCategoryAndPrice product={product} />
                <TableCellId product={product} />
                {isSuperAdmin && (
                    <TableCellModifyButtons product={product} handleEdit={handleEdit} handleDelete={props.handleDelete} />
                )}
            </TableRow>
            ))}
        </TableBody>
    );
}