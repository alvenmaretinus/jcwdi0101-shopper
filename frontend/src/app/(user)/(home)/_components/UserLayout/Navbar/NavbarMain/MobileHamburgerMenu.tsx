"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { authClient } from "@/lib/authClient";
import { Menu, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Categories", path: "/categories" },
  { label: "Deals", path: "/deals" },
];

export const MobileHamburgerMenu = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data } = authClient.useSession();

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild className="lg:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-3/4">
        <div className="flex flex-col gap-6 mt-8">
          <hr className="border-border mt-3" />
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <hr className="border-border" />

          <div className="flex flex-col gap-2">
            <Link
              href="/profile/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 rounded-lg font-medium text-foreground hover:bg-muted flex items-center gap-3"
            >
              <User className="h-5 w-5" />
              My Account
            </Link>
            <Link
              href="/profile/order"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 rounded-lg font-medium text-foreground hover:bg-muted flex items-center gap-3"
            >
              <ShoppingCart className="h-5 w-5" />
              My Orders
            </Link>
          </div>
          {!data && (
            <Button className="bg-primary md:hidden hover:bg-primary/90 text-primary-foreground rounded-full mt-4">
              Sign In
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
