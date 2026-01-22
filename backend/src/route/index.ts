import { Router } from "express";
import storeRouter from "./store";
import userRouter from "./user";

export const appRouter = Router();

appRouter.use(storeRouter);
appRouter.use(userRouter);
