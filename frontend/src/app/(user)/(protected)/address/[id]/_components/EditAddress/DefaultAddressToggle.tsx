"use client";

import { Dispatch, SetStateAction } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  isDefault: boolean;
  setIsDefault: Dispatch<SetStateAction<boolean>>;
  disabled?: boolean;
};

export const DefaultAddressToggle = ({ isDefault, setIsDefault,disabled }: Props) => {
  return (
    <div className="pt-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-fit">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsDefault(!isDefault)}
              className={`flex items-center gap-3 group px-1 ${
                disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"
              }`}
            >
              <div
                className={`w-12 h-6 rounded-full p-1 transition-colors relative shadow-inner ${
                  isDefault ? "bg-emerald-500" : "bg-slate-200"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform shadow-md ${
                    isDefault ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
              <span
                className={`text-sm font-semibold transition-colors ${
                  isDefault ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                Set as Default Address
              </span>
            </button>
          </div>
        </TooltipTrigger>
        {disabled && (
          <TooltipContent side="right" className="max-w-[200px]">
            This is your default address. To change it, set another address as default.
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
};
