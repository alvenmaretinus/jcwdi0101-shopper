import SelectionSelect from '@/app/admin/_components/SelectionSelect';
import { getStores } from '@/services/store/getStores';

interface SalesReportHeaderProps {
  isSuperAdmin: boolean;
  selectedStoreName: string;
  onStoreSelect: (store: { id: string; name: string } | null) => void;
}

export function SalesReportHeader({
  isSuperAdmin,
  selectedStoreName,
  onStoreSelect,
}: SalesReportHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sales Report</h1>
        <p className="text-muted-foreground">Completed sales records</p>
      </div>
      {isSuperAdmin && (
        <div className="ml-auto sm:w-auto">
          <SelectionSelect
            value={selectedStoreName}
            onChange={onStoreSelect}
            getType={async ({ name, page, limit }) => {
              const response = await getStores({ query: { page, search: name, sortBy: 'createdAt', sortOrder: 'desc' } });
              return { data: (response.data || []).map((store) => ({ id: store.id, name: store.name })), meta: response.meta };
            }}
            title="Select Store"
            description="Search and select a store"
            className="w-48"
            displayValue={selectedStoreName}
            showLabel={false}
          />
        </div>
      )}
    </div>
  );
}
