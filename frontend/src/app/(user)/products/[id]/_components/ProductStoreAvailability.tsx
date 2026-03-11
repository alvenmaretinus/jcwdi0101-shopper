import { Store } from "lucide-react";

interface ProductStore {
  storeId: string;
  quantity: number;
  store: {
    name: string;
  };
}

interface ProductStoreAvailabilityProps {
  productStores: ProductStore[];
}

export const ProductStoreAvailability = ({
  productStores,
}: ProductStoreAvailabilityProps) => {
  const availableStores = productStores.filter((ps) => ps.quantity > 0);

  if (availableStores.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Store className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">Available at:</span>
      </div>
      <div className="space-y-2">
        {availableStores.map((ps) => (
          <div
            key={ps.storeId}
            className="flex justify-between items-center bg-muted/50 rounded-lg px-4 py-2"
          >
            <span className="text-sm">{ps.store.name}</span>
            <span className="text-sm font-medium">{ps.quantity} units</span>
          </div>
        ))}
      </div>
    </div>
  );
};
