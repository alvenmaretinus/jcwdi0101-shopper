import { MapPin } from "lucide-react";

const mockLocation = "Jakarta Selatan";

export const TopBarLocation = () => {
  return (
    <div className="bg-primary text-primary-foreground py-2 px-6">
      <div className="flex items-center justify-end rounded-md text-sm">
        <button className="flex cursor-pointer items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>
            Shopper at: <strong>{mockLocation}</strong>
          </span>
        </button>
      </div>
    </div>
  );
};
