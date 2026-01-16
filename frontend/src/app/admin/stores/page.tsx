"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "../_components/SectionHeader";
import { useInitialFetch } from "@/hooks/useInitialFetch";
import { getStores } from "@/services/store/getStores";

export default function Stores() {
  const route = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: stores, isLoading } = useInitialFetch(getStores);

  const filteredStores = stores
    ? stores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.addressName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleRowClick = (storeId: string) => {
    route.push(`/admin/stores/${storeId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Stores"
          description="Manage all store locations"
        />

        <Button onClick={() => route.push("/admin/stores/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Store
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <Table>
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
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-muted-foreground"
                  >
                    Please wait...
                  </TableCell>
                </TableRow>
              ) : filteredStores.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No stores found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStores.map((store) => (
                  <TableRow
                    key={store.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(store.id)}
                  >
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-sm truncate max-w-64">
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
