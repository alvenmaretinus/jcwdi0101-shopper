import { apiFetch, HttpMethod } from "@/lib/apiFetch";

export enum MovementType {
  PURCHASED = "PURCHASED",
  SOLD = "SOLD",
  REALLOCATED = "REALLOCATED",
  CANCELED = "CANCELED",
  ADJUSTMENT = "ADJUSTMENT",
}

export type DetailedMovementRecord = {
  id: string;
  date: string;
  movementType: MovementType;
  description: string | null;
  fromStoreName: string | null;
  toStoreName: string | null;
  quantityChange: number;
  endStock: number | null;
};

export type DetailedStockReportResponse = {
  data: DetailedMovementRecord[];
  startingStock: number;
  endingStock: number;
  total: number;
  page: number;
  totalPages: number;
};

export interface GetDetailedStockReportParams {
  productId: string;
  month: number;
  year: number;
  storeId: string; // Required for detailed reports - per-store tracking
  skip?: number;
  take?: number;
}

export async function getDetailedStockReport(
  params: GetDetailedStockReportParams
): Promise<DetailedStockReportResponse> {
  const queryParams = new URLSearchParams({
    productId: params.productId,
    createdAtMonth: params.month.toString(),
    createdAtYear: params.year.toString(),
    storeId: params.storeId,
    ...(params.skip !== undefined && { skip: params.skip.toString() }),
    ...(params.take !== undefined && { take: params.take.toString() }),
  });

  return apiFetch<DetailedStockReportResponse>(
    `/stock-report/detailed?${queryParams.toString()}`,
    {
      method: HttpMethod.GET,
    }
  );
}
