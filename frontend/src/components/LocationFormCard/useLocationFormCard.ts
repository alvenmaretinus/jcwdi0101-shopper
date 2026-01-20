import { Coords } from "@/types/Coords";
import { useState } from "react";

export const useLocationFormCard = (
  initialLocation: Coords,
  initialAddressName = ""
) => {
  const [coords, setCoords] = useState<Coords>(initialLocation);
  const [addressName, setAddressName] = useState(initialAddressName);

  return {
    coords,
    setCoords,
    addressName,
    setAddressName,
  };
};
