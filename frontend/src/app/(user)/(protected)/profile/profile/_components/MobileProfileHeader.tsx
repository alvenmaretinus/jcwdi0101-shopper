"use client";

import Image from "next/image";
import { authClient } from "@/lib/authClient";
import { useState } from "react";
import { ChangePictureDialog } from "../../_components/ProfileSidebar/ChangePictureDialog";
import { User } from "@/types/User";
import { format } from "date-fns";

export const MobileProfileHeader = ({ user }: { user: User }) => {
  const [isChangeImageOpen, setIsChangeImageOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { data } = authClient.useSession();
  const sessionUser = data?.user;

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
    </div>
  );
};
