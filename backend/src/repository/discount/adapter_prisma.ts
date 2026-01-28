import { DiscountCreateReq, DiscountUpdateReq, DiscountResponse, DiscountFilter } from "./entity";
import { DiscountRepo } from "./interface";
import { PrismaClient } from "../../../prisma/generated/client";
import { DiscountCreateInput } from "../../../prisma/generated/models";
import { DiscountType } from "../../../prisma/generated/enums";


export class PrismaRepository implements DiscountRepo {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async createDiscount(data: DiscountCreateReq): Promise<DiscountResponse> {
        const DiscountCreateData: DiscountCreateInput = {
            ...data,
            type: data.type as DiscountType,
        }
        const discount: DiscountResponse = await this.prisma.discount.create(
            { data: DiscountCreateData }
        );
        return discount;
    }
    async updateDiscount(id: string, data: DiscountUpdateReq): Promise<DiscountResponse> {
        const discount = await this.prisma.discount.update({
            where: { id },
            data,
        });
        return discount as DiscountResponse;
    } 
    async getDiscountsByFilter(filter: Partial<DiscountFilter>): Promise<DiscountResponse[]> {
        const discounts = await this.prisma.discount.findMany({
            where: filter,
        });
        return discounts as DiscountResponse[];
    }
    
    async getDiscountById(id: string): Promise<DiscountResponse | null> {
        const discount = await this.prisma.discount.findUnique({
            where: { id },
        });
        return discount as DiscountResponse | null;
    }

    async deleteDiscount(id: string): Promise<void> {
        await this.prisma.discount.delete({
            where: { id },
        });
    } 
}
