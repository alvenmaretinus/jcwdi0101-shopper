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
import { useState , useEffect, useCallback } from 'react';
import { Product } from '@/types/Product';
import { authClient } from '@/lib/authClient';
import { getUserByEmail } from '@/services/user/getUserByEmail';



export default function Inventory() {
  const { data, isPending } = authClient.useSession();
  const sessionUser = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userStoreId, setUserStoreId] = useState<string>('');

  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

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
    // Fetch stores for the store filter dropdown
    if (!isSuperAdmin) return;
    
    const fetchStores = async () => {
        const apiInit: ApiInit = { method: HttpMethod.GET };
        try {
            // Add query parameters required by the backend
            const data = await apiFetch<any>(`/stores?page=1&pageSize=100`, apiInit);
            console.log('Stores API response:', data);
            console.log('Stores is array?', Array.isArray(data));
            console.log('Stores length:', data?.length);
            // The backend returns array directly
            setStores(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch stores:', error);
            console.error('This might be an authentication issue - /stores requires login');
            setStores([]);
        }
    };
    fetchStores();
  }, [isSuperAdmin]);

  useEffect(() => {
    const apiInit: ApiInit = {
        method: HttpMethod.GET,
    };
    const fetchStockRecords = async () => {
        try {
            let url = `/product?withStock=true`
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
            const data = await apiFetch<Product[]>(url, apiInit);
            console.log('Stock records API response:', data);
            setStockRecords(Array.isArray(data) ? data : []);
        }
        catch (error) {
            console.error('Failed to fetch stock records:', error);
            setStockRecords([]);
        }
    };
    fetchStockRecords();
  }, [selectedStoreId, searchQuery]);
            

  const startEditing = (productStoreId: string, quantity: number) => {
    setEditingId(productStoreId);
    setEditQuantity(quantity);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditQuantity(0);
  };

  const saveQuantity = async () => {
    if (!editingId) return;

    try {
      const apiInit: ApiInit = {
        method: HttpMethod.PATCH,
        body: { "quantity": editQuantity },
      };
      
      await apiFetch(`/product-store/${editingId}`, apiInit);
      
      // Update local state to reflect the change
      setStockRecords(prevRecords =>
        prevRecords.map(product => ({
          ...product,
          productStores: product.productStores?.map(ps =>
            ps.id === editingId ? { ...ps, quantity: editQuantity } : ps
          ),
        }))
      );
      
      setEditingId(null);
      setEditQuantity(0);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Manage product stock levels per store</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); setIsAddDialogOpen(false); }}>
              <div className="space-y-2">
                <Label>Product</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(stockRecords) && stockRecords.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isSuperAdmin && (
                <div className="space-y-2">
                  <Label>Store</Label>
                  <Select defaultValue={selectedStoreId !== 'all' ? selectedStoreId : undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(stores) && stores.map(store => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Initial Quantity</Label>
                <Input type="number" min={0} placeholder="e.g., 100" />
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
      </div>

      {/* Store Filter */}
      {isSuperAdmin && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label className="shrink-0">Select Store:</Label>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all" value="all">All Stores</SelectItem>
                  {Array.isArray(stores) && stores.map(store => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                                <Input
                                type="number"
                                min={0}
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(Number(e.target.value))}
                                className="w-24 h-8"
                                autoFocus
                                />
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
                                <Button size="sm" variant="ghost" onClick={() => startEditing(ps.id, ps.quantity)}>
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
      </Card>
    </div>
  );
}
