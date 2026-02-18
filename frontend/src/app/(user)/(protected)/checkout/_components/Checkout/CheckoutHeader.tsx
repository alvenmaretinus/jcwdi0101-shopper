"use client";

import { ChevronRight } from "lucide-react";

export const CheckoutHeader = () => {
  return (
    <>
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <a href="/cart" className="hover:text-primary cursor-pointer">
          Cart
        </a>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Checkout</span>
      </nav>

      <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>
    </>
  );
};

export default CheckoutHeader;
