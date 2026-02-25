"use client";

import { ChevronDown, ChevronUp, Tag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AppliedDiscount {
  id: string;
  name: string;
  label: string;
  savedAmount: number;
  endsAt?: Date | null;
}

interface ItemBreakdown {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  totalDiscount: number;
  bogoFreeQuantity: number;
  appliedDiscounts: AppliedDiscount[];
}

export interface DiscountBreakdownProps {
  items: ItemBreakdown[];
}

export const DiscountBreakdown = ({ items }: DiscountBreakdownProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (productId: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(productId)) {
      newSet.delete(productId);
    } else {
      newSet.add(productId);
    }
    setExpandedItems(newSet);
  };

  return (
    <div className="space-y-4">
      {/* Items with discounts */}
      <div className="space-y-3">
        {items.map((item) => {
          const isExpanded = expandedItems.has(item.productId);
          const hasDiscounts = item.appliedDiscounts.length > 0 || item.totalDiscount > 0;

          return (
            <div key={item.productId} className="border border-border rounded-lg p-3">
              {/* Item header */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity}× @ Rp {item.unitPrice.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold">
                    Rp {item.totalPrice.toLocaleString("id-ID")}
                  </p>
                  {item.totalDiscount > 0 && (
                    <p className="text-xs text-red-500">
                      -Rp {item.totalDiscount.toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              </div>

              {/* BOGO info */}
              {item.bogoFreeQuantity > 0 && (
                <div className="mt-2 text-xs text-primary font-medium">
                  🎁 +{item.bogoFreeQuantity} item free (BOGO)
                </div>
              )}

              {/* Expandable discounts */}
              {hasDiscounts && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(item.productId)}
                    className="w-full mt-2 justify-between text-xs h-8 text-muted-foreground hover:text-foreground"
                  >
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {item.appliedDiscounts.length} discount
                      {item.appliedDiscounts.length !== 1 ? "s" : ""}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>

                  {/* Expanded discounts */}
                  {isExpanded && (
                    <div className="mt-2 ml-2 space-y-1 border-l-2 border-muted pl-2">
                      {item.appliedDiscounts.map((discount) => (
                        <div key={discount.id} className="text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground truncate">
                              {discount.name}
                            </span>
                            <span className="text-red-500 font-medium ml-2 flex-shrink-0">
                              -{discount.label}
                            </span>
                          </div>
                          <div className="text-muted-foreground text-[10px] mt-0.5">
                            Saved: Rp {discount.savedAmount.toLocaleString("id-ID")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
