import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { CartLogo } from "./CartLogo";
import { NavLink } from "./NavLink";
import { ProfileLogo } from "./ProfileLogo";
import { Button } from "@/components/ui/button";
import { MobileHamburgerMenu } from "./MobileHamburgerMenu";

export const NavbarMain = () => {
  return (
    <div className="py-4 px-6 flex items-center justify-between gap-4">
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
  );
};
