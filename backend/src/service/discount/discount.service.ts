import { CreateDiscountInput, GetDiscountsByFilterInput, UpdateDiscountInput } from "../../schema/discount/index";
import { DiscountCreateReq, DiscountFilter, DiscountResponse, DiscountUpdateReq } from "../../repository/discount/entity";
import { Service } from "./interface";
import { DiscountRepo, PaginatedResponse } from "../../repository/discount/interface";
import Decimal from "decimal.js";

export class DiscountService implements Service {
   private repo: DiscountRepo;
    constructor(repo: DiscountRepo) {
        this.repo = repo;
    }
    
    async createDiscount(data: CreateDiscountInput): Promise<DiscountResponse> {
        const createData: DiscountCreateReq = {
            ...data,
            percentage: data.percentage !== undefined ? new Decimal(data.percentage) : undefined,
        };
        return this.repo.createDiscount(createData);
    }
    async updateDiscount(data: UpdateDiscountInput): Promise<DiscountResponse> {
        const { id, ...restData } = data;
        const updateData: Partial<DiscountUpdateReq> = {
            ...restData,
            percentage: restData.percentage !== undefined ? new Decimal(restData.percentage) : undefined,
        };
        return this.repo.updateDiscount(id, updateData);
    }

    /**
     * Business requirement: Filter discounts by multiple criteria.
     * 
     * Supports:
     * - Field filters: percentage, amount, type, productId, etc.
     * - Active date filter: Returns only discounts valid on the specified date
     * - Pagination: Returns paginated results with metadata
     * 
     * The percentage field is converted from number to Decimal for database compatibility.
     * Active date filtering uses complex logic (handled in repository layer) to check
     * if discount is active based on startsAt and endsAt fields.
     */
    async getDiscountsByFilter(filter: GetDiscountsByFilterInput): Promise<PaginatedResponse<DiscountResponse>> {
        const { percentage, page, limit, ...rest } = filter;
        const formattedFilter: Partial<DiscountFilter> = { 
            ...rest,
            ...(percentage !== undefined ? { percentage: new Decimal(percentage) } : {}),
        };

        return this.repo.getDiscountsByFilter(formattedFilter, { page, limit });
    }
    
    async getProductsWithDiscounts(filter: GetDiscountsByFilterInput): Promise<PaginatedResponse<DiscountResponse>> {
        const { percentage, page, limit, ...rest } = filter;
        const formattedFilter: Partial<DiscountFilter> = { 
            ...rest,
            isTiedToProduct: true, // Only get product-specific discounts
            ...(percentage !== undefined ? { percentage: new Decimal(percentage) } : {}),
        };

        return this.repo.getProductsWithDiscounts(formattedFilter, { page, limit });
    }
    
    async getDiscountById(id: string): Promise<DiscountResponse | null> {
        return this.repo.getDiscountById(id);
    }
    async deleteDiscount(id: string): Promise<void> {
        return this.repo.deleteDiscount(id);
    }
}