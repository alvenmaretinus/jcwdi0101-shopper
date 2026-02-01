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
    if (req.user != undefined 
        && req.user.role === UserRole.ADMIN 
        && req.user.storeId != null 
        && req.user.storeId !== inputData.storeId) {
        return res.status(403).json({ error: "Forbidden" });
    }
    const result = await stockReportService.getStockReportsByFilter(inputData);
    return res.json(result);
});

export default router;