
export type CreateProductCategoryReq = {
    category: string
}

export type GetProductCategoryReq = {
    id: string
    category?: string
}

export type ProductCategory = {
    id?: string
    category: string
    createdAt?: Date | string
    updatedAt?: Date | string
}