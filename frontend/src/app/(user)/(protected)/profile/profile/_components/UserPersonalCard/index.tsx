"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/authClient";
import { Edit2, KeyRound, Mail } from "lucide-react";
import { ChangeNameDialog } from "./ChangeNameDialog";
import { useState } from "react";
import { ChangeEmailDialog } from "./ChangeEmailDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { User } from "@/types/User";

const InfoItem = ({
  label,
  value,
  buttonText,
  icon,
  onClick,
}: {
  label: string;
  value: string;
  buttonText?: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-border flex-col md:flex-row">
    <div>
      <Label className="text-muted-foreground text-sm sm:text-base md:text-sm lg:text-base">{label}</Label>
      <p className="font-medium mt-1 text-base sm:text-lg md:text-base lg:text-lg">{value}</p>
    </div>
    {buttonText && (
      <Button onClick={onClick} variant="outline" size="sm">
        {icon && <span className="mr-2">{icon}</span>}
        {buttonText}
      </Button>
    )}
  </div>
);

export const UserCard = (props: {user: User}) => {
  const [isChangeNameOpen, setIsChangeNameOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const { data } = authClient.useSession();
  const user = data?.user;

  return (
    <div className="bg-card rounded-2xl p-6 border">
      <h2 className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-bold mb-6">Personal Information</h2>

      <div className="space-y-4">
        <InfoItem
          label="Name"
          value={user?.name || props.user.name}
          buttonText="Change Name"
          icon={<Edit2 className="h-4 w-4" />}
          onClick={() => setIsChangeNameOpen(true)}
        />
        {isChangeNameOpen && (
          <ChangeNameDialog
            open={isChangeNameOpen}
            onOpenChange={setIsChangeNameOpen}
            currentName={user?.name}
          />
        )}

        <InfoItem
          label="Email"
          value={user?.email || props.user.email}
          buttonText="Change Email"
          icon={<Mail className="h-4 w-4" />}
          onClick={() => setIsChangeEmailOpen(true)}
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
          buttonText="Change Password"
          icon={<KeyRound className="h-4 w-4" />}
          onClick={() => setIsChangePasswordOpen(true)}
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
