import { ReactNode } from "react";

interface ProductsDesktopSidebarProps {
  children: ReactNode;
}

export function ProductsDesktopSidebar({ children }: ProductsDesktopSidebarProps) {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-28">{children}</div>
    </aside>
  );
}
