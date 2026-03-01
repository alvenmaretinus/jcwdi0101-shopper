"use client";
import { useState, useEffect } from 'react';
import { apiFetch, ApiInit, HttpMethod } from '@/lib/apiFetch';
import { authClient } from '@/lib/authClient';
import { getUserByEmail } from '@/services/user/getUserByEmail';
import { getStores } from '@/services/store/getStores';
import { getProducts, ProductWithDetails } from '@/services/product/getProducts';
import { Product } from '@/types/Product';
import AddStockDialog from './_components/AddStockDialog';
import StoreFilter from './_components/StoreFilter';
import InventoryTable from './_components/InventoryTable';
import InventoryModals from './_components/InventoryModals';


export default function Inventory() {
  const { data, isPending } = authClient.useSession();
  const sessionUser = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userStoreId, setUserStoreId] = useState<string>('');

  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');
  const [isStoreFilterModalOpen, setIsStoreFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAddProduct, setSelectedAddProduct] = useState<string>('');
  const [selectedAddProductName, setSelectedAddProductName] = useState<string>('');
  const [selectedAddStore, setSelectedAddStore] = useState<string>('');
  const [addQuantity, setAddQuantity] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStoreId, setEditingStoreId] = useState<string>('');
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [originalQuantity, setOriginalQuantity] = useState<number>(0);
  const [editMovementMessage, setEditMovementMessage] = useState<string>('');
  const [editMovementType, setEditMovementType] = useState<string>('ADJUSTMENT');
  const [isReallocationMode, setIsReallocationMode] = useState(false);
  const [targetStoreId, setTargetStoreId] = useState<string>('');
  const [storesForReallocation, setStoresForReallocation] = useState<any[]>([]);
  const [storesPage, setStoresPage] = useState(1);
  const [reallocateStoresPage, setReallocateStoresPage] = useState(1);
  const [productsForDropdown, setProductsForDropdown] = useState<Product[]>([]);
  const [productsPage, setProductsPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Map mock data to the API shape
  const [stockRecords, setStockRecords] = useState<Product[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!isPending && sessionUser) {
        const userData = await getUserByEmail(sessionUser.email);
        if (userData?.role === 'SUPERADMIN') {
          setIsSuperAdmin(true);
          setSelectedStoreId('all'); // Superadmin can view all stores
          setSelectedStoreName('All Stores');
        }
        if (userData?.storeId) {
          setUserStoreId(userData.storeId);
          if (userData.role !== 'SUPERADMIN') {
            setSelectedStoreId(userData.storeId);
          }
        }
      }
    };
    fetchUserRole();
  }, [sessionUser, isPending]);

  useEffect(() => {
    // Fetch all stores for super admin
    if (isSuperAdmin) {
      const fetchAllStores = async () => {
        try {
          const response = await getStores();
          console.log('getStores response:', response);
          const storesData = Array.isArray(response) ? response : response?.data || [];
          console.log('Processed stores:', storesData);
          setStores(storesData);
        } catch (error) {
          console.error('Failed to fetch stores:', error);
          setStores([]);
        }
      };
      fetchAllStores();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    // Fetch all stores for reallocation modal when in reallocation mode
    if (isReallocationMode && isSuperAdmin) {
      const fetchStoresForReallocation = async () => {
        try {
          const response = await getStores();
          setStoresForReallocation(response.data || []);
        } catch (error) {
          console.error('Failed to fetch stores for reallocation:', error);
          setStoresForReallocation([]);
        }
      };
      fetchStoresForReallocation();
    }
  }, [isReallocationMode, isSuperAdmin]);

  useEffect(() => {
    const apiInit: ApiInit = {
        method: HttpMethod.GET,
    };
    const fetchStockRecords = async () => {
        try {
            let url = `/product?withStock=true&page=${currentPage}&limit=20`
            console.log('Selected store ID for fetching stock records:', selectedStoreId);
            console.log('Session user:', sessionUser);
            if (selectedStoreId === '') {
              return; // Don't fetch if store ID is not set yet
            }
            if (selectedStoreId !== 'all') {
                url += `&storeId=${selectedStoreId}`;
            }
            if (searchQuery.trim() !== '') {
                url += `&name=${searchQuery}`;
            }
            console.log('Fetching stock records with URL:', url);
            const response = await apiFetch<any>(url, apiInit);
            console.log('Stock records API response:', response);
            // Check if response has data and meta properties (paginated response)
            if (response && 'data' in response && 'meta' in response) {
                setStockRecords(Array.isArray(response.data) ? response.data : []);
                setPagination(response.meta);
            } else {
                // Fallback for non-paginated response
                setStockRecords(Array.isArray(response) ? response : []);
            }
        }
        catch (error) {
            console.error('Failed to fetch stock records:', error);
            setStockRecords([]);
        }
    };
    fetchStockRecords();
  }, [selectedStoreId, searchQuery, sessionUser, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStoreId]);

  // Pagination helper for stores
  const getPaginatedStores = (storesList: any[], page: number) => {
    const startIdx = (page - 1) * ITEMS_PER_PAGE;
    return storesList.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  };

  const getTotalPages = (storesList: any[]) => Math.ceil(storesList.length / ITEMS_PER_PAGE);

  const paginatedStores = getPaginatedStores(stores, storesPage);
  const paginatedReallocateStores = getPaginatedStores(storesForReallocation, reallocateStoresPage);

  // Reset pagination when stores change
  useEffect(() => {
    setStoresPage(1);
  }, [stores]);

  useEffect(() => {
    setReallocateStoresPage(1);
  }, [storesForReallocation]);

  useEffect(() => {
    setProductsPage(1);
  }, [productsForDropdown]);

  const handleProductSelect = (product: ProductWithDetails | null) => {
    if (product) {
      setSelectedAddProduct(product.id);
      setSelectedAddProductName(product.name);
    } else {
      setSelectedAddProduct('');
      setSelectedAddProductName('');
    }
  };

  const startEditing = (productStoreId: string, quantity: number, storeId: string) => {
    setEditingId(productStoreId);
    setEditingStoreId(storeId);
    setEditQuantity(quantity);
    setOriginalQuantity(quantity);
    setEditMovementMessage('');
    setEditMovementType('ADJUSTMENT');
    setIsReallocationMode(false);
    setTargetStoreId('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingStoreId('');
    setEditQuantity(0);
    setOriginalQuantity(0);
    setEditMovementMessage('');
    setEditMovementType('ADJUSTMENT');
    setIsReallocationMode(false);
    setTargetStoreId('');
  };

  const saveQuantity = async () => {
    if (!editingId) return;

    try {
      // Handle reallocation
      if (editMovementType === 'REALLOCATED') {
        if (!isSuperAdmin) {
          alert('Only super admins can reallocate stock between stores');
          return;
        }
        if (!targetStoreId) {
          alert('Please select a target store for reallocation');
          return;
        }
        
        const transferQuantity = originalQuantity - editQuantity;
        if (transferQuantity <= 0) {
          alert('Decrease the quantity to reallocate stock to the target store');
          return;
        }

        const body: any = {
          "toStoreId": targetStoreId,
          "transferQuantity": transferQuantity,
          "fromStoreId": editingStoreId,
          "movementType": 'REALLOCATED'
        };
        if (editMovementMessage.trim() !== '') {
          body.movementMessage = editMovementMessage.trim();
        }

        const apiInit: ApiInit = {
          method: HttpMethod.PATCH,
          body,
        };

        await apiFetch(`/product-store/${editingId}`, apiInit);
        alert('Stock reallocated successfully');
      } else {
        // Handle regular stock adjustment
        const body: any = { "quantity": editQuantity, "movementType": editMovementType };
        if (editMovementMessage.trim() !== '') {
          body.movementMessage = editMovementMessage.trim();
        }
        
        const apiInit: ApiInit = {
          method: HttpMethod.PATCH,
          body,
        };
        
        await apiFetch(`/product-store/${editingId}`, apiInit);
      }
      
      // Refresh stock records
      const url = `/product?withStock=true&page=${currentPage}&limit=20&storeId=${selectedStoreId !== 'all' ? selectedStoreId : userStoreId}`;
      const response = await apiFetch<any>(url, { method: HttpMethod.GET });
      if (response && 'data' in response && 'meta' in response) {
        setStockRecords(Array.isArray(response.data) ? response.data : []);
        setPagination(response.meta);
      }
      
      setEditingId(null);
      setEditingStoreId('');
      setEditQuantity(0);
      setOriginalQuantity(0);
      setEditMovementMessage('');
      setEditMovementType('ADJUSTMENT');
      setIsReallocationMode(false);
      setTargetStoreId('');
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const handleStoreFilterSelect = (store: { id: string; name: string } | null) => {
    if (!store) {
      setSelectedStoreId('all');
      setSelectedStoreName('All Stores');
      return;
    }

    setSelectedStoreId(store.id);
    setSelectedStoreName(store.name);
  };

  const getStoresForSelection = async ({
    name,
    page,
    limit,
  }: {
    name: string | undefined;
    page: number;
    limit: number;
  }) => {
    const response = await getStores({
      query: {
        page,
        search: name,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    });

    return {
      data: (response.data || []).map((store) => ({ id: store.id, name: store.name })),
      meta: response.meta,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Manage product stock levels per store</p>
        </div>
      </div>

      <AddStockDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        selectedAddProduct={selectedAddProduct}
        selectedAddProductName={selectedAddProductName}
        setSelectedAddProduct={setSelectedAddProduct}
        setSelectedAddProductName={setSelectedAddProductName}
        selectedAddStore={selectedAddStore}
        setSelectedAddStore={setSelectedAddStore}
        addQuantity={addQuantity}
        setAddQuantity={setAddQuantity}
        isSuperAdmin={isSuperAdmin}
        paginatedStores={paginatedStores}
        stores={stores}
        storesPage={storesPage}
        setStoresPage={setStoresPage}
        getTotalPages={getTotalPages}
        onProductSelect={() => setIsProductModalOpen(true)}
        currentPage={currentPage}
        selectedStoreId={selectedStoreId}
        userStoreId={userStoreId}
        setProductsForDropdown={setProductsForDropdown}
        setStores={setStores}
        setStockRecords={setStockRecords}
        setPagination={setPagination}
        getStores={getStores}
      />

      <StoreFilter
        isSuperAdmin={isSuperAdmin}
        selectedStoreName={selectedStoreName}
        onOpenChange={setIsStoreFilterModalOpen}
      />

      <InventoryTable
        stockRecords={stockRecords}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pagination={pagination}
        onPageChange={setCurrentPage}
        selectedStoreId={selectedStoreId}
        editingId={editingId}
        editingStoreId={editingStoreId}
        editQuantity={editQuantity}
        setEditQuantity={setEditQuantity}
        editMovementMessage={editMovementMessage}
        setEditMovementMessage={setEditMovementMessage}
        editMovementType={editMovementType}
        setEditMovementType={setEditMovementType}
        isReallocationMode={isReallocationMode}
        setIsReallocationMode={setIsReallocationMode}
        targetStoreId={targetStoreId}
        setTargetStoreId={setTargetStoreId}
        paginatedReallocateStores={paginatedReallocateStores}
        storesForReallocation={storesForReallocation}
        reallocateStoresPage={reallocateStoresPage}
        setReallocateStoresPage={setReallocateStoresPage}
        getTotalPages={getTotalPages}
        originalQuantity={originalQuantity}
        isSuperAdmin={isSuperAdmin}
        onStartEditing={startEditing}
        onSaveQuantity={saveQuantity}
        onCancelEditing={cancelEditing}
        currentPage={currentPage}
        userStoreId={userStoreId}
        setStockRecords={setStockRecords}
        setPagination={setPagination}
      />

      <InventoryModals
        isProductModalOpen={isProductModalOpen}
        onProductModalOpenChange={setIsProductModalOpen}
        onProductSelect={handleProductSelect}
        selectedProductId={selectedAddProduct}
        getProducts={getProducts}
        
        isStoreFilterModalOpen={isStoreFilterModalOpen}
        onStoreFilterModalOpenChange={setIsStoreFilterModalOpen}
        onStoreFilterSelect={handleStoreFilterSelect}
        selectedStoreId={selectedStoreId}
        getStoresForSelection={getStoresForSelection}
      />
    </div>
  );
}

