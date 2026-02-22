"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const OrderTabs = ({ activeTab, onTabChange }: OrderTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="bg-card p-1 rounded-full mb-6 inline-flex">
        <TabsTrigger
          value="all"
          className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          All
        </TabsTrigger>
        <TabsTrigger
          value="pending"
          className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          Pending
        </TabsTrigger>
        <TabsTrigger
          value="processing"
          className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          Processing
        </TabsTrigger>
        <TabsTrigger
          value="shipping"
          className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          Shipping
        </TabsTrigger>
        <TabsTrigger
          value="delivered"
          className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          Delivered
        </TabsTrigger>
        <TabsTrigger
          value="completed"
          className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          Completed
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default OrderTabs;
