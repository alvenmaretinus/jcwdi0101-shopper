"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useUserProductsStore } from "@/store/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ProductsSearchBar() {
  const router = useRouter();
  const searchQuery = useUserProductsStore((state) => state.searchQuery);
  const setSearchQuery = useUserProductsStore((state) => state.setSearchQuery);
  const syncWithUrl = useUserProductsStore((state) => state.syncWithUrl);
  const [inputValue, setInputValue] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
      const url = syncWithUrl();
      router.push(url);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [inputValue, setSearchQuery, syncWithUrl, router]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
      <Input
        type="search"
        placeholder="Search products..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-12 h-12 rounded-full bg-card border-0 shadow-soft pr-9"
      />
    </div>
  );
}
