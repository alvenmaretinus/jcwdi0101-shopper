import storeRouter from "../controller/store.controller";
import { Router } from "express";

const router = Router().use("/stores", storeRouter);

export default router;
