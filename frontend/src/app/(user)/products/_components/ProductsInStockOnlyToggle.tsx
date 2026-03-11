"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface ProductsInStockOnlyToggleProps {
  showInStock: boolean;
}

export function ProductsInStockOnlyToggle({
  showInStock,
}: ProductsInStockOnlyToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCheckedChange = (checked: boolean | "indeterminate") => {
    const nextChecked = checked === true;
    const params = new URLSearchParams(searchParams.toString());

    if (nextChecked) {
      params.set("inStockOnly", "true");
    } else {
      params.delete("inStockOnly");
    }

    // Reset paging when filter changes so user sees first page of new result set.
    params.delete("page");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <Checkbox checked={showInStock} onCheckedChange={handleCheckedChange} />
      <span>In Stock Only</span>
    </label>
  );
}
