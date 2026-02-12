import { Router } from 'express';
import { PrismaVoucherRepository } from '../repository/voucher/adapter_prisma';
import { prisma } from '../lib/db/prisma';
import { VoucherService } from '../service/voucher/voucher.service';
import { 
    GetVoucherByIdInput, 
    GetVoucherByIdSchema, 
    GetVouchersByFilterInput, 
    GetVouchersByFilterSchema, 
    CreateVoucherInput, 
    CreateVoucherSchema, 
    UpdateVoucherSchema, 
    UpdateVoucherInput, 
    DeleteVoucherByIdInput, 
    DeleteVoucherByIdSchema,
    CalculateVoucherDiscountInput,
    CalculateVoucherDiscountSchema
} from '../schema/voucher/';
import { isSuperAdmin } from '../middleware/isSuperAdmin';
import { isAuth } from '../middleware/isAuth';

const vouchersRepo = new PrismaVoucherRepository(prisma);
const voucherService = new VoucherService(vouchersRepo);

const router = Router();

// Business requires that even non-logged in users can view vouchers
router.get("/vouchers", async (req, res) => {
    const inputData: GetVouchersByFilterInput = GetVouchersByFilterSchema.parse(req.query);
    const vouchers = await voucherService.getVouchersByFilter(inputData);
    return res.json(vouchers);
});

// Calculate voucher discount - public endpoint for UI preview
router.post("/vouchers/calculate-discount", async (req, res) => {
    const inputData: CalculateVoucherDiscountInput = CalculateVoucherDiscountSchema.parse(req.body);
    const totalDiscount = await voucherService.calculateVoucherDiscount(inputData.voucherIds, inputData.subtotal);
    return res.json({ totalDiscount, subtotal: inputData.subtotal, finalAmount: inputData.subtotal - totalDiscount });
});

router.post("/vouchers", isAuth, isSuperAdmin, async (req, res) => {
    const inputData: CreateVoucherInput = CreateVoucherSchema.parse(req.body);
    const createdVoucher = await voucherService.createVoucher(inputData);
    return res.status(201).json(createdVoucher);
});

router.patch("/vouchers/:id", isAuth, isSuperAdmin, async (req, res) => {
    const { id } = req.params;
    const inputData: UpdateVoucherInput = UpdateVoucherSchema.parse({
        ...req.body,
        id: id,
    });

    const updatedVoucher = await voucherService.updateVoucher(inputData);
    return res.json(updatedVoucher);
});

router.delete("/vouchers/:id", isAuth, isSuperAdmin, async (req, res) => {
    const inputData: DeleteVoucherByIdInput = DeleteVoucherByIdSchema.parse(req.params);
    await voucherService.deleteVoucher(inputData.id);
    return res.status(204).send();
});

// Anyone (even non-logged in users) can view voucher details
router.get("/vouchers/:id", async (req, res) => {
    const inputData: GetVoucherByIdInput = GetVoucherByIdSchema.parse(req.params);
    const voucher = await voucherService.getVoucherById(inputData.id);
    if (!voucher) {
        return res.status(404).json({ message: "Voucher not found" });
    }
    return res.json(voucher);
});

export default router;
