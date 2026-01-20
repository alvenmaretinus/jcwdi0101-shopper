import authRouter from "../controller/auth.controller";
import { Router } from "express";

const router = Router().use("/auth", authRouter);

export default router;
