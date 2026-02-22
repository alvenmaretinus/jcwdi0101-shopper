import { apiFetch, HttpMethod } from "@/lib/apiFetch";

export type SummaryStockReportItem = {
  productId: string;
  productName: string;
  totalAdditions: number;
  totalReductions: number;
  endingStock: number;
};

export type SummaryStockReportResponse = {
  data: SummaryStockReportItem[];
  total: number;
  page: number;
  totalPages: number;
};

export interface GetSummaryStockReportParams {
  month: number;
  year: number;
  storeId?: string;
  skip?: number;
  take?: number;
}

export async function getSummaryStockReport(
  params: GetSummaryStockReportParams
): Promise<SummaryStockReportResponse> {
  const queryParams = new URLSearchParams({
    createdAtMonth: params.month.toString(),
    createdAtYear: params.year.toString(),
    ...(params.storeId && { storeId: params.storeId }),
    ...(params.skip !== undefined && { skip: params.skip.toString() }),
    ...(params.take !== undefined && { take: params.take.toString() }),
  });

  return apiFetch<SummaryStockReportResponse>(
    `/stock-report/summary?${queryParams.toString()}`,
    {
      method: HttpMethod.GET,
    }
  );
}
