"use client";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface StoreFilterProps {
  isSuperAdmin: boolean;
  selectedStoreName: string;
  onOpenChange: (open: boolean) => void;
}

export default function StoreFilter({
  isSuperAdmin,
  selectedStoreName,
  onOpenChange,
}: StoreFilterProps) {
  if (!isSuperAdmin) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Label className="shrink-0">Select Store:</Label>
          <Button
            type="button"
            variant="outline"
            className="w-64 justify-start text-left font-normal"
            onClick={() => onOpenChange(true)}
          >
            {selectedStoreName || 'Select a store'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
