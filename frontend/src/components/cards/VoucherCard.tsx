"use client";

import { Clock } from "lucide-react";
import { PromoCard } from "@/lib/promoCardBuilder";

interface VoucherCardProps {
  promo: PromoCard;
  gradient: { from: string; to: string };
}

export function VoucherCard({ promo, gradient }: VoucherCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl text-white p-6"
      style={{
        background: `linear-gradient(to bottom right, ${gradient.from}, ${gradient.to})`,
      }}
    >
      <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">
        {promo.emoji}
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
          <Clock className="h-4 w-4" />
          <span>{promo.expiresIn}</span>
        </div>
        <div className="text-3xl font-bold mb-2">{promo.discount}</div>
        <h3 className="text-lg font-bold mb-2">{promo.title}</h3>
        <p className="text-white/80 text-sm mb-4">{promo.description}</p>
        {promo.code && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
            <span className="text-sm">Code: </span>
            <span className="font-mono font-bold">{promo.code}</span>
          </div>
        )}
        <p className="text-xs text-white/80 mt-2">
          Remaining uses: {promo.remainingUses}
        </p>
      </div>
    </div>
  );
}
