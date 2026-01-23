import { Router } from "express";
import storeRouter from "./store";
import userRouter from "./user";
import authRouter from "./auth";
import cartRouter from "./cart.route";

export const appRouter = Router();

appRouter.use(authRouter);
appRouter.use(storeRouter);
appRouter.use(userRouter);
appRouter.use(authRouter);
appRouter.use(cartRouter);
