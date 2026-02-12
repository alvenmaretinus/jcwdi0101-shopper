import { CreateVoucherInput, GetVouchersByFilterInput, UpdateVoucherInput } from "../../schema/voucher/index";
import { VoucherCreateReq, VoucherFilter, VoucherResponse, VoucherUpdateReq } from "../../repository/voucher/entity";

export interface Service {
    createVoucher(data: CreateVoucherInput): Promise<VoucherResponse>;
    updateVoucher(data: UpdateVoucherInput): Promise<VoucherResponse>;
    getVouchersByFilter(filter: GetVouchersByFilterInput): Promise<VoucherResponse[]>;
    getVoucherById(id: string): Promise<VoucherResponse | null>;
    getVouchersByIds(ids: string[]): Promise<VoucherResponse[]>;
    deleteVoucher(id: string): Promise<void>;
}
