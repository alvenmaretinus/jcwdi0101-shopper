import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import Link from "next/link";

export const ProfileLogo = () => {
  return (
    <Link href="/profile" className="hidden md:flex">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
      >
        <User className="h-5 w-5" />
      </Button>
    </Link>
  );
};
