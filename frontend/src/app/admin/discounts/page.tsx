"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, Percent, Tag, Gift, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Discount } from '@/types/Discount';
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount, CreateDiscountInput, UpdateDiscountInput } from '@/services/discount';
import { toast } from 'sonner';

const discountTypeIcons = {
  PERCENTAGE: Percent,
  FIXED_AMOUNT: Tag,
  QUANTITY: Gift,
};

const discountTypeLabels = {
  PERCENTAGE: 'Percentage',
  FIXED_AMOUNT: 'Fixed Amount',
  QUANTITY: 'Buy X Get Y',
};

export default function Discounts() {
  const user  = { role: 'SUPERADMIN', storeId: 'some-store-id' }; // Replace with actual user context
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch discounts on mount and when filters change
  useEffect(() => {
    fetchDiscounts();
  }, [typeFilter]);

  const fetchDiscounts = async () => {
    setIsLoading(true);
    try {
      const data = await getDiscounts({ 
        type: typeFilter !== 'all' ? typeFilter : undefined 
      });
      setDiscounts(data);
    } catch (error) {
      toast.error('Failed to load discounts');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDiscounts: Discount[] = discounts.filter((discount: Discount) => {
    const matchesSearch = 
      discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (discount.percentage?.toString() || '').includes(searchQuery.toLowerCase()) ||
      (discount.amount?.toString() || '').includes(searchQuery.toLowerCase()) ||
      discount.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingDiscount(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const type = formData.get('type') as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
      const endsAt = formData.get('endsAt') as string;
      const startsAt = formData.get('startsAt') as string;
      
      const discountData: any = {
        name: formData.get('name') as string,
        type,
        isWithMinimum: formData.get('isWithMinimum') === 'true',
        isTiedToProduct: formData.get('productId') !== 'all',
        productId: formData.get('productId') !== 'all' ? formData.get('productId') as string : undefined,
      };

      // Add type-specific fields
      if (type === 'PERCENTAGE') {
        discountData.percentage = Number(formData.get('value'));
      } else if (type === 'FIXED_AMOUNT') {
        discountData.amount = Number(formData.get('value'));
      } else if (type === 'QUANTITY') {
        discountData.buyQuantity = Number(formData.get('buyQuantity'));
        discountData.freeQuantity = Number(formData.get('freeQuantity'));
      }

      if (formData.get('minimumPrice')) {
        discountData.minimumPrice = Number(formData.get('minimumPrice'));
      }

      if (startsAt) {
        discountData.startsAt = new Date(startsAt);
      }

      if (endsAt) {
        discountData.endsAt = new Date(endsAt);
      }

      if (editingDiscount) {
        await updateDiscount({ id: editingDiscount.id, ...discountData });
      } else {
        await createDiscount(discountData as CreateDiscountInput);
      }

      await fetchDiscounts();
      setIsDialogOpen(false);
      setEditingDiscount(null);
    } catch (error) {
      // Error toast is handled in the service
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) {
      return;
    }

    try {
      await deleteDiscount(id);
      await fetchDiscounts();
    } catch (error) {
      // Error toast is handled in the service
    }
  };

  const getDiscountValue = (discount: Discount) => {
    switch (discount.type) {
      case 'PERCENTAGE':
        return `${discount.percentage}%`;
      case 'FIXED_AMOUNT':
        return `Rp ${discount.amount?.toLocaleString('id-ID')}`;
      case 'QUANTITY':
        return `Buy ${discount.buyQuantity} Get ${discount.freeQuantity}`;
      default:
        return '-';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discounts</h1>
          <p className="text-muted-foreground">Manage promotions and discounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingDiscount ? 'Edit Discount' : 'Create New Discount'}</DialogTitle>
              <DialogDescription>
                {editingDiscount ? 'Update discount details' : 'Set up a new promotion'}
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Discount Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Summer Sale 20%" 
                  defaultValue={editingDiscount?.name} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Discount Type</Label>
                <Select name="type" defaultValue={editingDiscount?.type || 'PERCENTAGE'} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount (Rp)</SelectItem>
                    <SelectItem value="QUANTITY">Buy X Get Y Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional fields based on type */}
              <div className="space-y-2">
                <Label htmlFor="value">
                  {editingDiscount?.type === 'QUANTITY' ? 'Quantities' : 'Discount Value'}
                </Label>
                {editingDiscount?.type === 'QUANTITY' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      name="buyQuantity" 
                      type="number" 
                      placeholder="Buy quantity"
                      defaultValue={editingDiscount?.buyQuantity}
                      required
                    />
                    <Input 
                      name="freeQuantity" 
                      type="number" 
                      placeholder="Free quantity"
                      defaultValue={editingDiscount?.freeQuantity}
                      required
                    />
                  </div>
                ) : (
                  <Input 
                    name="value" 
                    type="number" 
                    step="0.01"
                    placeholder={editingDiscount?.type === 'PERCENTAGE' ? '10' : '50000'} 
                    defaultValue={editingDiscount?.percentage || editingDiscount?.amount}
                    required 
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="isWithMinimum" 
                    name="isWithMinimum" 
                    value="true"
                    defaultChecked={editingDiscount?.isWithMinimum}
                    className="rounded"
                  />
                  <Label htmlFor="isWithMinimum" className="cursor-pointer">Set minimum purchase</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumPrice">Minimum Purchase (Rp)</Label>
                <Input 
                  id="minimumPrice"
                  name="minimumPrice" 
                  type="number" 
                  placeholder="50000" 
                  defaultValue={editingDiscount?.minimumPrice} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Apply to Product (Optional)</Label>
                <Select name="productId" defaultValue={editingDiscount?.productId || 'all'}>
                  <SelectTrigger>
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startsAt">Start Date (Optional)</Label>
                  <Input 
                    id="startsAt"
                    name="startsAt" 
                    type="date" 
                    defaultValue={editingDiscount?.startsAt ? format(new Date(editingDiscount.startsAt), 'yyyy-MM-dd') : ''} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endsAt">End Date (Optional)</Label>
                  <Input 
                    id="endsAt"
                    name="endsAt" 
                    type="date" 
                    defaultValue={editingDiscount?.endsAt ? format(new Date(editingDiscount.endsAt), 'yyyy-MM-dd') : ''} 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingDiscount ? 'Save Changes' : 'Create Discount'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                <SelectItem value="QUANTITY">Buy X Get Y</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDiscounts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No discounts found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Discount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Min. Purchase</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiscounts.map((discount) => {
                  const TypeIcon = discountTypeIcons[discount.type];
                  const isExpired = discount.endsAt ? new Date(discount.endsAt) < new Date() : false;
                  return (
                    <TableRow key={discount.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{discount.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{discountTypeLabels[discount.type]}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{getDiscountValue(discount)}</TableCell>
                      <TableCell>
                        {discount.minimumPrice 
                          ? `Rp ${discount.minimumPrice.toLocaleString('id-ID')}` 
                          : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {discount.endsAt ? format(new Date(discount.endsAt), 'MMM dd, yyyy') : 'No expiry'}
                      </TableCell>
                      <TableCell>
                        {isExpired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(discount)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(discount.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
