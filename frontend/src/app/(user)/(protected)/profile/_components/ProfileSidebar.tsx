"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, MapPin, Tag, LogOut } from "lucide-react";
import Image from "next/image";
import { authClient } from "@/lib/authClient";

const Item = ({
  href,
  icon: Icon,
  label,
  path,
}: {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  path: string;
}) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
      path === href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
    }`}
  >
    <Icon className="h-5 w-5" /> {label}
  </Link>
);

export const ProfileSidebar = () => {
  const path = usePathname();
  const router = useRouter();
  const handleLogout = async () => {
    await authClient.signOut();
    router.replace("/login");
  };

  return (
    <aside className="p-6 rounded-2xl shadow-md">
      <div className="text-center mb-6">
        <div
          className="
            relative mx-auto mb-3
            w-16 h-16
            sm:w-20 sm:h-20
            md:w-24 md:h-24
            rounded-full overflow-hidden
            ring-2 ring-primary/20
            "
        >
          <Image src="/sayur.jpg" fill className="object-cover" alt="profile" />
        </div>

        <p className="font-bold">mockUser.name</p>
        <p className="text-xs text-muted-foreground">mockUser.email</p>
        <p className="text-xs text-muted-foreground mt-1">
          Member since mockUser.memberSince
        </p>
      </div>

      <nav className="space-y-1">
        <Item
          href="/profile/profile"
          path={path}
          icon={User}
          label="My Profile"
        />
        <Item
          href="/profile/order"
          path={path}
          icon={Package}
          label="My Orders"
        />
        <Item
          href="/profile/address"
          path={path}
          icon={MapPin}
          label="Addresses"
        />
        <Item href="/profile/voucher" path={path} icon={Tag} label="Vouchers" />
      </nav>

      <hr className="my-4 border-border" />

      <button
        onClick={handleLogout}
        className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
      >
        <LogOut className="h-5 w-5" />
        <span>Log Out</span>
      </button>
    </aside>
  );
};
