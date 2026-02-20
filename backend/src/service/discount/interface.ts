import { CreateDiscountInput, GetDiscountsByFilterInput, UpdateDiscountInput } from "../../schema/discount/index";
import { DiscountResponse } from "../../repository/discount/entity";
import { PaginatedResponse } from "../../repository/discount/interface";


interface DiscountService {
    createDiscount(data: CreateDiscountInput): Promise<DiscountResponse>;
    updateDiscount(data: UpdateDiscountInput): Promise<DiscountResponse>;
    getDiscountsByFilter(filter: GetDiscountsByFilterInput): Promise<PaginatedResponse<DiscountResponse>>;
    getDiscountById(id: string): Promise<DiscountResponse | null>;
    deleteDiscount(id: string): Promise<void>;
}

export type Service = DiscountService;