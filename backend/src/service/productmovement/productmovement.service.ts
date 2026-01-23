import { Service } from "../productmovement/interface";

class ProductMovementService implements Service {
    private productMovementRepo;
    constructor(productMovementRepo: any) {
        this.productMovementRepo = productMovementRepo;
    }
    async createProductMovement(data: any): Promise<any> {
        return this.productMovementRepo.createProductMovement(data);
    }
    async getProductMovementsByFilter(filter: Partial<any>): Promise<any[]> {
        return this.productMovementRepo.getProductMovementsByFilter(filter);
    }
}

export { ProductMovementService };