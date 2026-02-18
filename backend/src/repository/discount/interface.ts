import { DiscountCreateReq, DiscountUpdateReq, DiscountResponse, DiscountFilter } from "./entity";

export interface PaginationParams {
    page: number;
    limit: number;
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

export interface DiscountRepo {
    createDiscount(data: DiscountCreateReq): Promise<DiscountResponse>;
    updateDiscount(id: string, data: Partial<DiscountUpdateReq>): Promise<DiscountResponse>;
    getDiscountsByFilter(filter: Partial<DiscountFilter>, pagination?: PaginationParams): Promise<PaginatedResponse<DiscountResponse>>;
    getProductsWithDiscounts(filter: Partial<DiscountFilter>, pagination?: PaginationParams): Promise<PaginatedResponse<DiscountResponse>>;
    getDiscountById(id: string): Promise<DiscountResponse | null>;
    deleteDiscount(id: string): Promise<void>;
}