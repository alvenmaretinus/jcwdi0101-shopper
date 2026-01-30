import { Router } from "express";
import { StockReportService } from "../service/stock-report/stock-report.service";
import { GetStockReportByFilterSchema } from "../schema/stock-report/GetStockReportByFilterSchema";
import { PrismaRepository } from "../repository/stock-report/adapter_prisma";
import { prisma } from "../lib/db/prisma";

const stockReportRepo = new PrismaRepository(prisma);
const stockReportService = new StockReportService(stockReportRepo);

const router = Router();

router.get("/", async (req, res) => {
    const inputData = GetStockReportByFilterSchema.parse(req.query);
    const result = await stockReportService.getStockReportsByFilter(inputData);
    return res.json(result);
});

export default router;