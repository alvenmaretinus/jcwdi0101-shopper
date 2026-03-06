# Centralized State Management with Zustand

## Overview

This project now uses **Zustand** for centralized state management, replacing the previous pattern of managing state locally in each component. This approach addresses the concerns about components doing too much and having overly long functions.

## The Problem (Before)

Previously, each page component was responsible for:
- ✗ Managing local state (useState for 10+ state variables)
- ✗ Data fetching logic (useEffect with complex dependencies)
- ✗ User authentication and role checking
- ✗ Pagination state management
- ✗ Filter state management
- ✗ CRUD operations
- ✗ UI state (dialogs, loading states)

**Result**: Components were 200-400+ lines with mixed concerns and difficult to test.

## The Solution (After)

With Zustand stores, components are now:
- ✓ Focused only on UI composition
- ✓ Much shorter (50-100 lines typical)
- ✓ Easier to understand and maintain
- ✓ State and logic are reusable across components
- ✓ Functions can be called from any component, even in different files

**Result**: Clean separation of concerns and centralized business logic.

## Available Stores

### 1. `useAuthStore`
Manages user authentication and permissions.

```tsx
import { useAuthStore } from '@/store';

function MyComponent() {
  const { isSuperAdmin, userStoreId, fetchUserRole } = useAuthStore();
  
  useEffect(() => {
    if (user?.email) {
      fetchUserRole(user.email);
    }
  }, [user?.email, fetchUserRole]);
  
  return <div>{isSuperAdmin ? 'Admin' : 'User'}</div>;
}
```

**Benefits:**
- Single source of truth for user role
- Prevents redundant API calls (cached by email)
- Shared across all components

### 2. `useProductsStore`
Manages product listing, filtering, pagination, and CRUD.

```tsx
import { useProductsStore } from '@/store';

function ProductsPage() {
  const {
    products,
    loading,
    searchQuery,
    categoryFilter,
    fetchProducts,
    setSearchQuery,
    setCategoryFilter,
    deleteProduct,
  } = useProductsStore();
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  return (
    <div>
      <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      {loading ? 'Loading...' : products.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  );
}
```

**Benefits:**
- Automatic refetch when filters change
- Centralized product CRUD logic
- Pagination handled automatically

### 3. `useDiscountsStore`
Manages discount listing, filtering, and CRUD.

```tsx
import { useDiscountsStore } from '@/store';

function DiscountsTab() {
  const {
    discounts,
    isLoading,
    fetchDiscounts,
    createDiscount,
    updateDiscount,
  } = useDiscountsStore();
  
  const handleCreate = async (data) => {
    await createDiscount(data);
    // Store automatically refetches and updates UI
  };
  
  return <DiscountList discounts={discounts} />;
}
```

### 4. `useInventoryStore`
Manages complex inventory operations, stock records, and store selection.

```tsx
import { useInventoryStore } from '@/store';

function InventoryPage() {
  const {
    stockRecords,
    selectedStoreId,
    loading,
    fetchStockRecords,
    setSelectedStore,
    startEditing,
    cancelEditing,
  } = useInventoryStore();
  
  // All the complex inventory logic is in the store!
  return <InventoryTable records={stockRecords} />;
}
```

**Benefits:**
- Handles complex reallocation logic
- Manages multiple modals and edit states
- Clean separation from UI

### 5. `useSalesReportStore`
Manages sales report filtering and data fetching.

```tsx
import { useSalesReportStore } from '@/store';

function SalesReport() {
  const {
    allSalesRecords,
    selectedMonth,
    selectedYear,
    setMonth,
    setYear,
    fetchSalesRecords,
  } = useSalesReportStore();
  
  return <ReportTable data={allSalesRecords} />;
}
```

### 6. `useStockReportStore` 
Manages both summary and detailed stock reports with tab switching.

```tsx
import { useStockReportStore } from '@/store';

function StockReports() {
  const {
    activeTab,
    summaryReports,
    detailedReports,
    setActiveTab,
    fetchSummaryReport,
    fetchDetailedReport,
  } = useStockReportStore();
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      {/* Store handles fetching based on active tab */}
    </Tabs>
  );
}
```

## Key Patterns

### 1. Selective Subscription
Only subscribe to the state you need to prevent unnecessary re-renders:

```tsx
// ✓ Good - only re-renders when loading changes
const loading = useProductsStore((state) => state.loading);

// ✗ Bad - re-renders on any store change
const store = useProductsStore();
```

### 2. Actions Don't Need Subscription
If you only need to call actions, you don't trigger re-renders:

```tsx
// This component won't re-render when store changes
function CreateButton() {
  const openDialog = useProductsStore((state) => state.openCreateDialog);
  return <button onClick={openDialog}>Create</button>;
}
```

### 3. Cross-Component Communication
Child components can call store actions directly:

```tsx
// Parent Component
function ProductsPage() {
  const products = useProductsStore((state) => state.products);
  return <ProductList products={products} />;
}

// Child Component (in a different file!)
function ProductCard({ product }) {
  const deleteProduct = useProductsStore((state) => state.deleteProduct);
  return <button onClick={() => deleteProduct(product.id)}>Delete</button>;
}
```

### 4. Automatic Refetching
Stores handle side effects automatically:

```tsx
// When you change a filter, it automatically refetches
setCategoryFilter('new-category'); // Store handles fetchProducts internally
```

## Migration Guide

### Before (Local State):
```tsx
function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  // ... 10 more useState calls
  
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    // ... 30 lines of fetch logic
  }, [categoryFilter, searchQuery, currentPage]);
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // ... 100 more lines
}
```

### After (Zustand):
```tsx
function Products() {
  const {
    products,
    loading,
    searchQuery,
    categoryFilter,
    fetchProducts,
    setSearchQuery,
    setCategoryFilter,
  } = useProductsStore();
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // That's it! Just render the UI
}
```

## Testing Benefits

Stores are much easier to test than components:

```tsx
import { useProductsStore } from '@/store';

describe('useProductsStore', () => {
  it('should fetch products on search query change', async () => {
    const { setSearchQuery, products } = useProductsStore.getState();
    
    await setSearchQuery('test');
    
    expect(products).toHaveLength(5);
  });
});
```

## Performance Considerations

1. **Selective subscriptions** prevent unnecessary re-renders
2. **Zustand is lightweight** (~1KB) and fast
3. **No provider needed** - stores work out of the box
4. **Automatic garbage collection** - unused stores don't consume memory

## When to Use Zustand vs Local State

**Use Zustand when:**
- State is shared across multiple components
- You have complex state logic (filters, pagination, etc.)
- You need to call actions from different files
- State management is becoming unwieldy

**Use local useState when:**
- State is truly local to one component (e.g., a dropdown open state)
- It's simple UI state that doesn't need sharing
- The component is a simple, isolated widget

## File Structure

```
src/
  store/
    index.ts                    # Barrel export of all stores
    useAuthStore.ts             # User authentication & permissions
    useProductsStore.ts         # Product management
    useDiscountsStore.ts        # Discount management
    useInventoryStore.ts        # Inventory management
    useSalesReportStore.ts      # Sales reporting
    useStockReportStore.ts      # Stock reporting
```

## Example Comparison

See `src/app/admin/products/page.refactored.example.tsx` for a side-by-side comparison of the refactored products page.

**Before**: 185 lines, 8 useStates, 4 useEffects, mixed concerns
**After**: 75 lines, clean UI composition, reusable logic

## Further Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand Best Practices](https://github.com/pmndrs/zustand/blob/main/docs/guides/practice-with-no-store-actions.md)
