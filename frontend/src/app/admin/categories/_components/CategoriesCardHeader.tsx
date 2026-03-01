'use client'

import { CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type CategoriesCardHeaderProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function CategoriesCardHeader({
  searchQuery,
  onSearchChange,
}: CategoriesCardHeaderProps) {
  return (
    <CardHeader>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </CardHeader>
  );
}
