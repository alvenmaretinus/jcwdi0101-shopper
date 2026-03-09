import { ProductsInStockOnlyToggle } from "./ProductsInStockOnlyToggle";

interface ProductsToggleFilterProps {
  showInStock: boolean;
}

export function ProductsToggleFilter({ showInStock }: ProductsToggleFilterProps) {
  return (
    <div>
      <h3 className="font-semibold mb-3">Filters</h3>
      <div className="space-y-3">
        <ProductsInStockOnlyToggle showInStock={showInStock} />
      </div>
    </div>
  );
}
