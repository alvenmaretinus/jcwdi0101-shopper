import { CreateVoucherInput, GetVouchersByFilterInput, UpdateVoucherInput } from "../../schema/voucher/index";
import { VoucherResponse} from "../../repository/voucher/entity";

export interface Service {
    createVoucher(data: CreateVoucherInput): Promise<VoucherResponse>;
    updateVoucher(data: UpdateVoucherInput): Promise<VoucherResponse>;
    getVouchersByFilter(filter: GetVouchersByFilterInput): Promise<VoucherResponse[]>;
    getVoucherById(id: string): Promise<VoucherResponse | null>;
    getVoucherByCode(code: string): Promise<VoucherResponse | null>;
    getVouchersByIds(ids: string[]): Promise<VoucherResponse[]>;
    getVouchersByCodes(codes: string[]): Promise<VoucherResponse[]>;
    deleteVoucher(id: string): Promise<void>;
    calculateVoucherDiscount(voucherCodes: string[], subtotal: number): Promise<number>;
}
