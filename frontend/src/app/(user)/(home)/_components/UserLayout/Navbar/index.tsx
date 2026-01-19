import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TopBarLocation } from "./TopBarLocation";
import { BrandLogo } from "./BrandLogo";
import { NavLink } from "./NavLink";
import { CartLogo } from "./CartLogo";
import { ProfileLogo } from "./ProfileLogo";
import { MobileHamburgerMenu } from "./MobileHamburgerMenu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-soft">
      <TopBarLocation />

      <div className="container-app py-4 px-6 flex items-center justify-between gap-4">
        <BrandLogo />

        <NavLink />

        <div className="flex items-center gap-2 sm:gap-4">
          <CartLogo />

          <ProfileLogo />
          <Link href="/login" className="hidden md:block">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
              Sign In
            </Button>
          </Link>

          <MobileHamburgerMenu />
        </div>
      </div>
    </header>
  );
}
