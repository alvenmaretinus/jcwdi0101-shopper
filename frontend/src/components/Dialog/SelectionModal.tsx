'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { getProducts } from '@/services/product/getProducts';
import type { ProductWithDetails } from '@/services/product/getProducts';

type SelectionGetParamsType = {
    name: string | undefined;
    page: number;
    limit: number;
};

interface SelectionModalProps<SelectionType extends { id: string, name: string}> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: SelectionType | null) => void;
  selectedSelectionId?: string | null;
  title?: string;
  description?: string;
  getType: (params: SelectionGetParamsType) => Promise<{ data: SelectionType[]; meta: { page: number; limit: number; total: number; totalPages: number } }>;
}

export default function SelectionModal<SelectionType extends { id: string, name: string }>({
  open,
  onOpenChange,
  onSelect,
  selectedSelectionId: selectedSelectionId,
  title = 'Select option',
  description = 'Search and select from the possible options',
  getType,
}: SelectionModalProps<SelectionType>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<SelectionType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open, searchQuery, currentPage]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await getType({
        name: searchQuery || undefined,
        page: currentPage,
        limit: 10,
      });
      setItems(response.data as unknown as SelectionType[]);
      setPagination(response.meta);
    } catch (error) {
      console.error(`Failed to load ${title.toLowerCase()}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemSelect = (item: SelectionType) => {
    onSelect(item);
    onOpenChange(false);
  };

  const handleClearSelection = () => {
    onSelect(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search {title}</label>
            <Input
              type="text"
              placeholder={`Enter ${title.toLowerCase()} name...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading {title.toLowerCase()}...
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {title.toLowerCase()} found
                </div>
              ) : (
                <div className="divide-y">
                  {items.map((selection) => (
                    <button
                      key={selection.id}
                      onClick={() => handleItemSelect(selection)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <span className="font-medium">{selection.name}</span>
                      </div>
                      {selectedSelectionId === selection.id && (
                        <Badge variant="default" className="ml-2">Selected</Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {pagination.totalPages > 1 && (
              <div className="border-t bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          {selectedSelectionId && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClearSelection}
            >
              Clear Selection
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
