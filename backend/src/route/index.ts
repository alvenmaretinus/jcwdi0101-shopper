import { Router } from "express";
import storeRouter from "./store";

export const appRouter = Router();

appRouter.use(storeRouter);
