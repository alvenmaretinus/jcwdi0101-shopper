import { TableHead, TableHeader, TableRow } from "@/components/ui/table";


export default function ProductTableHeader(props: any) {
    return (
         <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>ID</TableHead>
                {props.isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
    )
}  