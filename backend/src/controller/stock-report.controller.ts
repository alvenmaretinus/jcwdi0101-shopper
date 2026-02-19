import { Router } from "express";
import { StockReportService } from "../service/stock-report/stock-report.service";
import { GetStockReportByFilterSchema } from "../schema/stock-report/GetStockReportByFilterSchema";
import { PrismaRepository } from "../repository/stock-report/adapter_prisma";
import { prisma } from "../lib/db/prisma";
import { isAuth } from "../middleware/isAuth";
import { isAdmin } from "../middleware/isAdmin";
import { UserRole } from "../../prisma/generated/enums";

const stockReportRepo = new PrismaRepository(prisma);
const stockReportService = new StockReportService(stockReportRepo);

const router = Router();

router.get("/", isAuth, isAdmin, async (req, res) => {
    const inputData = GetStockReportByFilterSchema.parse(req.query);
    
    // Additional check: if the user is ADMIN, ensure they can only access their own store's data
    if (req.user?.role === UserRole.ADMIN) {
        // ADMIN users must have a storeId and it must match their store
        if (!inputData.storeId || req.user.storeId !== inputData.storeId) {
            return res.status(403).json({ error: "Forbidden" });
        }
    } else if (req.user?.role === UserRole.SUPERADMIN && !inputData.storeId) {
        // SUPERADMIN can query all stores (when storeId is not provided)
        // This is allowed
    } else if (inputData.storeId && req.user?.role !== UserRole.SUPERADMIN) {
        // Non-SUPERADMIN users can only query their own store
        if (req.user?.storeId !== inputData.storeId) {
            return res.status(403).json({ error: "Forbidden" });
        }
    }
    
    const result = await stockReportService.getStockReportsByFilter(inputData);
    return res.json({
        data: result.items,
        total: result.total,
        page: Math.floor(inputData.skip / inputData.take) + 1,
        totalPages: Math.ceil(result.total / inputData.take),
    });
});

export default router;