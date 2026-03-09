import { PaginationMeta } from "./ProductsList.types";

interface ProductsPageHeaderProps {
  categoryName: string;
  pagination: PaginationMeta;
}

export function ProductsPageHeader({
  categoryName,
  pagination,
}: ProductsPageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-foreground">
        {categoryName || "All Products"}
      </h1>
      <p className="text-muted-foreground mt-2">
        Showing {(pagination.page - 1) * pagination.limit + 1}-
        {Math.min(pagination.page * pagination.limit, pagination.total)} of {" "}
        {pagination.total} products
      </p>
    </div>
  );
}
