import productMovementRouter from '../controller/productmovement.controller';
import { Router } from 'express';

const router = Router().use("/product-movement", productMovementRouter);

export default router;