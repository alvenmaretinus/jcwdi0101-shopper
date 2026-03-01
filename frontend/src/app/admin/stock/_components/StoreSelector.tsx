import SelectionSelect from '@/app/admin/_components/SelectionSelect';
import { Label } from '@/components/ui/label';
import { SelectableItem } from '@/types/common';
import { fetchStoresForSelect } from '@/lib/reportSelectors';

interface StoreSelectorProps {
  isSuperAdmin: boolean;
  selectedStoreName: string;
  userStoreId?: string;
  onStoreSelect: (store: SelectableItem | null) => void;
  className?: string;
}

export function StoreSelector({
  isSuperAdmin,
  selectedStoreName,
  userStoreId,
  onStoreSelect,
  className = 'w-64',
}: StoreSelectorProps) {
  if (!isSuperAdmin && userStoreId) {
    return (
      <div className="space-y-2">
        <Label>Store</Label>
        <div className="px-4 py-2 border rounded-md bg-gray-50 text-sm">
          {selectedStoreName || 'Your Store'}
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <SelectionSelect
      value={selectedStoreName}
      label="Store"
      onChange={onStoreSelect}
      getType={async ({ name, page, limit }) => {
        return fetchStoresForSelect(name, page, limit);
      }}
      title="Select Store"
      description="Search and select a store"
      className={className}
      displayValue={selectedStoreName || 'Select a store'}
    />
  );
}
