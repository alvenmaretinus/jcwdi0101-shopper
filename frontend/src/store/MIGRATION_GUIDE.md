# Quick Migration Guide for Your Components

## Overview
Here's exactly how to refactor each of your components using the new Zustand stores.

---

## 1. Admin Products Page

### Current Issues:
- 185 lines of code
- Managing 8+ pieces of state locally
- Mixing data fetching with UI logic

### Solution:
```tsx
'use client'
import { useEffect } from 'react';
import { authClient } from '@/lib/authClient';
import { useAuthStore, useProductsStore } from '@/store';
import ProductForm from './_components/_product-form/product-form';
import ProductsCard from './_components/_products-card/products-card';
import { Pagination } from '@/components/Pagination/Pagination';

export default function Products() {
  const { data } = authClient.useSession();
  const { isSuperAdmin, fetchUserRole } = useAuthStore();
  const {
    products,
    categories,
    loading,
    isDialogOpen,
    editingProduct,
    searchQuery,
    categoryFilter,
    pagination,
    fetchProducts,
    fetchCategories,
    setSearchQuery,
    setCategoryFilter,
    setCurrentPage,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    deleteProduct,
  } = useProductsStore();

  useEffect(() => {
    if (data?.user?.email) {
      fetchUserRole(data.user.email);
    }
  }, [data?.user?.email]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            {isSuperAdmin ? 'Manage product catalog' : 'View product catalog'}
          </p>
        </div>
        {isSuperAdmin && (
          <ProductForm
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={closeDialog}
            editingProduct={editingProduct}
            handleCreate={openCreateDialog}
            onCreated={fetchProducts}
            categories={categories}
          />
        )}
      </div>
      
      <ProductsCard 
        products={products}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        isSuperAdmin={isSuperAdmin}
        handleEdit={openEditDialog}
        handleDelete={deleteProduct}
        onPageChange={setCurrentPage}
      />
      
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onChange={setCurrentPage}
      />
    </div>
  );
}
```

**Reduction: 185 lines → 70 lines (62% smaller!)**

---

## 2. Admin Discounts (DiscountsTab Component)

### Current Issues:
- 678 lines in one file
- Complex form handling
- State management mixed with UI

### Solution:
```tsx
'use client'
import { useEffect } from 'react';
import { useDiscountsStore } from '@/store';
import { toast } from 'sonner';
import DiscountsList from './DiscountsList';
import DiscountForm from './DiscountForm';

export function DiscountsTab() {
  const {
    discounts,
    isLoading,
    isDialogOpen,
    editingDiscount,
    searchQuery,
    typeFilter,
    pagination,
    fetchDiscounts,
    setSearchQuery,
    setTypeFilter,
    setCurrentPage,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    createDiscount,
    updateDiscount,
    deleteDiscount,
  } = useDiscountsStore();

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleSubmit = async (data) => {
    try {
      if (editingDiscount) {
        await updateDiscount(editingDiscount.id, data);
        toast.success('Discount updated successfully');
      } else {
        await createDiscount(data);
        toast.success('Discount created successfully');
      }
    } catch (error) {
      toast.error('Failed to save discount');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDiscount(id);
      toast.success('Discount deleted');
    } catch {
      toast.error('Failed to delete discount');
    }
  };

  return (
    <>
      <DiscountForm
        isOpen={isDialogOpen}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        initialData={editingDiscount}
      />
      
      <DiscountsList
        discounts={discounts}
        isLoading={isLoading}
        searchQuery={searchQuery}
        typeFilter={typeFilter}
        onSearchChange={setSearchQuery}
        onTypeFilterChange={setTypeFilter}
        onEdit={openEditDialog}
        onDelete={handleDelete}
        onCreate={openCreateDialog}
        pagination={pagination}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
```

**Key benefit:** All the complex logic is now in the store, this component just orchestrates UI.

---

## 3. Admin Inventory Page

### Current Issues:
- 416+ lines 
- Managing 20+ pieces of state
- Complex editing and reallocation logic
- Too many responsibilities

### Solution:
```tsx
'use client'
import { useEffect } from 'react';
import { authClient } from '@/lib/authClient';
import { useAuthStore, useInventoryStore } from '@/store';
import AddStockDialog from './_components/AddStockDialog';
import StoreFilter from './_components/StoreFilter';
import InventoryTable from './_components/InventoryTable';

export default function Inventory() {
  const { data } = authClient.useSession();
  const { isSuperAdmin, userStoreId, fetchUserRole } = useAuthStore();
  const {
    stockRecords,
    stores,
    loading,
    selectedStoreId,
    selectedStoreName,
    searchQuery,
    pagination,
    isAddDialogOpen,
    // ... other state and actions from store
    fetchStockRecords,
    fetchStores,
    setSelectedStore,
    setSearchQuery,
    setCurrentPage,
    openAddDialog,
    closeAddDialog,
  } = useInventoryStore();

  useEffect(() => {
    if (data?.user?.email) {
      fetchUserRole(data.user.email);
    }
  }, [data?.user?.email]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchStores();
      setSelectedStore('all', 'All Stores');
    } else if (userStoreId) {
      setSelectedStore(userStoreId, '');
    }
  }, [isSuperAdmin, userStoreId]);

  useEffect(() => {
    if (selectedStoreId) {
      fetchStockRecords();
    }
  }, [selectedStoreId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        {isSuperAdmin && (
          <button onClick={openAddDialog}>Add Stock</button>
        )}
      </div>

      <StoreFilter
        stores={stores}
        selectedStoreId={selectedStoreId}
        onStoreChange={setSelectedStore}
      />

      <InventoryTable
        records={stockRecords}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pagination={pagination}
        onPageChange={setCurrentPage}
      />

      <AddStockDialog
        isOpen={isAddDialogOpen}
        onClose={closeAddDialog}
      />
    </div>
  );
}
```

