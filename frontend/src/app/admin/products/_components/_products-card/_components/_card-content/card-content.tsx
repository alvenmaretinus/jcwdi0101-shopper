import { CardContent } from "@/components/ui/card";
import ProductTableHeader from "./_components/table-header";
import { Table} from "@/components/ui/table";
import ProductTableBody from "./_components/_table-body/table-body";


export default function CustomCardContent(props: any) {
    return (
        <CardContent>
          <Table>
           <ProductTableHeader isSuperAdmin={props.isSuperAdmin} />
            <ProductTableBody products={props.products} isSuperAdmin={props.isSuperAdmin} handleEdit={props.handleEdit} handleDelete={props.handleDelete} />
          </Table>
        </CardContent>
    );
}