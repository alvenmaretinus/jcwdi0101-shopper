import { Router } from 'express';
import { PrismaVoucherRepository } from '../repository/voucher/adapter_prisma';
import { prisma } from '../lib/db/prisma';
import { VoucherService } from '../service/voucher/voucher.service';
import { 
    GetVoucherByIdInput, 
    GetVoucherByIdSchema, 
    GetVoucherByCodeInput,
    GetVoucherByCodeSchema,
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
import { isMaybeAuth } from '../middleware/isMaybeAuth';
import { isAuth } from '../middleware/isAuth';
import { UserRole } from '../../prisma/generated/enums';

const vouchersRepo = new PrismaVoucherRepository(prisma);
const voucherService = new VoucherService(vouchersRepo);

const router = Router();

// Business requires that even non-logged in users can view vouchers
// However, referral vouchers are only visible to the user they're designated for
router.get("/vouchers", isMaybeAuth, async (req, res) => {
    const inputData: GetVouchersByFilterInput = GetVouchersByFilterSchema.parse(req.query);
    // Include userId if user is authenticated
    if (req.user?.id) {
        inputData.userId = req.user.id;
    }
    const includeAllReferral = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPERADMIN;
    const result = await voucherService.getVouchersByFilter(inputData, { includeAllReferral });
    return res.json(result);
});

// Calculate voucher discount - public endpoint for UI preview
router.post("/vouchers/calculate-discount", isAuth, async (req, res) => {
    const inputData: CalculateVoucherDiscountInput = CalculateVoucherDiscountSchema.parse(req.body);
    const userId = req.user?.id as string | undefined;
    const breakdown = await voucherService.calculateVoucherDiscountBreakdown(
        inputData.voucherCodes,
        inputData.subtotal,
        userId,
        inputData.shippingCost ?? 0,
        inputData.cartItems,
    );
    return res.json({
        subtotal: inputData.subtotal,
        shippingCost: inputData.shippingCost ?? 0,
        productDiscount: breakdown.productDiscount,
        shippingDiscount: breakdown.shippingDiscount,
        totalDiscount: breakdown.totalDiscount,
        quantityBonuses: breakdown.quantityBonuses,
        finalAmount: inputData.subtotal + (inputData.shippingCost ?? 0) - breakdown.totalDiscount,
    });
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

// Get voucher by code - public endpoint for users to apply vouchers
// MUST be before the /:id route to avoid conflicts
router.get("/vouchers/code/:code", async (req, res) => {
    const inputData: GetVoucherByCodeInput = GetVoucherByCodeSchema.parse(req.params);
    const voucher = await voucherService.getVoucherByCode(inputData.code);
    if (!voucher) {
        return res.status(404).json({ message: "Voucher not found" });
    }
    return res.json(voucher);
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
