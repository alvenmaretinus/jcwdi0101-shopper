import { Badge } from '@/components/ui/badge';

interface StockBadgeProps {
  stock: number;
}

export function StockBadge({ stock }: StockBadgeProps) {
  if (stock === 0) {
    return <Badge variant="destructive">Out</Badge>;
  }

  if (stock <= 10) {
    return <Badge className="bg-yellow-100 text-yellow-800">{stock}</Badge>;
  }

  return <span>{stock}</span>;
}
