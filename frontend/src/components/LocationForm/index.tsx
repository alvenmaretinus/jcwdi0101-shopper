"use client";

import { Navigation } from "lucide-react";
import { toast } from "sonner";
import { Dispatch, SetStateAction, useState } from "react";
import { Coords } from "@/types/Coords";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import SearchBarLocation from "./SearchBarLocation";
import { getReverseGeoIdn } from "@/services/geolocation/getReverseGeoIdn";
const ReactMap = dynamic(
  async () => {
    const ReactMapModule = await import("@/components/Map/ReactMap");
    return ReactMapModule.ReactMap;
  },
  {
    ssr: false,
  }
);

type Props = {
  coords: Coords;
  setCoords: Dispatch<SetStateAction<Coords>>;
  addressName: string;
  setAddressName: Dispatch<SetStateAction<string>>;
};

export const LocationForm = ({
  coords,
  setCoords,
  addressName,
  setAddressName,
}: Props) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isShouldFly, setIsShouldFly] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsShouldFly(true);
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setTimeout(() => setIsShouldFly(false), 100);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to get your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Sorting from default store.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information is unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }

        toast.error(errorMessage);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleAutoFill = async () => {
    setIsFetchingAddress(true);
    try {
      const address = await getReverseGeoIdn({
        lat: coords.lat,
        lng: coords.lng,
      });

      setAddressName(address.label);
    } catch (error) {
      console.warn(error);
    } finally {
      setIsFetchingAddress(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="addressName">Address Name</Label>
        <Input
          id="addressName"
          placeholder="e.g., Jl. Sudirman No. 123, Jakarta"
          value={addressName}
          onChange={(e) => setAddressName(e.target.value)}
        />
        <Button
          size="sm"
          variant="link"
          className="text-xs text-muted-foreground"
          onClick={handleAutoFill}
          disabled={isFetchingAddress}
        >
          {isFetchingAddress
            ? "Finding Address Name..."
            : "Click here to autofill the address"}
        </Button>
      </div>

      {/* Current Location Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleUseCurrentLocation}
        disabled={isGettingLocation}
        className="w-full"
      >
        <Navigation className="h-4 w-4 mr-2" />
        {isGettingLocation ? "Getting location..." : "Use My Current Location"}
      </Button>

      {/* Search Bar */}
      <div className="mb-3.5">
        <SearchBarLocation
          setCoords={setCoords}
          isShouldFly={isShouldFly}
          setIsShouldFly={setIsShouldFly}
        />
      </div>

      <div className="w-full mt-6 sm:mt-10 h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px]">
        <ReactMap
          isShouldFly={isShouldFly}
          coords={coords}
          setCoords={setCoords}
        />
      </div>
    </>
  );
};
