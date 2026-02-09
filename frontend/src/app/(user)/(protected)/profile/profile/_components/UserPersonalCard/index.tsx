"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/authClient";
import { Edit2, KeyRound, Mail, User as UserIcon } from "lucide-react";
import { ChangeNameDialog } from "./ChangeNameDialog";
import { useState } from "react";
import { ChangeEmailDialog } from "./ChangeEmailDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { User } from "@/types/User";
import { cn } from "@/lib/utils";

const InfoItem = ({
  label,
  value,
  buttonText,
  icon: Icon,
  onClick,
  disabled,
  isLast,
}: {
  label: string;
  value: string;
  buttonText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
  isLast?: boolean;
}) => (
  <div
    className={cn(
      "flex items-center justify-between py-4",
      !isLast && "border-b border-border"
    )}
  >
    <div className="flex items-center gap-3 min-w-0 flex-1">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0">
        <Label className="text-muted-foreground text-xs">{label}</Label>
        <p className="font-medium text-sm sm:text-base truncate">{value}</p>
      </div>
    </div>
    {buttonText && !disabled && (
      <Button
        onClick={onClick}
        variant="ghost"
        size="sm"
        className="shrink-0 ml-2"
      >
        <Edit2 className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">{buttonText}</span>
      </Button>
    )}
  </div>
);

export const UserCard = ({
  user,
  isOAuth,
}: {
  user: User;
  isOAuth: boolean;
}) => {
  const [isChangeNameOpen, setIsChangeNameOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const { data } = authClient.useSession();
  const sessionUser = data?.user;

  return (
    <div className="bg-card rounded-2xl p-4 sm:p-6 border shadow-soft">
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
        Personal Information
      </h2>

      <div>
        <InfoItem
          label="Name"
          value={sessionUser?.name || user.name}
          buttonText="Change"
          icon={UserIcon}
          onClick={() => setIsChangeNameOpen(true)}
        />
        {isChangeNameOpen && (
          <ChangeNameDialog
            open={isChangeNameOpen}
            onOpenChange={setIsChangeNameOpen}
            currentName={sessionUser?.name}
          />
        )}

        <InfoItem
          label="Email"
          value={sessionUser?.email || user.email}
          buttonText="Change"
          icon={Mail}
          onClick={() => setIsChangeEmailOpen(true)}
          disabled={isOAuth}
        />
        {isChangeEmailOpen && (
          <ChangeEmailDialog
            open={isChangeEmailOpen}
            onOpenChange={setIsChangeEmailOpen}
          />
        )}

        <InfoItem
          label="Password"
          value="••••••••"
          buttonText="Change"
          icon={KeyRound}
          onClick={() => setIsChangePasswordOpen(true)}
          disabled={isOAuth}
          isLast
        />
        {isChangePasswordOpen && (
          <ChangePasswordDialog
            open={isChangePasswordOpen}
            onOpenChange={setIsChangePasswordOpen}
          />
        )}
      </div>
    </div>
  );
};
