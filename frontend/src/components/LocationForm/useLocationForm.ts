import { Coords } from "@/types/Coords";
import { useState } from "react";

export const useLocationForm = (
  initialLocation: Coords,
  initialAddressName?: string
) => {
  const [coords, setCoords] = useState<Coords>(initialLocation);
  const [addressName, setAddressName] = useState(initialAddressName ?? "");

  return {
    coords,
    setCoords,
    addressName,
    setAddressName,
  };
};
