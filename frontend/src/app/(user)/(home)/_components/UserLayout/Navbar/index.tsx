import { TopBarLocation } from "./TopBarLocation";
import { NavbarMain } from "./NavbarMain";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-soft">
      <TopBarLocation />
      <NavbarMain />
    </header>
  );
}
