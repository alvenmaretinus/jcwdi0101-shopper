"use client";

import { Location } from "@/types/Location";
import { MapPin } from "lucide-react";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";

type ReactMapProps = {
  zoom?: number;
  scrollWheelZoom?: boolean;
} & MapProps;

export const ReactMap = ({
  location,
  setLocation,
  zoom = 13,
  scrollWheelZoom = true,
  isShouldFly,
}: ReactMapProps) => {
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={location}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        className="w-full h-full z-0"
      >
        <Map
          location={location}
          setLocation={setLocation}
          isShouldFly={isShouldFly}
        />
      </MapContainer>
      {/* Crosshair marker at center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
        <div className="relative">
          <div className="absolute z-20 -top-6 left-1/2 -translate-x-1/2 w-12 h-12">
            <MapPin
              fill="blue"
              className="h-8 w-8 stroke-white drop-shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

type MapProps = {
  location: Location;
  setLocation: React.Dispatch<React.SetStateAction<Location>>;
  isShouldFly?: boolean;
};

const Map = ({ location, setLocation, isShouldFly }: MapProps) => {
  const map = useMap();

  useMapEvents({
    moveend(e) {
      const newCenter = map.getCenter();
      setLocation({ lat: newCenter.lat, lng: newCenter.lng });
    },
  });

  useEffect(() => {
    if (
      isShouldFly &&
      location.lat !== map.getCenter().lat &&
      location.lng !== map.getCenter().lng
    ) {
      map.flyTo(location, 18, {
        duration: 1,
      });
    }
  }, [location, map, isShouldFly]);

  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  );
};
