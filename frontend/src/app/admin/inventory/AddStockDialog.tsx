"use client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { apiFetch, ApiInit, HttpMethod } from '@/lib/apiFetch';
import { Product } from '@/types/Product';

interface AddStockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAddProduct: string;
  selectedAddProductName: string;
  setSelectedAddProduct: (id: string) => void;
  setSelectedAddProductName: (name: string) => void;
  selectedAddStore: string;
  setSelectedAddStore: (id: string) => void;
  addQuantity: number;
  setAddQuantity: (quantity: number) => void;
  isSuperAdmin: boolean;
  paginatedStores: any[];
  stores: any[];
  storesPage: number;
  setStoresPage: (page: number) => void;
  getTotalPages: (stores: any[]) => number;
  onProductSelect: () => void;
  currentPage: number;
  selectedStoreId: string;
  userStoreId: string;
  setProductsForDropdown: (products: Product[]) => void;
  setStores: (stores: any[]) => void;
  setStockRecords: (records: any[]) => void;
  setPagination: (pagination: any) => void;
  getStores: any;
}

export default function AddStockDialog({
  isOpen,
  onOpenChange,
  selectedAddProduct,
  selectedAddProductName,
  setSelectedAddProduct,
  setSelectedAddProductName,
  selectedAddStore,
  setSelectedAddStore,
  addQuantity,
  setAddQuantity,
  isSuperAdmin,
  paginatedStores,
  stores,
  storesPage,
  setStoresPage,
  getTotalPages,
  onProductSelect,
  currentPage,
  selectedStoreId,
  userStoreId,
  setProductsForDropdown,
  setStores,
  setStockRecords,
  setPagination,
  getStores,
}: AddStockDialogProps) {
  
  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with:', { selectedAddProduct, selectedAddStore, addQuantity, isSuperAdmin, userStoreId });
    
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
      
      console.log('Sending API request with body:', body);
      
      const apiInit: ApiInit = {
        method: HttpMethod.POST,
        body,
      };
      
      const result = await apiFetch(`/product-store`, apiInit);
      console.log('API response:', result);
      
      // Reset form and close dialog
      setSelectedAddProduct('');
      setSelectedAddStore('');
      setAddQuantity(0);
      onOpenChange(false);
      
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
      alert(`Failed to add stock: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
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
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal"
              onClick={onProductSelect}
            >
              {selectedAddProductName || 'Select a product'}
            </Button>
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
                            setStoresPage(Math.max(1, storesPage - 1));
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
                            setStoresPage(Math.min(getTotalPages(stores), storesPage + 1));
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Stock</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
