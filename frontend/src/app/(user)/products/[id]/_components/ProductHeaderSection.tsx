import { Badge } from "@/components/ui/badge";

interface ProductHeaderSectionProps {
  categoryName: string | null;
  productName: string;
  description: string | null;
}

export const ProductHeaderSection = ({
  categoryName,
  productName,
  description,
}: ProductHeaderSectionProps) => {
  return (
    <div>
      <Badge variant="secondary" className="mb-2">
        {categoryName || "Uncategorized"}
      </Badge>
      <h1 className="text-4xl font-bold mb-2">{productName}</h1>
      {description && (
        <p className="text-muted-foreground text-lg">{description}</p>
      )}
    </div>
  );
};
