import { VoucherCreateReq, VoucherUpdateReq, VoucherResponse, VoucherFilter } from "./entity";

export interface VoucherRepo {
    createVoucher(data: VoucherCreateReq): Promise<VoucherResponse>;
    updateVoucher(id: string, data: Partial<VoucherUpdateReq>): Promise<VoucherResponse>;
    getVouchersByFilter(filter: Partial<VoucherFilter>): Promise<VoucherResponse[]>;
    getVoucherById(id: string): Promise<VoucherResponse | null>;
    getVoucherByCode(code: string): Promise<VoucherResponse | null>;
    getVouchersByIds(ids: string[]): Promise<VoucherResponse[]>;
    deleteVoucher(id: string): Promise<void>;
}
