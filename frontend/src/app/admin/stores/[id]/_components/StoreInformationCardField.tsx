import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";

type Props = {
  title: string;
  value: string;
  onEditClick?: () => void;
};

const StoreInformationCardField = ({ title, value, onEditClick }: Props) => {
  return (
    <div className="flex items-center justify-between py-2 border-b">
      <div>
        <Label className="text-muted-foreground text-xs">{title}</Label>
        <p className="font-medium">{value}</p>
      </div>
      {onEditClick && (
        <Button variant="ghost" size="sm" onClick={onEditClick}>
          <Pencil className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default StoreInformationCardField;
