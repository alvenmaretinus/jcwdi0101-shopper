"use client";

import { CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
};

export const AddressFormHeader = ({ title, subtitle }: Props) => (
  <CardHeader className="bg-emerald-600 text-white pb-8">
    <CardTitle className="text-2xl font-bold flex items-center gap-2">
      <MapPin className="h-6 w-6" />
      {title}
    </CardTitle>
    <p className="text-emerald-100 text-sm opacity-90">{subtitle}</p>
  </CardHeader>
);
