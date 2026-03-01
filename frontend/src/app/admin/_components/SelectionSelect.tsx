import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SelectionModal from "@/components/Dialog/SelectionModal";

interface SelectionSelectProps {
  value: string | number;
  label?: string;
  onChange: (value: any) => void;
  getType: (params: { name: string | undefined; page: number; limit: number }) => Promise<any>;
  title: string;
  description: string;
  className?: string;
  displayValue?: string;
  showLabel?: boolean;
}

export default function SelectionSelect({
  value,
  label,
  onChange,
  getType,
  title,
  description,
  className = "w-32",
  displayValue,
  showLabel = true,
}: SelectionSelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (item: { id: string; name: string } | null) => {
    onChange(item);
  };

  const display = displayValue ?? String(value);

  return (
    <>
      {showLabel && label && (
        <div className="space-y-2">
          <Label>{label}</Label>
          <Button
            type="button"
            variant="outline"
            className={`${className} justify-start text-left font-normal`}
            onClick={() => setIsModalOpen(true)}
          >
            {display}
          </Button>
        </div>
      )}
      {!showLabel && (
        <Button
          type="button"
          variant="outline"
          className={`${className} justify-start text-left font-normal`}
          onClick={() => setIsModalOpen(true)}
        >
          {display}
        </Button>
      )}

      <SelectionModal
        open={isModalOpen}
        getType={getType}
        onOpenChange={setIsModalOpen}
        onSelect={handleSelect}
        selectedSelectionId={value === "all" ? null : String(value)}
        title={title}
        description={description}
      />
    </>
  );
}
