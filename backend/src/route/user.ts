import userRouter from "../controller/user.controller";
import { Router } from "express";


// const router = Router().use("/store", isAuth, isSuperAdmin, storeRouter);

const router = Router().use("/user", userRouter);

export default router;
