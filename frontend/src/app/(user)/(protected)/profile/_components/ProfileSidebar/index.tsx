"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User as UserIcon, Package, MapPin, Tag, LogOut } from "lucide-react";
import Image from "next/image";
import { authClient } from "@/lib/authClient";
import { useState } from "react";
import { ChangePictureDialog } from "./ChangePictureDialog";
import { format } from "date-fns";

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
  const [isChangeImageOpen, setIsChangeImageOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const { data } = authClient.useSession();
  const user = data?.user

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace("/login");
  };

  return (
    <aside className="p-6 rounded-2xl shadow-md">
      <div className="text-center mb-6">
        <button
          onClick={() => setIsChangeImageOpen(true)}
          className="
            relative mx-auto mb-3
            w-16 h-16
            sm:w-20 sm:h-20
            md:w-24 md:h-24
            rounded-full overflow-hidden
            ring-2 ring-primary/20
            cursor-pointer
            "
        >
          <Image
            src={user?.image || "/default_profile.png"}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fill
            className="object-cover"
            alt="profile"
          />
        </button>
        <ChangePictureDialog
          isOpen={isChangeImageOpen}
          setIsOpen={setIsChangeImageOpen}
          isUploadPicture={isUploading}
          setIsUploadPicture={setIsUploading}
        />

        <p className="font-bold">{user?.name||"user"}</p>
        <p className="text-xs text-muted-foreground">{user?.email||"mail@shopper.com"}</p>
        <p className="text-xs text-muted-foreground mt-1">
         {user?.createdAt? "Member since " + format(user.createdAt, "dd MMMM yyyy") : "Member since ?"}
        </p>
      </div>

      <nav className="space-y-1">
        <Item
          href="/profile/profile"
          path={path}
          icon={UserIcon}
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
