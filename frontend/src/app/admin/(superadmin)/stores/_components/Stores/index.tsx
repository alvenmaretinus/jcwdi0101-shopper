"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "@/app/admin/_components/SectionHeader";
import { StoreTable } from "./StoreTable";

export const Stores = () => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Stores"
          description="Manage all store locations"
        />

        <Button onClick={() => router.push("/admin/stores/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Store
        </Button>
      </div>

      <Card>
        <CardHeader />
        <CardContent className="p-2">
          <StoreTable />
        </CardContent>
      </Card>
    </div>
  );
};
