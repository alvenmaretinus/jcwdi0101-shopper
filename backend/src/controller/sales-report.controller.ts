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
import { UserRole } from "../../prisma/generated/enums"
import { ZodError } from "zod"

const router = Router()

const salesReportRepository: SalesReportRepository= new PrismaRepository(prisma)
const salesReportService: Service = new SalesReportService(salesReportRepository)

router.get("/", isAuth, isAdmin, async (req, res) => {
    const parseResult = GetSalesReportByFilterSchema.safeParse(req.query)
    if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid query parameters", errors: parseResult.error})
    }
    const inputData = parseResult.data

    if (req.user!.role === UserRole.ADMIN) {
        const adminStoreId = req.user!.storeId
        if (!adminStoreId) {
            return res.status(403).json({ message: "Forbidden. Admin does not have a store assigned." })
        }
        if (inputData.storeId && inputData.storeId !== adminStoreId) {
            return res.status(403).json({ message: "Forbidden. Admin cannot access other stores." })
        }
        inputData.storeId = adminStoreId
    }

    const [data, count]: [SalesReportEntity[], number] = await salesReportService.getSalesReportByFilter(inputData)
    return res.json({
        data: data,
        count: count,
        page: Math.floor(inputData.skip / inputData.take) + 1,
        pageSize: data.length,
    })
})

export default router;