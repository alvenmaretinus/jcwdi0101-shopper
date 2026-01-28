import { OrderItemSalesReportEntity, SalesReportEntity } from "./entities";


export function toDomainModel(param: OrderItemSalesReportEntity): SalesReportEntity[] {
    const results: SalesReportEntity[] = [];

    for (const [idx, item] of (param.orderItems ?? []).entries()) {
        results.push({
            number: idx+1,
            completion_date: param.deliveredAt ? param.deliveredAt.toISOString() : '',
            order_id: param.id,
            product_name: item.product.name,
            category_name: item.product.categoryId,
            product_price: item.unitPrice,
            quantity: item.quantity,
            total_price: item.unitPrice * item.quantity,
        });
    } 
    return results;
}
export function toDomainModels(params: OrderItemSalesReportEntity[]): SalesReportEntity[] {
    let results: SalesReportEntity[] = [];
    for (const param of params) {
        // map each param to SalesReportEntity
        results.push(...toDomainModel(param));
    }
    return results;
}