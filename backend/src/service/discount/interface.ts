import { CreateDiscountInput, GetDiscountsByFilterInput, UpdateDiscountInput } from "../../schema/discount/index";
import { DiscountResponse } from "../../repository/discount/entity";


interface DiscountService {
    createDiscount(data: CreateDiscountInput): Promise<DiscountResponse>;
    updateDiscount(id: string, data: UpdateDiscountInput): Promise<DiscountResponse>;
    getDiscountsByFilter(filter: GetDiscountsByFilterInput): Promise<DiscountResponse[]>;
    getDiscountById(id: string): Promise<DiscountResponse | null>;
    deleteDiscount(id: string): Promise<void>;
}

export type Service = DiscountService;