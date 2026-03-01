"use client";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pencil, Save, X, Search, Package } from 'lucide-react';
import { format } from 'date-fns';
import { apiFetch, ApiInit, HttpMethod } from '@/lib/apiFetch';
import { Pagination } from '@/components/Pagination/Pagination';
import { Product } from '@/types/Product';

interface InventoryTableProps {
  stockRecords: Product[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  selectedStoreId: string;
  editingId: string | null;
  editingStoreId: string;
  editQuantity: number;
  setEditQuantity: (quantity: number) => void;
  editMovementMessage: string;
  setEditMovementMessage: (message: string) => void;
  editMovementType: string;
  setEditMovementType: (type: string) => void;
  isReallocationMode: boolean;
  setIsReallocationMode: (mode: boolean) => void;
  targetStoreId: string;
  setTargetStoreId: (storeId: string) => void;
  paginatedReallocateStores: any[];
  storesForReallocation: any[];
  reallocateStoresPage: number;
  setReallocateStoresPage: (page: number) => void;
  getTotalPages: (stores: any[]) => number;
  originalQuantity: number;
  isSuperAdmin: boolean;
  onStartEditing: (productStoreId: string, quantity: number, storeId: string) => void;
  onSaveQuantity: () => void;
  onCancelEditing: () => void;
  currentPage: number;
  userStoreId: string;
  setStockRecords: (records: any[]) => void;
  setPagination: (pagination: any) => void;
}

export default function InventoryTable({
  stockRecords,
  searchQuery,
  onSearchChange,
  pagination,
  onPageChange,
  selectedStoreId,
  editingId,
  editingStoreId,
  editQuantity,
  setEditQuantity,
  editMovementMessage,
  setEditMovementMessage,
  editMovementType,
  setEditMovementType,
  isReallocationMode,
  setIsReallocationMode,
  targetStoreId,
  setTargetStoreId,
  paginatedReallocateStores,
  storesForReallocation,
  reallocateStoresPage,
  setReallocateStoresPage,
  getTotalPages,
  originalQuantity,
  isSuperAdmin,
  onStartEditing,
  onSaveQuantity,
  onCancelEditing,
  currentPage,
  userStoreId,
  setStockRecords,
  setPagination,
}: InventoryTableProps) {
  
  return (
    <Card>
      <CardHeader>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
                                          setReallocateStoresPage(Math.max(1, reallocateStoresPage - 1));
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
                                          setReallocateStoresPage(Math.min(getTotalPages(storesForReallocation), reallocateStoresPage + 1));
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
                          <Button size="sm" variant="ghost" onClick={onSaveQuantity}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={onCancelEditing}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => onStartEditing(ps.id, ps.quantity, ps.storeId)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onChange={onPageChange}
      />
    </Card>
  );
}
