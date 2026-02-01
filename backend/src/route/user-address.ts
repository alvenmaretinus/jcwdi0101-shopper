import userAddressRouter from "../controller/user-address.controller";
import { Router } from "express";

const router = Router().use("/user-address", userAddressRouter);

export default router;
