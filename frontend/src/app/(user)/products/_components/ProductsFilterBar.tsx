"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { useUserProductsStore } from "@/store/user";
import { useRouter } from "next/navigation";

interface ProductsFilterBarProps {
  filterContent: ReactNode;
}

export function ProductsFilterBar({
  filterContent,
}: ProductsFilterBarProps) {
  const router = useRouter();
  const currentSort = useUserProductsStore((state) => state.sortBy);
  const setSortBy = useUserProductsStore((state) => state.setSortBy);
  const syncWithUrl = useUserProductsStore((state) => state.syncWithUrl);

  const handleSortChange = (sortValue: string) => {
    setSortBy(sortValue);
    const url = syncWithUrl();
    router.push(url);
  };

  return (
    <div className="flex gap-3">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden h-12 rounded-full">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{filterContent}</div>
        </SheetContent>
      </Sheet>

      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="w-[180px] h-12 rounded-full bg-card border-0 shadow-soft px-4 py-2"
      >
        <option value="featured">Featured</option>
        <option value="name">Name</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </div>
  );
}
