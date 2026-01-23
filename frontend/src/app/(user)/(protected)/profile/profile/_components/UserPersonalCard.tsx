import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Edit2, KeyRound, Mail } from "lucide-react";

const InfoItem = ({
  label,
  value,
  buttonText,
  icon,
}: {
  label: string;
  value: string;
  buttonText?: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-border">
    <div>
      <Label className="text-muted-foreground text-sm">{label}</Label>
      <p className="font-medium mt-1">{value}</p>
    </div>
    {buttonText && (
      <Button variant="outline" size="sm">
        {icon && <span className="mr-2">{icon}</span>}
        {buttonText}
      </Button>
    )}
  </div>
);

export const UserCard = () => (
  <div className="bg-card rounded-2xl p-6 shadow-soft">
    <h2 className="text-xl font-bold mb-6">Personal Information</h2>

    <div className="space-y-4">
      <InfoItem
        label="Name"
        value="mockUser.name"
        buttonText="Change Name"
        icon={<Edit2 className="h-4 w-4" />}
      />
      <InfoItem
        label="Email"
        value="mockUser.email"
        buttonText="Change Email"
        icon={<Mail className="h-4 w-4" />}
      />
      <InfoItem
        label="Password"
        value="••••••••"
        buttonText="Change Password"
        icon={<KeyRound className="h-4 w-4" />}
      />
    </div>
  </div>
);
