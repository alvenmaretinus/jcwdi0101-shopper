import { useState } from "react";
import { Location } from "@/types/Location";

export const useLocationFormCard = (
  initialLocation: Location,
  initialAddress = ""
) => {
  const [location, setLocation] = useState<Location>(initialLocation);
  const [addressName, setAddressName] = useState(initialAddress);

  return {
    location,
    setLocation,
    addressName,
    setAddressName,
  };
};
