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
    async getDiscountsByFilter(filter: GetDiscountsByFilterInput): Promise<DiscountResponse[]> {
        const { activeOnDate, ...rest } = filter;
        const formattedFilter: Partial<DiscountFilter> = {
            ...rest,
        };
        if (activeOnDate) {
            // Treat null startsAt/endsAt as unbounded intervals:
            // (startsAt IS NULL OR startsAt <= activeOnDate)
            // AND (endsAt IS NULL OR endsAt >= activeOnDate)
            (formattedFilter as any).AND = [
                {
                    OR: [
                        { startsAt: null },
                        { startsAt: { lte: activeOnDate } },
                    ],
                },
                {
                    OR: [
                        { endsAt: null },
                        { endsAt: { gte: activeOnDate } },
                    ],
                },
            ];
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