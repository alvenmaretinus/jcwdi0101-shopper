import {Service} from './interface';
import {ProductsRepo, PaginationParams, PaginatedResponse} from '../../repository/product/interface';
import { FilterInput } from '../../schema/product/GetProductsByFilterSchema';
import { CreateProductInput, UpdateProductInput } from '../../schema/product';
import { Product, ProductWithStock, ProductWithDiscounts, ProductWithStockAndDiscounts } from '../../repository/product/entities';
import { PrismaClient } from '../../../prisma/generated/client';
import { calculateStackedDiscount } from '../../lib/discount/calculateStackedDiscount';
import { BadRequestError } from '../../error/BadRequestError';
import { toDomainModel } from '../../repository/product/mapper';

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
            },
            select: {
                id: true,
                name: true,
                percentage: true,
                amount: true,
                type: true,
                isVoucher: true,
                isWithMinimum: true,
                minimumPrice: true,
                hasDiscountAmountCap: true,
                maxDiscountAmount: true,
                isQuantityLimited: true,
                maxUses: true,
                useCounter: true,
                isTiedToProduct: true,
                productId: true,
                buyQuantity: true,
                freeQuantity: true,
                startsAt: true,
                endsAt: true,
                isSoftDeleted: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        const formatDiscountLabel = (discount: (typeof discounts)[number]) => {
            if (discount.type === 'PERCENTAGE') {
                return `${Number(discount.percentage ?? 0)}%`;
            }

            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
            }).format(Number(discount.amount ?? 0));
        };

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

            const unmetMinimumDiscounts = productDiscounts
                .filter((discount) =>
                    (discount.type === 'PERCENTAGE' || discount.type === 'FIXED_AMOUNT') &&
                    discount.isWithMinimum &&
                    discount.minimumPrice &&
                    product.price < discount.minimumPrice
                )
                .map((discount) => ({
                    id: discount.id,
                    name: discount.name || 'Discount',
                    label: formatDiscountLabel(discount),
                    minimumPrice: discount.minimumPrice!,
                }));
            
            return {
                ...product,
                discountedPricing: {
                    ...pricing,
                    unmetMinimumDiscounts: unmetMinimumDiscounts.length > 0 ? unmetMinimumDiscounts : undefined,
                },
            };
        });

        return {
            data: enhancedData,
            meta: result.meta,
        };
    }

    async createProduct(data: CreateProductInput): Promise<Product> {
        // Use transaction to validate and create product atomically
        const result = await this.prisma.$transaction(async (tx) => {
            // Check if product with same name already exists (case-insensitive, any status)
            const existingProduct = await tx.product.findFirst({
                where: {
                    name: {
                        equals: data.name,
                        mode: 'insensitive'
                    }
                },
                include: {
                    category: true,
                    productImages: true,
                }
            });

            if (existingProduct) {
                // If soft-deleted, restore it by updating the record
                if (existingProduct.isSoftDeleted) {
                    const now = new Date();
                    const restoredProduct = await tx.product.update({
                        where: { id: existingProduct.id },
                        data: {
                            name: data.name,
                            description: data.description,
                            price: data.price,
                            weight: data.weight,
                            isSoftDeleted: false,
                            updatedAt: now,
                            category: { connect: { id: data.categoryId } },
                        },
                        include: {
                            category: true,
                            productImages: true,
                        },
                    });
                    return restoredProduct;
                } else {
                    // Product exists and is not soft-deleted
                    throw new BadRequestError(`Product with name ${data.name} already exists`);
                }
            }

            // Create new product if it doesn't exist
            const now = new Date();
            const createdProduct = await tx.product.create({
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    createAt: now,
                    updatedAt: now,
                    weight: data.weight,
                    category: { connect: { id: data.categoryId } },
                },
                include: {
                    category: true,
                    productImages: true,
                },
            });

            return createdProduct;
        });

        // Convert to domain model
        return toDomainModel(result);
    }

    async updateProduct(data: UpdateProductInput): Promise<Product> {
        const {id, ...updateData} = data;
        return this.productRepo.updateProduct(id, updateData);
    }

    async deleteProduct(id: string): Promise<void> {
        return this.productRepo.deleteProduct(id);
    }

    async addProductImages(productId: string, imagePaths: string[]): Promise<Product> {
        // Verify product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new Error("Product not found");
        }

        // Create product image records
        for (const url of imagePaths) {
            await this.prisma.productImage.create({
                data: {
                    url,
                    productId,
                },
            });
        }

        // Return updated product with images
        return this.prisma.product.findUnique({
            where: { id: productId },
            include: { productImages: true },
        }) as Promise<Product>;
    }

    async deleteProductImage(productId: string, imageId: string): Promise<Product> {
        // Verify image exists and belongs to the product
        const image = await this.prisma.productImage.findUnique({
            where: { id: imageId },
        });

        if (!image) {
            throw new Error("Image not found");
        }

        if (image.productId !== productId) {
            throw new Error("Image does not belong to this product");
        }

        // Delete the image record
        await this.prisma.productImage.delete({
            where: { id: imageId },
        });

        // Delete the file from disk
        try {
            const path = await import("path");
            const fs = await import("fs");
            const filePath = path.join(process.cwd(), image.url);
            await fs.promises.unlink(filePath).catch(() => {});
        } catch (err) {
            console.error("Error deleting image file:", err);
        }

        // Return updated product with remaining images
        return this.prisma.product.findUnique({
            where: { id: productId },
            include: { productImages: true },
        }) as Promise<Product>;
    }
} 

