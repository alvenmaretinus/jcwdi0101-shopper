"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Categories", path: "/categories" },
  { label: "Deals", path: "/deals" },
];

export const NavLink = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-6">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          href={link.path}
          className={`font-medium transition-colors ${
            pathname === link.path
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};
