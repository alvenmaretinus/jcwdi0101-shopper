import { Or } from "@prisma/client/runtime/client";
import { Order, PrismaClient } from "../../../prisma/generated/client";
import { QueryMode } from "../../../prisma/generated/internal/prismaNamespaceBrowser";
import { DateTimeFilter, Order$orderItemsArgs, OrderFindManyArgs, OrderInclude, OrderItemInclude, OrderItemListRelationFilter, OrderItemWhereInput, OrderOrderByWithRelationInput, OrderWhereInput, ProductDefaultArgs, ProductInclude, ProductWhereInput } from "../../../prisma/generated/models";
import { OrderItemSalesReportEntity, SalesReportByFilterEntity, SalesReportEntity } from "./entities";
import { SalesReportRepository } from "./interface";
import { toDomainModels } from "./mapper";

export class PrismaRepository implements SalesReportRepository {
    private prismaClient: PrismaClient;
    
    constructor (prismaClient: PrismaClient) {
        this.prismaClient = prismaClient;
    }

    generateOptionalOrderItemsFilter(categoryId: string | undefined, productName: string | undefined): OrderItemListRelationFilter | undefined {
        if (categoryId === undefined && productName === undefined) {
            return undefined;
        }
        const productWhereInput: ProductWhereInput = {
            categoryId: categoryId ? categoryId : undefined,
            name: productName ? { contains: productName, mode: QueryMode.insensitive} : undefined,
        }
        const orderItemWhereInput: OrderItemWhereInput = {
            product: productWhereInput,
        }
        return {
            some: orderItemWhereInput
        };
    }

    async execute(params: OrderWhereInput,  orderInclude: OrderInclude,take: number, skip: number, orderBy: OrderOrderByWithRelationInput): Promise<[OrderItemSalesReportEntity[], number]> {
        const orderFindManyArgs: OrderFindManyArgs = {
            where: params,
            include: orderInclude,
            take: take,
            skip: skip,
            orderBy: orderBy,
        }
        
        const [results, count]: [OrderItemSalesReportEntity[], number] = await this.prismaClient.$transaction([
            this.prismaClient.order.findMany(orderFindManyArgs),
            this.prismaClient.order.count({ where: params })
        ]);
        return [results, count];
    }

    prepareOrderInclude(): OrderInclude {
        const productInclude: ProductInclude = { category: true };
        const productArgs: ProductDefaultArgs = { include: productInclude };
        const orderItemProduct: OrderItemInclude = { product: productArgs };
        const orderItems: Order$orderItemsArgs = { include: orderItemProduct };
        const orderInclude: OrderInclude = { orderItems: orderItems };

        return orderInclude;
    }

    prepareDateTimeFilter(monthAndYear: string): DateTimeFilter {
        const startOfMonth = new Date(`${monthAndYear}-01`);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        const completionDateFilter: DateTimeFilter = {
            gte: startOfMonth,
            lt: endOfMonth,
        };
        return completionDateFilter;
    }

    prepareOrderWhereInput(storeId: string, completionDateFilter: DateTimeFilter, orderItemsFilter: OrderItemListRelationFilter | undefined): OrderWhereInput {
        const where: OrderWhereInput = {
            storeId: storeId,
            deliveredAt: completionDateFilter,
            orderItems: orderItemsFilter
        };
        return where;
    }
    
    async getSalesReportByFilter(params: SalesReportByFilterEntity): Promise<[SalesReportEntity[], number]> {
        const completionDateFilter: DateTimeFilter = this.prepareDateTimeFilter(params.monthAndYear);
        const optionalOrderItemsFilter: OrderItemListRelationFilter | undefined = this.generateOptionalOrderItemsFilter(params.categoryId, params.productName);
        const orderWhereInput: OrderWhereInput = this.prepareOrderWhereInput(params.storeId, completionDateFilter, optionalOrderItemsFilter);
        const orderInclude: OrderInclude = this.prepareOrderInclude();
        const orderBy: OrderOrderByWithRelationInput = { deliveredAt: 'desc', id: 'asc' };
        
        const [results, count] = await this.execute(orderWhereInput, orderInclude, params.take, params.skip, orderBy);
        return [toDomainModels(results), count];
    } 
}


      