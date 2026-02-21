import {Service} from './interface';
import {ProductsRepo, PaginationParams, PaginatedResponse} from '../../repository/product/interface';
import { FilterInput } from '../../schema/product/GetProductsByFilterSchema';
import { CreateProductInput, UpdateProductInput } from '../../schema/product';
import { Product, ProductWithStock, ProductWithDiscounts, ProductWithStockAndDiscounts } from '../../repository/product/entities';
import { PrismaClient } from '../../../prisma/generated/client';
import { calculateStackedDiscount } from '../../lib/discount/calculateStackedDiscount';

export class ProductService implements Service {
    private productRepo: ProductsRepo;
    private prisma: PrismaClient;

    constructor(productRepo: ProductsRepo, prisma: PrismaClient) {
        this.productRepo = productRepo;
        this.prisma = prisma;
    }

    async getProductsByFilterWithOptionalStock(
        filter: Partial<FilterInput>,
        withStock: boolean,
        withDiscounts: boolean = false,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<Product> | PaginatedResponse<ProductWithStock> | PaginatedResponse<ProductWithDiscounts> | PaginatedResponse<ProductWithStockAndDiscounts>>
    {
        let result: PaginatedResponse<Product> | PaginatedResponse<ProductWithStock>;
        
        if (withStock) {
            result = await this.productRepo.getProductsByFilterWithStock(filter, pagination);
        } else {
            result = await this.productRepo.getProductsByFilter(filter, pagination);
        }

        // If discount calculation is not requested, return as is
        if (!withDiscounts) {
            return result;
        }

        // Fetch active discounts for all products in the result
        const productIds = result.data.map(p => p.id);
        
        if (productIds.length === 0) {
            return result;
        }

        const discounts = await this.prisma.discount.findMany({
            where: {
                isTiedToProduct: true,
                productId: { in: productIds },
                isSoftDeleted: false,
                OR: [
                    { startsAt: null },
                    { startsAt: { lte: new Date() } }
                ],
                AND: [
                    {
                        OR: [
                            { endsAt: null },
                            { endsAt: { gte: new Date() } }
                        ]
                    }
                ]
            }
        });

        // Group discounts by product
        const discountsByProduct = new Map<string, typeof discounts>();
        discounts.forEach(discount => {
            if (discount.productId) {
                if (!discountsByProduct.has(discount.productId)) {
                    discountsByProduct.set(discount.productId, []);
                }
                discountsByProduct.get(discount.productId)!.push(discount);
            }
        });

        // Calculate discounted pricing for each product
        const enhancedData = result.data.map(product => {
            const productDiscounts = discountsByProduct.get(product.id) || [];
            
            if (productDiscounts.length === 0) {
                return product;
            }

            const pricing = calculateStackedDiscount(product.price, productDiscounts as any);
            
            return {
                ...product,
                discountedPricing: pricing,
            };
        });

        return {
            data: enhancedData,
            meta: result.meta,
        };
    }

    async createProduct(data: CreateProductInput): Promise<Product> {
        return this.productRepo.createProduct(data);
    }

    async updateProduct(data: UpdateProductInput): Promise<Product> {
        const {id, ...updateData} = data;
        return this.productRepo.updateProduct(id, updateData);
    }

    async deleteProduct(id: string): Promise<void> {
        return this.productRepo.deleteProduct(id);
    }
} 

