"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStockReportStore } from '@/store/admin';
import { SummaryReportTab } from './SummaryReportTab';
import { DetailedReportTab } from './DetailedReportTab';

export function StockReportsTabs() {
  const activeTab = useStockReportStore((s) => s.activeTab);
  const setActiveTab = useStockReportStore((s) => s.setActiveTab);

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'summary' | 'detailed')} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="summary">Summary Report</TabsTrigger>
        <TabsTrigger value="detailed">Detailed Report</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="space-y-6">
        <SummaryReportTab />
      </TabsContent>

      <TabsContent value="detailed" className="space-y-6">
        <DetailedReportTab />
      </TabsContent>
    </Tabs>
  );
}
