"use client";

import { useStockReportAuth } from '../_hooks/useStockReportAuth';
import { StockReportsHeader } from './StockReportsHeader';
import { StockReportsTabs } from './StockReportsTabs';

export function StockReportsContainer() {
  useStockReportAuth();

  return (
    <div className="space-y-6">
      <StockReportsHeader />
      <StockReportsTabs />
    </div>
  );
}
