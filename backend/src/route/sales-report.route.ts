import salesReportRouter from "../controller/sales-report.controller";
import { Router } from "express";

const router = Router().use("/sales-report", salesReportRouter);

export default router;
