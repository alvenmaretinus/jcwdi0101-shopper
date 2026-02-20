import { ReactNode } from "react";


interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1">{children}</main>

    </div>
  );
}
