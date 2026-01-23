export interface ProductStoreRepo {
    createProductStore(data: any): Promise<any>;
    getProductStoreByID(id: string): Promise<any | null>;
    getProductStoresByFilter(filter: Partial<any>): Promise<any[]>;
    updateProductStore(id: string, data: Partial<any>): Promise<any>;
    deleteProductStore(id: string): Promise<void>;
}