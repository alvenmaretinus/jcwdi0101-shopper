"use client";

import Image from "next/image";
import { authClient } from "@/lib/authClient";
import { useState } from "react";
import { ChangePictureDialog } from "../../_components/ProfileSidebar/ChangePictureDialog";
import { User } from "@/types/User";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export const MobileProfileHeader = ({ user }: { user: User }) => {
  const [isChangeImageOpen, setIsChangeImageOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  
  const { data } = authClient.useSession();
  const sessionUser = data?.user;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await authClient.signOut();
    router.replace("/login");
  };

  return (
    <div className="lg:hidden flex flex-col items-center pb-6 mb-6 border-b border-border">
      <button
        onClick={() => setIsChangeImageOpen(true)}
        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-2 ring-primary/20 cursor-pointer"
      >
        <Image
          src={sessionUser?.image || user.image || "/default_profile.png"}
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

      <h1 className="font-bold text-lg mt-3">
        {sessionUser?.name || user.name || "User"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {sessionUser?.email || user.email}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Member since {format(new Date(user.createdAt), "MMMM yyyy")}
      </p>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500 text-red-500 hover:bg-red-500/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span>{isLoggingOut ? "Logging Out..." : "Log Out"}</span>
      </button>
    </div>
  );
};
