import { DiscountCreateReq, DiscountUpdateReq, DiscountResponse, DiscountFilter,  } from "./entity";

export interface DiscountRepo {
    createDiscount(data: DiscountCreateReq): Promise<DiscountResponse>;
    updateDiscount(id: string, data: Partial<DiscountUpdateReq>): Promise<DiscountResponse>;
    getDiscountsByFilter(filter: Partial<DiscountFilter>): Promise<DiscountResponse[]>;
    getDiscountById(id: string): Promise<DiscountResponse | null>;
    deleteDiscount(id: string): Promise<void>;
}