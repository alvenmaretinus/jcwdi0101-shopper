import stockReportRouter from "../controller/stock-report.controller";
import { Router } from "express";

const router = Router().use("/stock-report", stockReportRouter);

export default router;
