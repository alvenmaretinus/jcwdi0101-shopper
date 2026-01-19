export interface Service {
    getProductsByFilterWithOptionalStock(filter: Partial<any>, withStock: boolean): Promise<any[]>
}