
export type CreateProductCategoryReq = {
    name: string
}

export type GetProductCategoryReq = {
    id?: string
    name?: string
}

export type UpdateProductCategoryReq = {
    name: string // Required since we only have one field to update
}

export type ProductCategory = {
    id: string
    name: string
    createdAt: Date | string
    updatedAt: Date | string
}