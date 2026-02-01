import { NavbarMain } from "./NavbarMain";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-soft">
      <div className="bg-primary py-1.5" />
      <NavbarMain />
    </header>
  );
}
