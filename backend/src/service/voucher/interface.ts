import { CreateVoucherInput, GetVouchersByFilterInput, UpdateVoucherInput } from "../../schema/voucher/index";
import { VoucherResponse} from "../../repository/voucher/entity";
import { PaginatedResponse, VoucherQueryOptions } from "../../repository/voucher/interface";

export interface Service {
    createVoucher(data: CreateVoucherInput): Promise<VoucherResponse>;
    updateVoucher(data: UpdateVoucherInput): Promise<VoucherResponse>;
    getVouchersByFilter(filter: GetVouchersByFilterInput, options?: VoucherQueryOptions): Promise<PaginatedResponse<VoucherResponse>>;
    getVoucherById(id: string): Promise<VoucherResponse | null>;
    getVoucherByCode(code: string): Promise<VoucherResponse | null>;
    getVouchersByIds(ids: string[]): Promise<VoucherResponse[]>;
    getVouchersByCodes(codes: string[]): Promise<VoucherResponse[]>;
    deleteVoucher(id: string): Promise<void>;
    calculateVoucherDiscount(
        voucherCodes: string[],
        subtotal: number,
        userId?: string,
        shippingCost?: number,
    ): Promise<number>;
}
