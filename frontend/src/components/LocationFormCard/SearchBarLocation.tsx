import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { getForwardGeoIdn } from "@/services/geolocation/getForwardGeoIdn";
import { Coords } from "@/types/Coords";
import { MIN_LOCATION_SEARCH_LENGTH } from "@/constants/geo";

type Props = {
  setCoords: Dispatch<SetStateAction<Coords>>;
  isShouldFly: boolean;
  setIsShouldFly: Dispatch<SetStateAction<boolean>>;
};

type GeoLocation = {
  lat: number;
  lng: number;
  name: string;
};

const SearchBarLocation = ({
  setCoords,
  isShouldFly,
  setIsShouldFly,
}: Props) => {
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [locations, setLocations] = useState<GeoLocation[] | null>(null);

  useEffect(() => {
    if (isShouldFly) return;
    const timeout = setTimeout(() => {
      setSearch(input);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [input]);

  useEffect(() => {
    if (search.length < MIN_LOCATION_SEARCH_LENGTH) return setLocations(null);
    const getLocations = async () => {
      setLocations(await getForwardGeoIdn(search));
    };
    getLocations();
  }, [search]);

  const onSelectHandler = (location: GeoLocation) => {
    setIsShouldFly(true);
    setInput(location.name);
    setCoords({ lat: location.lat, lng: location.lng });
    setTimeout(() => {
      setIsShouldFly(false);
    }, 100);
    setLocations(null);
  };

  return (
    <div className="relative w-full">
      <SearchBar
        input={input}
        setInput={setInput}
        placeholder="Search for a location..."
      />

      {locations && (
        <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-md max-h-60 overflow-auto">
          {locations.map((location, i) => (
            <button
              key={location.name + i}
              className="w-full px-3 py-2 text-left hover:bg-muted flex gap-2 items-center"
              onClick={() => onSelectHandler(location)}
            >
              <MapPin className="h-4 w-4 text-primary" />
              {location.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBarLocation;
