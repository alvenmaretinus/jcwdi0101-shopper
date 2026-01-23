import productStoreRouter from '../controller/productstore.controller';
import { Router } from 'express';

const router = Router().use("", productStoreRouter);

export default router;