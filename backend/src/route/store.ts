import storeRouter from "../controller/store.controller";
import { Router } from "express";
import { isAuth } from "../middleware/isAuth";
import { isSuperAdmin } from "../middleware/isSuperAdmin";

// const router = Router().use("/store", isAuth, isSuperAdmin, storeRouter);

// TODO: Use isAuth and isSuperAdmin middleware
const router = Router().use("/stores", storeRouter);

export default router;
