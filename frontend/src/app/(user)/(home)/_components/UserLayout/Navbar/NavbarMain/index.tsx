"use client";

import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { CartLogo } from "./CartLogo";
import { NavLink } from "./NavLink";
import { ProfileLogo } from "./ProfileLogo";
import { Button } from "@/components/ui/button";
import { MobileHamburgerMenu } from "./MobileHamburgerMenu";
import { authClient } from "@/lib/authClient";

export const NavbarMain = () => {
  const { data } = authClient.useSession();

  return (
    <div className="py-3 px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3 sm:gap-4">
      <BrandLogo />

      <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex">
          <NavLink />
        </div>

        <CartLogo />
        <ProfileLogo />

        {!data && (
          <Link href="/login" className="hidden md:block">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 sm:px-6">
              Sign In
            </Button>
          </Link>
        )}

        <MobileHamburgerMenu />
      </div>
    </div>
  );
};
