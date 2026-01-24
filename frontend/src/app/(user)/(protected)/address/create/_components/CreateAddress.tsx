"use client";

import { LocationForm } from "@/components/LocationForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coords } from "@/types/Coords";
import { Home, Briefcase, MapPin, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MONAS_LOCATION } from "@/constants/location";
import { createUserAddress } from "@/services/user-address/createUserAddress";
import { useRouter } from "next/navigation";

type AddressType = "HOME" | "OFFICE";

export default function CreateAddress() {
  const [coords, setCoords] = useState<Coords>(MONAS_LOCATION);
  const [addressName, setAddressName] = useState("");
  const [addressType, setAddressType] = useState<AddressType>("HOME");
  const [recipientName, setRecipientName] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    try {
      await createUserAddress({
        addressType,
        recipientName,
        addressName,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      toast.success("Address confirmed!");
      router.push("/address");
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 pb-32">
      <div className="max-w-2xl mx-auto">
        <Card className="border-none shadow-xl bg-emerald-600 overflow-hidden rounded-2xl">
          <CardHeader className="bg-emerald-600 text-white pb-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Add New Address
            </CardTitle>
            <p className="text-emerald-100 text-sm opacity-90">
              Please fill in your delivery details below
            </p>
          </CardHeader>

          <CardContent className="p-6 -mt-4 bg-white space-y-8">
            {/* Recipient Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-1">
                <User className="h-5 w-5" />
                <span>Recipient Details</span>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="recipientName"
                  className="text-xs uppercase tracking-wider text-slate-500 font-bold"
                >
                  Recipient Name
                </Label>
                <Input
                  id="recipientName"
                  placeholder="e.g. John Doe"
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all h-12 rounded-xl"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Address Type
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { type: "HOME", icon: Home, label: "Home" },
                    { type: "OFFICE", icon: Briefcase, label: "Office" },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setAddressType(item.type as AddressType)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all relative",
                        addressType === item.type
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold"
                          : "border-slate-100 bg-white text-slate-500 hover:border-emerald-200"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          addressType === item.type
                            ? "text-emerald-600"
                            : "text-slate-400"
                        )}
                      />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Location Section using shared component */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-1">
                <MapPin className="h-5 w-5" />
                <span>Delivery Location</span>
              </div>

              <LocationForm
                coords={coords}
                setCoords={setCoords}
                addressName={addressName}
                setAddressName={setAddressName}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/profile/address")}
              className="h-14 px-6 border-white/20  bg-white hover:bg-gray-100 text-gray-600 font-bold rounded-2xl transition-all text-lg"
            >
              Back
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-14 bg-white hover:bg-gray-100 text-emerald-600 font-bold rounded-2xl transition-all text-lg flex gap-2"
            >
              Confirm Delivery Address
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
