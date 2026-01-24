"use client";

import { Dispatch, SetStateAction } from "react";
import { MapPin } from "lucide-react";
import { Coords } from "@/types/Coords";
import { LocationForm } from "@/components/LocationForm";

type Props = {
  coords: Coords;
  setCoords: Dispatch<SetStateAction<Coords>>;
  addressName: string;
  setAddressName: Dispatch<SetStateAction<string>>;
};

export const LocationSection = ({
  coords,
  setCoords,
  addressName,
  setAddressName,
}: Props) => (
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
);
