import { Router } from "express";
import storeRouter from "./store";
import userRouter from "./user";
import cartRouter from "./cart.route";
import orderRoute from "./order";
import userAddressRouter from "./user-address";
import shippingCostRouter from "./shipping-cost";
import salesReportRouter from "./sales-report.route";

export const appRouter = Router();

appRouter.use(storeRouter);
appRouter.use(userRouter);
appRouter.use(cartRouter);
appRouter.use(orderRoute);
appRouter.use(userAddressRouter);
appRouter.use(shippingCostRouter);
appRouter.use(salesReportRouter);
