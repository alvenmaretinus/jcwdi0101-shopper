import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  isLabelHidden?: boolean;
  className?: string;
}

export default function MonthSelect({
  value,
  onChange,
  label = "Month",
  isLabelHidden = false,
  className = "w-36",
}: MonthSelectProps) {
  return (
    <div className="space-y-2">
      {!isLabelHidden && label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={className}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {months.map((month, i) => (
            <SelectItem key={i} value={String(i)}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
