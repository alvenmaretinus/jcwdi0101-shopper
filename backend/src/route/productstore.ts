import productStoreRouter from '../controller/productstore.controller';
import { Router } from 'express';

const router = Router().use("/product-store", productStoreRouter);

export default router;