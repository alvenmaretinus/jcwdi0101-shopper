import { Router } from "express";
import storeRouter from "./store";
import userRouter from "./user";

import productRouter from "./product.route";
import productStoreRouter from "./productstore";
import productMovementRouter from "./productmovement";
import cartRouter from "./cart.route";
import orderRoute from "./order";
import userAddressRouter from "./user-address";
import shippingCostRouter from "./shipping-cost";
import discountRouter from "./discount.route";
import voucherRouter from "./voucher.route";
import productCategoryRouter from "./product-category.route";
import salesReportRouter from "./sales-report.route";
import stockReportRouter from "./stock-report.route";
import referralRouter from "../controller/referral.controller";

export const appRouter = Router();

appRouter.use(storeRouter);
appRouter.use(userRouter);
appRouter.use(productRouter);
appRouter.use(productStoreRouter);
appRouter.use(productMovementRouter);
appRouter.use(cartRouter);
appRouter.use(orderRoute);
appRouter.use(userAddressRouter);
appRouter.use(shippingCostRouter);
appRouter.use(discountRouter);
appRouter.use(voucherRouter);
appRouter.use(productCategoryRouter);
appRouter.use(salesReportRouter);
appRouter.use(stockReportRouter);
appRouter.use(referralRouter);
