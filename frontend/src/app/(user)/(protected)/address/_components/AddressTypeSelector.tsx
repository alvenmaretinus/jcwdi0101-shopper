"use client";

import { Label } from "@/components/ui/label";
import { Home, Briefcase } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export type AddressType = "HOME" | "OFFICE";

type Props = {
  value: AddressType;
  onChange: Dispatch<SetStateAction<AddressType>>;
};

export const AddressTypeSelector = ({ value, onChange }: Props) => {
  const options = [
    { type: "HOME" as const, icon: Home, label: "Home" },
    { type: "OFFICE" as const, icon: Briefcase, label: "Office" },
  ];

  return (
    <div className="space-y-3">
      <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">
        Address Type
      </Label>
      <div className="grid grid-cols-2 gap-4">
        {options.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => onChange(item.type)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all relative ${
              value === item.type
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold"
                : "border-slate-100 bg-white text-slate-500 hover:border-emerald-200"
            }`}
          >
            <item.icon
              className={`h-5 w-5 ${
                value === item.type ? "text-emerald-600" : "text-slate-400"
              }`}
            />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
