import productMovementRouter from '../controller/productmovement.controller';
import { Router } from 'express';

const router = Router().use("", productMovementRouter);

export default router;