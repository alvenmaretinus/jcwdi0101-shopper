import { OrderPaymentType, OrderStatus } from "../../../prisma/generated/browser";

export type SalesReportEntity = {
    number: number;
    completion_date: string;
    order_id: string;
    product_name: string;
    category_name: string;
    product_price: number;
    quantity: number;
    total_price: number;
}

export type SalesReportByFilterEntity = {
    storeId: string
    monthAndYear: string
    categoryId?: string
    productName?: string
}

type product = {
            id: string;
            updatedAt: Date;
            name: string;
            description: string | null;
            price: number;
            createAt: Date;
            categoryId: string;
        };

type orderItems = ({
        product: product;
        id: string;
        quantity: number;
        unitPrice: number;
        productName: string;
        productCategory: string;
        orderId: string;
        productId: string;
    })[];

export type OrderItemSalesReportEntity = ({
    orderItems?: orderItems;
    id: string;
    subtotal: number;
    totalDiscount: number;
    shippingCost: number;
    grandTotal: number;
    status: OrderStatus;
    paymentType: OrderPaymentType;
    createdAt: Date;
    updatedAt: Date;
    paidAt: Date | null;
    confirmedAt: Date | null;
    cancelledAt: Date | null;
    shippedAt: Date | null;
    deliveredAt: Date | null;
    paymentDueAt: Date | null;
    cancelReason: string | null;
    paymentProofUrl: string | null;
    shippingAddress: string;
    storeAddress: string;
    storeName: string;
    storeId: string;
    userId: string;
});
