import { Router } from 'express';
import { PrismaRepository } from '../repository/product/adapter_prisma';
import { prisma } from '../lib/db/prisma';
import { ProductService } from '../service/product/product.service';
import { FilterInput, GetProductsByFilterSchema, GetProductsByFilterInput } from '../schema/product/GetProductsByFilterSchema';

const productsRepo = new PrismaRepository(prisma);
const productService = new ProductService(productsRepo);

const router = Router();

router.get("/products", async (req, res) => {
    const inputData: GetProductsByFilterInput = GetProductsByFilterSchema.parse(req.query);
    const filter: FilterInput = inputData.filter;
    const result = await productService.getProductsByFilterWithOptionalStock(filter, inputData.withStock);
    return res.json(result);    
});

export default router;
