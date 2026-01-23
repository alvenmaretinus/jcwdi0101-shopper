import productStoreRouter from '../controller/productstore.controller';
import { Router } from 'express';

const router = Router().use('/product-stores', productStoreRouter);

export default router;