import { CreateDiscountInput, GetDiscountsByFilterInput, UpdateDiscountInput } from "../../schema/discount/index";
import { DiscountCreateReq, DiscountResponse, DiscountUpdateReq } from "../../repository/discount/entity";
import { Service } from "./interface";
import { DiscountRepo } from "../../repository/discount/interface";
import { Decimal } from "../../../prisma/generated/internal/prismaNamespaceBrowser";

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
    async updateDiscount(id: string, data: UpdateDiscountInput): Promise<DiscountResponse> {
        const UpdateData: DiscountUpdateReq = {
            ...data,
            percentage: data.percentage !== undefined ? Decimal(data.percentage) : undefined,
        };
        return this.repo.updateDiscount(id, UpdateData);
    }
    async getDiscountsByFilter(filter: GetDiscountsByFilterInput): Promise<DiscountResponse[]> {
        const formattedFilter: Partial<GetDiscountsByFilterInput> = {
            ...filter,
        };
        return this.repo.getDiscountsByFilter(formattedFilter);
    }
    async getDiscountById(id: string): Promise<DiscountResponse | null> {
        return this.repo.getDiscountById(id);
    }
    async deleteDiscount(id: string): Promise<void> {
        return this.repo.deleteDiscount(id);
    }
}