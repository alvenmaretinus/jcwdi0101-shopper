import { Router } from "express";
import storeRouter from "./store";
import userRouter from "./user";
import authRouter from "./auth";

export const appRouter = Router();

appRouter.use(storeRouter);
appRouter.use(userRouter);
appRouter.use(authRouter);
