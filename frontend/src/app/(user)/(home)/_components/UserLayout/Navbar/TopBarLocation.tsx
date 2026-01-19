"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronDown, MapPin, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import getDistance from "geolib/es/getDistance";

const locations = {
  jakarta: { latitude: -6.208763, longitude: 106.845599 },
  bandung: { latitude: -6.917464, longitude: 107.619123 },
  surabaya: { latitude: -7.257472, longitude: 112.75209 },
};

const mockStores = [
  {
    id: 1,
    name: "SuperMart",
    ...locations.surabaya,
    address: "Jakarta",
    isDefault: true,
  },
  {
    id: 2,
    name: "FreshMart",
    address: "Bandung",
    ...locations.bandung,
    isDefault: false,
  },
  {
    id: 3,
    name: "DailyShop",
    ...locations.jakarta,
    address: "Surabaya",
    isDefault: false,
  },
];
type MockStore = (typeof mockStores)[0] & {
  distance?: number | undefined;
};
export const TopBarLocation = () => {
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [stores, setStores] = useState<MockStore[]>(mockStores);

  const [selectedStore, setSelectedStore] = useState<MockStore>(mockStores[0]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleSelectStore = (store: MockStore) => {
    setSelectedStore(store);
    setIsStoreDialogOpen(false);
  };

  const handleSortByNearest = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const storesWithDistance = stores.map((store) => ({
          ...store,
          distance:
            getDistance(
              { latitude: coords.latitude, longitude: coords.longitude },
              {
                latitude: store.latitude,
                longitude: store.longitude,
              },
              1
            ) / 1000,
        }));

        const sortedStores = storesWithDistance.sort(
          (a, b) => a.distance - b.distance
        );
        console.log(sortedStores);

        setStores(sortedStores);
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
    <div className="px-6 py-2 bg-primary text-white">
      <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
        <DialogTrigger className="" asChild>
          <button className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity">
            <Store className="h-4 w-4" />
            <span className="font-semibold">{selectedStore.name}</span>
            <span className="hidden sm:inline text-primary-foreground/80">
              • {selectedStore.address}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Store</DialogTitle>
          </DialogHeader>
          <Button
            className="text-muted-foreground"
            size="sm"
            variant="secondary"
            onClick={handleSortByNearest}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? "Sorting..." : "Sort by nearest"}
          </Button>
          <div className="flex flex-col gap-2 mt-4">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => handleSelectStore(store)}
                className={`flex items-start gap-3 p-4 rounded-lg text-left transition-colors ${
                  selectedStore.id === store.id
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-muted/50 hover:bg-muted border-2 border-transparent"
                }`}
              >
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{store.name}</span>

                    {store.isDefault && (
                      <Badge
                        variant="outline"
                        className="text-xs border-primary text-primary"
                      >
                        Main Store
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {store.address}
                  </p>
                </div>

                <div className="self-center text-gray-600 text-sm font-medium px-2 py-1 rounded-md">
                  {store?.distance && `${store?.distance?.toFixed(2)} km`}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
