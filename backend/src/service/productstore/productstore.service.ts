import { Service } from "./interface";

class ProductStoreService implements Service {
    private productStoreRepo;
    constructor(productStoreRepo: any) {
        this.productStoreRepo = productStoreRepo;
    }
    async createProductStore(data: any): Promise<any> {
        this.productStoreRepo.createProductStore(data);
        // TODO: Create Product Movement record here
    }
    async getProductStoreByID(id: string): Promise<any | null> {
        return this.productStoreRepo.getProductStoreByID(id);
    }
    async getProductStoresByFilter(filter: Partial<any>): Promise<any[]> {
        return this.productStoreRepo.getProductStoresByFilter(filter);
    }
    async updateProductStore(id: string, data: Partial<any>): Promise<any> {
        this.productStoreRepo.updateProductStore(id, data);
        // TODO: Create Product Movement record here
    }
    async deleteProductStore(id: string): Promise<void> {
        return this.productStoreRepo.deleteProductStore(id);
        // TODO: Create Product Movement record here
    }
}

export { ProductStoreService };