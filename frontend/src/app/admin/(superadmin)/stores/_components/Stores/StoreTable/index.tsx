"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { DefaultBadge } from "@/components/Badge/DefaultBadge";
import { Store } from "@/types/Store";
import { getStores } from "@/services/store/getStores";
import { StoreTableFilters } from "./StoreTableFilters";
import { StoreTablePagination } from "./StoreTablePagination";

type SortBy = "isDefault" | "createdAt" | "employeeCount";
type SortOrder = "asc" | "desc";

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export const StoreTable = () => {
  const router = useRouter();

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);

  // Sort state
  const [sortBy, setSortBy] = useState<SortBy>("isDefault");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination state
  const [page, setPage] = useState(1);

  // Data state
  const [stores, setStores] = useState<(Store & { employeeCount: number })[]>(
    []
  );
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getStores({
          query: {
            search: debouncedSearch.trim() || undefined,
            sortBy,
            sortOrder,
            page,
          },
        });
        setStores(result.data);
        setMeta(result.meta);
      } catch (error) {
        console.error("Failed to fetch stores:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearch, sortBy, sortOrder, page]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleSearchClear = () => {
    setSearchInput("");
    setPage(1);
  };

  const handleSortByChange = (value: SortBy) => {
    setSortBy(value);
    setPage(1);
  };

  const handleSortOrderChange = (value: SortOrder) => {
    setSortOrder(value);
    setPage(1);
  };

  const handleRowClick = (storeId: string) => {
    router.push(`/admin/stores/${storeId}`);
  };

  return (
    <div className="space-y-4">
      <StoreTableFilters
        searchInput={searchInput}
        onSearchChange={handleSearchChange}
        onSearchClear={handleSearchClear}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
        sortOrder={sortOrder}
        onSortOrderChange={handleSortOrderChange}
      />

      {stores.length === 0 && !isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          No stores found
        </div>
      ) : (
        <div className="relative overflow-x-auto -mx-2 px-2">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}
          <Table className={isLoading ? "opacity-60" : ""}>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Admins</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => (
                <TableRow
                  key={store.id}
                  className="cursor-pointer hover:bg-muted/50 h-12 sm:h-auto"
                  onClick={() => handleRowClick(store.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {store.name}
                      {store.isDefault && <DefaultBadge />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-sm truncate max-w-[120px] sm:max-w-48 md:max-w-64">
                        {store.addressName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-sm">
                        {store.employeeCount} admin
                        {store.employeeCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(store.createdAt, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(store.updatedAt, "MMM dd, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {meta && (
        <StoreTablePagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          onChange={setPage}
        />
      )}
    </div>
  );
};
