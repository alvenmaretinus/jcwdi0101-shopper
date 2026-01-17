"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Props = {
  title: string;
  description: string;
  onBack?: () => void;
};

export const SectionHeader = ({ title, description, onBack }: Props) => {
  return (
    <div className="flex items-center gap-4">
      {onBack && (
        <Button variant="ghost" size="icon" onClick={onBack}>
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
