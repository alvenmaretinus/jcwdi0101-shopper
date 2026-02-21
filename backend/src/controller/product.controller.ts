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
const productService = new ProductService(productsRepo, prisma);

const router = Router();

// Non-logged in users can view products
router.get("/",  async (req, res) => {
    const inputData: GetProductsByFilterInput = GetProductsByFilterSchema.parse(req.query);
    const filter: FilterInput = inputData.filter;
    const result = await productService.getProductsByFilterWithOptionalStock(
        filter, 
        inputData.withStock, 
        inputData.withDiscounts,
        inputData.pagination
    );
    return res.json(result);    
});

// Non-logged in users can view products by id
router.get("/:id", async (req, res) => {
    const inputData: GetProductByIdInput = GetProductByIdSchema.parse(req.params);
    const withDiscounts = req.query.withDiscounts === 'true' || req.query.withDiscounts === '1';
    const result = await productService.getProductsByFilterWithOptionalStock(
        { id: inputData.id }, 
        false,
        withDiscounts
    );
    // For single product lookup, return just the data array (without pagination metadata)
    return res.json(result.data);
});

router.post("/", isAuth, isSuperAdmin, async (req, res) => {
    const inputData: CreateProductInput = CreateProductSchema.parse(req.body);
    const createdProduct = await productService.createProduct(inputData);
    return res.status(201).json(createdProduct);
});

router.patch("/:id", isAuth, isSuperAdmin, async (req, res) => {
    const inputData = UpdateProductSchema.parse({ id: req.params.id, ...req.body });
    const updatedProduct = await productService.updateProduct(inputData);
    return res.json(updatedProduct);
});

router.delete("/:id", isAuth, isSuperAdmin, async (req, res) => {
    const inputData: DeleteProductByIdInput = DeleteProductByIdSchema.parse(req.params);
    await productService.deleteProduct(inputData.id);
    return res.status(204).send();
});


export default router;
