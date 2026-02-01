"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface ShippingCostItem {
  shipping_name: string;
  service_name: string;
  weight: number;
  is_cod: boolean;
  shipping_cost: number;
  shipping_cashback: number;
  shipping_cost_net: number;
  grandtotal: number;
  service_fee: number;
  net_income: number;
  etd: string;
}

interface ShippingMethodSelectionProps {
  shippingData: {
    calculate_reguler: ShippingCostItem[];
    calculate_cargo: ShippingCostItem[];
    calculate_instant: ShippingCostItem[];
  } | null;
  selectedMethod: string;
  onSelect: (method: string) => void;
}

export const ShippingMethodSelection = ({
  shippingData,
  selectedMethod,
  onSelect,
}: ShippingMethodSelectionProps) => {
  const [open, setOpen] = useState(false);
  const [tempMethod, setTempMethod] = useState(selectedMethod);

  const getCheapest = (items: ShippingCostItem[]) => {
    if (!items || items.length === 0) return null;
    return items.sort((prev, curr) =>
      prev.shipping_cost - curr.shipping_cost
    )[0];
  };

  const methods = shippingData
    ? [
        {
          id: "regular",
          label: "Economy",
          badge: null,
          description: "Standard shipping for daily needs",
          item: getCheapest(shippingData.calculate_reguler),
        },
        {
          id: "cargo",
          label: "Cargo",
          badge: "Big items",
          description: "Best for heavy/large items",
          item: getCheapest(shippingData.calculate_cargo),
        },
        {
          id: "instant",
          label: "Instant",
          badge: "Fastest",
          description: "Direct pickup and immediate delivery",
          item: getCheapest(shippingData.calculate_instant),
        },
      ].filter((m) => m.item !== null)
    : [];

  const currentMethod = methods.find((m) => m.id === selectedMethod);

  const handleConfirm = () => {
    onSelect(tempMethod);
    setOpen(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Shipping Method</h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 font-medium h-auto p-0 hover:bg-transparent"
            >
              Change
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm rounded-2xl sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Shipping Method
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 my-3 max-h-[50vh] overflow-y-auto pr-2">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className="p-3 rounded-xl border border-border transition-all cursor-pointer flex items-center justify-between hover:bg-gray-50"
                  onClick={() => setTempMethod(method.id)}
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <Label className="font-semibold cursor-pointer block text-sm">
                        {method.label}
                      </Label>
                      <p className="font-normal text-black text-xs">
                        Rp {method.item?.shipping_cost.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                        Delivery guarantee: {method.item?.etd}
                      </p>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center justify-center min-w-[1.5rem]">
                    {tempMethod === method.id && (
                      <Check className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                className="w-full rounded-full py-5 text-sm md:text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-500/20"
                onClick={handleConfirm}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {currentMethod ? (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border-0 transition-all text-left">
          <div className="flex flex-col">
            <p className="font-semibold text-sm tracking-tight">
              {currentMethod.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentMethod.item?.shipping_name} -{" "}
              {currentMethod.item?.service_name}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-black text-sm">
              Rp {currentMethod.item?.shipping_cost.toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Delivery guarantee: {currentMethod.item?.etd}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 bg-muted/50 rounded-xl border-0">
          <p className="text-sm text-muted-foreground italic">
            No shipping method selected
          </p>
        </div>
      )}
    </div>
  );
};
