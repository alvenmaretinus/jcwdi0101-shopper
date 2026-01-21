import { Router } from 'express';
import { PrismaRepository } from '../repository/product/adapter_prisma';
import { prisma } from '../lib/db/prisma';
import { ProductService } from '../service/product/product.service';
import { CreateProductInput, CreateProductSchema, GetProductByIdInput, 
    GetProductByIdSchema, DeleteProductByIdSchema, DeleteProductByIdInput,  FilterInput, GetProductsByFilterSchema, 
    GetProductsByFilterInput, UpdateProductSchema } from '../schema/product';
import { isAuth } from '../middleware/isAuth';
import { isSuperAdmin } from '../middleware/isSuperAdmin';

const productsRepo = new PrismaRepository(prisma);
const productService = new ProductService(productsRepo);

const router = Router();

router.get("/products",  async (req, res) => {
    const inputData: GetProductsByFilterInput = GetProductsByFilterSchema.parse(req.query);
    const filter: FilterInput = inputData.filter;
    const result = await productService.getProductsByFilterWithOptionalStock(filter, inputData.withStock);
    return res.json(result);    
});

router.get("/product/:id", async (req, res) => {
    const inputData: GetProductByIdInput = GetProductByIdSchema.parse(req.params);
    const result = await productService.getProductsByFilterWithOptionalStock({ id: inputData.id }, false);
    return res.json(result);
});

router.post("/product", isAuth, isSuperAdmin, async (req, res) => {
    const inputData: CreateProductInput = CreateProductSchema.parse(req.body);
    const createdProduct = await productService.createProduct(inputData);
    return res.status(201).json(createdProduct);
});

router.patch("/product/:id", isAuth, isSuperAdmin, async (req, res) => {
    const data = UpdateProductSchema.parse({ id: req.params.id, ...req.body });
    const updatedProduct = await productService.updateProduct(data.id, data);
    return res.json(updatedProduct);
});

router.delete("/product/:id", isAuth, isSuperAdmin, async (req, res) => {
    const inputData: DeleteProductByIdInput = DeleteProductByIdSchema.parse(req.params);
    await productService.deleteProduct(inputData.id);
    return res.status(204).send();
});


export default router;
