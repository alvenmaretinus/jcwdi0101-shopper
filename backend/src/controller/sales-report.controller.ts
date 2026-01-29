import { Router } from "express"
import { Service } from "../service/sales-report/interface"
import { SalesReportService } from "../service/sales-report/sales-report.service"
import { GetSalesReportByFilterSchema, GetSalesReportByFilterInput } from "../schema/sales-report"
import { SalesReportRepository } from "../repository/sales-report/interface"
import { PrismaRepository } from "../repository/sales-report/adapter_prisma"
import { prisma } from "../lib/db/prisma"
import { SalesReportEntity } from "../repository/sales-report/entities"
import { isAuth } from "../middleware/isAuth"
import { isAdmin } from "../middleware/isAdmin"
import { UserRole } from "../../prisma/generated/browser"

const router = Router()

const salesReportRepository: SalesReportRepository= new PrismaRepository(prisma)
const salesReportService: Service = new SalesReportService(salesReportRepository)

router.get("/", isAuth, isAdmin, async (req, res) => {
    const inputData: GetSalesReportByFilterInput = GetSalesReportByFilterSchema.parse(req.query)
    if (req.user!.role == UserRole.ADMIN && inputData.storeId !== req.user!.storeId) {
        return res.status(403).json({ message: "Forbidden" })
    }
    const result: SalesReportEntity[] = await salesReportService.getSalesReportByFilter(inputData)
    return res.json(result)
})

export default router;