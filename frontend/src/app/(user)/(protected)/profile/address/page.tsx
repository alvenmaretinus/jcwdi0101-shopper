import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Plus } from "lucide-react";

const mockAddresses = [
  {
    id: 1,
    label: "Home",
    address: "Jl. Sudirman No. 123, Kelurahan Senayan, Jakarta Selatan 12190",
    isDefault: true,
  },
  {
    id: 2,
    label: "Office",
    address:
      "Gedung Wisma 46, Lt. 15, Jl. Jendral Sudirman Kav. 1, Jakarta Pusat 10220",
    isDefault: false,
  },
];

export default function AddressPage() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Saved Addresses</h2>
        <Button className="text-primary-foreground rounded-full px-8 py-5">
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      <div className="space-y-4">
        {mockAddresses.map((address) => (
          <div key={address.id} className="p-4 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{address.label}</span>
                {address.isDefault && (
                  <Badge className="bg-primary/10 text-primary">Default</Badge>
                )}
              </div>
              <Button variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground">{address.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
