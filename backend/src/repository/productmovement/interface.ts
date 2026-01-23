export interface ProductMovementRepo {
    createProductMovement(data: any): Promise<any>;
    getProductMovementsByFilter(filter: Partial<any>): Promise<any[]>;
}