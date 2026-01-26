"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { DefaultAddressBadge } from "@/components/Badge/DefaultAddressBadge";
import { UserAddress } from "@/types/UserAddress";

export interface AddressSelectionProps {
  addresses: UserAddress[] | null;
  selectedAddress: UserAddress | null;
  setSelectedAddress: Dispatch<SetStateAction<UserAddress | null>>;
}

export const AddressSelection = ({
  addresses,
  selectedAddress,
  setSelectedAddress,
}: AddressSelectionProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (address: UserAddress) => {
    setSelectedAddress(address);
    setOpen(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Shipping Address</h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 font-medium h-auto p-0"
            >
              Change
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm rounded-2xl sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                My Address
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 my-3 max-h-[50vh] overflow-y-auto pr-2">
              {addresses && addresses.length > 0 ? (
                addresses.map((address) => (
                  <button
                    key={address.id}
                    className={`w-full p-3 rounded-xl border transition-all text-left flex items-start gap-3 group ${
                      selectedAddress?.id === address.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50 hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelect(address)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {address.addressType}
                        </span>
                        {address.isDefault && <DefaultAddressBadge />}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed italic">
                        {address.addressName}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4 italic">
                    Add some address first
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Link href="/address/create">Add New Address</Link>
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 border-t pt-4">
              <Button
                asChild
                className="w-full rounded-full py-5 text-sm md:text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-0 transition-all shadow-md shadow-emerald-500/20"
              >
                <Link href="/address/create">
                  <Plus className="h-4 w-4 md:h-5 md:w-5 mr-1" />
                  Add New Address
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {selectedAddress ? (
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl border-0">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">
                {selectedAddress.addressType}
              </span>
              {selectedAddress.isDefault && (
                <Badge className="bg-primary/10 text-primary text-[10px] h-4">
                  Default
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              {selectedAddress.addressName}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 bg-muted/50 rounded-xl border-0">
          <p className="text-sm text-muted-foreground italic">
            {!addresses || addresses.length === 0
              ? "Please add an address first"
              : "No address selected"}
          </p>
        </div>
      )}
    </div>
  );
};
