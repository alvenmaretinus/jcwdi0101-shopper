import { CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SalesReportEntity {
  number: number;
  completion_date: string;
  order_id: string;
  product_name: string;
  category_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
  voucher_codes: string[];
  discount_names: string[];
}

interface SalesReportTableProps {
  records: SalesReportEntity[];
}

export function SalesReportTable({ records }: SalesReportTableProps) {
  if (records.length === 0) {
    return (
      <CardContent>
        <p className="text-muted-foreground text-center py-12">No sales found for this period</p>
      </CardContent>
    );
  }

  return (
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Order ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Discounts</TableHead>
            <TableHead>Vouchers</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={`${record.order_id}-${record.product_name}`}>
              <TableCell className="text-muted-foreground">{record.number}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(record.completion_date).toLocaleDateString('id-ID')}
              </TableCell>
              <TableCell className="font-mono text-xs">{record.order_id}</TableCell>
              <TableCell className="font-medium">{record.product_name}</TableCell>
              <TableCell>{record.category_name}</TableCell>
              <TableCell>
                {record.discount_names.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {record.discount_names.map((discount, idx) => (
                      <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {discount}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">-</span>
                )}
              </TableCell>
              <TableCell>
                {record.voucher_codes.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {record.voucher_codes.map((voucher, idx) => (
                      <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-mono">
                        {voucher}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">Rp {record.product_price.toLocaleString('id-ID')}</TableCell>
              <TableCell className="text-right">{record.quantity}</TableCell>
              <TableCell className="text-right font-medium">Rp {record.total_price.toLocaleString('id-ID')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  );
}
