export interface Service {
    getProductsByFilterWithOptionalStock(filter: Partial<FilterInput>, withStock: boolean): Promise<any[]>
}