export interface ProductService {
    getProductsByFilterWithOptionalStock(filter: Partial<any>, withStock: boolean): Promise<any[]>
}

export type Service = ProductService;