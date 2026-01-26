import { Router } from "express";
import storeRouter from "./store";
import userRouter from "./user";
import cartRouter from "./cart.route";
import userAddressRouter from "./user-address";
import shippingCostRouter from "./shipping-cost";
import productCategoryRouter from "./product-category.route";

export const appRouter = Router();

appRouter.use(storeRouter);
appRouter.use(userRouter);
appRouter.use(cartRouter);
appRouter.use(userAddressRouter);
appRouter.use(shippingCostRouter);
appRouter.use(productCategoryRouter);