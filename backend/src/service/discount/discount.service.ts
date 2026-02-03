import { CreateDiscountInput, GetDiscountsByFilterInput, UpdateDiscountInput } from "../../schema/discount/index";
import { DiscountCreateReq, DiscountFilter, DiscountResponse, DiscountUpdateReq } from "../../repository/discount/entity";
import { Service } from "./interface";
import { DiscountRepo } from "../../repository/discount/interface";
import { Decimal } from "decimal.js"

export class DiscountService implements Service {
   private repo: DiscountRepo;
    constructor(repo: DiscountRepo) {
        this.repo = repo;
    }
    
    async createDiscount(data: CreateDiscountInput): Promise<DiscountResponse> {
        const CreateData: DiscountCreateReq = {
            ...data,
            percentage: data.percentage !== undefined ? Decimal(data.percentage) : undefined,
        };
        return this.repo.createDiscount(CreateData);
    }
    async updateDiscount(data: UpdateDiscountInput): Promise<DiscountResponse> {
        const { id, ...restData } = data;
        const UpdateData: Partial<DiscountUpdateReq> = {
            ...restData,
            percentage: restData.percentage !== undefined ? Decimal(restData.percentage) : undefined,
        };
        return this.repo.updateDiscount(id, UpdateData);
    }
    async getDiscountsByFilter(filter: GetDiscountsByFilterInput): Promise<DiscountResponse[]> {
        const { activeOnDate, ...rest } = filter;
        const formattedFilter: Partial<DiscountFilter> = {
            ...rest,
        };
        if (activeOnDate) {
            formattedFilter.startsAt = { lte: activeOnDate };
            formattedFilter.endsAt = { gte: activeOnDate };
        }
        return this.repo.getDiscountsByFilter(formattedFilter);
    }
    async getDiscountById(id: string): Promise<DiscountResponse | null> {
        return this.repo.getDiscountById(id);
    }
    async deleteDiscount(id: string): Promise<void> {
        return this.repo.deleteDiscount(id);
    }
}