"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Navigation, Search } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Dispatch, SetStateAction, useState } from "react";

import dynamic from "next/dynamic";

const ReactMap = dynamic(
  async () => {
    const ReactMapModule = await import("@/components/Map/ReactMap");
    return ReactMapModule.ReactMap;
  },
  {
    ssr: false,
  }
);

import { Location } from "@/types/Location";

type Props = {
  title: string;
  subtitle: string;
  location: Location;
  setLocation: Dispatch<SetStateAction<Location>>;
  addressName: string;
  setAddressName: Dispatch<SetStateAction<string>>;
};

export const LocationFormCard = ({
  title,
  subtitle,
  location,
  setLocation,
  addressName,
  setAddressName,
}: Props) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isShouldFly, setIsShouldFly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsShouldFly(true);
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setTimeout(() => setIsShouldFly(false), 100);
        setIsGettingLocation(false);
      },
      (error) => {
        toast.error("Unable to get your location. Please check permissions.");
        console.error("Geolocation error:", error);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
          >
            Click here to autofill the address
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
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
          {isGettingLocation
            ? "Getting location..."
            : "Use My Current Location"}
        </Button>

        <p>{`lat:${location.lat}, longi:${location.lng}`}</p>
        <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[700px]">
          <ReactMap
            isShouldFly={isShouldFly}
            location={location}
            setLocation={setLocation}
          />
        </div>
      </CardContent>
    </Card>
  );
};
