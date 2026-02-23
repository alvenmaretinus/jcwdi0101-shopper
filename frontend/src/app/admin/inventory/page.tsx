"use client";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Package, Pencil, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { apiFetch, ApiInit, HttpMethod } from '@/lib/apiFetch';
import { useState, useEffect } from 'react';
import { Product } from '@/types/Product';
import { authClient } from '@/lib/authClient';
import { getUserByEmail } from '@/services/user/getUserByEmail';
import { getStores } from '@/services/store/getStores';
import { Pagination } from '@/components/Pagination/Pagination';


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
  
  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAddProduct) {
      alert('Please select a product');
      return;
    }
    
    const storeId = isSuperAdmin ? selectedAddStore : userStoreId;
    if (!storeId) {
      alert('Please select a store');
      return;
    }
    
    if (addQuantity <= 0) {
      alert('Please enter a quantity greater than 0');
      return;
    }
    
    try {
      const body = {
        productId: selectedAddProduct,
        storeId: storeId,
        quantity: addQuantity,
      };
      
      const apiInit: ApiInit = {
        method: HttpMethod.POST,
        body,
      };
      
      await apiFetch(`/product-store`, apiInit);
      
      // Reset form and close dialog
      setSelectedAddProduct('');
      setSelectedAddStore('');
      setAddQuantity(0);
      setIsAddDialogOpen(false);
      
      // Refresh stock records
      const url = `/product?withStock=true&page=${currentPage}&limit=20&storeId=${selectedStoreId !== 'all' ? selectedStoreId : userStoreId}`;
      const response = await apiFetch<any>(url, { method: HttpMethod.GET });
      if (response && 'data' in response && 'meta' in response) {
        setStockRecords(Array.isArray(response.data) ? response.data : []);
        setPagination(response.meta);
      }
      
      alert('Stock added successfully');
    } catch (error) {
      console.error('Failed to add stock:', error);
      alert('Failed to add stock. Please try again.');
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

  const handleStoreFilterSelect = (storeId: string, storeName: string) => {
    setSelectedStoreId(storeId);
    setSelectedStoreName(storeName);
    setIsStoreFilterModalOpen(false);
    setStoresPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Manage product stock levels per store</p>
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (open) {
          // Fetch products when modal opens
          const fetchProducts = async () => {
            try {
              const apiInit: ApiInit = { method: HttpMethod.GET };
              const response = await apiFetch<any>('/product?page=1&limit=100', apiInit);
              const productsData = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
              setProductsForDropdown(productsData);
            } catch (error) {
              console.error('Failed to fetch products:', error);
              setProductsForDropdown([]);
            }
          };
          fetchProducts();

          if (isSuperAdmin) {
            // Fetch stores when modal opens
            const fetchAllStores = async () => {
              try {
                const response = await getStores();
                const storesData = Array.isArray(response) ? response : response?.data || [];
                setStores(storesData);
              } catch (error) {
                console.error('Failed to fetch stores for modal:', error);
                setStores([]);
              }
            };
            fetchAllStores();
          }
        } else if (!open) {
          // Reset form when closing
          setSelectedAddProduct('');
          setSelectedAddStore('');
          setAddQuantity(0);
        }
      }}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Product Stock</DialogTitle>
            <DialogDescription>
              Assign a product to a store with an initial quantity
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleAddStock}>
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={selectedAddProduct} onValueChange={setSelectedAddProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {getPaginatedStores(productsForDropdown, productsPage).map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                  {getTotalPages(productsForDropdown) > 1 && (
                    <div className="border-t p-2 space-y-1">
                      <div className="text-xs text-gray-500 px-2">Page {productsPage} of {getTotalPages(productsForDropdown)}</div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setProductsPage(p => Math.max(1, p - 1));
                          }}
                          disabled={productsPage === 1}
                          className="flex-1 text-xs px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setProductsPage(p => Math.min(getTotalPages(productsForDropdown), p + 1));
                          }}
                          disabled={productsPage === getTotalPages(productsForDropdown)}
                          className="flex-1 text-xs px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            {isSuperAdmin && (
              <div className="space-y-2">
                <Label>Store</Label>
                <Select value={selectedAddStore} onValueChange={setSelectedAddStore}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    {paginatedStores.map(store => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                    {getTotalPages(stores) > 1 && (
                      <div className="border-t p-2 space-y-1">
                        <div className="text-xs text-gray-500 px-2">Page {storesPage} of {getTotalPages(stores)}</div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setStoresPage(p => Math.max(1, p - 1));
                            }}
                            disabled={storesPage === 1}
                            className="flex-1 text-xs px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setStoresPage(p => Math.min(getTotalPages(stores), p + 1));
                            }}
                            disabled={storesPage === getTotalPages(stores)}
                            className="flex-1 text-xs px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Initial Quantity</Label>
              <Input type="number" min={0} value={addQuantity} onChange={(e) => setAddQuantity(Number(e.target.value))} placeholder="e.g., 100" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Stock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Store Filter */}
      {isSuperAdmin && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label className="shrink-0">Select Store:</Label>
              <Button
                type="button"
                variant="outline"
                className="w-64 justify-start text-left font-normal"
                onClick={() => setIsStoreFilterModalOpen(true)}
              >
                {selectedStoreName || 'Select a store'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                {selectedStoreId === 'all' && <TableHead>Store</TableHead>}
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={selectedStoreId === 'all' ? 6 : 5} className="text-center text-muted-foreground py-8">
                    No stock records found
                  </TableCell>
                </TableRow>
              ) : (
                stockRecords.map((stock) => (
                    stock.productStores?.map((ps) => (
                        <TableRow key={ps.id}>
                            <TableCell>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <span className="font-medium">{stock.name}</span>
                            </div>
                            </TableCell>
                            {selectedStoreId === 'all' && (
                            <TableCell>{ps.store.name}</TableCell>
                            )}
                            <TableCell>
                            {editingId === ps.id ? (
                                <div className="space-y-2">
                                <Input
                                type="number"
                                min={0}
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(Number(e.target.value))}
                                className="w-24 h-8"
                                autoFocus
                                placeholder="Quantity"
                                />
                                <Select value={editMovementType} onValueChange={(value) => {
                                  setEditMovementType(value);
                                  if (value === 'REALLOCATED') {
                                    setIsReallocationMode(true);
                                  } else {
                                    setIsReallocationMode(false);
                                    setTargetStoreId('');
                                  }
                                }}>
                                  <SelectTrigger className="w-80 h-8 text-xs">
                                    <SelectValue placeholder="Movement type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                                    <SelectItem value="PURCHASED">Purchased</SelectItem>
                                    <SelectItem value="SOLD">Sold</SelectItem>
                                    {isSuperAdmin && <SelectItem value="REALLOCATED">Reallocated (Super Admin)</SelectItem>}
                                    <SelectItem value="CANCELED">Canceled</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                type="text"
                                value={editMovementMessage}
                                onChange={(e) => setEditMovementMessage(e.target.value)}
                                className="w-80 h-8 text-xs"
                                placeholder="Reason for stock change (optional)"
                                />
                                {isReallocationMode && (
                                  <div className="space-y-2 border-t pt-2">
                                    <div>
                                      <Label className="text-xs">Select Target Store</Label>
                                      <div className="mt-1 max-h-48 overflow-y-auto border rounded p-2">
                                        {paginatedReallocateStores.length > 0 ? (
                                          paginatedReallocateStores.map((store) => (
                                            <div
                                              key={store.id}
                                              onClick={() => setTargetStoreId(store.id)}
                                              className={`cursor-pointer p-2 rounded text-sm mb-1 ${
                                                targetStoreId === store.id
                                                  ? 'bg-blue-500 text-white'
                                                  : 'bg-gray-100 hover:bg-gray-200'
                                              }`}
                                            >
                                              {store.name}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-xs text-gray-500">No stores available</div>
                                        )}
                                      </div>
                                      {getTotalPages(storesForReallocation) > 1 && (
                                        <div className="mt-2 space-y-1 border-t pt-2">
                                          <div className="text-xs text-gray-500 px-1">Page {reallocateStoresPage} of {getTotalPages(storesForReallocation)}</div>
                                          <div className="flex gap-1">
                                            <button
                                              type="button"
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setReallocateStoresPage(p => Math.max(1, p - 1));
                                              }}
                                              disabled={reallocateStoresPage === 1}
                                              className="flex-1 text-xs px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              Previous
                                            </button>
                                            <button
                                              type="button"
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setReallocateStoresPage(p => Math.min(getTotalPages(storesForReallocation), p + 1));
                                              }}
                                              disabled={reallocateStoresPage === getTotalPages(storesForReallocation)}
                                              className="flex-1 text-xs px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              Next
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    {targetStoreId && (
                                      <div className="text-xs text-blue-600 flex items-center gap-1">
                                        ✓ Selected: {storesForReallocation.find(s => s.id === targetStoreId)?.name}
                                      </div>
                                    )}
                                    {targetStoreId && (
                                      <div className="text-xs text-gray-600">
                                        Decrease quantity above to reallocate stock to {storesForReallocation.find(s => s.id === targetStoreId)?.name}
                                      </div>
                                    )}
                                  </div>
                                )}
                                </div>
                            ) : (
                                <span className="font-medium">{ps.quantity}</span>
                            )}
                            </TableCell>
                            <TableCell>
                            {(editingId === ps.id ? editQuantity : ps.quantity) === 0 ? (
                                <Badge variant="destructive">Out of Stock</Badge>
                            ) : (editingId === ps.id ? editQuantity : ps.quantity) <= 10 ? (
                                <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
                            ) : (
                                <Badge variant="secondary">In Stock</Badge>
                            )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                            {format(stock.updatedAt, 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell className="text-right">
                            {editingId === ps.id ? (
                                <div className="flex items-center justify-end gap-1">
                                <Button size="sm" variant="ghost" onClick={saveQuantity}>
                                    <Save className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={cancelEditing}>
                                    <X className="h-4 w-4" />
                                </Button>
                                </div>
                            ) : (
                                <Button size="sm" variant="ghost" onClick={() => startEditing(ps.id, ps.quantity, ps.storeId)}>
                                <Pencil className="h-4 w-4" />
                                </Button>
                            )}
                            </TableCell>
                        </TableRow>
                        )
                    )
              )))}
            </TableBody>
          </Table>
        </CardContent>
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onChange={setCurrentPage}
        />
      </Card>

      {/* Store Filter Modal */}
      <Dialog open={isStoreFilterModalOpen} onOpenChange={setIsStoreFilterModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Store</DialogTitle>
            <DialogDescription>
              Choose a store to filter the inventory
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <div className="divide-y">
                  <button
                    onClick={() => handleStoreFilterSelect('all', 'All Stores')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  >
                    <span className="font-medium">All Stores</span>
                    {selectedStoreId === 'all' && (
                      <Badge variant="default" className="ml-2">Selected</Badge>
                    )}
                  </button>
                  {paginatedStores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => handleStoreFilterSelect(store.id, store.name)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                    >
                      <span className="font-medium">{store.name}</span>
                      {selectedStoreId === store.id && (
                        <Badge variant="default" className="ml-2">Selected</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {getTotalPages(stores) > 1 && (
                <div className="border-t bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {storesPage} of {getTotalPages(stores)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStoresPage(p => Math.max(1, p - 1))}
                        disabled={storesPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStoresPage(p => Math.min(getTotalPages(stores), p + 1))}
                        disabled={storesPage === getTotalPages(stores)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

