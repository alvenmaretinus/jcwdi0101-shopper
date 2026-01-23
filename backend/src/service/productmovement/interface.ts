interface ProductMovementService {
    createProductMovement(data: any): Promise<any>;
    getProductMovementsByFilter(filter: Partial<any>): Promise<any[]>;
}

export type Service = ProductMovementService;