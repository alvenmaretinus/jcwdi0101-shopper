import userRouter from "../controller/user.controller";
import { Router } from "express";


const router = Router().use("", userRouter);

export default router;
