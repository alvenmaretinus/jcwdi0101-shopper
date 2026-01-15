"use client";

import { Coords } from "@/types/Coords";
import { MapPin } from "lucide-react";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";

type ReactMapProps = {
  zoom?: number;
  scrollWheelZoom?: boolean;
} & MapProps;

export const ReactMap = ({
  coords,
  setCoords,
  zoom = 14,
  scrollWheelZoom = true,
  isShouldFly,
}: ReactMapProps) => {
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={coords}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        className="w-full h-full z-0"
      >
        <Map coords={coords} setCoords={setCoords} isShouldFly={isShouldFly} />
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
  coords: Coords;
  setCoords: React.Dispatch<React.SetStateAction<Coords>>;
  isShouldFly?: boolean;
};

const Map = ({ coords, setCoords, isShouldFly }: MapProps) => {
  const map = useMap();

  useMapEvents({
    moveend(e) {
      const newCenter = map.getCenter();
      setCoords({ lat: newCenter.lat, lng: newCenter.lng });
    },
  });

  useEffect(() => {
    if (
      isShouldFly &&
      coords.lat !== map.getCenter().lat &&
      coords.lng !== map.getCenter().lng
    ) {
      map.flyTo(coords, 15, {
        duration: 1,
      });
    }
  }, [coords, map, isShouldFly]);

  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  );
};
