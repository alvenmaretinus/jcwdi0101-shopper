import { VoucherCreateReq, VoucherUpdateReq, VoucherResponse, VoucherFilter } from "./entity";

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface VoucherQueryOptions {
    includeAllReferral?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface VoucherRepo {
    createVoucher(data: VoucherCreateReq): Promise<VoucherResponse>;
    updateVoucher(id: string, data: Partial<VoucherUpdateReq>): Promise<VoucherResponse>;
    getVouchersByFilter(
        filter: Partial<VoucherFilter>,
        pagination?: PaginationParams,
        options?: VoucherQueryOptions
    ): Promise<PaginatedResponse<VoucherResponse>>;
    getVoucherById(id: string): Promise<VoucherResponse | null>;
    getVoucherByCode(code: string): Promise<VoucherResponse | null>;
    getVouchersByIds(ids: string[]): Promise<VoucherResponse[]>;
    getVouchersByCodes(codes: string[]): Promise<VoucherResponse[]>;
    deleteVoucher(id: string): Promise<void>;
}
