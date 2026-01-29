import { PrismaClient } from "../../../prisma/generated/client";
import { DateTimeFilter, Order$orderItemsArgs, OrderFindManyArgs, OrderInclude, OrderItemInclude, OrderItemListRelationFilter, OrderItemWhereInput, OrderWhereInput, ProductDefaultArgs, ProductInclude, ProductWhereInput } from "../../../prisma/generated/models";
import { OrderItemSalesReportEntity, SalesReportByFilterEntity, SalesReportEntity } from "./entities";
import { SalesReportRepository } from "./interface";
import { toDomainModels } from "./mapper";

export class PrismaRepository implements SalesReportRepository {
    private prismaClient: PrismaClient;
    
    constructor (prismaClient: PrismaClient) {
        this.prismaClient = prismaClient;
    }

    generateOrderItemsFilter(categoryId: string | undefined, productName: string | undefined): OrderItemListRelationFilter | undefined {
        if (categoryId === undefined && productName === undefined) {
            return undefined;
        }
        const productWhereInput: ProductWhereInput = {
            categoryId: categoryId ? categoryId : undefined,
            name: productName ? { contains: productName } : undefined,
        }
        const orderItemWhereInput: OrderItemWhereInput = {
            product: productWhereInput,
        }
        return {
            every: orderItemWhereInput
        };
    }

    async getOrderItemSalesReportEntityList(params: OrderWhereInput): Promise<OrderItemSalesReportEntity[]> {
        const productInclude: ProductInclude = { category: true };
        const productArgs: ProductDefaultArgs = { include: productInclude };
        const orderItemProduct: OrderItemInclude = { product: productArgs };
        const orderItems: Order$orderItemsArgs = { include: orderItemProduct };
        const orderInclude: OrderInclude = { orderItems: orderItems };
        const orderFindManyArgs: OrderFindManyArgs = {
            where: params,
            include: orderInclude,
        }

        const results: OrderItemSalesReportEntity[] = await this.prismaClient.order.findMany(orderFindManyArgs);

        return results;
    }
    
    async getSalesReportByFilter(params: SalesReportByFilterEntity): Promise<SalesReportEntity[]> {
        const createdAtFilter: DateTimeFilter = {
                gte: new Date(`${params.monthAndYear}-01`),
                lt: new Date(new Date(`${params.monthAndYear}-01`).setMonth(new Date(`${params.monthAndYear}-01`).getMonth() + 1)),
        };
        const where: OrderWhereInput = {
            storeId: params.storeId,
            createdAt: createdAtFilter,
            orderItems: this.generateOrderItemsFilter(params.categoryId, params.productName),
        };
        
        return toDomainModels(await this.getOrderItemSalesReportEntityList(where));
    }
}


      