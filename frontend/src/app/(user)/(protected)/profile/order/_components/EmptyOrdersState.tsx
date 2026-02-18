"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export const EmptyOrdersState = () => {
  return (
    <div className="bg-card rounded-2xl p-12 text-center shadow-soft">
      <div className="text-6xl mb-4">📦</div>
      <h3 className="text-xl font-semibold mb-2">No orders found</h3>
      <p className="text-muted-foreground mb-6">
        You don&apos;t have any orders in this category yet.
      </p>
      <Link href="/products">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
          Start Shopping
        </Button>
      </Link>
    </div>
  );
};

export default EmptyOrdersState;