**Reduction: 416 lines → ~100 lines (75% smaller!)**

---

## 4. Admin Sales Report

### Current Issues:
- Complex filter management
- Multiple dependent state updates
- Date/category/store filtering logic mixed with UI

### Solution:
```tsx
'use client'
import { useEffect } from 'react';
import { useAuthStore, useSalesReportStore } from '@/store';
import { authClient } from '@/lib/authClient';
import { SalesReportHeader } from './_components/SalesReportHeader';
import { SalesReportCard } from './_components/SalesReportCard';

export default function SalesReport() {
  const { data } = authClient.useSession();
  const { isSuperAdmin, userStoreId, fetchUserRole } = useAuthStore();
  const {
    allSalesRecords,
    selectedStoreName,
    selectedMonth,
    selectedYear,
    selectedCategoryName,
    productSearch,
    pagination,
    fetchSalesRecords,
    setStoreSelection,
    setCategorySelection,
    setMonth,
    setYear,
    setProductSearch,
    setCurrentPage,
  } = useSalesReportStore();

  useEffect(() => {
    if (data?.user?.email) {
      fetchUserRole(data.user.email);
    }
  }, [data?.user?.email]);

  useEffect(() => {
    fetchSalesRecords();
  }, []);

  return (
    <div className="space-y-6">
      <SalesReportHeader
        isSuperAdmin={isSuperAdmin}
        selectedStoreName={selectedStoreName}
        onStoreSelect={(store) => 
          setStoreSelection(store?.id || 'all', store?.name || 'All Stores')
        }
      />
      
      <SalesReportCard
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedCategoryName={selectedCategoryName}
        productSearch={productSearch}
        allSalesRecords={allSalesRecords}
        pagination={pagination}
        onMonthChange={setMonth}
        onYearChange={setYear}
        onCategoryChange={(cat) => 
          setCategorySelection(cat?.id || '', cat?.name || '')
        }
        onSearchChange={setProductSearch}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
```

---

## 5. Admin Stock Reports

### Current Issues:
- Managing two different tabs with different data
- Complex pagination for each tab
- Store/product selection logic

### Solution:
```tsx
'use client'
import { useEffect } from 'react';
import { useAuthStore, useStockReportStore } from '@/store';
import { authClient } from '@/lib/authClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SummaryReportTab } from './_components/SummaryReportTab';
import { DetailedReportTab } from './_components/DetailedReportTab';

export default function StockReports() {
  const { data } = authClient.useSession();
  const { isSuperAdmin, userStoreId, fetchUserRole } = useAuthStore();
  const {
    activeTab,
    selectedStoreId,
    summaryReports,
    detailedReports,
    isSummaryLoading,
    isDetailedLoading,
    setActiveTab,
    setStoreSelection,
    setReportMonth,
    setReportYear,
    setProductForDetail,
    setSummaryPage,
    setDetailedPage,
  } = useStockReportStore();

  useEffect(() => {
    if (data?.user?.email) {
      fetchUserRole(data.user.email);
    }
  }, [data?.user?.email]);

  useEffect(() => {
    if (isSuperAdmin) {
      setStoreSelection('all', 'All Stores');
    } else if (userStoreId) {
      setStoreSelection(userStoreId, '');
    }
  }, [isSuperAdmin, userStoreId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stock Reports</h1>
        <p className="text-muted-foreground">
          View inventory summary and detailed movement history
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as any)}>
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <SummaryReportTab
            reports={summaryReports}
            isLoading={isSummaryLoading}
            onMonthChange={setReportMonth}
            onYearChange={setReportYear}
            onPageChange={setSummaryPage}
          />
        </TabsContent>

        <TabsContent value="detailed">
          <DetailedReportTab
            reports={detailedReports}
            isLoading={isDetailedLoading}
            onProductSelect={(id, name) => setProductForDetail(id, name)}
            onMonthChange={setReportMonth}
            onYearChange={setReportYear}
            onPageChange={setDetailedPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 6. User Products Page (ProductsList)

### Note:
This component uses Next.js server-side rendering and URL-based state (which is good!). You generally don't need Zustand here since the URL is the source of truth. However, if you need to share product state across multiple client components, you could use it.

---

## Benefits Summary

### Before Zustand:
- ❌ Each page: 200-400+ lines
- ❌ 10-20 useState calls per component
- ❌ Complex useEffect dependencies
- ❌ Logic duplicated across components
- ❌ Hard to test
- ❌ Can't call functions from child components easily

### After Zustand:
- ✅ Each page: 50-100 lines
- ✅ Single store import
- ✅ Simple useEffect or none at all
- ✅ Centralized, reusable logic
- ✅ Easy to test stores independently
- ✅ Any component can call store actions

---

## Key Takeaway

**Yes, you were doing too much in one component!** Zustand solves this by:

1. **Centralizing state**: One place for all product/discount/inventory state
2. **Extracting logic**: Move complex functions to stores
3. **Enabling cross-component calls**: Child components can directly call store actions
4. **Simplifying components**: Components become thin UI layers

You can now call state-handling functions from **any component, even in different files**, because Zustand stores are global singletons that any component can import and use.
