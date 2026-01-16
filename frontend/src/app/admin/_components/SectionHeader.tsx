"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  title: string;
  description: string;
  isBackButtonEnabled?: boolean;
};

export const SectionHeader = ({
  title,
  description,
  isBackButtonEnabled = false,
}: Props) => {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4">
      {isBackButtonEnabled && (
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
