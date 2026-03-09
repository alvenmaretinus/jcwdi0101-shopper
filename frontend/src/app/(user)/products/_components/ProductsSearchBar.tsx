import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useUserProductsStore } from "@/store/user";
import { useSearchParams } from "next/navigation";

export function ProductsSearchBar() {
  const currentSearch = useUserProductsStore((state) => state.searchQuery);
  const searchParams = useSearchParams();
  const preservedParams = Array.from(searchParams.entries()).filter(
    ([key]) => key !== "search",
  );

  return (
    <form method="GET" action="/products" className="relative flex-1">
      {preservedParams.map(([key, value], index) => (
        <input
          key={`${key}-${value}-${index}`}
          type="hidden"
          name={key}
          value={value}
        />
      ))}
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="search"
        name="search"
        placeholder="Search products..."
        defaultValue={currentSearch}
        className="pl-12 h-12 rounded-full bg-card border-0 shadow-soft"
      />
      <button
        type="submit"
        className="absolute right-4 top-1/2 -translate-y-1/2"
        title="Search"
      >
        <Search className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      </button>
    </form>
  );
}
