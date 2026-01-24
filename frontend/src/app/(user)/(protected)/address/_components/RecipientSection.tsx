"use client";

import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { AddressType, AddressTypeSelector } from "./AddressTypeSelector";

type Props = {
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  type: AddressType;
  setType: Dispatch<SetStateAction<AddressType>>;
};

export const RecipientSection = ({ name, setName, type, setType }: Props) => (
  <div className="space-y-4 pt-2">
    <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-1">
      <User className="h-5 w-5" />
      <span>Recipient Details</span>
    </div>
    <div className="space-y-2">
      <Label
        htmlFor="recipientName"
        className="text-xs uppercase tracking-wider text-slate-500 font-bold"
      >
        Recipient Name
      </Label>
      <Input
        id="recipientName"
        placeholder="e.g. John Doe"
        className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all h-12 rounded-xl"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>
    <AddressTypeSelector value={type} onChange={setType} />
  </div>
);
