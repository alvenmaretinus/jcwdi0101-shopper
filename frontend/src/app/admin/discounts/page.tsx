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
import { Plus, Pencil, Trash2, Search, Percent, Tag, Gift, Loader2, Copy, Ticket, Truck, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { Discount } from '@/types/Discount';
import type { Voucher } from '@/types/Voucher';
import type { ProductWithDetails } from '@/services/product/getProducts';
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount, CreateDiscountInput, UpdateDiscountInput } from '@/services/discount';
import { getVouchers, createVoucher, deleteVoucher, CreateVoucherInput } from '@/services/voucher';
import { toast } from 'sonner';
import { authClient } from '@/lib/authClient';
import { getUserByEmail } from '@/services/user/getUserByEmail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/Pagination/Pagination';
import ProductSelectionModal from '@/components/Dialog/ProductSelectionModal';

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

const voucherTypeIcons = {
  REFERRAL: Users,
  TRANSACTIONAL: Ticket,
  FREEDELIVERY: Truck,
};

const voucherTypeLabels = {
  REFERRAL: 'Referral',
  TRANSACTIONAL: 'Transactional',
  FREEDELIVERY: 'Free Delivery',
};

export default function Discounts() {
  const { data } = authClient.useSession();
  const sessionUser = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userStoreId, setUserStoreId] = useState<string>('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [selectedDiscountType, setSelectedDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY'>('PERCENTAGE');
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithMinimumChecked, setIsWithMinimumChecked] = useState<boolean>(editingDiscount?.isWithMinimum ?? false);
  const [hasDiscountAmountCapChecked, setHasDiscountAmountCapChecked] = useState<boolean>(editingDiscount?.hasDiscountAmountCap ?? false);
  
  // Product selection states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  
  // Voucher states
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [voucherSearch, setVoucherSearch] = useState('');
  const [voucherTypeFilter, setVoucherTypeFilter] = useState<string>('all');
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState(false);
  const [isVouchersLoading, setIsVouchersLoading] = useState(false);
  const [selectedVoucherDiscountType, setSelectedVoucherDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY'>('PERCENTAGE');
  
  // Pagination states
  const [discountsPage, setDiscountsPage] = useState(1);
  const [vouchersPage, setVouchersPage] = useState(1);
  const [discountsPagination, setDiscountsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [vouchersPagination, setVouchersPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      if (sessionUser) {
        const userData = await getUserByEmail(sessionUser.email);
        if (userData?.role === 'SUPERADMIN') {
          setIsSuperAdmin(true);
        }
        if (userData?.storeId) {
          setUserStoreId(userData.storeId);
        }
      }
    };
    fetchUserRole();
  }, [sessionUser]);

  // Fetch discounts on mount and when filters change
  useEffect(() => {
    fetchDiscounts();
  }, [typeFilter, discountsPage, searchQuery]);

  // Fetch vouchers on mount and when filters change
  useEffect(() => {
    fetchVouchers();
  }, [voucherTypeFilter, vouchersPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setDiscountsPage(1);
  }, [searchQuery, typeFilter]);

  useEffect(() => {
    setVouchersPage(1);
  }, [voucherSearch, voucherTypeFilter]);



  const fetchDiscounts = async () => {
    setIsLoading(true);
    try {
      const response = await getDiscounts({ 
        name: searchQuery || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        page: discountsPage,
        limit: 20,
      });
      setDiscounts(response.data);
      setDiscountsPagination(response.meta);
    } catch (error) {
      toast.error('Failed to load discounts');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVouchers = async () => {
    setIsVouchersLoading(true);
    try {
      const response = await getVouchers({ 
        voucherType: voucherTypeFilter !== 'all' ? voucherTypeFilter : undefined,
        page: vouchersPage,
        limit: 20,
      });
      setVouchers(response.data);
      setVouchersPagination(response.meta);
    } catch (error) {
      toast.error('Failed to load vouchers');
    } finally {
      setIsVouchersLoading(false);
    }
  };


  const filteredDiscounts: Discount[] = discounts;

  const filteredVouchers: Voucher[] = vouchers.filter((voucher: Voucher) => {
    const matchesSearch = 
      voucher.code.toLowerCase().includes(voucherSearch.toLowerCase()) ||
      voucher.discount.name?.toLowerCase().includes(voucherSearch.toLowerCase()) ||
      voucher.voucherType.toLowerCase().includes(voucherSearch.toLowerCase());
    return matchesSearch;
  });

  const getDiscountForVoucher = (voucher: Voucher): Discount | undefined => {
    return voucher.discount;
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Voucher code copied to clipboard');
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setSelectedDiscountType(discount.type);
    if (discount.productId) {
      setSelectedProduct({ id: discount.productId } as ProductWithDetails);
    } else {
      setSelectedProduct(null);
    }
    setIsDialogOpen(true);
  };

  useEffect(() => {
    setIsWithMinimumChecked(editingDiscount?.isWithMinimum ?? false);
    setHasDiscountAmountCapChecked(editingDiscount?.hasDiscountAmountCap ?? false);
  }, [editingDiscount]);

  const handleCreate = () => {
    setEditingDiscount(null);
    setSelectedProduct(null);
    setSelectedDiscountType('PERCENTAGE');
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
      const rawValue = (formData.get('value') as string) ?? '';
      
      const discountData: any = {
        name: formData.get('name') as string,
        type,
        isVoucher: false,
        isWithMinimum: formData.has('isWithMinimum'),
        isTiedToProduct: !!selectedProduct?.id,
        productId: selectedProduct?.id || null,
      };

      // Add type-specific fields
      if (type === 'PERCENTAGE') {
        discountData.percentage = Number(rawValue);
      } else if (type === 'FIXED_AMOUNT') {
        const amount = Number(rawValue);
        if (!Number.isInteger(amount)) {
          toast.error('Fixed amount must be a whole number');
          setIsSubmitting(false);
          return;
        }
        discountData.amount = amount;
      } else if (type === 'QUANTITY') {
        const buyQuantity = Number(formData.get('buyQuantity'));
        const freeQuantity = Number(formData.get('freeQuantity'));

        if (!Number.isInteger(buyQuantity) || !Number.isInteger(freeQuantity)) {
          toast.error('Buy and free quantities must be whole numbers');
          setIsSubmitting(false);
          return;
        }

        discountData.buyQuantity = buyQuantity;
        discountData.freeQuantity = freeQuantity;
      }

      if (formData.get('minimumPrice')) {
        const minimumPrice = Number(formData.get('minimumPrice'));
        if (!Number.isInteger(minimumPrice)) {
          toast.error('Minimum purchase must be a whole number');
          setIsSubmitting(false);
          return;
        }
        discountData.minimumPrice = minimumPrice;
      }

      // Handle max discount amount (only for percentage discounts)
      if (type === 'PERCENTAGE' && formData.has('hasDiscountAmountCap')) {
        discountData.hasDiscountAmountCap = true;
        const maxDiscountAmount = Number(formData.get('maxDiscountAmount'));
        if (!Number.isInteger(maxDiscountAmount) || maxDiscountAmount < 1) {
          toast.error('Max discount amount must be a whole number greater than 0');
          setIsSubmitting(false);
          return;
        }
        discountData.maxDiscountAmount = maxDiscountAmount;
      } else {
        discountData.hasDiscountAmountCap = false;
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
      setSelectedProduct(null);
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

  const handleVoucherDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this voucher?')) {
      return;
    }

    try {
      await deleteVoucher(id);
      await fetchVouchers();
    } catch (error) {
      // Error toast is handled in the service
    }
  };

  const handleVoucherSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const type = formData.get('voucherDiscountType') as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
      const endsAt = formData.get('voucherEndsAt') as string;
      const startsAt = formData.get('voucherStartsAt') as string;
      
      const voucherData: CreateVoucherInput = {
        code: (formData.get('voucherCode') as string).toUpperCase(),
        name: formData.get('voucherName') as string,
        type,
        voucherType: formData.get('voucherType') as 'REFERRAL' | 'TRANSACTIONAL' | 'FREEDELIVERY',
        isWithMinimum: formData.has('voucherIsWithMinimum'),
      };

      // Add type-specific fields
      if (type === 'PERCENTAGE') {
        voucherData.percentage = Number(formData.get('voucherValue'));
      } else if (type === 'FIXED_AMOUNT') {
        voucherData.amount = Number(formData.get('voucherValue'));
      } else if (type === 'QUANTITY') {
        voucherData.buyQuantity = Number(formData.get('voucherBuyQuantity'));
        voucherData.freeQuantity = Number(formData.get('voucherFreeQuantity'));
      }

      if (formData.get('voucherMinimumPrice')) {
        voucherData.minimumPrice = Number(formData.get('voucherMinimumPrice'));
      }

      if (startsAt) {
        voucherData.startsAt = new Date(startsAt);
      }

      if (endsAt) {
        voucherData.endsAt = new Date(endsAt);
      }

      await createVoucher(voucherData);
      await fetchVouchers();
      setIsVoucherDialogOpen(false);
      setSelectedVoucherDiscountType('PERCENTAGE');
    } catch (error) {
      // Error toast is handled in the service
    } finally {
      setIsSubmitting(false);
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

  const getRemainingUsesLabel = (discount: Discount) => {
    if (!discount.isQuantityLimited) return 'Unlimited';
    const totalLimit = typeof discount.limit === 'number' ? discount.limit : 0;
    const used = typeof discount.useCounter === 'number' ? discount.useCounter : 0;
    return String(Math.max(0, totalLimit - used));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discounts</h1>
          <p className="text-muted-foreground">Manage promotions, voucher codes and discounts</p>
        </div>
      </div>

      <Tabs defaultValue="discounts">
        <TabsList>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
        </TabsList>

        
      
      <TabsContent value="discounts" className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingDiscount(null); setIsDialogOpen(true); }}>
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
                <Select
                  name="type"
                  value={selectedDiscountType}
                  onValueChange={(value) => setSelectedDiscountType(value as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY')}
                  required
                >
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
                  {selectedDiscountType === 'QUANTITY' ? 'Quantities' : 'Discount Value'}
                </Label>
                {selectedDiscountType === 'QUANTITY' ? (
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
                    step={selectedDiscountType === 'FIXED_AMOUNT' ? '1' : '0.01'}
                    placeholder={selectedDiscountType === 'PERCENTAGE' ? '10' : '50000'} 
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
                    checked={isWithMinimumChecked}
                    onChange={(e) => setIsWithMinimumChecked(e.target.checked)}
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
                  disabled={!isWithMinimumChecked}
                />
              </div>

              {selectedDiscountType === 'PERCENTAGE' && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="hasDiscountAmountCap" 
                        name="hasDiscountAmountCap" 
                        checked={hasDiscountAmountCapChecked}
                        onChange={(e) => setHasDiscountAmountCapChecked(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="hasDiscountAmountCap" className="cursor-pointer">Set maximum discount amount</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">Cap the maximum discount that can be applied to an order</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxDiscountAmount">Maximum Discount Amount (Rp)</Label>
                    <Input 
                      id="maxDiscountAmount"
                      name="maxDiscountAmount" 
                      type="number" 
                      placeholder="100000" 
                      defaultValue={editingDiscount?.maxDiscountAmount}
                      disabled={!hasDiscountAmountCapChecked}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Apply to Product (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setIsProductModalOpen(true)}
                >
                  {selectedProduct?.name || 'Select a product'}
                </Button>
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
                  <TableHead>Remaining Uses</TableHead>
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
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div>{getDiscountValue(discount)}</div>
                          {discount.hasDiscountAmountCap && discount.maxDiscountAmount && (
                            <div className="text-xs text-gray-600">
                              Max: Rp {discount.maxDiscountAmount.toLocaleString('id-ID')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {discount.minimumPrice 
                          ? `Rp ${discount.minimumPrice.toLocaleString('id-ID')}` 
                          : '-'}
                      </TableCell>
                      <TableCell>{getRemainingUsesLabel(discount)}</TableCell>
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
        <Pagination
          page={discountsPagination.page}
          totalPages={discountsPagination.totalPages}
          total={discountsPagination.total}
          onChange={setDiscountsPage}
        />
      </Card>
      </TabsContent>


      <TabsContent value="vouchers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search voucher codes..."
                      value={voucherSearch}
                      onChange={(e) => setVoucherSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={voucherTypeFilter} onValueChange={setVoucherTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="REFERRAL">Referral</SelectItem>
                      <SelectItem value="TRANSACTIONAL">Transactional</SelectItem>
                      <SelectItem value="FREEDELIVERY">Free Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog
                  open={isVoucherDialogOpen}
                  onOpenChange={(open) => {
                    setIsVoucherDialogOpen(open);
                    if (!open) {
                      setSelectedVoucherDiscountType('PERCENTAGE');
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsVoucherDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Voucher
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Voucher</DialogTitle>
                      <DialogDescription>Generate a voucher code with a new discount</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleVoucherSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="voucherCode">Voucher Code</Label>
                        <Input id="voucherCode" name="voucherCode" placeholder="e.g. SUMMER2024" className="uppercase" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voucherName">Discount Name</Label>
                        <Input id="voucherName" name="voucherName" placeholder="e.g. Summer Sale" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voucherType">Voucher Type</Label>
                        <Select name="voucherType" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select voucher type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="REFERRAL">Referral</SelectItem>
                            <SelectItem value="TRANSACTIONAL">Transactional</SelectItem>
                            <SelectItem value="FREEDELIVERY">Free Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voucherDiscountType">Discount Type</Label>
                        <Select
                          name="voucherDiscountType"
                          value={selectedVoucherDiscountType}
                          onValueChange={(value) =>
                            setSelectedVoucherDiscountType(
                              value as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY',
                            )
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                            <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                            <SelectItem value="QUANTITY">Buy X Get Y</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedVoucherDiscountType === 'QUANTITY' ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="voucherBuyQuantity">Buy Quantity</Label>
                            <Input
                              id="voucherBuyQuantity"
                              name="voucherBuyQuantity"
                              type="number"
                              min={1}
                              placeholder="e.g. 3"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="voucherFreeQuantity">Free Quantity</Label>
                            <Input
                              id="voucherFreeQuantity"
                              name="voucherFreeQuantity"
                              type="number"
                              min={1}
                              placeholder="e.g. 1"
                              required
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="voucherValue">Discount Value</Label>
                          <Input
                            id="voucherValue"
                            name="voucherValue"
                            type="number"
                            step="0.01"
                            placeholder="e.g. 10"
                            required
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="voucherIsWithMinimum" name="voucherIsWithMinimum" value="true" className="rounded" />
                          <Label htmlFor="voucherIsWithMinimum">Requires minimum purchase</Label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voucherMinimumPrice">Minimum Purchase (Rp)</Label>
                        <Input id="voucherMinimumPrice" name="voucherMinimumPrice" type="number" placeholder="e.g. 100000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voucherStartsAt">Start Date (Optional)</Label>
                        <Input id="voucherStartsAt" name="voucherStartsAt" type="datetime-local" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voucherEndsAt">End Date (Optional)</Label>
                        <Input id="voucherEndsAt" name="voucherEndsAt" type="datetime-local" />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsVoucherDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Create Voucher
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isVouchersLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredVouchers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No vouchers found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Linked Discount</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Remaining Uses</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVouchers.map((voucher) => {
                      const VTypeIcon = voucherTypeIcons[voucher.voucherType];
                      const linkedDiscount = getDiscountForVoucher(voucher);
                      return (
                        <TableRow key={voucher.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">{voucher.code}</code>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(voucher.code)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <VTypeIcon className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">{voucherTypeLabels[voucher.voucherType]}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{linkedDiscount?.name ?? '-'}</TableCell>
                        <TableCell>{linkedDiscount ? getDiscountValue(linkedDiscount) : '-'}</TableCell>
                        <TableCell>{linkedDiscount ? getRemainingUsesLabel(linkedDiscount) : '-'}</TableCell>
                        <TableCell>
                          {voucher.isRedeemed ? (
                            <Badge variant="secondary">Redeemed</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">Available</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{format(voucher.createdAt, 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleVoucherDelete(voucher.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              )}
            </CardContent>
            <Pagination
              page={vouchersPagination.page}
              totalPages={vouchersPagination.totalPages}
              total={vouchersPagination.total}
              onChange={setVouchersPage}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        onSelect={(product) => {
          setSelectedProduct(product);
        }}
        selectedProductId={selectedProduct?.id}
        title="Select Product"
        description="Search and select a product to apply the discount"
      />
    </div>
  );
}
