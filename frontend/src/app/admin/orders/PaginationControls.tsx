"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPrev: () => void;
  onNext: () => void;
  onLimitChange?: (n: number) => void;
}

export default function PaginationControls({
  page,
  totalPages,
  total,
  limit,
  onPrev,
  onNext,
  onLimitChange,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of{" "}
        {total}
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onPrev}
          disabled={page <= 1}
        >
          Prev
        </Button>
        <div className="px-3 py-1 border rounded">
          Page {page} / {totalPages}
        </div>
        <Button size="sm" onClick={onNext} disabled={page >= totalPages}>
          Next
        </Button>
        {onLimitChange && (
          <Select
            value={String(limit)}
            onValueChange={(v) => onLimitChange(Number(v))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="15">15 / page</SelectItem>
              <SelectItem value="25">25 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
