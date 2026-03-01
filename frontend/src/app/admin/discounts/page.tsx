"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/authClient";
import { getUserByEmail } from "@/services/user/getUserByEmail";
import { DiscountsTab } from "./_components/DiscountsTab";
import { VouchersTab } from "./_components/VouchersTab";

export default function Discounts() {
  const { data } = authClient.useSession();
  const sessionUser = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userStoreId, setUserStoreId] = useState<string>("");

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!sessionUser) return;
      const userData = await getUserByEmail(sessionUser.email);
      setIsSuperAdmin(userData?.role === "SUPERADMIN");
      setUserStoreId(userData?.storeId ?? "");
    };

    fetchUserRole();
  }, [sessionUser]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discounts</h1>
          <p className="text-muted-foreground">
            Manage promotions, voucher codes and discounts
          </p>
        </div>
      </div>

      <Tabs defaultValue="discounts">
        <TabsList>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
        </TabsList>

        <TabsContent value="discounts" className="space-y-4">
          <DiscountsTab />
        </TabsContent>

        <TabsContent value="vouchers" className="space-y-4">
          <VouchersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
