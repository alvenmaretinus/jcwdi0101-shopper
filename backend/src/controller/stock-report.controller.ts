import { Router } from "express";
import { StockReportService } from "../service/stock-report/stock-report.service";
import { GetStockReportByFilterSchema } from "../schema/stock-report/GetStockReportByFilterSchema";
import { GetSummaryStockReportSchema } from "../schema/stock-report/SummaryStockReportSchema";
import { GetDetailedStockReportSchema } from "../schema/stock-report/DetailedStockReportSchema";
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
    
    console.log('[Stock Report] Request:', {
        storeId: inputData.storeId,
        month: inputData.createdAtMonth,
        year: inputData.createdAtYear,
        skip: inputData.skip,
        take: inputData.take,
        userRole: req.user?.role,
        userStoreId: req.user?.storeId
    });
    
    // Additional check: if the user is ADMIN, ensure they can only access their own store's data
    // Note: The repository filters by fromStoreId OR toStoreId, so admins see all movements
    // that affect their store (both incoming and outgoing)
    if (req.user?.role === UserRole.ADMIN) {
        // ADMIN users must have a storeId and it must match their store
        if (!inputData.storeId || req.user.storeId !== inputData.storeId) {
            return res.status(403).json({ error: "Forbidden: You can only view movements for your own store" });
        }
    } else if (req.user?.role === UserRole.SUPERADMIN && !inputData.storeId) {
        // SUPERADMIN can query all stores (when storeId is not provided)
        // This is allowed
    } else if (inputData.storeId && req.user?.role !== UserRole.SUPERADMIN) {
        // Non-SUPERADMIN users can only query their own store
        if (req.user?.storeId !== inputData.storeId) {
            return res.status(403).json({ error: "Forbidden: You can only view movements for your own store" });
        }
    }
    
    const result = await stockReportService.getStockReportsByFilter(inputData);
    
    console.log('[Stock Report] Result:', {
        itemsCount: result.items.length,
        total: result.total
    });
    
    return res.json({
        data: result.items,
        total: result.total,
        page: Math.floor(inputData.skip / inputData.take) + 1,
        totalPages: Math.ceil(result.total / inputData.take),
    });
});

/**
 * GET /stock-report/summary
 * Returns aggregated inventory data per product per month
 * Summary includes: total additions, total reductions, and ending stock
 */
router.get("/summary", isAuth, isAdmin, async (req, res) => {
    const inputData = GetSummaryStockReportSchema.parse(req.query);
    
    console.log('[Stock Report Summary] Request:', {
        storeId: inputData.storeId,
        month: inputData.createdAtMonth,
        year: inputData.createdAtYear,
        userRole: req.user?.role,
        userStoreId: req.user?.storeId
    });
    
    // Authorization: same as main report endpoint
    if (req.user?.role === UserRole.ADMIN) {
        if (!inputData.storeId || req.user.storeId !== inputData.storeId) {
            return res.status(403).json({ error: "Forbidden: You can only view reports for your own store" });
        }
    } else if (inputData.storeId && req.user?.role !== UserRole.SUPERADMIN) {
        if (req.user?.storeId !== inputData.storeId) {
            return res.status(403).json({ error: "Forbidden: You can only view reports for your own store" });
        }
    }
    
    const result = await stockReportService.getSummaryStockReport(inputData);
    
    console.log('[Stock Report Summary] Result:', {
        itemsCount: result.items.length,
        total: result.total
    });
    
    return res.json({
        data: result.items,
        total: result.total,
        page: Math.floor(inputData.skip / inputData.take) + 1,
        totalPages: Math.ceil(result.total / inputData.take),
    });
});

/**
 * GET /stock-report/detailed
 * Returns detailed inventory history for a specific product in a month
 * Includes: all movements with quantity change and ending stock
 */
router.get("/detailed", isAuth, isAdmin, async (req, res) => {
    const inputData = GetDetailedStockReportSchema.parse(req.query);
    
    console.log('[Stock Report Detailed] Request:', {
        productId: inputData.productId,
        storeId: inputData.storeId,
        month: inputData.createdAtMonth,
        year: inputData.createdAtYear,
        userRole: req.user?.role,
        userStoreId: req.user?.storeId
    });
    
    // Authorization: store admins can only see their own store; superadmins can view any store
    if (req.user?.role === UserRole.ADMIN) {
        if (req.user.storeId !== inputData.storeId) {
            return res.status(403).json({ error: "Forbidden: You can only view reports for your own store" });
        }
    }
    // SUPERADMIN can view any store
    
    const result = await stockReportService.getDetailedStockReport(inputData);
    
    console.log('[Stock Report Detailed] Result:', {
        itemsCount: result.items.length,
        total: result.total,
        startingStock: result.startingStock,
        endingStock: result.endingStock
    });
    
    return res.json({
        data: result.items,
        startingStock: result.startingStock,
        endingStock: result.endingStock,
        total: result.total,
        page: Math.floor(inputData.skip / inputData.take) + 1,
        totalPages: Math.ceil(result.total / inputData.take),
    });
});

export default router;