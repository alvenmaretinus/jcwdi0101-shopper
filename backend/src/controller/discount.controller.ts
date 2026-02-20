import { Router } from 'express';
import { PrismaRepository }  from '../repository/discount/adapter_prisma';
import { prisma } from '../lib/db/prisma';
import { DiscountService } from '../service/discount/discount.service';
import { GetDiscountByIdInput, GetDiscountByIdSchema, GetDiscountsByFilterInput, GetDiscountsByFilterSchema, CreateDiscountInput, CreateDiscountSchema, UpdateDiscountSchema, UpdateDiscountInput, DeleteDiscountByIdInput, DeleteDiscountByIdSchema} from '../schema/discount/';
import { isSuperAdmin } from '../middleware/isSuperAdmin';
import { isAuth } from '../middleware/isAuth';

const discountsRepo = new PrismaRepository(prisma);
const discountService = new DiscountService(discountsRepo);

const router = Router();

// Business requires that even non-logged in users can view discounts that a product has
router.get("/",  async (req, res, next) => {
    try {
        const inputData: GetDiscountsByFilterInput = GetDiscountsByFilterSchema.parse(req.query);
        const result = await discountService.getDiscountsByFilter(inputData); 
        return res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get products with active discounts (for deals page)
router.get("/products",  async (req, res, next) => {
    try {
        const inputData: GetDiscountsByFilterInput = GetDiscountsByFilterSchema.parse(req.query);
        const result = await discountService.getProductsWithDiscounts(inputData); 
        return res.json(result);
    } catch (error) {
        next(error);
    }
}); 

router.post("/", isAuth, isSuperAdmin, async (req, res) => {
    const inputData: CreateDiscountInput = CreateDiscountSchema.parse(req.body);
    const createdDiscount = await discountService.createDiscount(inputData); 
    return res.status(201).json(createdDiscount);
});

router.patch("/:id", isAuth, isSuperAdmin, async (req, res) => {
    const { id } = req.params;
    const inputData: UpdateDiscountInput = UpdateDiscountSchema.parse({
        ...req.body,
        id: id,
    });
    
    const updatedDiscount = await discountService.updateDiscount(inputData); 
    return res.json(updatedDiscount);
});

router.delete("/:id", isAuth, isSuperAdmin, async (req, res) => {
    const inputData: DeleteDiscountByIdInput = DeleteDiscountByIdSchema.parse(req.params);
    await discountService.deleteDiscount(inputData.id); 
    return res.status(204).send();
});

// Anyone (even non-logged in users) can view discount details
router.get("/:id", async (req, res) => {
    const inputData: GetDiscountByIdInput = GetDiscountByIdSchema.parse(req.params);
    const discount = await discountService.getDiscountById(inputData.id); 
    if (!discount) {
        return res.status(404).json({ message: "Discount not found" });
    } 
    return res.json(discount);
});  

export default router;